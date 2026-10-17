// Static page generator: content/*.json -> HTML pages, blog pages and sitemap.
// Used by the CMS "Publish" button and by `npm run generate`.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, existsSync, renameSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Fixed route table. URLs are not editable from the CMS on purpose.
const PATHS = {
  home: ["/", "/en/"],
  services: ["/services", "/en/services"],
  blog: ["/blog", "/en/blog"],
  contact: ["/contact", "/en/contact"],
};
const LANGS = ["fr", "en"];
const LOCALE = { fr: "fr_TN", en: "en_US" };
const idx = (lang) => (lang === "fr" ? 0 : 1);

// ---------- escaping and light markup ----------
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// [[word]] -> highlighted word, applied after escaping
const inline = (s) => esc(s).replace(/\[\[(.+?)\]\]/g, '<span class="highlight">$1</span>');

// body text: blank line = new paragraph, lines starting with "- " = bullet list
function bodyHtml(text) {
  return String(text)
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((l) => l.trim());
      if (lines.every((l) => l.startsWith("- "))) {
        return `<ul>${lines.map((l) => `<li>${esc(l.slice(2))}</li>`).join("")}</ul>`;
      }
      return `<p>${lines.map(esc).join("<br />")}</p>`;
    })
    .join("\n      ");
}

// JSON inside <script>: neutralise sequences that could close the tag
const ldJson = (obj) =>
  JSON.stringify(obj).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");

// ---------- content ----------
export function loadContent(root = ROOT) {
  const site = JSON.parse(readFileSync(join(root, "content/site.json"), "utf8"));
  const blog = JSON.parse(readFileSync(join(root, "content/blog.json"), "utf8"));
  return { site, blog };
}

