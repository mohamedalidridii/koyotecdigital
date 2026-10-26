// Static page generator: content/*.json -> HTML pages, blog pages and sitemap.
// Used by the CMS "Publish" button and by `npm run generate`.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, existsSync, renameSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Service landing pages, one search intent each. The key is also the content key in site.json.
export const LANDINGS = {
  lp_web: ["/creation-site-web-tunis", "/en/web-design-tunisia"],
};
// landing page of each service, in the order of home.cards / services.blocks (null: no page of its own)
const SERVICE_LANDING = ["lp_web", null, null, null, null, null];

// Fixed route table. URLs are not editable from the CMS on purpose.
const PATHS = {
  ...LANDINGS,
  home: ["/", "/en/"],
  services: ["/services", "/en/services"],
  art: ["/art-de-la-difference", "/en/art-of-difference"],
  // the engineering section is a separate Next app (engineering/), built into public/engineering
  engineering: ["/engineering/", "/engineering/en/"],
  blog: ["/blog", "/en/blog"],
  contact: ["/contact", "/en/contact"],
};
const LANGS = ["fr", "en"];
const LOCALE = { fr: "fr_TN", en: "en_US" };
const idx = (lang) => (lang === "fr" ? 0 : 1);
// routes outside the barba-driven pages: links to them must load the page for real
const ENGINEERING_ROUTES = ["", "expertise", "work", "studio", "engagements", "contact"];
const full = (k) => (k === "engineering" ? " data-barba-prevent" : "");

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
  const art = JSON.parse(readFileSync(join(root, "content/art.json"), "utf8"));
  return { site, blog, art };
}

