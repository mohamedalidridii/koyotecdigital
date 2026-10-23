// Builds every showcase piece (showcase/<slug>) into public/art-de-la-difference/<slug>/.
// Each piece is served from a sub-path, so its output is rebased and gets a "Concept KOYOTEC" badge.
// Usage: node scripts/showcase/build.mjs [slug ...]   (no slug = all)
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync, rmSync, mkdirSync, cpSync, symlinkSync } from "node:fs";
import { join, resolve, dirname, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SRC = join(ROOT, "showcase");
const OUT = join(ROOT, "public/art-de-la-difference");
const TEMPLATES = join(process.env.HOME, "Downloads/templates");
export const BASE = "/art-de-la-difference";

const pieces = JSON.parse(readFileSync(join(ROOT, "content/art.json"), "utf8"));
const only = process.argv.slice(2);

const sh = (cmd, cwd) => execSync(cmd, { cwd, stdio: "inherit", env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" } });

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

// reuse the node_modules shipped with the original template when there is one, install otherwise
function ensureDeps(dir, piece) {
  if (!existsSync(join(dir, "package.json")) || existsSync(join(dir, "node_modules"))) return;
  const original = join(TEMPLATES, piece.source, "node_modules");
  if (existsSync(original)) symlinkSync(original, join(dir, "node_modules"), "dir");
  else sh("npm install --no-audit --no-fund --loglevel=error", dir);
}

function buildNext(dir, base) {
  const config = join(dir, "next.config.mjs");
  writeFileSync(
    config,
    `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "${base}",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
`
  );
  const major = Number(JSON.parse(readFileSync(join(dir, "node_modules/next/package.json"), "utf8")).version.split(".")[0]);
  sh(`npx next build${major >= 16 ? " --webpack" : ""}`, dir);
  return join(dir, "out");
}

function buildVite(dir, base) {
  const out = join(dir, "dist");
  sh(`npx vite build --base=${base}/ --outDir dist --emptyOutDir`, dir);
  return out;
}

// plain HTML: copy the site as is (relative paths already work under a sub-path)
function buildStatic(dir) {
  const out = join(dir, ".static-out");
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out);
  for (const f of readdirSync(dir)) {
    if ([".static-out", "node_modules", "package.json", "package-lock.json", "README.md"].includes(f)) continue;
    cpSync(join(dir, f), join(out, f), { recursive: true });
  }
  return out;
}

// root-absolute references ("/images/a.jpg", "/work") only work at a domain root: point them at the piece's base
// (Next already prefixes its own routes and chunks, so there only public/ files are rebased)
function rebase(out, base, publicDir) {
  const top = (publicDir ? (existsSync(publicDir) ? readdirSync(publicDir) : []) : readdirSync(out)).filter((f) => f !== "index.html");
  const pages = new Set(top.filter((f) => f.endsWith(".html")).map((f) => f.slice(0, -5)));
  // for Next, a public folder may share its name with a route ("/catalog"), so folders only match as "/catalog/…"
  const root = publicDir || out;
  const isDir = (f) => statSync(join(root, f)).isDirectory();
  const esc = (f) => f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const names = top.map((f) => (publicDir && isDir(f) ? `${esc(f)}(?=\\/)` : esc(f))).join("|");
  const asset = names && new RegExp(`(["'\`(=,\\s])\\/(?:${names})(?=[\\/"'\`)?#\\s,]|$)`, "g");
  for (const file of walk(out)) {
    const ext = extname(file);
    if (![".html", ".js", ".css", ".json", ".txt", ".webmanifest"].includes(ext)) continue;
    let s = readFileSync(file, "utf8");
    const before = s;
    if (asset) s = s.replace(asset, (m, pre) => `${pre}${base}${m.slice(pre.length)}`);
    // clean page links (/work -> /base/work.html) and links to the root
    s = s.replace(/(href=|location\.href\s*=\s*)(["'])\/([a-z0-9-]+)\/?\2/gi, (m, attr, q, name) =>
      pages.has(name) ? `${attr}${q}${base}/${name}.html${q}` : m
    );
    if (ext === ".html") s = s.replace(/href=(["'])\/\1/g, `href=$1${base}/$1`);
    if (s !== before) writeFileSync(file, s);
  }
}

function badge(out, piece) {
  const html = `<a href="${BASE}" target="_top" id="koy-badge" style="position:fixed;left:12px;bottom:12px;z-index:2147483647;display:flex;gap:8px;align-items:center;padding:7px 11px;border-radius:999px;background:rgba(13,13,13,.82);color:#f3f1ec;font:500 11px/1 system-ui,sans-serif;letter-spacing:.04em;text-decoration:none;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)"><span style="width:7px;height:7px;background:#ff0000"></span>Concept KOYOTEC · ${piece.client}</a>`;
  const script = `<script>addEventListener("DOMContentLoaded",function(){if(window.self!==window.top||document.getElementById("koy-badge"))return;document.body.insertAdjacentHTML("beforeend",${JSON.stringify(html)})})</script>`;
  for (const file of walk(out).filter((f) => f.endsWith(".html"))) {
    const s = readFileSync(file, "utf8");
    if (s.includes("koy-badge")) continue;
    writeFileSync(file, s.includes("</head>") ? s.replace("</head>", `${script}</head>`) : script + s);
  }
}

const failed = [];
for (const piece of pieces) {
  if (only.length && !only.includes(piece.slug)) continue;
  const dir = join(SRC, piece.slug);
  const base = `${BASE}/${piece.slug}`;
  console.log(`\n▸ ${piece.slug} (${piece.framework})`);
  try {
    ensureDeps(dir, piece);
    const out =
      piece.framework === "next" ? buildNext(dir, base) : piece.framework === "vite" ? buildVite(dir, base) : buildStatic(dir);
    rebase(out, base, piece.framework === "next" && join(dir, "public"));
    badge(out, piece);
    const dest = join(OUT, piece.slug);
    rmSync(dest, { recursive: true, force: true });
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(out, dest, { recursive: true, filter: (f) => !f.endsWith(".DS_Store") });
    if (piece.framework === "static") rmSync(out, { recursive: true, force: true });
    console.log(`✓ ${piece.slug} -> ${relative(ROOT, dest)}`);
  } catch (err) {
    failed.push(piece.slug);
    console.error(`✗ ${piece.slug}: ${err.message.split("\n")[0]}`);
  }
}
console.log(failed.length ? `\nfailed: ${failed.join(", ")}` : "\nall pieces built");
process.exitCode = failed.length ? 1 : 0;
