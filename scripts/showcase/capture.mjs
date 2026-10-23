// Records the preview of every built showcase piece: a poster (webp) and a short scroll-through
// clip (webm + mp4) in public/art/previews/. `--check` only loads each piece and reports
// failed requests and page errors, with a screenshot in the scratch folder.
// Usage: node scripts/showcase/capture.mjs [--check] [slug ...]
import { createServer } from "node:http";
import { execFileSync } from "node:child_process";
import { createReadStream, existsSync, mkdirSync, readFileSync, statSync, rmSync, readdirSync } from "node:fs";
import { join, resolve, dirname, extname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const PUBLIC = join(ROOT, "public");
const OUT = join(PUBLIC, "art/previews");
const TMP = join(process.env.CAPTURE_TMP || tmpdir(), "koy-capture");
const W = 1440, H = 900;
const SETTLE = 10000; // most pieces open with a preloader (a piece can set its own "settle" in ms)
const CLIP = 6; // seconds

const args = process.argv.slice(2);
const check = args.includes("--check");
const force = args.includes("--force"); // otherwise pieces that already have a preview are skipped
const only = args.filter((a) => !a.startsWith("--"));
const pieces = JSON.parse(readFileSync(join(ROOT, "content/art.json"), "utf8")).filter((p) => !only.length || only.includes(p.slug));

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".gif": "image/gif",
  ".mp4": "video/mp4", ".webm": "video/webm", ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".otf": "font/otf", ".ico": "image/x-icon",
  ".glb": "model/gltf-binary", ".txt": "text/plain",
};

// public/ served at the domain root, like Vercel does; directories resolve to their index.html
const server = createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let file = join(PUBLIC, path);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  else if (!existsSync(file) && existsSync(file + ".html")) file += ".html";
  if (!file.startsWith(PUBLIC) || !existsSync(file)) {
    res.writeHead(404).end("not found");
    return;
  }
  const size = statSync(file).size;
  const type = MIME[extname(file).toLowerCase()] || "application/octet-stream";
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || "");
  if (range) {
    const start = Number(range[1] || 0), end = range[2] ? Number(range[2]) : size - 1;
    res.writeHead(206, { "Content-Type": type, "Content-Range": `bytes ${start}-${end}/${size}`, "Accept-Ranges": "bytes", "Content-Length": end - start + 1 });
    createReadStream(file, { start, end }).pipe(res);
  } else {
    res.writeHead(200, { "Content-Type": type, "Content-Length": size, "Accept-Ranges": "bytes" });
    createReadStream(file).pipe(res);
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = `http://127.0.0.1:${server.address().port}`;

const ff = (...a) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...a]);
const launch = () => chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required", "--enable-gpu-rasterization", "--ignore-gpu-blocklist"] });
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

const report = [];
for (const piece of pieces) {
  if (!check && !force && existsSync(join(OUT, `${piece.slug}.mp4`))) continue;
  // a fresh browser per piece: some pieces are heavy WebGL scenes
  const browser = await launch();
  const url = `${origin}/art-de-la-difference/${piece.slug}/`;
  const vidDir = join(TMP, piece.slug);
  rmSync(vidDir, { recursive: true, force: true });
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
    ...(check ? {} : { recordVideo: { dir: vidDir, size: { width: W, height: H } } }),
  });
  const t0 = Date.now();
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push(`error: ${e.message.split("\n")[0]}`));
  page.on("response", (r) => r.status() >= 400 && problems.push(`${r.status()} ${r.url().replace(origin, "")}`));
  page.on("requestfailed", (r) => !/\.(mp4|webm)$/.test(r.url()) && problems.push(`failed ${r.url().replace(origin, "")}`));
  try {
    await page.goto(url, { waitUntil: "load", timeout: 45000 });
  } catch (e) {
    problems.push(`goto: ${e.message.split("\n")[0]}`);
  }
  await page.mouse.move(W * 0.5, H * 0.55);
  await page.waitForTimeout(piece.settle || SETTLE);
  // the badge is for visitors of the live piece, not for the preview
  await page.evaluate(() => document.getElementById("koy-badge")?.remove()).catch(() => {});

  if (check) {
    await page.screenshot({ path: join(TMP, `${piece.slug}.png`) });
    await context.close();
    await browser.close();
    report.push([piece.slug, problems]);
    console.log(`${problems.length ? "✗" : "✓"} ${piece.slug}${problems.length ? "\n    " + [...new Set(problems)].slice(0, 8).join("\n    ") : ""}`);
    continue;
  }

  const start = (Date.now() - t0) / 1000;
  // a slow scroll-through with a drifting pointer, so hover and scroll effects show
  const steps = CLIP * 10;
  for (let i = 0; i < steps; i++) {
    await page.mouse.move(W * (0.35 + 0.3 * Math.sin(i / 9)), H * (0.45 + 0.15 * Math.cos(i / 7)));
    await page.mouse.wheel(0, 70);
    await page.waitForTimeout(100);
  }
  const video = page.video();
  await context.close();
  await browser.close();
  const raw = await video.path();

  const base = join(OUT, piece.slug);
  // the poster is a frame from just after the scroll begins, when any intro has played
  const posterPng = join(TMP, `${piece.slug}.png`);
  ff("-ss", String(start + 1.2), "-i", raw, "-frames:v", "1", posterPng);
  execFileSync("magick", [posterPng, "-resize", "1440x", "-quality", "78", `${base}.webp`]);
  const vf = "scale=960:-2,fps=30";
  ff("-ss", String(start), "-t", String(CLIP), "-i", raw, "-an", "-vf", vf, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "42", "-row-mt", "1", "-deadline", "good", `${base}.webm`);
  ff("-ss", String(start), "-t", String(CLIP), "-i", raw, "-an", "-vf", vf, "-c:v", "libx264", "-crf", "28", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", `${base}.mp4`);
  rmSync(vidDir, { recursive: true, force: true });
  const kb = (f) => Math.round(statSync(f).size / 1024);
  console.log(`✓ ${piece.slug}  poster ${kb(`${base}.webp`)}KB  webm ${kb(`${base}.webm`)}KB  mp4 ${kb(`${base}.mp4`)}KB${problems.length ? `  (${problems.length} warnings)` : ""}`);
}

server.close();
if (check) {
  const bad = report.filter(([, p]) => p.length).map(([s]) => s);
  console.log(bad.length ? `\nissues: ${bad.join(", ")}\nscreenshots: ${TMP}` : `\nall pieces load cleanly\nscreenshots: ${TMP}`);
}
