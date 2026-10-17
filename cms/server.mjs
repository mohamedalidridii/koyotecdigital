// Local-only CMS server. Zero dependencies.
//   npm run cms:password   set / change the admin password
//   npm run cms            start on http://127.0.0.1:4321
//
// Safety model: binds to loopback only, checks Host/Origin, scrypt-hashed password,
// HttpOnly SameSite=Strict session cookie + CSRF token, strict content validation,
// automatic backups, atomic writes. Publishing = regenerate files + local git commit (no push).
import http from "node:http";
import crypto from "node:crypto";
import readline from "node:readline";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, renameSync,
  copyFileSync, unlinkSync, createReadStream,
} from "node:fs";
import { join, extname, resolve, sep, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { generate, loadContent, ROOT } from "./generate.mjs";

const run = promisify(execFile);
const HERE = dirname(fileURLToPath(import.meta.url));
const PORT = 4321;
const HOST = "127.0.0.1";
const AUTH_FILE = join(HERE, ".auth.json");
const BACKUPS = join(HERE, "backups");
const SITE_FILE = join(ROOT, "content/site.json");
const BLOG_FILE = join(ROOT, "content/blog.json");
const UPLOADS = join(ROOT, "public/uploads");
const PUBLIC = join(ROOT, "public");
const SESSION_TTL = 2 * 60 * 60 * 1000;
const IMG_EXT = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml" };
const UPLOAD_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]); // no SVG uploads: can embed scripts
const MANAGED_ALL = ["content", "index.html", "services.html", "contact.html", "en", "blog", "public/sitemap.xml", "public/uploads"];
const managed = () => MANAGED_ALL.filter((p) => existsSync(join(ROOT, p)));

// ---------- password ----------
function hashPassword(pw, salt = crypto.randomBytes(16)) {
  const hash = crypto.scryptSync(pw, salt, 64, { N: 16384, r: 8, p: 1 });
  return { salt: salt.toString("hex"), hash: hash.toString("hex") };
}
function verifyPassword(pw) {
  if (!existsSync(AUTH_FILE)) return false;
  const { salt, hash } = JSON.parse(readFileSync(AUTH_FILE, "utf8"));
  const test = crypto.scryptSync(pw, Buffer.from(salt, "hex"), 64, { N: 16384, r: 8, p: 1 });
  return crypto.timingSafeEqual(test, Buffer.from(hash, "hex"));
}
function ask(question, hidden) {
  return new Promise((res) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => { if (s.includes(question)) rl.output.write(s); };
    }
    rl.question(question, (a) => { rl.close(); if (hidden) process.stdout.write("\n"); res(a); });
  });
}
async function setPassword() {
  const a = await ask("Nouveau mot de passe (12 caractères minimum) : ", true);
  if (a.length < 12) { console.error("Trop court."); process.exit(1); }
  const b = await ask("Confirmez : ", true);
  if (a !== b) { console.error("Les mots de passe ne correspondent pas."); process.exit(1); }
  writeFileSync(AUTH_FILE, JSON.stringify(hashPassword(a)), { mode: 0o600 });
  console.log("Mot de passe enregistré (cms/.auth.json, ignoré par git).");
}

// ---------- validation ----------
const MAX_STR = 20000;
function shapeCheck(next, ref, path = "") {
  if (typeof ref === "string") {
    if (typeof next !== "string") throw new Error(`${path}: texte attendu`);
    if (next.length > MAX_STR) throw new Error(`${path}: texte trop long`);
    return;
  }
  if (Array.isArray(ref)) {
    if (!Array.isArray(next)) throw new Error(`${path}: liste attendue`);
    if (next.length < 1) throw new Error(`${path}: la liste ne peut pas être vide`);
    if (next.length > 40) throw new Error(`${path}: trop d'éléments`);
    // tuples such as [heading, text] must keep their exact length
    if (Array.isArray(ref[0])) next.forEach((item, i) => { if (!Array.isArray(item) || item.length !== ref[0].length) throw new Error(`${path}[${i}]: ${ref[0].length} champs attendus`); });
    next.forEach((item, i) => shapeCheck(item, ref[0], `${path}[${i}]`));
    return;
  }
  if (ref && typeof ref === "object") {
    if (!next || typeof next !== "object" || Array.isArray(next)) throw new Error(`${path}: objet attendu`);
    const rk = Object.keys(ref).sort().join(); const nk = Object.keys(next).sort().join();
    if (rk !== nk) throw new Error(`${path || "racine"}: champs inattendus ou manquants`);
    for (const k of Object.keys(ref)) shapeCheck(next[k], ref[k], path ? `${path}.${k}` : k);
    return;
  }
  throw new Error(`${path}: type non supporté`);
}
const isHttps = (u) => { try { return new URL(u).protocol === "https:"; } catch { return false; } };

