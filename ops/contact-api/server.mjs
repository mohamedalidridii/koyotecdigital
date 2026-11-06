import http from "node:http";
import nodemailer from "nodemailer";
import { handleCareers } from "./careers.mjs";

const {
  PORT = "3001",
  SMTP_HOST = "mail.koyotec.digital",
  SMTP_PORT = "587",
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM = "noreply@koyotec.digital",
  MAIL_TO = "medali.dridi@koyotec.digital",
  ALLOWED_ORIGINS = "https://www.koyotec.digital,https://koyotec.digital",
  CAREERS_SMTP_USER,
  CAREERS_SMTP_PASS,
  CAREERS_TO = "medali.dridi@koyotec.digital",
  SMTP_DRY, // local testing only: print messages instead of sending them
} = process.env;

if (!SMTP_USER || !SMTP_PASS) {
  console.error("SMTP_USER and SMTP_PASS are required");
  process.exit(1);
}

const origins = new Set(ALLOWED_ORIGINS.split(",").map((s) => s.trim()));
const smtp = (user, pass) =>
  SMTP_DRY
    ? nodemailer.createTransport({ jsonTransport: true })
    : nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: false,
        requireTLS: true,
        auth: { user, pass },
      });
const transport = smtp(SMTP_USER, SMTP_PASS);
// careers mail is sent as careers@ (the mailserver only lets an account send as itself)
const careersTransport = CAREERS_SMTP_USER && CAREERS_SMTP_PASS ? smtp(CAREERS_SMTP_USER, CAREERS_SMTP_PASS) : null;
if (!careersTransport) console.warn("CAREERS_SMTP_USER/PASS missing: /careers is disabled");
if (SMTP_DRY) {
  for (const t of [transport, careersTransport]) {
    const real = t?.sendMail.bind(t);
    if (real) t.sendMail = async (m) => { const info = await real(m); const j = JSON.parse(info.message); console.log("DRY", j.subject, "->", JSON.stringify(j.to), (j.attachments || []).map((a) => a.filename)); return info; };
  }
}

// sliding window rate limit per IP
function limiter(limit, windowMs) {
  const hits = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [ip, list] of hits) if (!list.some((t) => now - t < windowMs)) hits.delete(ip);
  }, windowMs).unref();
  return (ip) => {
    const now = Date.now();
    const list = (hits.get(ip) || []).filter((t) => now - t < windowMs);
    list.push(now);
    hits.set(ip, list);
    return list.length > limit;
  };
}
const limited = limiter(5, 10 * 60 * 1000); // contact: 5 per 10 minutes
const careersLimited = limiter(4, 60 * 60 * 1000); // careers: 4 per hour

const oneLine = (v, max) => String(v ?? "").replace(/[\r\n\t]+/g, " ").trim().slice(0, max);
const EMAIL = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]{2,}$/;

function send(res, status, body, origin) {
  const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };
  if (origin && origins.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

function readBody(req, max = 10_000) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > max) {
        reject(new Error("too large"));
        req.destroy();
      } else chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  const url = (req.url || "").split("?")[0];

  if (req.method === "GET" && url === "/health") return send(res, 200, { ok: true });
  if (url !== "/contact" && url !== "/careers") return send(res, 404, { error: "not found" }, origin);

  if (req.method === "OPTIONS") {
    if (!origin || !origins.has(origin)) return send(res, 403, { error: "origin" });
    res.writeHead(204, {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    });
    return res.end();
  }
  if (req.method !== "POST") return send(res, 405, { error: "method" }, origin);
  if (!origin || !origins.has(origin)) return send(res, 403, { error: "origin" });

  const ip = String(req.headers["x-real-ip"] || req.socket.remoteAddress);

  if (url === "/careers") {
    if (!careersTransport) return send(res, 503, { error: "unavailable" }, origin);
    if (careersLimited(ip)) return send(res, 429, { error: "rate limit" }, origin);
    return handleCareers(req, res, { send, origin, ip, transport: careersTransport, from: CAREERS_SMTP_USER, to: CAREERS_TO, oneLine, EMAIL });
  }

  if (limited(ip)) return send(res, 429, { error: "rate limit" }, origin);

  let data;
  try {
    data = JSON.parse(await readBody(req));
  } catch {
    return send(res, 400, { error: "invalid body" }, origin);
  }

  // honeypot: bots fill it, humans never see it. Pretend success.
  if (data.website) return send(res, 200, { ok: true }, origin);

  const name = oneLine(data.name, 120);
  const email = oneLine(data.email, 200);
  const message = String(data.message ?? "").trim().slice(0, 5000);
  const types = (Array.isArray(data.type) ? data.type : []).slice(0, 12).map((t) => oneLine(t, 60)).filter(Boolean);
  const other = oneLine(data.other, 200);
  const lang = data.lang === "en" ? "en" : "fr";

  if (!name || !EMAIL.test(email) || !message) return send(res, 400, { error: "invalid fields" }, origin);

  const subject = `${lang === "en" ? "New website request" : "Nouvelle demande du site"} — ${name}`;
  const text = `${message}\n\n${types.length ? `→ ${types.join(", ")}${other ? ` (${other})` : ""}\n` : ""}${name} · ${email}\n\n(${lang.toUpperCase()} form, IP ${ip})`;

  try {
    await transport.sendMail({
      from: { name: "KOYOTEC site", address: MAIL_FROM },
      to: MAIL_TO,
      replyTo: { name, address: email },
      subject,
      text,
    });
    console.log(`sent from ${email}`);
    return send(res, 200, { ok: true }, origin);
  } catch (err) {
    console.error("smtp error:", err.message);
    return send(res, 502, { error: "mail failed" }, origin);
  }
});

server.listen(Number(PORT), "127.0.0.1", () => console.log(`contact api on 127.0.0.1:${PORT}`));
