// Shrinks the media of the showcase sources in place (same file names, so no reference changes):
// images are capped at 2000px and re-encoded when heavy, videos over 3MB are re-encoded at 1600px.
// Safe to run again: files that are already light are skipped.
// Usage: node scripts/showcase/optimize.mjs [slug ...]
import { execFileSync } from "node:child_process";
import { readdirSync, statSync, renameSync, rmSync } from "node:fs";
import { join, resolve, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SRC = join(ROOT, "showcase");
const SKIP = new Set(["node_modules", "dist", "out", ".next", ".static-out", "src"]);
const MAX = 2000;
const only = process.argv.slice(2);

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return SKIP.has(f) ? [] : walk(p);
    return [p];
  });

const run = (cmd, args) => execFileSync(cmd, args, { stdio: ["ignore", "pipe", "pipe"] }).toString().trim();
let before = 0, after = 0;

for (const slug of readdirSync(SRC)) {
  if (only.length && !only.includes(slug)) continue;
  for (const file of walk(join(SRC, slug))) {
    const ext = extname(file).toLowerCase();
    const size = statSync(file).size;
    const tmp = file + ".tmp" + ext;
    try {
      if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        if (size < 300 * 1024) continue;
        const [w, h] = run("magick", ["identify", "-format", "%w %h", file + "[0]"]).split(" ").map(Number);
        const heavy = size / (w * h) > (ext === ".png" ? 0.8 : 0.22);
        if (Math.max(w, h) <= MAX && !heavy) continue;
        const args = [file, "-resize", `${MAX}x${MAX}>`, "-strip"];
        if (ext === ".png") args.push("-define", "png:compression-level=9");
        else args.push("-quality", ext === ".webp" ? "80" : "80", "-interlace", "Plane");
        run("magick", [...args, tmp]);
      } else if ([".mp4", ".webm", ".mov"].includes(ext)) {
        if (size < 3 * 1024 * 1024) continue;
        const codec = ext === ".webm" ? ["-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "38", "-row-mt", "1"] : ["-c:v", "libx264", "-crf", "27", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart"];
        run("ffmpeg", ["-y", "-loglevel", "error", "-i", file, "-vf", "scale='min(1600,iw)':-2", "-an", ...codec, tmp]);
      } else continue;
      const next = statSync(tmp).size;
      if (next < size) {
        renameSync(tmp, file);
        before += size;
        after += next;
        console.log(`${slug}: ${file.slice(SRC.length + slug.length + 2)} ${(size / 1048576).toFixed(1)}MB -> ${(next / 1048576).toFixed(1)}MB`);
      } else rmSync(tmp);
    } catch (err) {
      rmSync(tmp, { force: true });
      console.error(`skip ${file}: ${err.message.split("\n")[0]}`);
    }
  }
}
console.log(`\nsaved ${((before - after) / 1048576).toFixed(1)}MB (${(before / 1048576).toFixed(1)}MB -> ${(after / 1048576).toFixed(1)}MB)`);