function validateSite(next) {
  const cur = JSON.parse(readFileSync(SITE_FILE, "utf8"));
  shapeCheck(next, cur);
  const g = next.global;
  if (!isHttps(g.domain)) throw new Error("global.domain doit être une URL https://");
  if (!isHttps(g.instagram) || !isHttps(g.youtube)) throw new Error("Les liens Instagram/YouTube doivent commencer par https://");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(g.email)) throw new Error("E-mail invalide");
  if (!/^\+\d{8,15}$/.test(g.phone)) throw new Error("Téléphone : format international sans espaces, ex. +21652405699");
  if (!Number.isFinite(Number(g.latitude)) || !Number.isFinite(Number(g.longitude))) throw new Error("Latitude/longitude invalides");
  if (!/^\/[A-Za-z0-9/_.-]+$/.test(g.ogImage) || g.ogImage.includes("..")) throw new Error("ogImage : chemin comme /home/banner.jpg");
  if (!existsSync(join(PUBLIC, g.ogImage))) throw new Error("ogImage : fichier introuvable dans public/");
  if (!/^\d{4}$/.test(g.year)) throw new Error("Année invalide");
  return next;
}

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
function validateBlog(next) {
  const cur = JSON.parse(readFileSync(BLOG_FILE, "utf8"));
  if (!next || typeof next !== "object" || Object.keys(next).sort().join() !== "en,fr") throw new Error("Structure du blog invalide");
  const base = { id: "", slug: "", date: "", title: "", desc: "", h1: "", intro: "", sections: [["", ""]] };
  for (const lang of ["fr", "en"]) {
    if (!Array.isArray(next[lang]) || next[lang].length > 200) throw new Error(`${lang}: liste d'articles invalide`);
    const ids = new Set(); const slugs = new Set();
    for (const a of next[lang]) {
      const allowed = Object.keys(base).concat("updated").sort().join();
      const keys = Object.keys(a).sort().join();
      if (keys !== Object.keys(base).sort().join() && keys !== allowed) throw new Error(`Article « ${a.title || "?"} » : champs invalides`);
      shapeCheck(Object.fromEntries(Object.keys(base).map((k) => [k, a[k]])), base, `article ${a.slug}`);
      if (a.updated !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(a.updated)) throw new Error("Date de mise à jour invalide");
      if (!SLUG_RE.test(a.slug) || a.slug.length > 80) throw new Error(`Slug invalide « ${a.slug} » : minuscules, chiffres et tirets seulement`);
      if (a.slug === "index") throw new Error("Le slug « index » est réservé");
      if (!/^[a-z0-9-]{1,60}$/.test(a.id)) throw new Error(`Identifiant invalide « ${a.id} »`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(a.date) || Number.isNaN(Date.parse(a.date))) throw new Error(`Date invalide « ${a.date} » (AAAA-MM-JJ)`);
      for (const f of ["title", "desc", "h1", "intro"]) if (!a[f].trim()) throw new Error(`Article « ${a.slug} » : « ${f} » est vide`);
      if (ids.has(a.id)) throw new Error(`Identifiant en double : ${a.id}`);
      if (slugs.has(a.slug)) throw new Error(`Slug en double : ${a.slug}`);
      ids.add(a.id); slugs.add(a.slug);
    }
  }
  // stamp "updated" on articles that actually changed
  const today = new Date().toISOString().slice(0, 10);
  for (const lang of ["fr", "en"]) {
    for (const a of next[lang]) {
      const old = cur[lang].find((x) => x.id === a.id);
      if (!old) continue;
      const strip = ({ updated, ...rest }) => JSON.stringify(rest);
      if (strip(old) !== strip(a)) a.updated = today;
      else if (old.updated) a.updated = old.updated;
    }
  }
  return next;
}

