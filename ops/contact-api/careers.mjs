// POST /careers — spontaneous applications from /carrieres and /en/careers.
// multipart/form-data with one CV file; mailed from careers@ to CAREERS_TO, then a short
// confirmation goes back to the applicant.
import busboy from "busboy";

const MAX_FILE = 8 * 1024 * 1024;
const MAX_BODY = MAX_FILE + 64 * 1024;

// keys sent by the form -> label used in the email (the founder reads French)
export const POLES = {
  digital: {
    label: "Digital",
    roles: {
      web: "Développeur web / front-end",
      uiux: "Designer UI/UX",
      brand: "Designer graphique & identité visuelle",
      seo: "SEO & contenu",
      ecommerce: "Développeur e-commerce",
      strategy: "Stratégie digitale & social media",
    },
  },
  engineering: {
    label: "Engineering",
    roles: {
      devops: "Ingénieur DevOps",
      cloud: "Ingénieur cloud",
      ai: "Ingénieur IA / ML",
      data: "Data engineer / BI",
      security: "Analyste cybersécurité",
    },
  },
};
export const CONTRACTS = { cdi: "CDI / CDD", stage: "Stage / PFE", freelance: "Freelance", alternance: "Alternance" };

const FILE_TYPES = {
  pdf: { mime: "application/pdf", magic: (b) => b.subarray(0, 5).toString("latin1") === "%PDF-" },
  docx: {
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    magic: (b) => b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04,
  },
  doc: { mime: "application/msword", magic: (b) => b.subarray(0, 8).equals(Buffer.from("d0cf11e0a1b11ae1", "hex")) },
};

const html = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "candidat";

class HttpError extends Error {
  constructor(status, error) {
    super(error);
    this.status = status;
  }
}

// parse the multipart body; resolves { fields, file } or rejects with an HttpError
function parse(req) {
  return new Promise((resolve, reject) => {
    const len = Number(req.headers["content-length"] || 0);
    if (len > MAX_BODY) return reject(new HttpError(413, "too large"));
    let bb;
    try {
      bb = busboy({ headers: req.headers, limits: { files: 1, fileSize: MAX_FILE, fields: 20, fieldSize: 6000, parts: 22 } });
    } catch {
      return reject(new HttpError(400, "invalid body"));
    }
    const fields = {};
    let file = null;
    let failed = null;
    const fail = (err) => {
      if (!failed) failed = err;
    };
    bb.on("field", (name, value, info) => {
      if (info.valueTruncated) fail(new HttpError(400, "field too long"));
      fields[name] = value; // every field is single-valued: the last one wins
    });
    bb.on("file", (name, stream, info) => {
      if (name !== "cv" || file) {
        stream.resume();
        return fail(new HttpError(400, "unexpected file"));
      }
      const chunks = [];
      stream.on("data", (c) => chunks.push(c));
      stream.on("limit", () => fail(new HttpError(413, "file too large")));
      stream.on("end", () => {
        file = { filename: info.filename || "", content: Buffer.concat(chunks) };
      });
    });
    bb.on("filesLimit", () => fail(new HttpError(400, "one file only")));
    bb.on("partsLimit", () => fail(new HttpError(400, "too many parts")));
    bb.on("error", () => reject(new HttpError(400, "invalid body")));
    bb.on("close", () => (failed ? reject(failed) : resolve({ fields, file })));
    req.on("aborted", () => reject(new HttpError(400, "aborted")));
    req.pipe(bb);
  });
}

