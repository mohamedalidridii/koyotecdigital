"use strict";
// Admin UI. Content is only ever inserted with textContent / .value (never innerHTML).
const app = document.getElementById("app");
const state = { site: null, blog: null, csrf: null, tab: "pages", lang: "fr", page: "home", dirtySite: false, dirtyBlog: false, editing: null, flash: null };

const LABELS = {
  title: "Titre de la page (balise title, ~60 caractères)", desc: "Description Google (~155 caractères)", hero: "Texte alternatif de la bannière",
  h1: "Titre principal (H1)", callout: "Phrases d'accroche", pix: "Titre animé", lead: "Texte d'introduction (mettez [[mots]] entre doubles crochets pour les surligner)",
  about: "Paragraphes « à propos »", about_cta: "Bouton « à propos »", banner: "Titre de la bannière", tags: "Mots-clés de la bannière", banner_copy: "Texte de la bannière",
  spot: "Légende de la galerie", spot_cta: "Bouton de la galerie", split: "Mots animés", svc_kicker: "Petit titre des services", svc_h: "Titre des services",
  svc_items: "Liste des services", foot_copy: "Texte du pied de page", hero_foot: "Sous-titre du bandeau", hero_cta: "Bouton du bandeau", svc_foot: "Légende services (gauche)",
  svc_foot2: "Légende services (droite)", team: "Titre de la section équipe", kicker: "Petit titre", h2: "Titre de section (H2)", blocks: "Blocs de services",
  process_h: "Titre de la méthode", process: "Étapes de la méthode", cta_h: "Titre de l'appel à l'action", cta: "Bouton d'appel à l'action", addr: "Adresse (une ligne par élément)",
  drop: "Texte « écrivez-nous »", love: "Message de bas de page", lead_: "", read: "Libellé « lire »", by: "Signature", home: "Libellé « Accueil »",
  menu: "Bouton menu", start: "Bouton « démarrer »", other_lang: "Libellé du changement de langue", email_ph: "Texte du champ e-mail", touch: "Texte « nous écrire »",
  based: "Texte de localisation", rights: "Mention droits réservés", nav: "Noms du menu", services: "Services", blog: "Blog", contact: "Contact",
  domain: "Adresse du site (https://…)", name: "Nom de l'entreprise", tagline: "Nom complet", email: "E-mail", phone: "Téléphone (format +21652405699)", phoneDisplay: "Téléphone affiché",
  instagram: "Lien Instagram", youtube: "Lien YouTube", locality: "Ville / quartier", country: "Code pays", latitude: "Latitude", longitude: "Longitude", year: "Année du copyright",
  ogImage: "Image de partage (chemin, ex. /og/koyotec.jpg)", slug: "Adresse de l'article (slug : minuscules, chiffres, tirets)", date: "Date de publication", intro: "Introduction (en gras)",
  sections: "Sections de l'article",
  eyebrow: "Petite ligne au-dessus du titre", sub: "Phrase sous le titre", cta_primary: "Bouton principal (devis)", cta_secondary: "Bouton secondaire",
  services_kicker: "Petit titre des services", services_h: "Titre de la section services", services_lead: "Phrase sous le titre des services",
  cards: "Cartes de services", cards_more: "Texte « en savoir plus »", why_h: "Titre « pourquoi nous »", points: "Trois points forts",
  faq_h: "Titre de la FAQ", faq: "Questions / réponses", cta_sub: "Phrase du bandeau final", cta_btn: "Bouton du bandeau final",
  hero_meta: "Lignes sous le grand nom (une par élément)", scroll_hint: "Texte « défiler »", services_outline: "Titre services : mot en contour", services_bold: "Titre services : mot en gras",
  why_kicker: "Petite étiquette « pourquoi nous »", popup_title: "Texte de la carte flottante", popup_btn: "Bouton de la carte flottante", cta_giant: "Gros texte du bandeau final",
  close: "Libellé « fermer »", form_h: "Titre du formulaire", f_name: "Champ nom", f_email: "Champ e-mail", f_type: "Choix des besoins",
  f_msg: "Champ message", f_send: "Bouton d'envoi", f_note: "Note sous le bouton", f_done: "Message après l'envoi",
  nav_cta: "Bouton « devis » du menu", footer_pages: "Titre colonne pages (pied de page)", footer_contact: "Titre colonne contact", footer_follow: "Titre colonne réseaux",
};
const TUPLE = { cards: ["Titre", "Description"], points: ["Titre", "Description"], faq: ["Question", "Réponse"], blocks: ["Titre", "Texte"], process: ["Étape", "Description"], sections: ["Titre de section", "Texte (ligne vide = nouveau paragraphe ; « - » en début de ligne = liste)"] };
const PAGE_NAMES = { home: "Accueil", services: "Services", contact: "Contact", blog: "Page Blog", ui: "Menus et libellés" };
const label = (k) => LABELS[k] || k;

