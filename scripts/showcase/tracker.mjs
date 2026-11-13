// Adds the Umami tracker (cookieless analytics, same website as koyotec.digital) to every HTML page
// of the built showcase pieces, so visits to the live concepts are counted too.
// Called by build.mjs after each piece; run on its own to tag what is already built:
//   node scripts/showcase/tracker.mjs
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const { analytics } = JSON.parse(readFileSync(join(ROOT, "content/site.json"), "utf8")).global;

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

export function addTracker(dir) {
  if (!analytics?.id) return 0;
  const tag = `<script defer src="${analytics.src}" data-website-id="${analytics.id}" data-domains="www.koyotec.digital,koyotec.digital"></script>`;
  let n = 0;
  for (const file of walk(dir).filter((f) => f.endsWith(".html"))) {
    const s = readFileSync(file, "utf8");
    if (s.includes(analytics.id)) continue;
    writeFileSync(file, s.includes("</head>") ? s.replace("</head>", `${tag}</head>`) : tag + s);
    n++;
  }
  return n;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = join(ROOT, "public/art-de-la-difference");
  let total = 0;
  for (const slug of readdirSync(out)) {
    const dir = join(out, slug);
    if (existsSync(join(dir, "index.html"))) total += addTracker(dir);
  }
  console.log(`tracker added to ${total} pages`);
}
