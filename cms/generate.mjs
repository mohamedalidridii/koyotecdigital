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

  // particle shape shown behind each service, in the order of home.cards / services.blocks
  const SHAPES = ["browser", "glyph", "signal", "grid", "bag", "compass"];
  // decorative cursor labels (aria-hidden, so they stay out of the CMS)
  const CURSOR = {
    fr: { howl: "Cliquez", view: "Voir", read: "Lire", write: "Écrire" },
    en: { howl: "Click", view: "View", read: "Read", write: "Write" },
  };
  const SKIP = { fr: "Aller au contenu", en: "Skip to content" };
  const pad = (n) => String(n).padStart(2, "0");

  function org(lang) {
    const t = site[lang];
    return {
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

  const graph = (...nodes) => ({ "@context": "https://schema.org", "@graph": nodes });
  const crumbs = (...items) => ({
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, item], n) => ({ "@type": "ListItem", position: n + 1, name, item })),
  });

  function headTag({ lang, title, desc, canon, altFr, altEn, ld, ogType = "website" }) {
    return `<!DOCTYPE html>
<html lang="${lang}" class="no-js">
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
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" href="/site-icon.png" />
    <meta name="theme-color" content="#0a0a0d" />
    <meta name="author" content="${esc(G.name)}" />
    <script>(function(d){var e=d.documentElement;e.classList.replace("no-js","js");try{if(sessionStorage.getItem("ky-visited"))e.classList.add("is-visited")}catch(_){}if(matchMedia("(prefers-reduced-motion: reduce)").matches)e.classList.add("is-reduced")})(document)</script>
    <link rel="preload" href="/fonts/clash-display-600.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/general-sans-400.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="stylesheet" href="/css/main.css" />
    <script type="application/ld+json">${ldJson(ld)}</script>
  </head>`;
  }

  function pageHead(lang, page) {
    const p = site[lang][page];
    const ui = site[lang].ui;
    const home = [ui.nav.home, url("home", lang)];
    let ld;
    if (page === "home") {
      ld = graph(
        org(lang),
        { "@type": "WebSite", "@id": SITE + "/#website", name: G.name, url: url("home", lang), inLanguage: lang, publisher: { "@id": SITE + "/#organization" } },
        { "@type": "FAQPage", mainEntity: p.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
      );
    } else if (page === "contact") {
      ld = graph(org(lang), { "@type": "ContactPage", name: p.h1, url: url(page, lang), about: { "@id": SITE + "/#organization" } }, crumbs(home, [ui.nav[page], url(page, lang)]));
    } else {
      ld = graph(org(lang), crumbs(home, [ui.nav[page], url(page, lang)]));
    }
    return headTag({
      lang, title: p.title, desc: p.desc, canon: PATHS[page][idx(lang)],
      altFr: PATHS[page][0], altEn: PATHS[page][1], ld,
    });
  }

  // button whose label rolls up on hover (the copy is duplicated in CSS via data-text)
  const btn = (href, label, kind = "ember", extra = "") =>
    `<a class="btn btn-${kind}" href="${esc(href)}" data-magnetic${extra}><span class="btn-label" data-text="${esc(label)}">${esc(label)}</span></a>`;

  // persistent chrome that lives outside the swapped page: WebGL stage, cursor, transition curtain, preloader
  function chrome(lang) {
    return `  <a class="skip-link" href="#main">${SKIP[lang]}</a>
  <canvas class="gl" id="gl" aria-hidden="true"></canvas>
  <div class="gl-fallback" aria-hidden="true"></div>
  <div class="grain" aria-hidden="true"></div>
  <div class="cursor" aria-hidden="true"><span class="cursor-ring"></span><span class="cursor-label"></span></div>
  <div class="curtain" aria-hidden="true"><div class="curtain-panel"></div><p class="curtain-label"></p></div>
  <div class="preloader" aria-hidden="true">
    <p class="pl-coords mono">${esc(G.latitude)}° N — ${esc(G.longitude)}° E</p>
    <p class="pl-word">${esc(G.name)}</p>
    <p class="pl-count mono"><span>000</span></p>
  </div>`;
  }

  function nav(lang, page, switchTo) {
    const ui = site[lang].ui; const i = idx(lang);
    const other = lang === "fr" ? "en" : "fr";
    const keys = ["home", "services", "blog", "contact"];
    const sw = switchTo || PATHS[page][idx(other)];
    const cur = (k) => (k === page ? ' aria-current="page"' : "");
    const links = keys
      .map((k) => `<li><a href="${PATHS[k][i]}"${cur(k)} data-scramble>${esc(ui.nav[k])}</a></li>`)
      .join("");
    const items = keys
      .map((k, n) => `        <li><a href="${PATHS[k][i]}"${cur(k)}><span class="menu-idx mono">${pad(n + 1)}</span><span class="menu-name">${esc(ui.nav[k])}</span></a></li>`)
      .join("\n");
    return `    <header class="site-nav">
      <a class="brand" href="${PATHS.home[i]}" aria-label="${esc(G.name)} — ${esc(ui.nav.home)}"><span class="brand-mark" aria-hidden="true"></span><span class="brand-name">${esc(G.name)}</span></a>
      <nav class="nav-main" aria-label="${esc(ui.menu)}"><ul class="nav-links">${links}</ul></nav>
      <div class="nav-right">
        <a class="lang mono" href="${esc(sw)}" hreflang="${other}" lang="${other}" data-scramble>${other.toUpperCase()}</a>
        ${btn(PATHS.contact[i], ui.nav_cta, "ember", ' data-size="sm"')}
        <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu"><span class="menu-btn-label mono" data-open="${esc(ui.menu)}" data-close="${esc(ui.close)}">${esc(ui.menu)}</span><span class="menu-btn-lines" aria-hidden="true"><i></i><i></i></span></button>
      </div>
    </header>

    <div class="menu" id="menu" inert>
      <div class="menu-bg" aria-hidden="true"></div>
      <nav class="menu-inner" aria-label="${esc(ui.menu)}">
        <ol class="menu-list">
${items}
        </ol>
      </nav>
      <div class="menu-foot mono">
        <a href="mailto:${esc(G.email)}">${esc(G.email)}</a>
        <a href="tel:${esc(G.phone)}">${esc(G.phoneDisplay)}</a>
        <a href="${esc(G.instagram)}" target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href="${esc(G.youtube)}" target="_blank" rel="noopener noreferrer">YouTube</a>
        <a href="${esc(sw)}" hreflang="${other}" lang="${other}">${esc(ui.other_lang)}</a>
      </div>
    </div>`;
  }

  function footer(lang) {
    const t = site[lang]; const ui = t.ui; const i = idx(lang);
    return `    <footer class="footer">
      <div class="footer-inner shell">
        <div class="footer-top">
          <p class="footer-lead">${esc(t.home.foot_copy)}</p>
          <a class="footer-mail" href="mailto:${esc(G.email)}" data-cursor="${CURSOR[lang].write}">${esc(G.email)}</a>
        </div>
        <div class="footer-cols">
          <div>
            <h2 class="footer-h mono">${esc(ui.footer_pages)}</h2>
            <a href="${PATHS.home[i]}">${esc(ui.nav.home)}</a>
            <a href="${PATHS.services[i]}">${esc(ui.nav.services)}</a>
            <a href="${PATHS.blog[i]}">${esc(ui.nav.blog)}</a>
            <a href="${PATHS.contact[i]}">${esc(ui.nav.contact)}</a>
          </div>
          <div>
            <h2 class="footer-h mono">${esc(ui.footer_contact)}</h2>
            <a href="mailto:${esc(G.email)}">${esc(G.email)}</a>
            <a href="tel:${esc(G.phone)}">${esc(G.phoneDisplay)}</a>
            <p>${esc(G.locality)}</p>
          </div>
          <div>
            <h2 class="footer-h mono">${esc(ui.footer_follow)}</h2>
            <a href="${esc(G.instagram)}" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="${esc(G.youtube)}" target="_blank" rel="noopener noreferrer">YouTube</a>
          </div>
        </div>
        <p class="footer-word" aria-hidden="true">${esc(G.name)}</p>
        <div class="footer-bottom mono"><p>${esc(ui.based)}</p><p>&copy; ${esc(G.year)} ${esc(G.name)}. ${esc(ui.rights)}</p></div>
      </div>
    </footer>`;
  }

  // full page: chrome + barba container (nav, main, footer) + single module entry
  function page({ head, lang, ns, theme = "dark", pageKey, switchTo, main, withFooter = true }) {
    return `${head}

<body>
${chrome(lang)}
  <div data-barba="wrapper">
  <div class="page" data-barba="container" data-barba-namespace="${ns}" data-theme="${theme}">
${nav(lang, pageKey, switchTo)}

    <main id="main">
${main}
    </main>
${withFooter ? "\n" + footer(lang) + "\n" : ""}  </div>
  </div>

  <script type="module" src="/scripts/main.js"></script>
</body>
</html>
`;
  }

  const stripNum = (t) => String(t).replace(/^\d+\.\s*/, "");
  const stack = (arr) => arr.map(([a, b], n) => `          <li class="stack-card" style="--i:${n}">
            <span class="stack-num" aria-hidden="true">${pad(n + 1)}</span>
            <div class="stack-copy"><h3>${esc(stripNum(a))}</h3><p>${esc(b)}</p></div>
            <span class="stack-of mono" aria-hidden="true">${pad(n + 1)} / ${pad(arr.length)}</span>
          </li>`).join("\n");

  const processSection = (lang, h, steps, n) => `      <section class="process" id="process" data-gl="constellation" data-gl-dim="0.45">
        <div class="shell">
          <p class="kicker mono"><span>(${pad(n)})</span></p>
          <h2 class="section-title" data-split>${esc(h)}</h2>
          <ol class="stack">
${stack(steps)}
          </ol>
        </div>
      </section>`;

  const ctaSection = (lang, { kicker, h, giant, button }) => {
    const i = idx(lang);
    return `      <section class="cta" id="contact-cta" data-gl="orbit" data-gl-dim="0.75">
        <div class="shell">
          ${kicker ? `<p class="kicker mono">${esc(kicker)}</p>` : ""}
          <h2 class="cta-h" data-split>${esc(h)}</h2>
          ${giant ? `<a class="cta-giant" href="${PATHS.contact[i]}" data-cursor="${CURSOR[lang].write}">${esc(giant)}</a>` : ""}
          <div class="btn-row">
            ${btn(PATHS.contact[i], button)}
            ${btn("tel:" + G.phone, G.phoneDisplay, "ghost")}
          </div>
        </div>
      </section>`;
  };

  function home(lang) {
    const h = site[lang].home; const i = idx(lang); const c = CURSOR[lang];
    const words = h.cards.map(([a]) => `<span>${esc(a)}</span><i aria-hidden="true">✦</i>`).join("");
    const panels = h.cards.map(([a, b], n) => `            <article class="svc-panel panel" data-gl="${SHAPES[n % SHAPES.length]}">
              <span class="svc-num" aria-hidden="true">${pad(n + 1)}</span>
              <div class="svc-copy">
                <p class="mono svc-of">(${pad(n + 1)} / ${pad(h.cards.length)})</p>
                <h3 class="svc-name">${esc(a)}</h3>
                <p class="svc-desc">${esc(b)}</p>
                <a class="link-arrow mono" href="${PATHS.services[i]}" data-cursor="${c.view}">${esc(h.cards_more)} <span aria-hidden="true">→</span></a>
              </div>
            </article>`).join("\n");
    const pillars = h.points.map(([a, b], n) => `            <li><span class="mono">${pad(n + 1)}</span><h3>${esc(a)}</h3><p>${esc(b)}</p></li>`).join("\n");
    const faq = h.faq.map(([q, a]) => `            <details><summary><span>${esc(q)}</span><i aria-hidden="true"></i></summary><div class="faq-a"><p>${esc(a)}</p></div></details>`).join("\n");
    const main = `      <section class="hero" data-gl="dunes" data-cursor="${c.howl}">
        <div class="hero-top shell mono">
          <p class="hero-meta">${h.hero_meta.map((m) => `<span>${esc(m)}</span>`).join("")}</p>
          <p class="hero-coords" aria-hidden="true">${esc(G.latitude)}° N / ${esc(G.longitude)}° E</p>
        </div>
        <div class="hero-body shell">
          <p class="eyebrow mono">${esc(h.eyebrow)}</p>
          <h1 class="hero-title" data-split>${esc(h.h1)}</h1>
          <div class="hero-aside">
            <p class="hero-sub">${esc(h.sub)}</p>
            <div class="btn-row">
              ${btn(PATHS.contact[i], h.cta_primary)}
              ${btn(PATHS.services[i], h.cta_secondary, "ghost")}
            </div>
          </div>
        </div>
        <p class="hero-word" aria-hidden="true">${esc(G.name)}</p>
        <div class="scroll-cue mono" aria-hidden="true"><span>${esc(h.scroll_hint)}</span><i></i></div>
      </section>

      <div class="marquee" aria-hidden="true"><div class="marquee-track"><div class="marquee-group">${words}</div><div class="marquee-group">${words}</div></div></div>

      <section class="manifesto" id="why" data-gl="dunes" data-gl-dim="0.35">
        <div class="shell">
          <p class="kicker mono"><span>(01)</span> ${esc(h.why_kicker)}</p>
          <h2 class="visually-hidden">${esc(h.why_h)}</h2>
          <p class="manifesto-text" data-words>${inline(h.lead)}</p>
          <div class="manifesto-cols" data-scroll data-scroll-speed="0.06">${h.about.map((x) => `<p>${esc(x)}</p>`).join("")}</div>
          <ol class="pillars">
${pillars}
          </ol>
        </div>
      </section>

      <section class="services" id="services">
        <div class="services-pin">
          <div class="services-track">
            <div class="svc-intro panel" data-gl="constellation" data-gl-dim="0.6">
              <p class="kicker mono"><span>(02)</span> ${esc(h.services_kicker)}</p>
              <h2 class="mix"><span class="outline">${esc(h.services_outline)}</span> <span class="solid">${esc(h.services_bold)}</span></h2>
              <p class="lead">${esc(h.services_lead)}</p>
              <p class="svc-hint mono" aria-hidden="true">${esc(h.scroll_hint)} <span>→</span></p>
            </div>
${panels}
          </div>
          <div class="services-progress" aria-hidden="true"><i></i></div>
        </div>
      </section>

${processSection(lang, h.process_h, h.process, 3)}

      <section class="faq" id="faq" data-gl="constellation" data-gl-dim="0.25">
        <div class="shell faq-grid">
          <div class="faq-head">
            <p class="kicker mono"><span>(04)</span> FAQ</p>
            <h2 class="section-title" data-split>${esc(h.faq_h)}</h2>
          </div>
          <div class="faq-list">
${faq}
          </div>
        </div>
      </section>

${ctaSection(lang, { kicker: h.cta_sub, h: h.cta_h, giant: h.cta_giant, button: h.cta_btn })}

      <aside class="float-cta" aria-label="${esc(h.popup_title)}">
        <button class="float-close" type="button" aria-label="${esc(site[lang].ui.close)}">×</button>
        <p class="mono">${esc(h.popup_title)}</p>
        ${btn(PATHS.contact[i], h.popup_btn, "ember", ' data-size="sm"')}
      </aside>`;
    return page({ head: pageHead(lang, "home"), lang, ns: "home", pageKey: "home", main });
  }

  function services(lang) {
    const s = site[lang].services; const i = idx(lang);
    const blocks = s.blocks.map(([a, b], n) => `        <article class="svc-block" data-gl="${SHAPES[n % SHAPES.length]}">
          <div class="shell svc-block-grid">
            <span class="svc-block-num" aria-hidden="true" data-scroll data-scroll-speed="0.12">${pad(n + 1)}</span>
            <div class="svc-block-copy">
              <p class="mono svc-of">(${pad(n + 1)} / ${pad(s.blocks.length)})</p>
              <h3 data-split>${esc(a)}</h3>
              <p>${esc(b)}</p>
            </div>
          </div>
        </article>`).join("\n");
    const main = `      <section class="page-hero" data-gl="constellation" data-gl-dim="0.6">
        <div class="shell">
          <p class="kicker mono"><span>(00)</span> ${esc(site[lang].ui.nav.services)}</p>
          <h1 class="page-title" data-split>${esc(s.h1)}</h1>
          <div class="page-hero-foot">
            <p class="hero-sub">${esc(s.sub)}</p>
            ${btn(PATHS.contact[i], s.cta)}
          </div>
        </div>
      </section>

      <section class="svc-detail" aria-labelledby="svc-h">
        <div class="shell"><h2 class="section-title" id="svc-h" data-split>${esc(s.h2)}</h2></div>
${blocks}
      </section>

${processSection(lang, s.process_h, s.process, 7)}

${ctaSection(lang, { h: s.cta_h, button: s.cta })}`;
    return page({ head: pageHead(lang, "services"), lang, ns: "services", pageKey: "services", main });
  }

  function contact(lang) {
    const c = site[lang].contact; const h = site[lang].home;
    const types = h.cards.map(([a], n) => `<label class="chip"><input type="checkbox" name="type" value="${esc(a)}" /><span>${esc(a)}</span></label>`).join("");
    const main = `      <section class="contact" data-gl="orbit" data-gl-dim="0.5">
        <div class="shell contact-grid">
          <div class="contact-info">
            <p class="kicker mono"><span>(✦)</span> ${esc(c.drop)}</p>
            <h1 class="page-title" data-split>${esc(c.h1)}</h1>
            <address class="contact-addr mono">${c.addr.map((x) => `<span>${esc(x)}</span>`).join("")}</address>
            <ul class="contact-links">
              <li><a href="mailto:${esc(G.email)}" data-cursor="${CURSOR[lang].write}">${esc(G.email)}</a></li>
              <li><a href="tel:${esc(G.phone)}">${esc(G.phoneDisplay)}</a></li>
              <li class="mono"><a href="${esc(G.instagram)}" target="_blank" rel="noopener noreferrer">Instagram</a> / <a href="${esc(G.youtube)}" target="_blank" rel="noopener noreferrer">YouTube</a></li>
            </ul>
            <p class="contact-love mono">${esc(c.love)}</p>
          </div>
          <form class="contact-form" action="mailto:${esc(G.email)}" method="post" enctype="text/plain" data-email="${esc(G.email)}" data-done="${esc(c.f_done)}">
            <h2 class="form-h">${esc(c.form_h)}</h2>
            <label class="field"><span class="mono">${esc(c.f_name)}</span><input name="name" autocomplete="name" required /></label>
            <label class="field"><span class="mono">${esc(c.f_email)}</span><input name="email" type="email" autocomplete="email" required /></label>
            <fieldset class="chips"><legend class="mono">${esc(c.f_type)}</legend>${types}</fieldset>
            <label class="field"><span class="mono">${esc(c.f_msg)}</span><textarea name="message" rows="4" required></textarea></label>
            <div class="form-foot">
              <button class="btn btn-ember" type="submit" data-magnetic><span class="btn-label" data-text="${esc(c.f_send)}">${esc(c.f_send)}</span></button>
              <p class="form-note mono">${esc(c.f_note)}</p>
            </div>
            <p class="form-done mono" role="status" aria-live="polite"></p>
          </form>
        </div>
      </section>`;
    return page({ head: pageHead(lang, "contact"), lang, ns: "contact", pageKey: "contact", main });
  }

  function blogIndex(lang) {
    const b = site[lang].blog; const i = idx(lang);
    const list = blog[lang];
    const cards = list.map((a, n) => `          <a class="blog-card" href="${artPath(lang, a)}" data-cursor="${CURSOR[lang].read}">
            <span class="blog-card-num mono" aria-hidden="true">${pad(n + 1)}</span>
            <p class="meta mono">${esc(a.date)} · ${esc(b.by)}</p>
            <h2>${esc(a.title)}</h2>
            <p class="blog-card-desc">${esc(a.desc)}</p>
            <span class="blog-card-go mono">${esc(b.read)} <span aria-hidden="true">→</span></span>
          </a>`).join("\n");
    const ld = {
      "@context": "https://schema.org", "@type": "Blog", name: b.h1, url: SITE + PATHS.blog[i],
      publisher: { "@id": SITE + "/#organization" }, inLanguage: lang,
      blogPost: list.map((a) => ({ "@type": "BlogPosting", headline: a.title, url: SITE + artPath(lang, a), datePublished: a.date })),
    };
    const main = `      <section class="blog-head" data-gl="off">
        <div class="shell">
          <p class="kicker mono"><span>(✦)</span> ${esc(b.kicker)}</p>
          <h1 class="page-title" data-split>${esc(b.h1)}</h1>
          <p class="lead">${esc(b.lead)}</p>
        </div>
      </section>
      <section class="blog-list shell" aria-label="${esc(b.h1)}">
${cards}
      </section>`;
    const head = headTag({ lang, title: b.title, desc: b.desc, canon: PATHS.blog[i], altFr: PATHS.blog[0], altEn: PATHS.blog[1], ld });
    return page({ head, lang, ns: "blog", theme: "light", pageKey: "blog", main });
  }

  function article(lang, a) {
    const t = site[lang]; const b = t.blog; const i = idx(lang);
    const sib = partner(lang, a);
    const own = artPath(lang, a);
    const altFr = lang === "fr" ? own : sib ? artPath("fr", sib) : null;
    const altEn = lang === "en" ? own : sib ? artPath("en", sib) : null;
    const body = a.sections.map(([h, c]) => `          <h2>${esc(h)}</h2>\n          ${bodyHtml(c)}`).join("\n");
    const modified = a.updated || a.date;
    const ld = graph(
      {
        "@type": "BlogPosting", headline: a.title, description: a.desc, inLanguage: lang,
        datePublished: a.date, dateModified: modified, mainEntityOfPage: SITE + own, image: SITE + G.ogImage,
        author: { "@id": SITE + "/#organization" }, publisher: { "@id": SITE + "/#organization" },
      },
      crumbs([b.home, SITE + PATHS.home[i]], ["Blog", SITE + PATHS.blog[i]], [a.title, SITE + own]),
    );
    const switchTo = lang === "fr" ? (altEn || PATHS.blog[1]) : (altFr || PATHS.blog[0]);
    const main = `      <div class="read-progress" aria-hidden="true"></div>
      <article class="article shell" data-gl="off">
        <header class="article-head">
          <nav class="crumbs mono" aria-label="Breadcrumb"><a href="${PATHS.home[i]}">${esc(b.home)}</a> / <a href="${PATHS.blog[i]}">Blog</a></nav>
          <h1 class="article-title" data-split>${esc(a.h1)}</h1>
          <p class="meta mono"><time datetime="${esc(a.date)}">${esc(a.date)}</time> · ${esc(b.by)}</p>
        </header>
        <div class="article-body">
          <p class="article-intro"><strong>${esc(a.intro)}</strong></p>
${body}
        </div>
        <aside class="article-cta">
          <h2>${esc(b.cta_h)}</h2>
          <div class="btn-row">${btn(PATHS.contact[i], b.cta)} ${btn(PATHS.services[i], t.ui.nav.services, "ghost")}</div>
        </aside>
      </article>`;
    const head = headTag({ lang, title: `${a.title} – ${G.name}`, desc: a.desc, canon: own, altFr, altEn, ld, ogType: "article" });
    return page({ head, lang, ns: "article", theme: "light", pageKey: "blog", switchTo, main });
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