function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") el.className = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) el.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(kid));
  return el;
}

async function api(method, url, body, extra = {}) {
  const headers = { ...extra };
  if (state.csrf) headers["X-CSRF-Token"] = state.csrf;
  let payload = body;
  if (body && !(body instanceof Blob) && typeof body === "object") { headers["Content-Type"] = "application/json"; payload = JSON.stringify(body); }
  const res = await fetch(url, { method, headers, body: payload, credentials: "same-origin" });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && url !== "/api/login") { state.csrf = null; render(); throw new Error("Session expirée, reconnectez-vous."); }
  if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
  return data;
}

function flash(kind, text) { state.flash = { kind, text }; render(); window.scrollTo(0, 0); }
async function guarded(fn) { try { await fn(); } catch (e) { flash("err", e.message); } }

// ---------- generic tree editor ----------
function field(parent, container, key, opts = {}) {
  const val = parent[key];
  const dirty = opts.onChange;
  if (typeof val === "string") {
    const long = val.length > 70 || val.includes("\n") || ["lead", "banner_copy", "intro", "desc", "about"].includes(key) || opts.multiline;
    const input = long ? h("textarea", { rows: Math.min(14, Math.max(3, Math.ceil(val.length / 90) + val.split("\n").length)) }) : h("input", { type: key === "date" ? "date" : "text" });
    input.value = val;
    input.addEventListener("input", () => { parent[key] = input.value; dirty(); });
    container.append(h("label", { class: "field" }, h("span", {}, opts.label || label(key)), input));
  } else if (Array.isArray(val)) {
    const wrap = h("fieldset", {}, h("legend", {}, opts.label || label(key)));
    const draw = () => {
      wrap.replaceChildren(h("legend", {}, opts.label || label(key)));
      val.forEach((item, i) => {
        const tools = h("div", { class: "tools" },
          h("button", { class: "btn secondary small", type: "button", title: "Monter", onclick: () => { if (i > 0) { [val[i - 1], val[i]] = [val[i], val[i - 1]]; dirty(); draw(); } } }, "↑"),
          h("button", { class: "btn secondary small", type: "button", title: "Descendre", onclick: () => { if (i < val.length - 1) { [val[i + 1], val[i]] = [val[i], val[i + 1]]; dirty(); draw(); } } }, "↓"),
          h("button", { class: "btn danger small", type: "button", title: "Supprimer", onclick: () => { if (val.length > 1 && confirm("Supprimer cet élément ?")) { val.splice(i, 1); dirty(); draw(); } } }, "✕"));
        if (Array.isArray(item)) {
          const g = h("div", { class: "group" }, tools);
          item.forEach((_, j) => field(item, g, j, { onChange: dirty, label: (TUPLE[key] || [])[j] || `Champ ${j + 1}`, multiline: j === 1 }));
          wrap.append(g);
        } else {
          const input = h("input", { type: "text" }); input.value = item;
          input.addEventListener("input", () => { val[i] = input.value; dirty(); });
          wrap.append(h("div", { class: "row" }, h("div", { class: "grow" }, input), tools));
        }
      });
      const sample = val[0];
      wrap.append(h("div", { class: "row" }, h("button", { class: "btn secondary small", type: "button", onclick: () => { val.push(Array.isArray(sample) ? sample.map(() => "") : ""); dirty(); draw(); } }, "+ Ajouter")));
    };
    draw();
    container.append(wrap);
  } else if (val && typeof val === "object") {
    const fs = h("fieldset", {}, h("legend", {}, opts.label || label(key)));
    for (const k of Object.keys(val)) if (!(opts.hide || []).includes(k)) field(val, fs, k, { onChange: dirty });
    container.append(fs);
  }
}