// ---------- files ----------
function backup(file) {
  mkdirSync(BACKUPS, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  copyFileSync(file, join(BACKUPS, `${file.split(sep).pop()}.${stamp}`));
  const all = readdirSync(BACKUPS).filter((f) => !statSync(join(BACKUPS, f)).isDirectory()).sort();
  for (const old of all.slice(0, Math.max(0, all.length - 60))) unlinkSync(join(BACKUPS, old));
}
function atomicWrite(file, data) {
  const tmp = file + ".tmp";
  writeFileSync(tmp, data);
  renameSync(tmp, file);
}
const isInside = (base, target) => { const r = resolve(target); return r === resolve(base) || r.startsWith(resolve(base) + sep); };

function sniff(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.length > 12 && buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "webp";
  if (buf.length > 6 && /^GIF8[79]a$/.test(buf.subarray(0, 6).toString("latin1"))) return "gif";
  return null;
}
const extKind = (ext) => (ext === ".jpeg" ? "jpg" : ext.slice(1));

function listImages(dir, base = dir, out = []) {
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    const st = statSync(full);
    if (st.isDirectory()) { listImages(full, base, out); continue; }
    if (IMG_EXT[extname(f).toLowerCase()]) out.push({ path: full.slice(base.length + 1).split(sep).join("/"), size: st.size });
  }
  return out;
}

// ---------- http plumbing ----------
const sessions = new Map();
const failures = { count: 0, until: 0 };
const ALLOWED_HOSTS = new Set([`127.0.0.1:${PORT}`, `localhost:${PORT}`]);

const send = (res, code, body, headers = {}) => {
  const isObj = typeof body === "object" && !Buffer.isBuffer(body);
  res.writeHead(code, {
    "Content-Type": isObj ? "application/json; charset=utf-8" : "text/plain; charset=utf-8",
    "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer",
    ...headers,
  });
  res.end(isObj ? JSON.stringify(body) : body);
};
const readBody = (req, limit) => new Promise((res, rej) => {
  const chunks = []; let n = 0;
  req.on("data", (c) => { n += c.length; if (n > limit) { rej(Object.assign(new Error("Fichier trop volumineux"), { status: 413 })); req.destroy(); } else chunks.push(c); });
  req.on("end", () => res(Buffer.concat(chunks)));
  req.on("error", rej);
});
const readJson = async (req) => {
  try { return JSON.parse((await readBody(req, 2 * 1024 * 1024)).toString("utf8")); }
  catch (e) { throw Object.assign(new Error(e.status ? e.message : "JSON invalide"), { status: e.status || 400 }); }
};
const parseCookies = (h = "") => Object.fromEntries(h.split(";").map((p) => p.trim().split("=")).filter((p) => p[0]).map(([k, ...v]) => [k, v.join("=")]));
function getSession(req) {
  const tok = parseCookies(req.headers.cookie).cms_session;
  const s = tok && sessions.get(tok);
  if (!s) return null;
  if (Date.now() > s.exp) { sessions.delete(tok); return null; }
  s.exp = Date.now() + SESSION_TTL;
  return { tok, ...s };
}

async function gitStatus() {
  const { stdout } = await run("git", ["status", "--porcelain", "--", ...managed()], { cwd: ROOT });
  return stdout.split("\n").filter(Boolean);
}
const changedFiles = () => {
  const { files } = generate(ROOT, loadContent(ROOT), { write: false });
  const changed = [];
  for (const [p, html] of Object.entries(files)) {
    const f = join(ROOT, p);
    if (!existsSync(f) || readFileSync(f, "utf8") !== html) changed.push(p);
  }
  const expected = new Set(Object.keys(files));
  for (const dir of ["blog", "en/blog"]) {
    if (!existsSync(join(ROOT, dir))) continue;
    for (const f of readdirSync(join(ROOT, dir))) if (f.endsWith(".html") && !expected.has(`${dir}/${f}`)) changed.push(`${dir}/${f} (supprimé)`);
  }
  return changed;
};

