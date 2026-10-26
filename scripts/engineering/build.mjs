// Builds the Koyotec Engineering site (engineering/, Next static export) into public/engineering/.
// The app is configured for its sub-path (basePath "/engineering" in engineering/next.config.mjs),
// so unlike the showcase pieces its output needs no rebasing.
// Usage: node scripts/engineering/build.mjs
import { execSync } from "node:child_process";
import { existsSync, rmSync, cpSync } from "node:fs";
import { join, resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SRC = join(ROOT, "engineering");
const DEST = join(ROOT, "public/engineering");

const sh = (cmd) => execSync(cmd, { cwd: SRC, stdio: "inherit", env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" } });

if (!existsSync(join(SRC, "node_modules"))) sh("npm install --no-audit --no-fund --loglevel=error");
sh("npx next build");

rmSync(DEST, { recursive: true, force: true });
cpSync(join(SRC, "out"), DEST, { recursive: true, filter: (f) => !f.endsWith(".DS_Store") });
console.log(`✓ engineering -> ${relative(ROOT, DEST)}`);