// ---------- views ----------
function renderLogin() {
  const pw = h("input", { type: "password", autocomplete: "current-password", autofocus: true });
  const form = h("form", { class: "login", onsubmit: (e) => { e.preventDefault(); guarded(async () => { await api("POST", "/api/login", { password: pw.value }); await load(); }); } },
    h("h1", {}, "KOYOTEC CMS"),
    state.flash ? h("div", { class: `msg ${state.flash.kind}` }, state.flash.text) : null,
    h("label", { class: "field" }, h("span", {}, "Mot de passe"), pw),
    h("p", {}, h("button", { class: "btn", type: "submit" }, "Se connecter")));
  app.replaceChildren(form);
}

function tabs() {
  const t = (id, text, dirty) => h("button", { class: state.tab === id ? "active" : "", onclick: () => { state.tab = id; state.editing = null; state.flash = null; render(); } }, text, dirty ? h("span", { class: "dirty-dot" }, " ●") : null);
  return h("header", { class: "top" }, h("h1", {}, "KOYOTEC CMS"),
    h("nav", {}, t("pages", "Pages", state.dirtySite && state.tab === "pages"), t("blog", "Blog", state.dirtyBlog), t("media", "Images"), t("settings", "Réglages", state.dirtySite && state.tab === "settings"), t("publish", "Publier")),
    h("button", { onclick: () => guarded(async () => { await api("POST", "/api/logout"); state.csrf = null; state.flash = null; render(); }) }, "Déconnexion"));
}

const langBar = () => h("div", { class: "bar" }, ...["fr", "en"].map((l) => h("button", { class: "pill" + (state.lang === l ? " active" : ""), onclick: () => { state.lang = l; state.editing = null; render(); } }, l === "fr" ? "Français" : "English")));

function saveBar(kind) {
  const dirty = kind === "site" ? state.dirtySite : state.dirtyBlog;
  return h("div", { class: "savebar" }, dirty ? "Modifications non enregistrées" : "Tout est enregistré",
    h("button", { class: "btn", disabled: !dirty, onclick: () => guarded(async () => {
      if (kind === "site") { await api("PUT", "/api/site", state.site); state.dirtySite = false; }
      else { const r = await api("PUT", "/api/blog", state.blog); state.blog = r.blog; state.dirtyBlog = false; }
      flash("ok", "Enregistré. Ouvrez l'onglet Publier pour mettre à jour les pages.");
    }) }, "Enregistrer"));
}

function viewPages() {
  const box = h("div", {});
  box.append(h("h2", {}, "Pages"), langBar(), h("div", { class: "bar" }, ...Object.keys(PAGE_NAMES).map((p) => h("button", { class: "pill" + (state.page === p ? " active" : ""), onclick: () => { state.page = p; render(); } }, PAGE_NAMES[p]))));
  box.append(h("p", { class: "hint" }, "Les articles du blog se modifient dans l'onglet Blog. Modifiez les textes puis cliquez sur Enregistrer, puis Publier."));
  const mark = () => { state.dirtySite = true; updateSaveBar(); };
  const data = state.site[state.lang];
  const target = state.page === "ui" ? data.ui : data[state.page];
  for (const k of Object.keys(target)) field(target, box, k, { onChange: mark });
  return [box, saveBar("site")];
}

function viewSettings() {
  const box = h("div", {}, h("h2", {}, "Réglages généraux"), h("p", { class: "hint" }, "Coordonnées, réseaux et adresse du site, partagés par toutes les pages (pied de page, contact, données structurées Google)."));
  const mark = () => { state.dirtySite = true; updateSaveBar(); };
  for (const k of Object.keys(state.site.global)) field(state.site.global, box, k, { onChange: mark });
  return [box, saveBar("site")];
}