const ADMIN_FILES = { "/": ["index.html", "text/html; charset=utf-8"], "/admin.js": ["admin.js", "text/javascript; charset=utf-8"], "/admin.css": ["admin.css", "text/css; charset=utf-8"] };
const CSP = "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' blob: data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'";

const server = http.createServer(async (req, res) => {
  try {
    if (!ALLOWED_HOSTS.has(req.headers.host)) return send(res, 403, "Hôte refusé");
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;

    // static admin UI
    if (req.method === "GET" && ADMIN_FILES[path]) {
      const [file, type] = ADMIN_FILES[path];
      return send(res, 200, readFileSync(join(HERE, "admin", file)), { "Content-Type": type, "Content-Security-Policy": CSP, "X-Frame-Options": "DENY" });
    }

    if (!path.startsWith("/api/")) return send(res, 404, "Introuvable");

    // state-changing requests must come from our own origin
    if (req.method !== "GET") {
      const origin = req.headers.origin;
      if (!origin || !ALLOWED_HOSTS.has(new URL(origin).host)) return send(res, 403, { error: "Origine refusée" });
    }

    if (path === "/api/login" && req.method === "POST") {
      if (Date.now() < failures.until) return send(res, 429, { error: `Trop d'essais. Réessayez dans ${Math.ceil((failures.until - Date.now()) / 1000)} s.` });
      const { password } = await readJson(req);
      if (typeof password !== "string" || !verifyPassword(password)) {
        if (++failures.count >= 5) { failures.until = Date.now() + 60_000; failures.count = 0; }
        return send(res, 401, { error: "Mot de passe incorrect" });
      }
      failures.count = 0;
      const tok = crypto.randomBytes(32).toString("hex");
      const csrf = crypto.randomBytes(24).toString("hex");
      sessions.set(tok, { csrf, exp: Date.now() + SESSION_TTL });
      return send(res, 200, { ok: true }, { "Set-Cookie": `cms_session=${tok}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL / 1000}` });
    }

    const s = getSession(req);
    if (!s) return send(res, 401, { error: "Non connecté" });
    if (req.method !== "GET" && req.headers["x-csrf-token"] !== s.csrf) return send(res, 403, { error: "Jeton CSRF invalide" });

    if (path === "/api/logout" && req.method === "POST") {
      sessions.delete(s.tok);
      return send(res, 200, { ok: true }, { "Set-Cookie": "cms_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0" });
    }
    if (path === "/api/content" && req.method === "GET") {
      return send(res, 200, { ...loadContent(ROOT), csrf: s.csrf });
    }
    if (path === "/api/site" && req.method === "PUT") {
      const next = validateSite(await readJson(req));
      backup(SITE_FILE);
      atomicWrite(SITE_FILE, JSON.stringify(next, null, 2) + "\n");
      generate(ROOT, loadContent(ROOT), { write: false }); // fail now, not at publish time
      return send(res, 200, { ok: true });
    }
    if (path === "/api/blog" && req.method === "PUT") {
      const next = validateBlog(await readJson(req));
      backup(BLOG_FILE);
      atomicWrite(BLOG_FILE, JSON.stringify(next, null, 2) + "\n");
      generate(ROOT, loadContent(ROOT), { write: false });
      return send(res, 200, { ok: true, blog: next });
    }
    if (path === "/api/media" && req.method === "GET") {
      return send(res, 200, { images: listImages(PUBLIC) });
    }
    if (path === "/api/media/file" && req.method === "GET") {
      const rel = url.searchParams.get("path") || "";
      const full = resolve(PUBLIC, rel);
      const ext = extname(full).toLowerCase();
      if (!isInside(PUBLIC, full) || !IMG_EXT[ext] || !existsSync(full)) return send(res, 404, "Introuvable");
      res.writeHead(200, { "Content-Type": IMG_EXT[ext], "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox" });
      return createReadStream(full).pipe(res);
    }
    if (path === "/api/media/upload" && req.method === "POST") {
      const raw = (req.headers["x-filename"] || "").toString();
      const name = decodeURIComponent(raw).toLowerCase().replace(/[^a-z0-9._-]/g, "-").replace(/-+/g, "-").replace(/^[.-]+/, "");
      const ext = extname(name);
      if (!name || !UPLOAD_EXT.has(ext)) return send(res, 400, { error: "Formats acceptés : jpg, png, webp, gif" });
      const buf = await readBody(req, 8 * 1024 * 1024);
      if (sniff(buf) !== extKind(ext)) return send(res, 400, { error: "Le contenu ne correspond pas à l'extension" });
      mkdirSync(UPLOADS, { recursive: true });
      const dest = join(UPLOADS, name);
      if (existsSync(dest)) return send(res, 409, { error: "Un fichier de ce nom existe déjà" });
      writeFileSync(dest, buf);
      return send(res, 200, { ok: true, path: "/uploads/" + name });
    }
    if (path === "/api/media/replace" && req.method === "POST") {
      const rel = url.searchParams.get("path") || "";
      const full = resolve(PUBLIC, rel);
      const ext = extname(full).toLowerCase();
      if (!isInside(PUBLIC, full) || !UPLOAD_EXT.has(ext) || !existsSync(full)) return send(res, 400, { error: "Image à remplacer introuvable" });
      const buf = await readBody(req, 8 * 1024 * 1024);
      if (sniff(buf) !== extKind(ext)) return send(res, 400, { error: `Le nouveau fichier doit être au même format (${ext})` });
      mkdirSync(join(BACKUPS, "media"), { recursive: true });
      copyFileSync(full, join(BACKUPS, "media", `${Date.now()}-${rel.replace(/[/\\]/g, "_")}`));
      writeFileSync(full, buf);
      return send(res, 200, { ok: true });
    }
    if (path === "/api/media/delete" && req.method === "POST") {
      const { path: rel } = await readJson(req);
      const full = resolve(PUBLIC, "uploads", String(rel).replace(/^\/?uploads\//, ""));
      if (!isInside(UPLOADS, full) || !existsSync(full)) return send(res, 400, { error: "Seuls les fichiers de uploads/ peuvent être supprimés" });
      mkdirSync(join(BACKUPS, "media"), { recursive: true });
      renameSync(full, join(BACKUPS, "media", `${Date.now()}-${full.split(sep).pop()}`));
      return send(res, 200, { ok: true });
    }
    if (path === "/api/status" && req.method === "GET") {
      return send(res, 200, { changed: changedFiles(), git: await gitStatus() });
    }
    if (path === "/api/publish" && req.method === "POST") {
      const { note } = await readJson(req);
      const msg = ("cms: " + (typeof note === "string" && note.trim() ? note.trim() : "update content")).replace(/[\r\n]+/g, " ").slice(0, 120);
      const { files, removed } = generate(ROOT, loadContent(ROOT)); // renders everything first, writes only if it succeeds
      await run("git", ["add", "-A", "--", ...managed()], { cwd: ROOT });
      let commit;
      try {
        ({ stdout: commit } = await run("git", ["commit", "-m", msg, "--", ...managed()], { cwd: ROOT }));
      } catch (e) {
        const out = `${e.stdout || ""}${e.stderr || ""}`;
        if (/nothing (added )?to commit|no changes added/i.test(out)) return send(res, 200, { ok: true, committed: false, message: "Aucun changement à publier.", files: Object.keys(files).length });
        throw new Error("git commit a échoué : " + out.trim().slice(0, 500));
      }
      return send(res, 200, { ok: true, committed: true, message: commit.trim().split("\n")[0], files: Object.keys(files).length, removed });
    }
    return send(res, 404, { error: "Introuvable" });
  } catch (e) {
    const status = e.status || (/attendu|invalide|vide|double|réservé|manquant|trop|Slug|Date|Identifiant|champs|doit|ogImage|Téléphone|E-mail|Année|Latitude|champs attendus/.test(e.message) ? 400 : 500);
    if (status === 500) console.error(e);
    return send(res, status, { error: status === 500 ? "Erreur serveur : " + e.message : e.message });
  }
});

if (process.argv.includes("--set-password")) {
  await setPassword();
} else if (!existsSync(AUTH_FILE)) {
  console.error("Aucun mot de passe défini. Lancez d'abord : npm run cms:password");
  process.exit(1);
} else {
  server.listen(PORT, HOST, () => console.log(`CMS : http://localhost:${PORT}  (Ctrl+C pour arrêter)`));
}