export function generate(root = ROOT, content = loadContent(root), { write = true } = {}) {
  const { site, blog, art = loadContent(root).art } = content;
  const G = site.global;
  const SITE = G.domain.replace(/\/$/, "");
  const url = (page, lang) => SITE + PATHS[page][idx(lang)];
  const artPath = (lang, a) => (lang === "fr" ? "/blog/" : "/en/blog/") + a.slug;
  const partner = (lang, a) => blog[lang === "fr" ? "en" : "fr"].find((x) => x.id === a.id);

  // particle shape shown for each service, in the order of home.cards / services.blocks
  const SHAPES = ["browser", "glyph", "signal", "grid", "bag", "compass"];
  // decorative cursor labels (aria-hidden, so they stay out of the CMS)
  const CURSOR = {
    fr: { howl: "Cliquez", view: "Voir", read: "Lire", write: "Écrire", enter: "Entrer" },
    en: { howl: "Click", view: "View", read: "Read", write: "Write", enter: "Enter" },
  };
  const SKIP = { fr: "Aller au contenu", en: "Skip to content" };
  const pad = (n) => String(n).padStart(2, "0");

  // ---------- inline pictograms set inside the display type (decorative, no text content) ----------
  const svg = (name, body, vb = "0 0 40 40") =>
    `<svg class="g g-${name}" viewBox="${vb}" aria-hidden="true" focusable="false">${body}</svg>`;
  const GLYPH = {
    star: svg("star", '<path d="M20 2v36M2 20h36M7.3 7.3l25.4 25.4M32.7 7.3 7.3 32.7"/>'),
    moon: svg("moon", '<circle cx="20" cy="20" r="17"/><path class="fill" d="M20 3a17 17 0 0 1 0 34 11 17 0 0 0 0-34z"/>'),
    pin: svg("pin", '<path d="M20 2 38 20 20 38 2 20z"/><circle class="fill" cx="20" cy="20" r="3.5"/>'),
    arrow: svg("arrow", '<path d="M8 32 32 8M14 8h18v18"/>'),
    howl: svg("howl", '<path d="M2 20c3-9 6-9 9 0s6 9 9 0 6-9 9 0 6 9 9 0"/>', "0 0 40 40"),
    swap: svg("swap", '<path d="M4 14h30l-7-7M36 26H6l7 7"/>'),
    loop: svg("loop", '<path d="M6 26c0-12 10-16 18-12s8 16-2 16H10l5-5m-5 5 5 5"/>'),
  };
  // the KOYOTEC mark, traced from public/koyotec.png. Strokes use currentColor; the square stays brand red.
  // pathLength=1 lets the preloader draw it stroke by stroke. `id` keeps clip ids unique per instance.
  const LOGO_D = ["M220.5 10C175.75 9.25 132.75 31 92 90.25L19.66 206", "M79 1.5V72.5M80 112V206", "M142.1 106L233.1 206", "M1 104H246"];
  const logoPaths = () => LOGO_D.map((d, i) => `<path${i === 3 ? ' class="logo-bar"' : ""} pathLength="1" d="${d}"/>`).join("");
  const logo = (id, cls = "") =>
    `<svg class="logo-mark${cls ? " " + cls : ""}" viewBox="0 0 250 195" aria-hidden="true" focusable="false"><defs><clipPath id="kb-${id}"><rect width="250" height="194.5"/></clipPath></defs><g class="logo-strokes" clip-path="url(#kb-${id})">${logoPaths()}</g><rect class="logo-dot" x="232" y="2" width="18" height="18"/></svg>`;

  // boxed stacked labels, like a stamp, also decorative
  const stamp = (a, b, c) =>
    `<span class="stamp" aria-hidden="true"><span>${esc(a)}</span><span>${esc(b)}${c ? `<br />${esc(c)}` : ""}</span></span>`;
  const coords = () =>
    `<span class="coords" aria-hidden="true"><span>${esc(G.latitude)}</span><span>${esc(G.longitude)}</span></span>`;
  // place a glyph after the n-th word of a heading: "Création de site web ✳ et branding à Tunis ◐"
  const withGlyphs = (text, picks) => {
    const words = String(text).split(" ");
    return words
      .map((w, i) => esc(w) + (picks[i] ? `&nbsp;${picks[i]}` : ""))
      .join(" ");
  };
  const midGlyphs = (text, a, b) => {
    const n = String(text).split(" ").length;
    return withGlyphs(text, { [Math.max(0, Math.ceil(n / 2) - 1)]: a, [n - 1]: b });
  };

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

  function headTag({ lang, title, desc, canon, altFr, altEn, ld, ogType = "website", theme = "#f3f1ec", htmlClass = "" }) {
    return `<!DOCTYPE html>
<html lang="${lang}" class="no-js${htmlClass ? " " + htmlClass : ""}">
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
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="icon" href="/site-icon.png" type="image/png" sizes="512x512" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="theme-color" content="${theme}" />
    <meta name="author" content="${esc(G.name)}" />
    <script>(function(d){var e=d.documentElement;e.classList.replace("no-js","js");if(matchMedia("(prefers-reduced-motion: reduce)").matches)e.classList.add("is-reduced")})(document)</script>
    <link rel="preload" href="/fonts/instrument-serif-400.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/geist-variable.woff2" as="font" type="font/woff2" crossorigin />
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
        faqLd(p.faq),
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

  // text link with an arrow and a hairline that redraws on hover
  const link = (href, label, extra = "") =>
    `<a class="tlink" href="${esc(href)}"${extra}><span class="tlink-label">${esc(label)}</span><span class="tlink-arrow" aria-hidden="true">→</span></a>`;

  // persistent chrome that lives outside the swapped page: WebGL stage, cursor, transition curtain, preloader
  function chrome(lang) {
    return `  <a class="skip-link" href="#main">${SKIP[lang]}</a>
  <canvas class="gl" id="gl" aria-hidden="true"></canvas>
  <div class="gl-fallback" aria-hidden="true"></div>
  <div class="grain" aria-hidden="true"></div>
  <div class="cursor" aria-hidden="true"><span class="cursor-dot"></span><span class="cursor-label"></span></div>
  <div class="curtain" aria-hidden="true"><div class="curtain-panel"></div><p class="curtain-label"></p></div>
  <div class="preloader" aria-hidden="true">
    <svg class="pl-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="pl-clip"><rect width="250" height="194.5"/></clipPath>
        <mask id="pl-hole" maskUnits="userSpaceOnUse">
          <rect class="pl-fill" fill="#fff"/>
          <g class="pl-cut" opacity="0"><g class="pl-strokes" clip-path="url(#pl-clip)" stroke="#000">${logoPaths()}</g></g>
        </mask>
      </defs>
      <rect class="pl-paper pl-fill" mask="url(#pl-hole)"/>
      <g class="pl-ink"><g class="pl-strokes" clip-path="url(#pl-clip)">${logoPaths()}</g></g>
    </svg>
    <span class="pl-dot"></span>
    <p class="pl-top"><span>${esc(G.name)}&reg;</span><span>${esc(G.latitude)} / ${esc(G.longitude)}</span></p>
    <div class="pl-bottom">
      <p class="pl-odo">${[0, 1, 2].map((c) => `<span class="odo-col"><span class="odo-strip">${[...Array(c === 2 ? 11 : 10).keys()].map((d) => `<span>${d % 10}</span>`).join("")}</span></span>`).join("")}<span class="odo-pct">%</span></p>
      <p class="pl-words"><span class="pl-words-strip">${site[lang].home.cards.map(([n]) => `<span>${esc(n)}</span>`).join("")}</span></p>
    </div>
  </div>`;
  }

  function nav(lang, page, switchTo) {
    const ui = site[lang].ui; const i = idx(lang);
    const other = lang === "fr" ? "en" : "fr";
    const keys = ["home", "services", "engineering", "art", "blog", "contact"];
    const sw = switchTo || PATHS[page][idx(other)];
    const cur = (k) => (k === page ? ' aria-current="page"' : "");
    const links = keys
      .map((k, n) => `<li><a href="${PATHS[k][i]}"${k === "art" ? ' class="nav-art"' : ""}${full(k)}${cur(k)}>${k === "art" ? '<i class="nav-art-dot" aria-hidden="true"></i>' : ""}${esc(ui.nav[k])}</a>${n < keys.length - 1 ? "," : ""}</li>`)
      .join(" ");
    const items = keys
      .map((k, n) => `        <li><a href="${PATHS[k][i]}"${k === "art" ? ' class="nav-art"' : ""}${full(k)}${cur(k)}><span class="menu-idx">(${pad(n + 1)})</span><span class="menu-name">${esc(ui.nav[k])}</span>${k === "art" ? '<i class="nav-art-dot" aria-hidden="true"></i>' : ""}</a></li>`)
      .join("\n");
    return `    <header class="site-nav">
      <a class="brand" href="${PATHS.home[i]}" aria-label="${esc(G.name)} — ${esc(ui.nav.home)}">${logo("nav")}<span class="brand-name">${esc(G.name)}<sup>&reg;</sup></span></a>
      <nav class="nav-main" aria-label="${esc(ui.menu)}"><ul class="nav-links">${links}</ul></nav>
      <div class="nav-right">
        <a class="lang" href="${esc(sw)}" hreflang="${other}" lang="${other}">${other.toUpperCase()}</a>
        <a class="nav-cta" href="${PATHS.contact[i]}">${esc(ui.nav_cta)}</a>
        <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu"><span class="menu-btn-label" data-open="${esc(ui.menu)}" data-close="${esc(ui.close)}">${esc(ui.menu)}</span></button>
      </div>
    </header>

    <div class="menu" id="menu" inert>
      <div class="menu-bg" aria-hidden="true"></div>
      <nav class="menu-inner" aria-label="${esc(ui.menu)}">
        <ol class="menu-list">
${items}
        </ol>
      </nav>
      <div class="menu-foot">
        <a href="mailto:${esc(G.email)}">${esc(G.email)}</a>
        <a href="tel:${esc(G.phone)}">${esc(G.phoneDisplay)}</a>
        <a href="${esc(G.instagram)}" target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href="${esc(G.youtube)}" target="_blank" rel="noopener noreferrer">YouTube</a>
        <a href="${esc(sw)}" hreflang="${other}" lang="${other}">${esc(ui.other_lang)}</a>
      </div>
    </div>`;
  }

  // giant address lockup with inline pictograms (footer and contact page)
  function addressLockup(lang, tag = "p") {
    const ui = site[lang].ui;
    const [phonePrefix, ...phoneRest] = String(G.phoneDisplay).split(" ");
    const [mailUser, mailHost] = String(G.email).split("@");
    return `<${tag} class="address-lockup">
          <span class="al-line">${GLYPH.pin} ${esc(G.locality)} ${coords()} ${GLYPH.swap} ${esc(site[lang].contact.addr[1] || "")}</span>
          <a class="al-line" href="tel:${esc(G.phone)}">${esc(ui.footer_contact)} ${stamp(phonePrefix, phoneRest.slice(0, 1).join(" "), phoneRest.slice(1).join(" "))}<span class="visually-hidden">${esc(G.phoneDisplay)}</span></a>
          <a class="al-line" href="mailto:${esc(G.email)}">${esc(mailUser)}${GLYPH.loop}<span class="visually-hidden">@</span>${esc(mailHost)}</a>
        </${tag}>`;
  }

  function footer(lang) {
    const t = site[lang]; const ui = t.ui; const i = idx(lang);
    return `    <footer class="footer">
      <div class="shell">
        <div class="footer-cols">
          <div>
            <h2 class="footer-h">${esc(ui.footer_pages)}</h2>
            <a href="${PATHS.home[i]}">${esc(ui.nav.home)}</a>
            <a href="${PATHS.services[i]}">${esc(ui.nav.services)}</a>
            <a href="${PATHS.engineering[i]}" data-barba-prevent>${esc(ui.nav.engineering)}</a>
            <a href="${PATHS.art[i]}">${esc(ui.nav.art)}</a>
            <a href="${PATHS.blog[i]}">${esc(ui.nav.blog)}</a>
            <a href="${PATHS.contact[i]}">${esc(ui.nav.contact)}</a>
          </div>
          <div>
            <h2 class="footer-h">${esc(ui.nav.services)}</h2>
${Object.keys(LANDINGS).filter((k) => t[k]).map((k) => `            <a href="${PATHS[k][i]}">${esc(t[k].label)}</a>`).join("\n")}
          </div>
          <div>
            <h2 class="footer-h">${esc(ui.footer_follow)}</h2>
            <a href="${esc(G.instagram)}" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="${esc(G.youtube)}" target="_blank" rel="noopener noreferrer">YouTube</a>
          </div>
          <div>
            <h2 class="footer-h">${esc(t.home.foot_copy)}</h2>
            <a href="${PATHS.contact[i]}">${esc(ui.nav_cta)} →</a>
          </div>
        </div>
        <div class="footer-sign">
          ${addressLockup(lang)}
          ${logo("ft", "footer-mark")}
        </div>
        <div class="footer-bottom"><p>${esc(ui.based)}</p><p>&copy;${esc(G.year)} ${esc(G.name)}. ${esc(ui.rights)}</p></div>
      </div>
    </footer>`;
  }

  // full page: chrome + barba container (nav, main, footer) + single module entry
  function page({ head, lang, ns, pageKey, switchTo, main }) {
    return `${head}

<body>
${chrome(lang)}
  <div data-barba="wrapper">
  <div class="page" data-barba="container" data-barba-namespace="${ns}">
${nav(lang, pageKey, switchTo)}

    <main id="main">
${main}
    </main>

${footer(lang)}
  </div>
  </div>

  <script type="module" src="/scripts/main.js"></script>
</body>
</html>
`;
  }

  // section heading in the "Extras (13)" style: big serif title, count on the right, hairline below
  const sectionHead = (title, count, id) =>
    `<div class="sec-head" data-line><h2 class="sec-title"${id ? ` id="${id}"` : ""} data-split>${esc(title)}</h2><span class="sec-count" aria-hidden="true">(${pad(count)})</span></div>`;

  const stripNum = (t) => String(t).replace(/^\d+\.\s*/, "");

  // table rows: small label column + rows of number, title, text
  const processSection = (lang, h, steps) => `      <section class="table-sec" id="process" data-gl="constellation" data-gl-dim="0.5">
        <div class="shell">
          ${sectionHead(h, steps.length, "process-h")}
          <ol class="rows">
${steps.map(([a, b], n) => `            <li class="row" data-line><span class="row-num">${pad(n + 1)}</span><h3 class="row-title">${esc(stripNum(a))}</h3><p class="row-text">${esc(b)}</p></li>`).join("\n")}
          </ol>
        </div>
      </section>`;

  const faqRows = (items) => items.map(([q, a], n) => `            <details data-line><summary><span class="row-num">${pad(n + 1)}</span><span class="faq-q">${esc(q)}</span><i aria-hidden="true"></i></summary><div class="faq-a"><p>${esc(a)}</p></div></details>`).join("\n");
  const faqLd = (items) => ({ "@type": "FAQPage", mainEntity: items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) });

  const ctaSection = (lang, { kicker, h, giant, button }) => {
    const i = idx(lang);
    return `      <section class="cta" id="contact-cta" data-gl="orbit" data-gl-dim="0.45">
        <div class="shell">
          <p class="cta-kicker">${esc(kicker || h)}</p>
          <a class="cta-giant" href="${PATHS.contact[i]}" data-cursor="${CURSOR[lang].write}"><span class="cta-word">${esc(giant || h)}</span></a>
          <div class="cta-links">
            ${link(PATHS.contact[i], button)}
            ${link("tel:" + G.phone, G.phoneDisplay)}
          </div>
          ${kicker ? `<h2 class="visually-hidden">${esc(h)}</h2>` : ""}
        </div>
      </section>`;
  };

  // the service's own landing page when it has one, else the given fallback
  const serviceHref = (lang, n, fallback) => {
    const k = SERVICE_LANDING[n];
    return k && site[lang][k] ? PATHS[k][idx(lang)] : fallback;
  };

  // the signature list: big serif names on hairlines; hovering one gathers the particles into its shape
  const serviceList = (lang, items, href, count, more) => `          <ol class="svc-list">
${items.map(([a, b], n) => `            <li data-line><a class="svc-row" href="${serviceHref(lang, n, href)}" data-shape="${SHAPES[n % SHAPES.length]}" data-cursor="${CURSOR[lang].view}"><span class="svc-num">${pad(n + 1)}</span><span class="svc-name">${esc(a)}</span><span class="svc-desc">${esc(b)}</span></a></li>`).join("\n")}
          </ol>
          ${more ? `<p class="svc-more">${link(href, more)}</p>` : ""}`;

  // home teaser for the engineering section: the services list again, one row per discipline
  function engineeringTeaser(lang) {
    const e = site[lang].home.engineering; const i = idx(lang);
    const href = PATHS.engineering[i];
    const rows = e.items.map(([a, b], n) => `            <li data-line><a class="svc-row" href="${href}expertise/" data-barba-prevent data-shape="${SHAPES[(n + 2) % SHAPES.length]}" data-cursor="${CURSOR[lang].enter}"><span class="svc-num">${pad(n + 1)}</span><span class="svc-name">${esc(a)}</span><span class="svc-desc">${esc(b)}</span></a></li>`).join("\n");
    return `      <section class="services-home eng-teaser" id="engineering" data-gl="constellation" data-gl-dim="0.22">
        <div class="shell">
          <div class="label-row" data-line><span>${esc(e.kicker)} (${pad(e.items.length)})</span><span class="label-lead">${esc(e.lead)}</span></div>
          <h2 class="eng-teaser-title" data-split>${esc(e.title)}</h2>
          <ol class="svc-list">
${rows}
          </ol>
          <p class="svc-more">${link(href, e.cta, " data-barba-prevent")}</p>
        </div>
      </section>`;
  }

  // home teaser for the showcase: a stack of identical-looking pieces that bursts into thirty different identities
  function artTeaser(lang) {
    const h = site[lang].home; const i = idx(lang); const c = CURSOR[lang];
    const featured = art.filter((p) => p.featured);
    const letters = [...h.art_word].map((ch) => `<span class="art-l">${esc(ch)}</span>`).join("");
    const chips = featured.map((p) => {
      const prev = `/art/previews/${p.slug}`;
      return `            <a class="art-chip" href="${PATHS.art[i]}" style="--accent:${esc(p.accent)}" data-cursor="${c.enter}">
              <img src="${prev}.webp" alt="${esc(`${p.client}, ${p[lang].sector}`)}" width="1440" height="900" loading="lazy" decoding="async" />
              <video muted loop playsinline preload="none" aria-hidden="true" data-webm="${prev}.webm" data-mp4="${prev}.mp4"></video>
              <span class="art-chip-name">${esc(p.client)}</span>
            </a>`;
    }).join("\n");
    const names = art.map((p) => `<span>${esc(p.client)}</span><i>✳</i>`).join("");
    return `      <section class="art-teaser" id="art" data-gl="constellation" data-gl-dim="0.35">
        <div class="art-teaser-in shell">
          <p class="art-teaser-kicker">${stamp(h.art_kicker, pad(art.length))} <a href="${PATHS.art[i]}">${esc(site[lang].ui.nav.art)}</a></p>
          <h2 class="art-teaser-title"><span class="art-teaser-a">${esc(h.art_h)}</span> <span class="art-word" aria-label="${esc(h.art_word)}"><span aria-hidden="true">${letters}</span></span></h2>
          <div class="art-stack">
${chips}
          </div>
          <div class="art-teaser-foot">
            <p class="art-teaser-count" aria-hidden="true"><span class="art-teaser-n">01</span><i>/${pad(art.length)}</i> ${esc(h.art_count)}</p>
            <p class="art-teaser-lead">${esc(h.art_lead)}</p>
            <a class="art-teaser-cta" href="${PATHS.art[i]}" data-cursor="${c.enter}"><span class="cta-word">${esc(h.art_cta)}</span> ${GLYPH.arrow}</a>
          </div>
        </div>
        <div class="art-marquee" aria-hidden="true"><div class="art-marquee-track">${names}${names}</div></div>
      </section>`;
  }

  function home(lang) {
    const h = site[lang].home; const i = idx(lang); const c = CURSOR[lang];
    const pillars = h.points.map(([a, b], n) => `            <li data-line><span class="pillar-num">(${pad(n + 1)})</span><h3>${esc(a)}</h3><p>${esc(b)}</p></li>`).join("\n");
    const faq = faqRows(h.faq);
    const main = `      <section class="hero" data-gl="dunes" data-cursor="${c.howl}">
        <div class="hero-float shell" aria-hidden="true">
          <p class="float-a" data-scroll data-scroll-speed="0.15">${esc(h.hero_meta[0] || "")}</p>
          <p class="float-b" data-scroll data-scroll-speed="0.3">${esc(h.hero_meta[1] || "")}</p>
          <p class="float-c" data-scroll data-scroll-speed="0.08">${esc(G.latitude)}° N<br />${esc(G.longitude)}° E</p>
        </div>
        <div class="hero-foot shell">
          <div class="lockup">
            <p class="lockup-brand">${stamp("Web", "Brand", "SEO")} <span>${esc(G.name)}<sup>&reg;</sup></span></p>
            <h1 class="lockup-h1" data-split>${midGlyphs(h.h1, GLYPH.star, GLYPH.moon)}</h1>
          </div>
          <div class="hero-aside">
            <p class="hero-sub">${esc(h.sub)}</p>
            <div class="hero-links">
              ${link(PATHS.contact[i], h.cta_primary)}
              ${link(PATHS.services[i], h.cta_secondary)}
            </div>
          </div>
        </div>
        <p class="scroll-cue" aria-hidden="true">${esc(h.scroll_hint)} ↓</p>
      </section>

      <section class="services-home" id="services" data-gl="constellation" data-gl-dim="0.22">
        <div class="shell">
          <div class="label-row" data-line><span>${esc(h.services_kicker)} (${pad(h.cards.length)})</span><span class="label-lead">${esc(h.services_lead)}</span></div>
          <h2 class="visually-hidden">${esc(h.services_outline)} ${esc(h.services_bold)}</h2>
${serviceList(lang, h.cards, PATHS.services[i], h.cards.length, h.cards_more)}
        </div>
      </section>

${engineeringTeaser(lang)}

${artTeaser(lang)}

      <section class="statement" id="why" data-gl="dunes" data-gl-dim="0.3">
        <div class="shell">
          <h2 class="visually-hidden">${esc(h.why_h)}</h2>
          <p class="statement-text" data-words>${stamp("KYT", h.why_kicker)} ${inline(h.lead)} ${GLYPH.howl}</p>
          <div class="statement-foot">
            <div class="statement-copy">${h.about.map((x) => `<p>${esc(x)}</p>`).join("")}</div>
            <ul class="link-list">
              <li data-line>${link(PATHS.services[i], site[lang].ui.nav.services)}</li>
              <li data-line>${link(PATHS.contact[i], site[lang].ui.nav.contact)}</li>
            </ul>
          </div>
          <ol class="pillars">
${pillars}
          </ol>
        </div>
      </section>

${processSection(lang, h.process_h, h.process)}

      <section class="table-sec faq" id="faq" data-gl="constellation" data-gl-dim="0.3">
        <div class="shell">
          ${sectionHead(h.faq_h, h.faq.length, "faq-h")}
          <div class="faq-list">
${faq}
          </div>
        </div>
      </section>

${ctaSection(lang, { kicker: h.cta_sub, h: h.cta_h, giant: h.cta_giant, button: h.cta_btn })}`;
    return page({ head: pageHead(lang, "home"), lang, ns: "home", pageKey: "home", main });
  }

  function services(lang) {
    const s = site[lang].services; const i = idx(lang);
    const blocks = s.blocks.map(([a, b], n) => {
      const own = serviceHref(lang, n, null);
      return `          <article class="svc-block" data-line data-gl="${SHAPES[n % SHAPES.length]}" data-gl-dim="0.9">
            <span class="svc-block-num">(${pad(n + 1)})</span>
            <h3 class="svc-block-title" data-split>${esc(a)}</h3>
            <div class="svc-block-text"><p>${esc(b)}</p>${own ? `<p class="svc-block-more">${link(own, site[lang].home.cards_more)}</p>` : ""}</div>
          </article>`;
    }).join("\n");
    const main = `      <section class="page-hero" data-gl="constellation" data-gl-dim="0.5">
        <div class="shell">
          <p class="lockup-brand">${stamp("Web", "Brand", "SEO")} <span>${esc(site[lang].ui.nav.services)}</span></p>
          <h1 class="lockup-h1 page-title" data-split>${midGlyphs(s.h1, GLYPH.star, GLYPH.arrow)}</h1>
          <div class="page-hero-foot" data-line>
            <p class="hero-sub">${esc(s.sub)}</p>
            ${link(PATHS.contact[i], s.cta)}
          </div>
        </div>
      </section>

      <section class="svc-detail" aria-labelledby="svc-h">
        <div class="shell">
          ${sectionHead(s.h2, s.blocks.length, "svc-h")}
${blocks}
        </div>
      </section>

${processSection(lang, s.process_h, s.process)}

${ctaSection(lang, { h: s.cta_h, button: s.cta })}`;
    return page({ head: pageHead(lang, "services"), lang, ns: "services", pageKey: "services", main });
  }

  // service landing page: one search intent, long-form copy, method, concept examples, FAQ
  function landing(lang, key) {
    const l = site[lang][key]; const ui = site[lang].ui; const i = idx(lang); const c = CURSOR[lang];
    const own = PATHS[key][i];
    const body = l.sections.map(([h, t]) => `          <h2>${esc(h)}</h2>\n          ${bodyHtml(t)}`).join("\n");
    const pieces = l.examples.map((slug) => art.find((p) => p.slug === slug)).filter(Boolean);
    const examples = pieces.map((p, n) => `            <li data-line><a class="svc-row" href="/art-de-la-difference/${p.slug}/" target="_blank" rel="noopener" data-barba-prevent data-cursor="${c.enter}"><span class="svc-num">${pad(n + 1)}</span><span class="svc-name">${esc(p.client)}</span><span class="svc-desc">${esc(p[lang].sector)} · ${esc(p[lang].line)}</span></a></li>`).join("\n");
    const others = Object.keys(LANDINGS).filter((k) => k !== key && site[lang][k]).map((k) => [PATHS[k][i], site[lang][k].label]);
    const posts = l.posts.map((id) => blog[lang].find((a) => a.id === id)).filter(Boolean).map((a) => [artPath(lang, a), a.title]);
    const related = [...others, ...posts, [PATHS.services[i], ui.nav.services], [PATHS.art[i], ui.nav.art]]
      .map(([href, label]) => `              <li data-line>${link(href, label)}</li>`).join("\n");
    const ld = graph(
      org(lang),
      {
        "@type": "Service", name: l.h1, serviceType: l.label, description: l.desc, url: SITE + own, inLanguage: lang,
        provider: { "@id": SITE + "/#organization" }, areaServed: [{ "@type": "Country", name: "Tunisia" }],
      },
      faqLd(l.faq),
      crumbs([ui.nav.home, url("home", lang)], [ui.nav.services, url("services", lang)], [l.label, SITE + own]),
    );
    const main = `      <section class="page-hero" data-gl="constellation" data-gl-dim="0.5">
        <div class="shell">
          <p class="lockup-brand">${stamp("Web", "Brand", "SEO")} <span>${esc(l.label)}</span></p>
          <h1 class="lockup-h1 page-title" data-split>${midGlyphs(l.h1, GLYPH.star, GLYPH.pin)}</h1>
          <div class="page-hero-foot" data-line>
            <p class="hero-sub">${esc(l.sub)}</p>
            ${link(PATHS.contact[i], l.cta)}
          </div>
        </div>
      </section>

      <section class="landing-copy" data-gl="off">
        <div class="article-body">
          <p class="article-intro">${esc(l.intro)}</p>
${body}
        </div>
      </section>

${processSection(lang, l.process_h, l.process)}

      <section class="services-home" id="examples" data-gl="constellation" data-gl-dim="0.22">
        <div class="shell">
          ${sectionHead(l.examples_h, pieces.length, "examples-h")}
          <p class="hero-sub" data-line>${esc(l.examples_lead)}</p>
          <ol class="svc-list">
${examples}
          </ol>
          <p class="svc-more">${link(PATHS.art[i], ui.nav.art)}</p>
        </div>
      </section>

      <section class="table-sec faq" id="faq" data-gl="constellation" data-gl-dim="0.3">
        <div class="shell">
          ${sectionHead(l.faq_h, l.faq.length, "faq-h")}
          <div class="faq-list">
${faqRows(l.faq)}
          </div>
        </div>
      </section>

      <section class="table-sec" id="related" aria-labelledby="related-h">
        <div class="shell">
          ${sectionHead(l.related_h, others.length + posts.length + 2, "related-h")}
          <ul class="link-list">
${related}
          </ul>
        </div>
      </section>

${ctaSection(lang, { h: l.cta_h, button: l.cta })}`;
    const head = headTag({ lang, title: l.title, desc: l.desc, canon: own, altFr: PATHS[key][0], altEn: PATHS[key][1], ld });
    return page({ head, lang, ns: "services", pageKey: "services", switchTo: PATHS[key][idx(lang === "fr" ? "en" : "fr")], main });
  }

  function contact(lang) {
    const c = site[lang].contact; const h = site[lang].home;
    const types = h.cards.map(([a]) => `<label class="chip"><input type="checkbox" name="type" value="${esc(a)}" /><span>${esc(a)}</span></label>`).join("")
      + `<label class="chip chip-art"><input type="checkbox" name="type" value="${esc(c.f_art)}" /><span><i class="chip-dot" aria-hidden="true"></i>${esc(c.f_art)}</span></label>`
      + `<label class="chip"><input type="checkbox" name="type" value="${esc(c.f_other)}" data-other /><span>${esc(c.f_other)}</span></label>`;
    const main = `      <section class="contact page-hero" data-gl="orbit" data-gl-dim="0.25">
        <div class="shell">
          <p class="lockup-brand">${stamp("Hello", c.drop)} <span>${esc(c.love)}</span></p>
          <h1 class="lockup-h1 page-title" data-split>${midGlyphs(c.h1, GLYPH.howl, GLYPH.pin)}</h1>
        </div>
      </section>
      <section class="contact-body">
        <div class="shell contact-grid">
          <div class="contact-info">
            ${addressLockup(lang, "address")}
            <p class="contact-social"><a href="${esc(G.instagram)}" target="_blank" rel="noopener noreferrer">Instagram</a>, <a href="${esc(G.youtube)}" target="_blank" rel="noopener noreferrer">YouTube</a></p>
          </div>
          <form class="contact-form" action="${esc(G.formEndpoint)}" method="post" data-endpoint="${esc(G.formEndpoint)}" data-lang="${lang}" data-email="${esc(G.email)}" data-done="${esc(c.f_done)}" data-error="${esc(c.f_error)}" data-sending="${esc(c.f_sending)}">
            <h2 class="form-h">${esc(c.form_h)}</h2>
            <label class="field" data-line><span>${esc(c.f_name)}</span><input name="name" autocomplete="name" required /></label>
            <label class="field" data-line><span>${esc(c.f_email)}</span><input name="email" type="email" autocomplete="email" required /></label>
            <fieldset class="chips" data-line><legend>${esc(c.f_type)}</legend>${types}</fieldset>
            <label class="field other-field" data-line hidden><span>${esc(c.f_other_label)}</span><input name="other" maxlength="200" /></label>
            <label class="field" data-line><span>${esc(c.f_msg)}</span><textarea name="message" rows="4" required></textarea></label>
            <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" />
            <div class="form-foot">
              <button class="send" type="submit" data-cursor="${CURSOR[lang].write}"><span>${esc(c.f_send)}</span> ${GLYPH.arrow}</button>
              <p class="form-note">${esc(c.f_note)}</p>
            </div>
            <p class="form-done" role="status" aria-live="polite"></p>
          </form>
        </div>
      </section>`;
    return page({ head: pageHead(lang, "contact"), lang, ns: "contact", pageKey: "contact", main });
  }

  // the exhibition: every showcase piece as a framed card that opens its live concept in a viewer
  function artPage(lang) {
    const a = site[lang].art; const i = idx(lang); const c = CURSOR[lang];
    const n = pad(art.length);
    const pieces = art.map((p, k) => {
      const t = p[lang];
      const href = `/art-de-la-difference/${p.slug}/`;
      const prev = `/art/previews/${p.slug}`;
      return `            <li class="art-piece" data-kind="${esc(p.kind)}" style="--accent:${esc(p.accent)}">
              <a class="art-card" href="${href}" target="_blank" rel="noopener" data-barba-prevent data-slug="${esc(p.slug)}" data-cursor="${c.enter}">
                <span class="art-frame">
                  <img class="art-poster" src="${prev}.webp" alt="${esc(`${a.piece} ${pad(k + 1)} : ${p.client}, ${t.sector}`)}" width="1440" height="900" loading="lazy" decoding="async" />
                  <video class="art-video" muted loop playsinline preload="none" aria-hidden="true" data-webm="${prev}.webm" data-mp4="${prev}.mp4"></video>
                </span>
                <span class="art-meta"><span class="art-num">${esc(a.piece)} ${pad(k + 1)}<i>/${n}</i></span><span class="art-kind">${esc(a["kind_" + p.kind])}</span></span>
                <span class="art-client">${esc(p.client)}</span>
                <span class="art-sector">${esc(t.sector)} · ${esc(p.year)}</span>
                <span class="art-line">${esc(t.line)}</span>
              </a>
            </li>`;
    }).join("\n");
    const filters = [["all", a.all], ["entreprise", a.business], ["personal", a.personal]]
      .map(([k, label], j) => `<button class="art-filter" type="button" data-filter="${k}" aria-pressed="${j === 0}">${esc(label)} <sup>${pad(k === "all" ? art.length : art.filter((p) => p.kind === k).length)}</sup></button>`)
      .join("");
    const letters = [...a.word].map((ch) => `<span class="art-l">${esc(ch)}</span>`).join("");
    const ld = graph(
      org(lang),
      {
        "@type": "CollectionPage", name: a.h1, description: a.desc, url: url("art", lang), inLanguage: lang,
        hasPart: art.map((p) => ({ "@type": "CreativeWork", name: `${p.client} — ${p[lang].sector}`, url: SITE + `/art-de-la-difference/${p.slug}/`, creator: { "@id": SITE + "/#organization" } })),
      },
      crumbs([site[lang].ui.nav.home, url("home", lang)], [a.h1, url("art", lang)]),
    );
    const main = `      <section class="art-hero" data-gl="off">
        <div class="shell">
          <p class="lockup-brand art-brand">${stamp(a.kicker, n)} <span>${esc(a.note)}</span></p>
          <h1 class="art-title"><span class="art-title-a">${esc(a.h1.slice(0, a.h1.lastIndexOf(" ")))}</span> <span class="art-word" aria-label="${esc(a.word)}"><span aria-hidden="true">${letters}</span></span></h1>
          <div class="art-hero-foot" data-line>
            <p class="hero-sub">${esc(a.lead)}</p>
            <p class="art-count" aria-hidden="true"><span>${n}</span> ${esc(a.count_a)} <i>/</i> <span>${n}</span> ${esc(a.count_b)}</p>
          </div>
        </div>
        <p class="scroll-cue art-cue" aria-hidden="true">${esc(a.scroll)} →</p>
      </section>

      <section class="art-expo" aria-label="${esc(a.h1)}" data-gl="off">
        <div class="art-bar shell">
          <div class="art-filters" role="group" aria-label="${esc(a.kicker)}">${filters}</div>
          <p class="art-progress" aria-hidden="true"><span class="art-progress-n">01</span> / ${n}</p>
        </div>
        <div class="art-stage">
          <ol class="art-track">
${pieces}
          </ol>
        </div>
      </section>

      <dialog class="art-viewer" aria-label="${esc(a.h1)}" data-label-piece="${esc(a.piece)}">
        <div class="art-viewer-bar">
          <p class="art-viewer-title"><span class="art-viewer-num"></span> <span class="art-viewer-client"></span> <span class="art-viewer-sector"></span></p>
          <div class="art-viewer-actions">
            <button type="button" class="art-viewer-btn" data-step="-1" aria-label="${esc(a.prev)}">←</button>
            <button type="button" class="art-viewer-btn" data-step="1" aria-label="${esc(a.next)}">→</button>
            <a class="art-viewer-btn art-viewer-open" href="#" target="_blank" rel="noopener" data-barba-prevent>${esc(a.open)} ↗</a>
            <button type="button" class="art-viewer-btn art-viewer-close">${esc(a.close)} ✕</button>
          </div>
        </div>
        <div class="art-viewer-screen"><iframe title="${esc(a.h1)}" loading="lazy" referrerpolicy="same-origin"></iframe></div>
      </dialog>

${ctaSection(lang, { h: a.cta_h, button: a.cta })}`;
    const head = headTag({ lang, title: a.title, desc: a.desc, canon: PATHS.art[i], altFr: PATHS.art[0], altEn: PATHS.art[1], ld, theme: "#0d0d0d", htmlClass: "is-art" });
    return page({ head, lang, ns: "art", pageKey: "art", main });
  }

  function blogIndex(lang) {
    const b = site[lang].blog; const i = idx(lang);
    const list = blog[lang];
    const rows = list.map((a, n) => `          <li data-line><a class="post-row" href="${artPath(lang, a)}" data-cursor="${CURSOR[lang].read}">
            <span class="post-num">${pad(n + 1)}</span>
            <span class="post-title">${esc(a.title)}</span>
            <span class="post-desc">${esc(a.desc)}</span>
            <span class="post-meta"><time datetime="${esc(a.date)}">${esc(a.date)}</time> ${b.read ? `· ${esc(b.read)} →` : ""}</span>
          </a></li>`).join("\n");
    const ld = {
      "@context": "https://schema.org", "@type": "Blog", name: b.h1, url: SITE + PATHS.blog[i],
      publisher: { "@id": SITE + "/#organization" }, inLanguage: lang,
      blogPost: list.map((a) => ({ "@type": "BlogPosting", headline: a.title, url: SITE + artPath(lang, a), datePublished: a.date })),
    };
    const main = `      <section class="page-hero blog-head" data-gl="off">
        <div class="shell">
          <p class="lockup-brand">${stamp("Blog", b.kicker)} <span>${esc(b.by)}</span></p>
          <h1 class="lockup-h1 page-title" data-split>${midGlyphs(b.h1, GLYPH.star, GLYPH.moon)}</h1>
          <div class="page-hero-foot" data-line><p class="hero-sub">${esc(b.lead)}</p><span class="sec-count" aria-hidden="true">(${pad(list.length)})</span></div>
        </div>
      </section>
      <section class="shell blog-list" aria-label="${esc(b.h1)}">
        <ol class="post-rows">
${rows}
        </ol>
      </section>`;
    const head = headTag({ lang, title: b.title, desc: b.desc, canon: PATHS.blog[i], altFr: PATHS.blog[0], altEn: PATHS.blog[1], ld });
    return page({ head, lang, ns: "blog", pageKey: "blog", main });
  }

  // landing pages that list this article among their related posts
  const landingsFor = (lang, a) =>
    Object.keys(LANDINGS).filter((k) => site[lang][k]?.posts.includes(a.id)).map((k) => [PATHS[k][idx(lang)], site[lang][k].label]);

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
      <article class="article" data-gl="off">
        <header class="article-head shell">
          <nav class="crumbs" aria-label="Breadcrumb"><a href="${PATHS.home[i]}">${esc(b.home)}</a>, <a href="${PATHS.blog[i]}">Blog</a></nav>
          <h1 class="article-title" data-split>${esc(a.h1)}</h1>
          <p class="meta" data-line><time datetime="${esc(a.date)}">${esc(a.date)}</time><span>${esc(b.by)}</span></p>
        </header>
        <div class="article-body">
          <p class="article-intro">${esc(a.intro)}</p>
${body}
        </div>
        <aside class="article-cta shell">
          <h2>${esc(b.cta_h)}</h2>
          <div class="cta-links">${link(PATHS.contact[i], b.cta)} ${landingsFor(lang, a).map(([href, label]) => link(href, label)).join(" ") || link(PATHS.services[i], t.ui.nav.services)}</div>
        </aside>
      </article>`;
    const head = headTag({ lang, title: `${a.title} – ${G.name}`, desc: a.desc, canon: own, altFr, altEn, ld, ogType: "article" });
    return page({ head, lang, ns: "article", pageKey: "blog", switchTo, main });
  }

  function sitemap() {
    const entries = [];
    for (const page of ["home", "services", ...Object.keys(LANDINGS).filter((k) => site.fr[k] && site.en[k]), "art", "blog", "contact"]) {
      entries.push({ fr: PATHS[page][0], en: PATHS[page][1] });
    }
    for (const r of ENGINEERING_ROUTES) {
      entries.push({ fr: PATHS.engineering[0] + (r && `${r}/`), en: PATHS.engineering[1] + (r && `${r}/`) });
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
    "art-de-la-difference.html": artPage("fr"), "en/art-of-difference.html": artPage("en"),
    "blog/index.html": blogIndex("fr"), "en/blog/index.html": blogIndex("en"),
    "public/sitemap.xml": sitemap(),
  };
  for (const lang of LANGS) {
    for (const k of Object.keys(LANDINGS)) {
      if (site[lang][k]) files[PATHS[k][idx(lang)].slice(1) + ".html"] = landing(lang, k);
    }
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