function updateSaveBar() { const old = document.querySelector(".savebar"); if (!old) return; const kind = state.tab === "blog" ? "blog" : "site"; old.replaceWith(saveBar(kind)); }

const today = () => new Date().toISOString().slice(0, 10);
function newArticle(id, lang) {
  return { id, slug: `nouvel-article-${id.slice(-4)}`, date: today(), title: lang === "fr" ? "Nouvel article" : "New article", desc: "", h1: lang === "fr" ? "Nouvel article" : "New article", intro: "", sections: [["", ""]] };
}

function viewBlog() {
  const list = state.blog[state.lang];
  const box = h("div", {}, h("h2", {}, "Blog"), langBar());
  if (state.editing !== null) {
    const art = list[state.editing];
    if (!art) { state.editing = null; return viewBlog(); }
    const mark = () => { state.dirtyBlog = true; updateSaveBar(); };
    box.append(h("div", { class: "bar" }, h("button", { class: "btn secondary", onclick: () => { state.editing = null; render(); } }, "← Retour à la liste")),
      h("p", { class: "hint" }, `Lien de l'article : ${state.lang === "fr" ? "/blog/" : "/en/blog/"}${art.slug}  ·  Identifiant de liaison FR/EN : ${art.id}`));
    for (const k of Object.keys(art)) if (!["id", "updated"].includes(k)) field(art, box, k, { onChange: mark });
    return [box, saveBar("blog")];
  }
  box.append(h("div", { class: "bar" },
    h("button", { class: "btn", onclick: () => { const id = "a" + Date.now().toString(36); state.blog.fr.push(newArticle(id, "fr")); state.blog.en.push(newArticle(id, "en")); state.dirtyBlog = true; state.editing = state.blog[state.lang].length - 1; render(); } }, "+ Nouvel article (FR + EN)"),
    h("span", { class: "hint grow" }, "Crée l'article dans les deux langues, liés entre eux. Pensez à remplir les deux versions.")));
  if (!list.length) box.append(h("p", {}, "Aucun article."));
  list.forEach((a, i) => box.append(h("div", { class: "card" },
    h("div", {}, h("strong", {}, a.title || "(sans titre)"), h("small", {}, `${a.date} · /${state.lang === "fr" ? "blog" : "en/blog"}/${a.slug}`)),
    h("div", {}, h("button", { class: "btn secondary small", onclick: () => { state.editing = i; render(); } }, "Modifier"), " ",
      h("button", { class: "btn danger small", onclick: () => guarded(async () => {
        if (!confirm(`Supprimer « ${a.title} » (${state.lang.toUpperCase()}) ?\nLa page sera retirée au prochain Publier. Une sauvegarde est conservée.`)) return;
        list.splice(i, 1); const r = await api("PUT", "/api/blog", state.blog); state.blog = r.blog; state.dirtyBlog = false; flash("ok", "Article supprimé. Publiez pour retirer la page.");
      }) }, "Supprimer")))));
  return [box, saveBar("blog")];
}

