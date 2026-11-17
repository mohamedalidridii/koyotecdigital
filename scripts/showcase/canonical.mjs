// Gives every HTML page of the built showcase pieces a self-referencing canonical URL
// (https://www.koyotec.digital/art-de-la-difference/<slug>/<page>/), so search engines do not pick
// one themselves between /<page> and /<page>/. An existing canonical (a redirect page pointing at fr/)
// keeps its target, made absolute. Error pages (404) are left alone.
// Called by build.mjs after each piece; run on its own to tag what is already built:
//   node scripts/showcase/canonical.mjs
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, resolve, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://www.koyotec.digital";
const BASE = "/art-de-la-difference";

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

export function addCanonical(dir, base) {
  const TAG = /<link\b[^>]*\brel=["']?canonical\b["']?[^>]*>/i;
  let n = 0;
  for (const file of walk(dir).filter((f) => f.endsWith(".html"))) {
    const rel = relative(dir, file).split(sep).join("/");
    if (/(^|\/)(404|_not-found)(\/|\.html$)/.test(rel)) continue;
    const self = `${SITE}${base}/${rel.replace(/(^|\/)index\.html$/, "$1")}`;
    let s = readFileSync(file, "utf8");
    const found = s.match(TAG);
    let href = self;
    if (found) {
      const h = found[0].match(/\bhref=["']([^"']+)["']/i);
      const target = h && new URL(h[1], self);
      if (target && target.origin === SITE && target.pathname.startsWith(`${base}/`)) href = target.href;
    }
    const link = `<link rel="canonical" href="${href}">`;
    if (found) {
      if (found[0] === link) continue;
      s = s.replace(found[0], link);
    } else s = s.includes("</head>") ? s.replace("</head>", `${link}</head>`) : link + s;
    writeFileSync(file, s);
    n++;
  }
  return n;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = join(ROOT, "public", BASE.slice(1));
  let total = 0;
  for (const slug of readdirSync(out)) {
    const dir = join(out, slug);
    if (existsSync(join(dir, "index.html"))) total += addCanonical(dir, `${BASE}/${slug}`);
  }
  console.log(`canonical set on ${total} pages`);
}
