"use client";

import styles from "./ContactActions.module.css";

import { useState } from "react";
import { FiArrowRight, FiArrowDown, FiMail } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

import { useLang } from "@/lib/useLang";
import { CONTACT } from "@/content/shared";

// The contact form API (ops/contact-api on the KOYOTEC VPS) accepts requests from www.koyotec.digital.
const API = "https://api.koyotec.digital/contact";

const track = (name, data) => {
  try {
    window.umami?.track(name, data);
  } catch {
    /* analytics must never break the form */
  }
};

export default function ContactActions() {
  const { t, lang } = useLang();
  const c = t.contactForm;
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const waHref = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(c.waText)}`;

  const scrollToForm = (e) => {
    e.preventDefault();
    document.getElementById("project-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    track("eng-form-open", { place: "contact-top" });
  };

  async function onSubmit(e) {
    e.preventDefault();
    if (status === "sending") return;
    const f = new FormData(e.currentTarget);
    if (!String(f.get("name") || "").trim() || !String(f.get("email") || "").trim() || !String(f.get("message") || "").trim()) return;
    const need = String(f.get("need") || "");
    const company = String(f.get("company") || "").trim();
    const body = {
      name: String(f.get("name") || "").trim(),
      email: String(f.get("email") || "").trim(),
      message: `${String(f.get("message") || "").trim()}\n\n${c.mailCompany}: ${company || "-"}\n${c.mailNeed}: ${need || "-"}\n(Koyotec Engineering)`,
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
            <form className={styles.form} onSubmit={onSubmit} noValidate={false}>
              <label className={styles.field}>
                <span>{c.name} *</span>
                <input name="name" type="text" required maxLength={120} autoComplete="name" />
              </label>
              <label className={styles.field}>
                <span>{c.company}</span>
                <input name="company" type="text" maxLength={120} autoComplete="organization" />
              </label>
              <label className={styles.field}>
                <span>{c.email} *</span>
                <input name="email" type="email" required maxLength={200} autoComplete="email" />
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
                <textarea name="message" required rows={5} maxLength={5000} placeholder={c.messagePlaceholder} />
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
