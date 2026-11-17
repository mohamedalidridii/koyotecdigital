"use client";

import styles from "./ContactActions.module.css";

import { useState } from "react";
import { FiArrowRight, FiArrowDown, FiMail } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

import { useLang } from "@/lib/useLang";
import { CONTACT } from "@/content/shared";

// The contact form API (ops/contact-api on the KOYOTEC VPS) accepts requests from www.koyotec.digital.
const API = "https://api.koyotec.digital/contact";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_MESSAGE = 10;

const track = (name, data) => {
  try {
    window.umami?.track(name, data);
  } catch {
    /* analytics must never break the form */
  }
};

// returns the error label for a field, or "" when the value is valid
function validate(name, value, e) {
  const v = String(value ?? "").trim();
  if (name === "name") {
    if (!v) return e.nameRequired;
    if (v.length < 2) return e.nameShort;
  }
  if (name === "email") {
    if (!v) return e.emailRequired;
    if (!EMAIL_RE.test(v)) return e.emailInvalid;
  }
  if (name === "message") {
    if (!v) return e.messageRequired;
    if (v.length < MIN_MESSAGE) return e.messageShort;
  }
  return "";
}

const REQUIRED = ["name", "email", "message"];

export default function ContactActions() {
  const { t, lang } = useLang();
  const c = t.contactForm;
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [touched, setTouched] = useState({});
  const waHref = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(c.waText)}`;

  const errors = Object.fromEntries(REQUIRED.map((n) => [n, validate(n, values[n], c.errors)]));
  const errorOf = (n) => (touched[n] ? errors[n] : "");

  // live check: once a field has been left (or a submit was tried), its label updates on every keystroke
  const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  const onBlur = (e) => {
    const n = e.target.name;
    setTouched((s) => (s[n] ? s : { ...s, [n]: true }));
  };

  const scrollToForm = (e) => {
    e.preventDefault();
    document.getElementById("project-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    track("eng-form-open", { place: "contact-top" });
  };

  async function onSubmit(e) {
    e.preventDefault();
    if (status === "sending") return;
    const form = e.currentTarget;
    const firstBad = REQUIRED.find((n) => errors[n]);
    if (firstBad) {
      setTouched({ name: true, email: true, message: true });
      form.querySelector(`[name="${firstBad}"]`)?.focus();
      track("eng-form-invalid", { field: firstBad });
      return;
    }
    const f = new FormData(form);
    const need = String(f.get("need") || "");
    const company = String(f.get("company") || "").trim();
    const body = {
      name: values.name.trim(),
      email: values.email.trim(),
      message: `${values.message.trim()}\n\n${c.mailCompany}: ${company || "-"}\n${c.mailNeed}: ${need || "-"}\n(Koyotec Engineering)`,
      type: [`Engineering: ${need || "-"}`],
      lang,
      website: String(f.get("website") || ""), // honeypot
    };
    setStatus("sending");
    try {
      const r = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error(String(r.status));
      setStatus("sent");
      track("eng-form-sent", { need: need || "unspecified", lang });
    } catch {
      setStatus("error");
      track("eng-form-error", { lang });
    }
  }

  const field = (n) => {
    const err = errorOf(n);
    const ok = touched[n] && !errors[n];
    return {
      name: n,
      value: values[n],
      onChange,
      onBlur,
      "aria-invalid": err ? "true" : "false",
      "aria-describedby": `${n}-hint`,
      className: err ? styles.invalid : ok ? styles.valid : undefined,
    };
  };

  const hint = (n) => {
    const err = errorOf(n);
    const ok = touched[n] && !errors[n];
    return (
      <span id={`${n}-hint`} className={err ? styles.hintError : styles.hintOk} aria-live="polite">
        {err || (ok ? c.errors.ok : "")}
      </span>
    );
  };

  return (
    <section className={styles.actions} aria-label={c.ariaLabel}>
      <div className="container">
        <div className={styles.buttons}>
          <a
            className={`${styles.btn} ${styles.wa}`}
            href={waHref}
            target="_blank"
            rel="noreferrer"
            data-umami-event="whatsapp"
            data-umami-event-place="engineering-contact"
          >
            <span className={styles.btnText}>
              <span className={styles.btnLabel}>WhatsApp</span>
              <span className={styles.btnNote}>{c.waNote}</span>
            </span>
            <FaWhatsapp aria-hidden="true" />
          </a>
          <a
            className={`${styles.btn} ${styles.mail}`}
            href={CONTACT.email.href}
            data-umami-event="email"
            data-umami-event-place="engineering-contact"
          >
            <span className={styles.btnText}>
              <span className={styles.btnLabel}>{c.emailLabel}</span>
              <span className={styles.btnNote}>{CONTACT.email.text}</span>
            </span>
            <FiMail aria-hidden="true" />
          </a>
          <a className={`${styles.btn} ${styles.formBtn}`} href="#project-form" onClick={scrollToForm}>
            <span className={styles.btnText}>
              <span className={styles.btnLabel}>{c.formLabel}</span>
              <span className={styles.btnNote}>{c.formNote}</span>
            </span>
            <FiArrowDown aria-hidden="true" />
          </a>
        </div>

        <div id="project-form" className={styles.formWrap}>
          <div className={styles.formIntro}>
            <p className="mono sm">{c.kicker}</p>
            <h3 className={styles.formTitle}>{c.title}</h3>
            <p className={styles.formCopy}>{c.copy}</p>
          </div>

          {status === "sent" ? (
            <div className={styles.done} role="status">
              <p className={styles.doneTitle}>{c.sentTitle}</p>
              <p>{c.sentCopy}</p>
            </div>
          ) : (
            <form className={styles.form} onSubmit={onSubmit} noValidate>
              <label className={styles.field}>
                <span>{c.name} *</span>
                <input type="text" maxLength={120} autoComplete="name" {...field("name")} />
                {hint("name")}
              </label>
              <label className={styles.field}>
                <span>{c.company}</span>
                <input name="company" type="text" maxLength={120} autoComplete="organization" />
              </label>
              <label className={styles.field}>
                <span>{c.email} *</span>
                <input type="email" maxLength={200} autoComplete="email" inputMode="email" {...field("email")} />
                {hint("email")}
              </label>
              <label className={styles.field}>
                <span>{c.need}</span>
                <select name="need" defaultValue="">
                  <option value="" disabled>
                    {c.needPlaceholder}
                  </option>
                  {c.needs.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <label className={`${styles.field} ${styles.full}`}>
                <span>{c.message} *</span>
                <textarea rows={5} maxLength={5000} placeholder={c.messagePlaceholder} {...field("message")} />
                {hint("message")}
              </label>
              {/* honeypot: hidden from humans, bots fill it */}
              <label className={styles.hp} aria-hidden="true">
                Website
                <input name="website" type="text" tabIndex={-1} autoComplete="off" />
              </label>
              <div className={`${styles.full} ${styles.submitRow}`}>
                <button type="submit" className={styles.submit} disabled={status === "sending"}>
                  <span>{status === "sending" ? c.sending : c.submit}</span>
                  <FiArrowRight aria-hidden="true" />
                </button>
                <p className={styles.privacy}>{c.privacy}</p>
              </div>
              {status === "error" ? (
                <p className={`${styles.full} ${styles.error}`} role="alert">
                  {c.error}{" "}
                  <a href={waHref} target="_blank" rel="noreferrer" data-umami-event="whatsapp" data-umami-event-place="engineering-form-error">
                    WhatsApp
                  </a>{" "}
                  · <a href={CONTACT.email.href}>{CONTACT.email.text}</a>
                </p>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