function validate({ fields, file }, { oneLine, EMAIL }) {
  const f = (k, max) => oneLine(fields[k], max);
  const lang = fields.lang === "en" ? "en" : "fr";
  const name = f("name", 120);
  const email = f("email", 200);
  const phone = f("phone", 40).replace(/[^\d+()\s.-]/g, "");
  const poleKey = f("pole", 20);
  const pole = POLES[poleKey];
  const roleKey = f("role", 30);
  const other = f("other", 160);
  const contractKey = f("contract", 20);
  const message = String(fields.message ?? "").trim().slice(0, 3000);
  let link = f("link", 300);

  if (!name) throw new HttpError(400, "name");
  if (!EMAIL.test(email)) throw new HttpError(400, "email");
  if (!pole) throw new HttpError(400, "pole");
  if (roleKey !== "other" && !pole.roles[roleKey]) throw new HttpError(400, "role");
  if (roleKey === "other" && !other) throw new HttpError(400, "other");
  if (!CONTRACTS[contractKey]) throw new HttpError(400, "contract");
  if (fields.consent !== "yes") throw new HttpError(400, "consent");
  if (link) {
    if (!/^https?:\/\//i.test(link)) link = `https://${link}`;
    try {
      const u = new URL(link);
      if (!/^https?:$/.test(u.protocol) || !u.hostname.includes(".")) throw 0;
      link = u.href;
    } catch {
      throw new HttpError(400, "link");
    }
  }

  if (!file || !file.content.length) throw new HttpError(400, "cv");
  const ext = (file.filename.split(".").pop() || "").toLowerCase();
  const type = FILE_TYPES[ext];
  if (!type || !type.magic(file.content)) throw new HttpError(415, "cv type");

  return {
    lang, name, email, phone, link, message,
    pole: pole.label,
    role: roleKey === "other" ? `Autre : ${other}` : pole.roles[roleKey],
    contract: CONTRACTS[contractKey],
    attachment: { filename: `CV-${slug(name)}.${ext}`, content: file.content, contentType: type.mime },
  };
}

function founderMail(a, ip) {
  const rows = [
    ["Nom", a.name],
    ["E-mail", a.email],
    ["Téléphone", a.phone || "—"],
    ["Pôle", a.pole],
    ["Profil", a.role],
    ["Contrat", a.contract],
    ["Lien", a.link || "—"],
    ["Langue du formulaire", a.lang.toUpperCase()],
  ];
  const text = `Nouvelle candidature spontanée\n\n${rows.map(([k, v]) => `${k} : ${v}`).join("\n")}\n\n${a.message ? `Message :\n${a.message}\n\n` : ""}CV en pièce jointe : ${a.attachment.filename}\n(IP ${ip})`;
  const body = `<!doctype html><html><body style="margin:0;padding:32px 16px;background:#f4f2ee;font-family:Helvetica,Arial,sans-serif;color:#111">
<table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden">
<tr><td style="padding:28px 32px 8px"><p style="margin:0;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#888">KOYOTEC · Carrières · ${html(a.pole)}</p>
<h1 style="margin:10px 0 0;font-size:24px;line-height:1.2">${html(a.name)}</h1><p style="margin:6px 0 0;color:#555">${html(a.role)} — ${html(a.contract)}</p></td></tr>
<tr><td style="padding:20px 32px"><table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px">
${rows.map(([k, v]) => `<tr><td style="padding:9px 0;border-top:1px solid #eee;color:#888;width:42%">${html(k)}</td><td style="padding:9px 0;border-top:1px solid #eee">${k === "Lien" && a.link ? `<a href="${html(a.link)}" style="color:#111">${html(v)}</a>` : k === "E-mail" ? `<a href="mailto:${html(v)}" style="color:#111">${html(v)}</a>` : html(v)}</td></tr>`).join("")}
</table></td></tr>
${a.message ? `<tr><td style="padding:0 32px 20px"><p style="margin:0 0 6px;color:#888;font-size:13px">Message</p><p style="margin:0;font-size:15px;line-height:1.55;white-space:pre-wrap">${html(a.message)}</p></td></tr>` : ""}
<tr><td style="padding:16px 32px 28px;font-size:13px;color:#888">CV en pièce jointe : ${html(a.attachment.filename)} · Répondre à ce mail écrit directement au candidat. · IP ${html(ip)}</td></tr>
</table></body></html>`;
  return {
    subject: `[Candidature] ${a.pole} · ${a.role} · ${a.contract} — ${a.name}`,
    text,
    html: body,
  };
}

const CONFIRM = {
  fr: {
    subject: "Nous avons bien reçu votre candidature — KOYOTEC",
    hi: (n) => `Bonjour ${n},`,
    body: [
      "Merci pour votre candidature spontanée chez KOYOTEC. Elle est bien arrivée et sera lue avec attention.",
      "Si votre profil correspond à nos besoins, actuels ou à venir, nous reviendrons vers vous pour un premier échange. Votre CV est conservé 12 mois, uniquement pour le recrutement.",
    ],
    recap: "Votre candidature",
    sign: "L’équipe KOYOTEC",
    foot: "Ceci est une confirmation automatique. Vous pouvez répondre à ce message pour compléter votre candidature.",
  },
  en: {
    subject: "We received your application — KOYOTEC",
    hi: (n) => `Hello ${n},`,
    body: [
      "Thank you for your spontaneous application to KOYOTEC. It has arrived safely and will be read carefully.",
      "If your profile matches our current or upcoming needs, we will get back to you for a first conversation. Your CV is kept for 12 months, for recruitment only.",
    ],
    recap: "Your application",
    sign: "The KOYOTEC team",
    foot: "This is an automatic confirmation. You can reply to this message to add to your application.",
  },
};

function applicantMail(a) {
  const c = CONFIRM[a.lang];
  const first = a.name.split(" ")[0];
  const recap = `${a.pole} · ${a.role} · ${a.contract}`;
  return {
    subject: c.subject,
    text: `${c.hi(first)}\n\n${c.body.join("\n\n")}\n\n${c.recap} : ${recap}\n\n${c.sign}\nwww.koyotec.digital\n\n${c.foot}`,
    html: `<!doctype html><html><body style="margin:0;padding:32px 16px;background:#f4f2ee;font-family:Helvetica,Arial,sans-serif;color:#111">
<table role="presentation" width="100%" style="max-width:540px;margin:0 auto;background:#fff;border-radius:14px">
<tr><td style="padding:32px 32px 4px"><p style="margin:0;font-size:20px;font-weight:700;letter-spacing:.02em">KOYOTEC<sup style="font-size:10px">®</sup></p></td></tr>
<tr><td style="padding:16px 32px 8px;font-size:15px;line-height:1.6"><p style="margin:0 0 14px">${html(c.hi(first))}</p>${c.body.map((p) => `<p style="margin:0 0 14px">${html(p)}</p>`).join("")}</td></tr>
<tr><td style="padding:0 32px 8px"><p style="margin:0;padding:14px 16px;background:#f4f2ee;border-radius:10px;font-size:14px"><span style="color:#888">${html(c.recap)}</span><br>${html(recap)}</p></td></tr>
<tr><td style="padding:16px 32px 28px;font-size:15px">${html(c.sign)}<br><a href="https://www.koyotec.digital" style="color:#111">www.koyotec.digital</a></td></tr>
</table><p style="max-width:540px;margin:14px auto 0;font-size:12px;color:#999;text-align:center">${html(c.foot)}</p></body></html>`,
  };
}

// ctx: { send, origin, ip, transport, from, to, oneLine, EMAIL }
export async function handleCareers(req, res, ctx) {
  const { send, origin, ip } = ctx;
  let app;
  try {
    const parsed = await parse(req);
    // honeypot: bots fill it, humans never see it. Pretend success.
    if (parsed.fields.website) return send(res, 200, { ok: true }, origin);
    app = validate(parsed, ctx);
  } catch (err) {
    if (err instanceof HttpError) return send(res, err.status, { error: err.message }, origin);
    console.error("careers parse error:", err.message);
    return send(res, 400, { error: "invalid body" }, origin);
  }

  const from = { name: app.lang === "en" ? "KOYOTEC Careers" : "KOYOTEC Carrières", address: ctx.from };
  try {
    await ctx.transport.sendMail({
      from,
      to: ctx.to,
      replyTo: { name: app.name, address: app.email },
      ...founderMail(app, ip),
      attachments: [app.attachment],
    });
  } catch (err) {
    console.error("careers smtp error:", err.message);
    return send(res, 502, { error: "mail failed" }, origin);
  }
  console.log(`application from ${app.email} (${app.pole}, ${app.role})`);

  // the confirmation is a courtesy: never fail the request because of it
  ctx.transport
    .sendMail({ from, to: { name: app.name, address: app.email }, ...applicantMail(app) })
    .catch((err) => console.error("careers confirmation error:", err.message));

  return send(res, 200, { ok: true }, origin);
}