export function generate(root = ROOT, content = loadContent(root), { write = true } = {}) {
  const { site, blog } = content;
  const G = site.global;
  const SITE = G.domain.replace(/\/$/, "");
  const url = (page, lang) => SITE + PATHS[page][idx(lang)];
  const artPath = (lang, a) => (lang === "fr" ? "/blog/" : "/en/blog/") + a.slug;
  const partner = (lang, a) => blog[lang === "fr" ? "en" : "fr"].find((x) => x.id === a.id);

  const css = (...names) =>
    ["globals.css", ...names].map((n) => `    <link rel="stylesheet" href="/${n}" />`).join("\n");
  const scripts = (...names) =>
    names.map((n) => `  <script type="module" src="/scripts/${n}.js"></script>`).join("\n");

  function org(lang) {
    const t = site[lang];
    return {
      "@context": "https://schema.org",
      "@type": ["ProfessionalService", "LocalBusiness"],
      "@id": SITE + "/#organization",
      name: G.name,
      alternateName: G.tagline,
      description: t.home.desc,
      url: SITE + "/",
      logo: SITE + "/site-icon.png",
      image: SITE + G.ogImage,
      email: G.email,
      telephone: G.phone,
      priceRange: "$$",
      address: { "@type": "PostalAddress", addressLocality: G.locality, addressCountry: G.country },
      geo: { "@type": "GeoCoordinates", latitude: Number(G.latitude), longitude: Number(G.longitude) },
      areaServed: [{ "@type": "Country", name: "Tunisia" }],
      knowsLanguage: ["fr", "ar", "en"],
      sameAs: [G.instagram, G.youtube],
      makesOffer: t.home.svc_items.map((n) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: n } })),
    };
  }

  function headTag({ lang, title, desc, canon, altFr, altEn, ld, css: cssBlock, ogType = "website" }) {
    return `<!DOCTYPE html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${esc(SITE + canon)}" />
${altFr ? `    <link rel="alternate" hreflang="fr" href="${esc(SITE + altFr)}" />\n` : ""}${altEn ? `    <link rel="alternate" hreflang="en" href="${esc(SITE + altEn)}" />\n` : ""}    <link rel="alternate" hreflang="x-default" href="${esc(SITE + (altFr || canon))}" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:site_name" content="${esc(G.name)}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(desc)}" />
    <meta property="og:url" content="${esc(SITE + canon)}" />
    <meta property="og:locale" content="${LOCALE[lang]}" />
    <meta property="og:image" content="${esc(SITE + G.ogImage)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" href="/site-icon.png" />
    <meta name="theme-color" content="#000000" />
    <meta name="author" content="${esc(G.name)}" />
${cssBlock}
    <script type="application/ld+json">${ldJson(ld)}</script>
  </head>`;
  }

  function pageHead(lang, page, cssBlock) {
    const p = site[lang][page];
    let ld = org(lang);
    if (page === "services") {
      const ui = site[lang].ui;
      ld = {
        "@context": "https://schema.org",
        "@graph": [
          ld,
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: ui.nav.home, item: url("home", lang) },
              { "@type": "ListItem", position: 2, name: ui.nav.services, item: url("services", lang) },
            ],
          },
        ],
      };
    }
    return headTag({
      lang, title: p.title, desc: p.desc, canon: PATHS[page][idx(lang)],
      altFr: PATHS[page][0], altEn: PATHS[page][1], ld, css: cssBlock,
    });
  }

  function nav(lang, page, switchTo) {
    const ui = site[lang].ui;
    const other = lang === "fr" ? "en" : "fr";
    const items = ["home", "services", "blog", "contact"]
      .map((k) => `      <div class="nav-item${k === page ? " active" : ""}"><a href="${PATHS[k][idx(lang)]}">${esc(ui.nav[k])}</a></div>`)
      .join("\n");
    const sw = switchTo || PATHS[page][idx(other)];
    return `  <div class="transition"><div class="transition-overlay"></div></div>

  <nav>
    <div class="container">
      <div class="logo"><div class="logo-container"><a href="${PATHS.home[idx(lang)]}" aria-label="${esc(G.name)}"><span></span>${esc(G.name)}.</a></div></div>
      <div class="menu-toggle-btn"><div class="menu-toggle-btn-wrapper"><p>${esc(ui.menu)}</p></div></div>
    </div>
  </nav>

  <div class="nav-overlay">
    <div class="nav-items">
${items}
      <div class="nav-item"><a href="${esc(sw)}" hreflang="${other}" lang="${other}">${esc(ui.other_lang)}</a></div>
    </div>
    <div class="nav-footer">
      <div class="container">
        <div class="nav-footer-item">
          <a href="${esc(G.instagram)}" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="${esc(G.youtube)}" target="_blank" rel="noopener noreferrer">YouTube</a>
        </div>
        <div class="nav-footer-item"><a href="${PATHS.contact[idx(lang)]}">[ &nbsp;${esc(ui.drop)}&nbsp; ]</a></div>
      </div>
    </div>
  </div>`;
  }

  function footer(lang) {
    const t = site[lang]; const ui = t.ui; const i = idx(lang);
    return `  <footer>
    <div class="footer-row form">
      <div class="container">
        <div class="footer-name"><h3>${esc(G.name)}.</h3><h3>Digital Agency</h3></div>
        <div class="footer-form-copy"><p>${esc(t.home.foot_copy)}</p></div>
        <div class="footer-input"><input type="email" placeholder="${esc(ui.email_ph)}" aria-label="${esc(ui.email_ph)}" /></div>
        <div class="footer-submit-btn"><a href="${PATHS.contact[i]}" class="scramble-hover">[ &nbsp;${esc(ui.start)}&nbsp; ]</a></div>
      </div>
    </div>
    <div class="footer-row meta">
      <div class="container">
        <div class="footer-meta-row">
          <div class="meta-info"><p>${esc(ui.touch)}</p><a href="mailto:${esc(G.email)}">${esc(G.email)}</a><a href="tel:${esc(G.phone)}">${esc(G.phoneDisplay)}</a></div>
          <div class="meta-info">
            <a href="${esc(G.youtube)}" target="_blank" rel="noopener noreferrer" class="scramble-hover">YouTube</a>
            <a href="${esc(G.instagram)}" target="_blank" rel="noopener noreferrer" class="scramble-hover">Instagram</a>
          </div>
          <div class="meta-info">
            <a href="${PATHS.home[i]}" class="scramble-hover">${esc(ui.nav.home)}</a>
            <a href="${PATHS.services[i]}" class="scramble-hover">${esc(ui.nav.services)}</a>
            <a href="${PATHS.blog[i]}" class="scramble-hover">${esc(ui.nav.blog)}</a>
            <a href="${PATHS.contact[i]}" class="scramble-hover">${esc(ui.nav.contact)}</a>
          </div>
        </div>
        <div class="footer-meta-row"><p>${esc(ui.based)}</p><p>&copy; ${esc(G.year)} ${esc(G.name)}. ${esc(ui.rights)}</p></div>
      </div>
    </div>
  </footer>`;
  }

  const spans = (arr) => arr.map((x) => `<span>${esc(x)}</span>`).join("");
  const ps = (arr) => arr.map((x) => `<p>${esc(x)}</p>`).join("");

  function home(lang) {
    const t = site[lang]; const h = t.home; const i = idx(lang);
    const cs = css("css/preloader.css", "css/transition.css", "css/menu.css", "css/home.css", "css/pixelated-video.css",
      "css/pixelated-text.css", "css/spotlight.css", "css/split-element.css", "css/footer.css");
    const gridItems = (arr) => arr.map((n) => `          <div class="grid-item"><p>${esc(n)}</p></div>`).join("\n");
    const rows = `        <div class="grid-row">\n${gridItems(h.svc_items.slice(0, 3))}\n        </div>\n        <div class="grid-row">\n${gridItems(h.svc_items.slice(3))}\n        </div>`;
    const imgs = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
      .map((trio) => `      <div class="grid-row">${trio.map((n) => `<div class="img"><img src="/spotlight/spotlight-${n}.jpg" alt="" loading="lazy" /></div>`).join("")}</div>\n`)
      .join("");
    return `${pageHead(lang, "home", cs)}

<body>
  <div class="overlay">
    <div class="projects"><div class="projects-header"><p>Service</p><p>${lang === "fr" ? "Ville" : "City"}</p></div></div>
    <div class="loader"><h2 class="logo-line-1">${esc(G.name)}.</h2><h2 class="logo-line-2">Digital Agency</h2></div>
    <div class="locations"><div class="locations-header"><p>${lang === "fr" ? "Lieu" : "Location"}</p></div></div>
  </div>

  <div class="image-grid">
${imgs}  </div>

${nav(lang, "home")}

  <main>
  <section class="hero">
    <video class="hero-video" autoplay muted loop playsinline preload="metadata" aria-hidden="true">
      <source src="/hero/hero-footage.mp4" type="video/mp4" />
    </video>
    <div class="hero-content">
      <div class="hero-header"><div class="container"><h1>${esc(h.h1)}</h1></div></div>
      <div class="hero-footer">
        <div class="container">
          <p><span>Ennasr</span> <span>/</span> <span>Tunis</span></p>
          <p>[ &nbsp;Scroll&nbsp; ]</p>
        </div>
      </div>
    </div>
  </section>

  <section class="about-callout">
    <div class="container"><div class="about-callout-copy">${ps(h.callout.slice(0, 2))}</div></div>
  </section>

  <section class="pixelated-text about-header"><h2 class="The-art-of-becoming">${esc(h.pix)}</h2></section>

  <section class="about-copy">
    <div class="container">
      <h3>${inline(h.lead)}</h3>
      <div class="about-copy-info">
        ${ps(h.about)}
        <a href="${PATHS.services[i]}" class="scramble-hover">[ &nbsp;${esc(h.about_cta)}&nbsp; ]</a>
      </div>
    </div>
  </section>

  <section class="banner">
    <div class="banner-img" data-parallax="true" data-parallax-speed="0.2">
      <img src="/home/banner.jpg" alt="${esc(h.hero)}" loading="lazy" />
    </div>
    <div class="banner-content">
      <div class="container">
        <div class="banner-header"><h2>${esc(h.banner)}</h2></div>
        <div class="banner-tags">${ps(h.tags)}</div>
        <div class="banner-copy"><p>${esc(h.banner_copy)}</p></div>
      </div>
    </div>
  </section>

  <section class="spotlight">
    <div class="spotlight-container"><div class="spotlight-gallery"></div></div>
    <div class="spotlight-footer">
      <div class="container"><p>${esc(h.spot)}</p><a href="${PATHS.services[i]}" class="scramble-hover">[ &nbsp;${esc(h.spot_cta)}&nbsp; ]</a></div>
    </div>
  </section>

  <section class="split-element">
    <div class="split-img split-top"><img src="/home/form.svg" alt="" /></div>
    <div class="split-img split-bottom"><img src="/home/form.svg" alt="" /></div>
    <div class="split-copy"><div class="container"><p>${spans(h.split)}</p></div></div>
  </section>

  <section class="clients">
    <div class="container">
      <div class="clients-header"><p>[ &nbsp;${esc(h.svc_kicker)}&nbsp; ]</p><h2>${esc(h.svc_h)}</h2></div>
      <div class="grid">
${rows}
      </div>
      <div class="highlight"></div>
    </div>
  </section>
  </main>

${footer(lang)}

${scripts("lenis-scroll", "preloader", "transition", "menu", "hover", "pixelated-video", "pixelated-text", "parallax", "spotlight", "split-element", "clients")}
</body>
</html>
`;
  }

  function services(lang) {
    const s = site[lang].services; const i = idx(lang);
    const cs = css("css/transition.css", "css/menu.css", "css/culture.css", "css/services.css", "css/split-element.css", "css/footer.css");
    const blocks = s.blocks.map(([a, b]) => `          <h3>${esc(a)}</h3>\n          <p>${esc(b)}</p>`).join("\n");
    const proc = s.process.map(([a, b]) => `          <h3>${esc(a)}</h3>\n          <p>${esc(b)}</p>`).join("\n");
    return `${pageHead(lang, "services", cs)}

<body>
${nav(lang, "services")}

  <main>
  <section class="culture-hero">
    <div class="culture-hero-img"><img src="/culture/hero.jpg" alt="${esc(s.h1)}" /></div>
    <div class="culture-hero-header"><div class="container"><h1>${esc(s.h1)}</h1></div></div>
    <div class="culture-hero-footer"><div class="container"><p>${esc(s.hero_foot)}</p><p>[ &nbsp;${esc(s.hero_cta)}&nbsp; ]</p></div></div>
  </section>

  <section class="services">
    <div class="services-container">
      <div class="services-list"></div>
      <div class="services-indicator"><span>[ Explore ]</span></div>
    </div>
    <div class="services-footer"><div class="container"><p>${esc(s.svc_foot)}</p><p>[ &nbsp;${esc(s.svc_foot2)}&nbsp; ]</p></div></div>
  </section>

  <section class="team"><div class="team-header"><h2>${esc(s.team)}</h2></div></section>

  <section class="split-element">
    <div class="container">
      <div class="split-img split-top"><img src="/home/form.svg" alt="" /></div>
      <div class="split-img split-bottom"><img src="/home/form.svg" alt="" /></div>
    </div>
    <div class="split-copy"><div class="container"><p>${spans(s.split)}</p></div></div>
  </section>

  <section class="culture-about">
    <div class="container">
      <div class="culture-header"><p>[ &nbsp;${esc(s.kicker)}&nbsp; ]</p><h2>${esc(s.h2)}</h2></div>
      <div class="culture-about-copy">
${blocks}
          <h3>${esc(s.process_h)}</h3>
${proc}
          <p><a href="${PATHS.contact[i]}" class="scramble-hover">[ &nbsp;${esc(s.cta)}&nbsp; ]</a></p>
      </div>
    </div>
  </section>
  </main>

${footer(lang)}

${scripts("lenis-scroll", "transition", "menu", "hover", "culture", "services", "split-element")}
</body>
</html>
`;
  }

  function contact(lang) {
    const c = site[lang].contact;
    const cs = css("css/transition.css", "css/menu.css", "css/pixelated-video.css", "css/contact.css");
    return `${pageHead(lang, "contact", cs)}

<body>
${nav(lang, "contact")}

  <main>
  <section class="hero contact-page">
    <video class="hero-video" autoplay muted loop playsinline preload="metadata" aria-hidden="true">
      <source src="/contact/contact-hero.mp4" type="video/mp4" />
    </video>
    <div class="contact-copy">
      <div class="contact-copy-main">
        <div class="contact-col-copy">
          <h1 class="contact-header">${esc(c.h1)}</h1>
          <address style="font-style:normal">
            ${c.addr.map((x) => `<h4>${esc(x)}</h4>`).join("")}
          </address>
        </div>
        <div class="contact-col-copy">
          <h4>${esc(c.drop)}</h4>
          <h4><a href="mailto:${esc(G.email)}">${esc(G.email)}</a></h4>
          <h4><a href="tel:${esc(G.phone)}">${esc(G.phoneDisplay)}</a></h4>
          <h4><a href="${esc(G.instagram)}" target="_blank" rel="noopener noreferrer">Instagram</a> / <a href="${esc(G.youtube)}" target="_blank" rel="noopener noreferrer">YouTube</a></h4>
        </div>
      </div>
      <div class="contact-copy-footer"><div class="container"><p>${esc(c.love)}</p><p>&copy; ${esc(G.year)} ${esc(G.name)}.</p></div></div>
    </div>
  </section>
  </main>

${scripts("lenis-scroll", "transition", "menu", "pixelated-video", "contact")}
</body>
</html>
`;
  }

  const blogCss = css("css/transition.css", "css/menu.css", "css/blog.css", "css/footer.css");

  function blogIndex(lang) {
    const b = site[lang].blog; const i = idx(lang);
    const list = blog[lang];
    const cards = list.map((a) => `      <a class="blog-card" href="${artPath(lang, a)}">
        <p class="meta">${esc(a.date)} · ${esc(b.by)}</p>
        <h2>${esc(a.title)}</h2>
        <p>${esc(a.desc)}</p>
      </a>`).join("\n");
    const ld = {
      "@context": "https://schema.org", "@type": "Blog", name: b.h1, url: SITE + PATHS.blog[i],
      publisher: { "@id": SITE + "/#organization" }, inLanguage: lang,
      blogPost: list.map((a) => ({ "@type": "BlogPosting", headline: a.title, url: SITE + artPath(lang, a) })),
    };
    return `${headTag({ lang, title: b.title, desc: b.desc, canon: PATHS.blog[i], altFr: PATHS.blog[0], altEn: PATHS.blog[1], ld, css: blogCss })}

<body>
${nav(lang, "blog")}

  <main class="blog">
    <div class="blog-head">
      <p class="kicker">[ &nbsp;${esc(b.kicker)}&nbsp; ]</p>
      <h1>${esc(b.h1)}</h1>
      <p class="lead">${esc(b.lead)}</p>
    </div>
    <div class="blog-list">
${cards}
    </div>
  </main>

${footer(lang)}

${scripts("lenis-scroll", "transition", "menu", "hover")}
</body>
</html>
`;
  }

  function article(lang, a) {
    const t = site[lang]; const b = t.blog; const i = idx(lang);
    const sib = partner(lang, a);
    const own = artPath(lang, a);
    const altFr = lang === "fr" ? own : sib ? artPath("fr", sib) : null;
    const altEn = lang === "en" ? own : sib ? artPath("en", sib) : null;
    const body = a.sections.map(([h, c]) => `      <h2>${esc(h)}</h2>\n      ${bodyHtml(c)}`).join("\n");
    const modified = a.updated || a.date;
    const ld = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BlogPosting", headline: a.title, description: a.desc, inLanguage: lang,
          datePublished: a.date, dateModified: modified, mainEntityOfPage: SITE + own, image: SITE + G.ogImage,
          author: { "@id": SITE + "/#organization" }, publisher: { "@id": SITE + "/#organization" },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: b.home, item: SITE + PATHS.home[i] },
            { "@type": "ListItem", position: 2, name: "Blog", item: SITE + PATHS.blog[i] },
            { "@type": "ListItem", position: 3, name: a.title, item: SITE + own },
          ],
        },
      ],
    };
    const switchTo = lang === "fr" ? (altEn || PATHS.blog[1]) : (altFr || PATHS.blog[0]);
    return `${headTag({ lang, title: `${a.title} – ${G.name}`, desc: a.desc, canon: own, altFr, altEn, ld, css: blogCss, ogType: "article" })}

<body>
${nav(lang, "blog", switchTo)}

  <main class="blog">
    <article class="article">
      <p class="crumbs"><a href="${PATHS.home[i]}">${esc(b.home)}</a> / <a href="${PATHS.blog[i]}">Blog</a></p>
      <h1>${esc(a.h1)}</h1>
      <p class="meta">${esc(a.date)} · ${esc(b.by)}</p>
      <p><strong>${esc(a.intro)}</strong></p>
${body}
      <div class="cta">
        <h2>${esc(b.cta_h)}</h2>
        <p><a href="${PATHS.contact[i]}">${esc(b.cta)}</a> · <a href="${PATHS.services[i]}">${esc(t.ui.nav.services)}</a></p>
      </div>
    </article>
  </main>

${footer(lang)}

${scripts("lenis-scroll", "transition", "menu", "hover")}
</body>
</html>
`;
  }

  function sitemap() {
    const entries = [];
    for (const page of ["home", "services", "blog", "contact"]) {
      entries.push({ fr: PATHS[page][0], en: PATHS[page][1] });
    }
    const seen = new Set();
    for (const lang of LANGS) {
      for (const a of blog[lang]) {
        if (seen.has(a.id)) continue;
        seen.add(a.id);
        const sib = partner(lang, a);
        const fa = lang === "fr" ? a : sib; const ea = lang === "en" ? a : sib;
        entries.push({
          fr: fa ? artPath("fr", fa) : null, en: ea ? artPath("en", ea) : null,
          lastmod: (fa || ea).updated || (fa || ea).date,
        });
      }
    }
    let x = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
    for (const e of entries) {
      for (const u of [e.fr, e.en]) {
        if (!u) continue;
        x += `  <url>\n    <loc>${esc(SITE + u)}</loc>\n${e.lastmod ? `    <lastmod>${esc(e.lastmod)}</lastmod>\n` : ""}`;
        if (e.fr) x += `    <xhtml:link rel="alternate" hreflang="fr" href="${esc(SITE + e.fr)}"/>\n`;
        if (e.en) x += `    <xhtml:link rel="alternate" hreflang="en" href="${esc(SITE + e.en)}"/>\n`;
        x += `    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(SITE + (e.fr || e.en))}"/>\n  </url>\n`;
      }
    }
    return x + "</urlset>\n";
  }

  // ---------- assemble ----------
  const files = {
    "index.html": home("fr"), "en/index.html": home("en"),
    "services.html": services("fr"), "en/services.html": services("en"),
    "contact.html": contact("fr"), "en/contact.html": contact("en"),
    "blog/index.html": blogIndex("fr"), "en/blog/index.html": blogIndex("en"),
    "public/sitemap.xml": sitemap(),
  };
  for (const lang of LANGS) {
    for (const a of blog[lang]) {
      files[`${lang === "fr" ? "blog" : "en/blog"}/${a.slug}.html`] = article(lang, a);
    }
  }

  if (!write) return { files, removed: [] };

  // write atomically, then drop article files that no longer exist in the content
  for (const [path, html] of Object.entries(files)) {
    const full = join(root, path);
    mkdirSync(dirname(full), { recursive: true });
    const tmp = full + ".tmp";
    writeFileSync(tmp, html);
    renameSync(tmp, full);
  }
  const removed = [];
  for (const dir of ["blog", "en/blog"]) {
    const abs = join(root, dir);
    if (!existsSync(abs)) continue;
    for (const f of readdirSync(abs)) {
      if (f.endsWith(".html") && !files[`${dir}/${f}`]) {
        unlinkSync(join(abs, f));
        removed.push(`${dir}/${f}`);
      }
    }
  }
  return { files, removed };
}

// CLI: node cms/generate.mjs
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { files, removed } = generate();
  console.log(`generated ${Object.keys(files).length} files` + (removed.length ? `, removed ${removed.join(", ")}` : ""));
}