async function viewMedia() {
  const { images } = await api("GET", "/api/media");
  const picker = (onFile) => { const i = h("input", { type: "file", accept: ".jpg,.jpeg,.png,.webp,.gif,image/*", style: "display:none" }); i.addEventListener("change", () => i.files[0] && onFile(i.files[0])); document.body.append(i); i.click(); setTimeout(() => i.remove(), 60000); };
  const box = h("div", {}, h("h2", {}, "Images"),
    h("p", { class: "hint" }, "Remplacer une image la change partout où elle est utilisée (même format requis, ancienne version sauvegardée). Les nouvelles images (jpg, png, webp, gif, 8 Mo max) vont dans /uploads/ ; vous pouvez ensuite en utiliser une comme image de partage dans Réglages."),
    h("div", { class: "bar" }, h("button", { class: "btn", onclick: () => picker((f) => guarded(async () => {
      const r = await api("POST", "/api/media/upload", f, { "X-Filename": encodeURIComponent(f.name), "Content-Type": "application/octet-stream" });
      flash("ok", `Image ajoutée : ${r.path}`);
    })) }, "+ Ajouter une image")));
  const grid = h("div", { class: "grid" });
  for (const im of images) {
    const upload = im.path.startsWith("uploads/");
    const ext = im.path.slice(im.path.lastIndexOf(".")).toLowerCase();
    grid.append(h("div", { class: "thumb" }, h("img", { src: `/api/media/file?path=${encodeURIComponent(im.path)}`, alt: "", loading: "lazy" }), `/${im.path}`, h("br", {}),
      ext === ".svg" ? null : h("button", { class: "btn secondary small", onclick: () => picker((f) => guarded(async () => { await api("POST", `/api/media/replace?path=${encodeURIComponent(im.path)}`, f, { "Content-Type": "application/octet-stream" }); flash("ok", `Image remplacée : /${im.path}`); })) }, "Remplacer"),
      upload ? h("button", { class: "btn danger small", onclick: () => guarded(async () => { if (confirm(`Supprimer /${im.path} ?`)) { await api("POST", "/api/media/delete", { path: im.path }); flash("ok", "Image supprimée (copie conservée dans cms/backups/media)."); } }) }, "Supprimer") : null));
  }
  box.append(grid);
  return box;
}

async function viewPublish() {
  const { changed, git } = await api("GET", "/api/status");
  const note = h("input", { type: "text", placeholder: "Note du commit (facultatif), ex. nouveau texte d'accueil" });
  const unsaved = state.dirtySite || state.dirtyBlog;
  return h("div", {}, h("h2", {}, "Publier"),
    unsaved ? h("div", { class: "msg err" }, "Vous avez des modifications non enregistrées : enregistrez-les d'abord.") : null,
    h("p", { class: "hint" }, "Publier régénère les pages HTML et le sitemap puis crée un commit git local. Rien n'est poussé en ligne : vérifiez avec npm run dev, puis faites git push vous-même."),
    h("h3", {}, changed.length ? `Pages qui vont changer (${changed.length})` : "Les pages générées sont à jour"), changed.length ? h("pre", {}, changed.join("\n")) : null,
    h("h3", {}, "État git (fichiers gérés par le CMS)"), h("pre", {}, git.length ? git.join("\n") : "propre"),
    h("label", { class: "field" }, h("span", {}, "Note"), note),
    h("p", {}, h("button", { class: "btn", disabled: unsaved, onclick: () => guarded(async () => {
      if (!confirm("Générer les pages et créer un commit git local ?")) return;
      const r = await api("POST", "/api/publish", { note: note.value });
      flash("ok", r.committed ? `Publié (${r.files} fichiers générés). Commit : ${r.message}. Il reste à faire git push pour la mise en ligne.` : r.message);
    }) }, "Publier (générer + commit local)")));
}

// ---------- render loop ----------
async function render() {
  if (!state.csrf) return renderLogin();
  const banner = state.flash ? h("div", { class: `msg ${state.flash.kind}` }, state.flash.text) : null;
  let body;
  try {
    if (state.tab === "pages") body = viewPages();
    else if (state.tab === "blog") body = viewBlog();
    else if (state.tab === "settings") body = viewSettings();
    else if (state.tab === "media") body = await viewMedia();
    else body = await viewPublish();
  } catch (e) { body = h("div", { class: "msg err" }, e.message); }
  const [content, extra] = Array.isArray(body) ? body : [body, null];
  const y = window.scrollY;
  app.replaceChildren(tabs(), h("main", {}, banner, content), extra);
  if (!state.flash) window.scrollTo(0, y);
}

async function load() {
  const data = await api("GET", "/api/content");
  state.site = data.site; state.blog = data.blog; state.csrf = data.csrf;
  state.dirtySite = state.dirtyBlog = false; state.flash = null; render();
}

window.addEventListener("beforeunload", (e) => { if (state.dirtySite || state.dirtyBlog) { e.preventDefault(); e.returnValue = ""; } });
load().catch(() => { state.csrf = null; render(); });
