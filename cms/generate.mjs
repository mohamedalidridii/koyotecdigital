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
      makesOffer: t.home.cards.map(([n]) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: n } })),
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
    if (page === "home") {
      ld = {
        "@context": "https://schema.org",
        "@graph": [ld, {
          "@type": "FAQPage",
          mainEntity: p.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
        }],
      };
    }
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

  function nav(lang, page, switchTo, onHero = false) {
    const ui = site[lang].ui; const i = idx(lang);
    const other = lang === "fr" ? "en" : "fr";
    const keys = ["home", "services", "blog", "contact"];
    const sw = switchTo || PATHS[page][idx(other)];
    const links = keys
      .map((k) => `<li><a href="${PATHS[k][i]}"${k === page ? ' class="active"' : ""}>${esc(ui.nav[k])}</a></li>`)
      .join("");
    const items = keys
      .map((k) => `      <div class="nav-item${k === page ? " active" : ""}"><a href="${PATHS[k][i]}">${esc(ui.nav[k])}</a></div>`)
      .join("\n");
    return `  <div class="transition"><div class="transition-overlay"></div></div>

  <nav class="site-nav${onHero ? " on-hero" : ""}">
    <div class="container">
      <div class="logo"><div class="logo-container"><a href="${PATHS.home[i]}" aria-label="${esc(G.name)}"><span></span>${esc(G.name)}.</a></div></div>
      <ul class="nav-links">${links}<li><a class="lang" href="${esc(sw)}" hreflang="${other}" lang="${other}">${other.toUpperCase()}</a></li></ul>
      <a class="btn-cta" href="${PATHS.contact[i]}">${esc(ui.nav_cta)}</a>
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
        <div class="nav-footer-item"><a href="${PATHS.contact[i]}">[ &nbsp;${esc(ui.drop)}&nbsp; ]</a></div>
      </div>
    </div>
  </div>`;
  }

  function footer(lang) {
    const t = site[lang]; const ui = t.ui; const i = idx(lang);
    return `  <footer class="site-footer">
    <div class="wrap">
      <div class="cols">
        <div>
          <p class="brand">${esc(G.name)}.</p>
          <p class="tag">${esc(t.home.foot_copy)}</p>
        </div>
        <div>
          <h4>${esc(ui.footer_pages)}</h4>
          <a href="${PATHS.home[i]}">${esc(ui.nav.home)}</a>
          <a href="${PATHS.services[i]}">${esc(ui.nav.services)}</a>
          <a href="${PATHS.blog[i]}">${esc(ui.nav.blog)}</a>
          <a href="${PATHS.contact[i]}">${esc(ui.nav.contact)}</a>
        </div>
        <div>
          <h4>${esc(ui.footer_contact)}</h4>
          <a href="mailto:${esc(G.email)}">${esc(G.email)}</a>
          <a href="tel:${esc(G.phone)}">${esc(G.phoneDisplay)}</a>
          <h4 style="margin-top:1.2rem">${esc(ui.footer_follow)}</h4>
          <a href="${esc(G.instagram)}" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="${esc(G.youtube)}" target="_blank" rel="noopener noreferrer">YouTube</a>
        </div>
      </div>
      <p class="giant-name" aria-hidden="true">${esc(G.name)}.</p>
      <div class="bottom"><p>${esc(ui.based)}</p><p>&copy; ${esc(G.year)} ${esc(G.name)}. ${esc(ui.rights)}</p></div>
    </div>
  </footer>`;
  }

  const ps = (arr) => arr.map((x) => `<p>${esc(x)}</p>`).join("");
  const siteCss = (...extra) => css("css/transition.css", "css/menu.css", "css/site.css", ...extra);

  const ctaBand = (lang, h, sub, btn) => `  <section class="cta-band" id="contact-cta">
    <div class="wrap">
      <h2>${esc(h)}</h2>
      <p>${esc(sub)}</p>
      <div class="btn-row">
        <a class="btn-cta" href="${PATHS.contact[idx(lang)]}">${esc(btn)}</a>
        <a class="btn-ghost" href="tel:${esc(G.phone)}">${esc(G.phoneDisplay)}</a>
      </div>
    </div>
  </section>`;

  const stripNum = (t) => String(t).replace(/^\d+\.\s*/, "");
  const stepsHtml = (arr) => arr.map(([a, b], n) => `<div class="step"><span class="numeral" aria-hidden="true">0${n + 1}</span><h3>${esc(stripNum(a))}</h3><p>${esc(b)}</p></div>`).join("\n        ");

  function home(lang) {
    const h = site[lang].home; const i = idx(lang);
    const rows = h.cards.map(([a, b], n) => `        <li><a class="svc-row" href="${PATHS.services[i]}"><span class="num mono">(0${n + 1})</span><span class="name">${esc(a)}</span><span class="desc">${esc(b)}</span><span class="go" aria-hidden="true">→</span></a></li>`).join("\n");
    const points = h.points.map(([a, b]) => `        <div class="point"><h3>${esc(a)}</h3><p>${esc(b)}</p></div>`).join("\n");
    const faq = h.faq.map(([q, a]) => `        <details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n");
    const words = h.cards.map(([a]) => `<span>${esc(a)}</span><i aria-hidden="true">✦</i>`).join("");
    return `${pageHead(lang, "home", siteCss())}

<body>
${nav(lang, "home", undefined, true)}

  <main>
  <section class="hero-clear hero-big">
    <video autoplay muted loop playsinline preload="metadata" aria-hidden="true">
      <source src="/hero/hero-footage.mp4" type="video/mp4" />
    </video>
    <div class="wrap">
      <p class="wordmark" aria-hidden="true">${esc(G.name)}</p>
      <p class="hero-meta mono">${h.hero_meta.map((m) => `<span>${esc(m)}</span>`).join("")}</p>
      <span class="eyebrow">${esc(h.eyebrow)}</span>
      <h1>${esc(h.h1)}</h1>
      <p class="sub">${esc(h.sub)}</p>
      <div class="btn-row">
        <a class="btn-cta" href="${PATHS.contact[i]}">${esc(h.cta_primary)}</a>
        <a class="btn-ghost" href="${PATHS.services[i]}">${esc(h.cta_secondary)}</a>
      </div>
    </div>
    <p class="scroll-hint mono" aria-hidden="true">[ ${esc(h.scroll_hint)} ]</p>
  </section>

  <div class="marquee" aria-hidden="true"><div class="track"><div class="group">${words}</div><div class="group">${words}</div></div></div>

  <section class="sec" id="services">
    <div class="wrap">
      <span class="tag mono">[ ${esc(h.services_kicker)} ]</span>
      <h2 class="mix"><span class="outline">${esc(h.services_outline)}</span> <span class="solid">${esc(h.services_bold)}</span></h2>
      <p class="lead">${esc(h.services_lead)}</p>
      <ol class="svc-list">
${rows}
      </ol>
    </div>
  </section>

  <section class="sec dark" id="why">
    <div class="wrap">
      <span class="tag mono">[ ${esc(h.why_kicker)} ]</span>
      <h2 class="visually-hidden">${esc(h.why_h)}</h2>
      <p class="statement">${inline(h.lead)}</p>
      <div class="body-copy centered">${ps(h.about)}</div>
      <div class="points">
${points}
      </div>
    </div>
  </section>

  <section class="sec" id="process">
    <div class="wrap">
      <h2>${esc(h.process_h)}</h2>
      <div class="steps">
        ${stepsHtml(h.process)}
      </div>
    </div>
  </section>

  <section class="sec dark" id="faq">
    <div class="wrap">
      <h2>${esc(h.faq_h)}</h2>
      <div class="faq">
${faq}
      </div>
    </div>
  </section>

  <section class="cta-band" id="contact-cta">
    <div class="wrap">
      <h2>${esc(h.cta_h)}</h2>
      <p>${esc(h.cta_sub)}</p>
      <a class="giant-cta" href="${PATHS.contact[i]}">${esc(h.cta_giant)}</a>
      <div class="btn-row">
        <a class="btn-cta" href="${PATHS.contact[i]}">${esc(h.cta_btn)}</a>
        <a class="btn-ghost" href="tel:${esc(G.phone)}">${esc(G.phoneDisplay)}</a>
      </div>
    </div>
  </section>
  </main>

  <aside class="float-cta" aria-label="${esc(h.popup_title)}">
    <button class="close" type="button" aria-label="Close">×</button>
    <p class="mono">${esc(h.popup_title)}</p>
    <a class="btn-cta" href="${PATHS.contact[i]}">${esc(h.popup_btn)}</a>
  </aside>

${footer(lang)}

${scripts("lenis-scroll", "transition", "menu", "hover", "animations")}
</body>
</html>
`;
  }

  function services(lang) {
    const s = site[lang].services; const i = idx(lang);
    const blocks = s.blocks.map(([a, b]) => `        <div class="card-s"><h3>${esc(a)}</h3><p>${esc(b)}</p></div>`).join("\n");
    return `${pageHead(lang, "services", siteCss())}

<body>
${nav(lang, "services")}

  <main>
  <section class="page-hero">
    <div class="wrap">
      <h1>${esc(s.h1)}</h1>
      <p class="sub">${esc(s.sub)}</p>
      <div class="btn-row"><a class="btn-cta" href="${PATHS.contact[i]}">${esc(s.cta)}</a></div>
    </div>
  </section>

  <section class="sec" style="padding-top:2rem">
    <div class="wrap">
      <h2>${esc(s.h2)}</h2>
      <div class="cards" style="grid-template-columns:repeat(2,1fr)">
${blocks}
      </div>
    </div>
  </section>

  <section class="sec dark">
    <div class="wrap">
      <h2>${esc(s.process_h)}</h2>
      <div class="steps">
        ${stepsHtml(s.process)}
      </div>
    </div>
  </section>

${ctaBand(lang, s.cta_h, "", s.cta)}
  </main>

${footer(lang)}

${scripts("lenis-scroll", "transition", "menu", "hover", "animations")}
</body>
</html>
`;
  }

  function contact(lang) {
    const c = site[lang].contact;
    const cs = css("css/transition.css", "css/menu.css", "css/site.css", "css/pixelated-video.css", "css/contact.css");
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

  const blogCss = css("css/transition.css", "css/menu.css", "css/site.css", "css/blog.css");

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

${scripts("lenis-scroll", "transition", "menu", "hover", "animations")}
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

${scripts("lenis-scroll", "transition", "menu", "hover", "animations")}
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
