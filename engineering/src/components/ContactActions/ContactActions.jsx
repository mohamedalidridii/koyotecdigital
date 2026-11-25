"use client";

import styles from "./ContactActions.module.css";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FiArrowRight, FiMail } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

import { useLang } from "@/lib/useLang";
import { splitPath } from "@/lib/i18n";
import { CONTACT } from "@/content/shared";

// The contact form API (ops/contact-api on the KOYOTEC VPS) accepts requests from www.koyotec.digital.
const API = "https://api.koyotec.digital/contact";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_MESSAGE = 10;

// what was typed survives a language switch (/contact and /en/contact are two pages): one draft per tab,
// kept only while the visitor moves between the two languages of this form
const DRAFT_KEY = "koy-eng-contact-draft";
const readDraft = () => {
  try {
    return JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null");
  } catch {
    return null;
  }
};
const writeDraft = (draft) => {
  try {
    if (draft) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    else sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* storage blocked: the draft is simply not kept */
  }
};

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

// ?need=… on links to this page pre-selects the topic (index into contactForm.needs, same order in fr/en).
// devops-audit = the 2-week DevOps & cloud audit (the offer); audit = the cloud cost audit (cost pages).
const NEED_KEYS = { "devops-audit": 0, iiot: 1, energy: 2, maintenance: 3, ai: 4, cloud: 5, devops: 5, kubernetes: 6, audit: 7, security: 8, data: 9 };

// reads ?need=… (useSearchParams must sit under a Suspense boundary in a prerendered page)
function NeedFromUrl({ needs, onNeed }) {
  const key = useSearchParams().get("need");
  useEffect(() => {
    const i = key ? NEED_KEYS[key.toLowerCase()] : undefined;
    if (i !== undefined && needs[i]) onNeed(needs[i]);
  }, [key, needs, onNeed]);
  return null;
}

export default function ContactActions() {
  const { t, lang } = useLang();
  const c = t.contactForm;
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [touched, setTouched] = useState({});
  const [need, setNeed] = useState("");
  const [company, setCompany] = useState("");
  const started = useRef(false);
  const lastField = useRef("");
  const finished = useRef(false); // sent, or abandonment already reported
  // analytics: form started (first focus), compared with eng-form-sent it gives the abandonment rate
  const onStart = (e) => {
    if (e?.target?.name) lastField.current = e.target.name;
    if (started.current) return;
    started.current = true;
    track("eng-form-start", { lang });
  };
  // form seen: half of it on screen, once per page view. Seen vs started tells whether visitors miss the
  // form or see it and stop; "need" is the topic the visitor arrived with (?need=), if any
  const formRef = useRef(null);
  const viewed = useRef(false);
  useEffect(() => {
    const form = formRef.current;
    if (!form || viewed.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || viewed.current) return;
        viewed.current = true;
        io.disconnect();
        track("eng-form-view", { lang: langRef.current, need: new URLSearchParams(window.location.search).get("need") || "none" });
      },
      { threshold: 0.5 },
    );
    io.observe(form);
    return () => io.disconnect();
  }, [status]);
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const langRef = useRef(lang);
  langRef.current = lang;

  // analytics: started but left without sending -> last field touched and how many required fields were filled
  useEffect(() => {
    const report = () => {
      if (!started.current || finished.current) return;
      finished.current = true;
      const filled = ["name", "email", "message"].filter((n) => String(valuesRef.current[n] || "").trim()).length;
      track("eng-form-abandon", { field: lastField.current || "none", filled: `${filled}/3`, lang: langRef.current });
      writeDraft(null);
    };
    window.addEventListener("pagehide", report);
    return () => {
      window.removeEventListener("pagehide", report);
      // a language switch lands on this same form in the other language: the draft carries on, no abandon
      if (splitPath(window.location.pathname).route === "/contact") return;
      report(); // leaving the page inside the site (client navigation)
    };
  }, []);

  // restore the draft left by the other language's page (a ?need= in the URL wins over its topic)
  useEffect(() => {
    const d = readDraft();
    if (!d) return;
    setValues((v) => ({ ...v, ...d.values }));
    setCompany(d.company || "");
    if (d.needIndex >= 0 && !new URLSearchParams(window.location.search).get("need")) setNeed(c.needs[d.needIndex] || "");
    started.current = true; // eng-form-start was already sent on the other page
    lastField.current = d.field || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep the draft current once the form is started (the topic is stored by position: labels differ per language)
  useEffect(() => {
    if (!started.current || finished.current) return;
    writeDraft({ values, company, needIndex: c.needs.indexOf(need), field: lastField.current });
  }, [values, company, need, c.needs]);
  const waHref = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(c.waText)}`;

  const errors = Object.fromEntries(REQUIRED.map((n) => [n, validate(n, values[n], c.errors)]));
  const errorOf = (n) => (touched[n] ? errors[n] : "");

  // live check: once a field has been left (or a submit was tried), its label updates on every keystroke
  const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  const onBlur = (e) => {
    const n = e.target.name;
    setTouched((s) => (s[n] ? s : { ...s, [n]: true }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    if (status === "sending") return;
    const form = e.currentTarget;
    const firstBad = REQUIRED.find((n) => errors[n]);
    if (firstBad) {
      setTouched({ name: true, email: true, message: true });
      form.querySelector(`[name="${firstBad}"]`)?.focus();
      track("eng-form-invalid", { field: firstBad, lang });
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
      finished.current = true;
      writeDraft(null);
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
      <Suspense fallback={null}>
        <NeedFromUrl needs={c.needs} onNeed={setNeed} />
      </Suspense>
      <div className="container">
        <div id="project-form" className={styles.formWrap}>
          <div className={styles.formIntro}>
            {/* the chosen topic is echoed here, so a visitor who clicked "Request the audit" sees it at once */}
            <p className="mono sm">{need ? `${c.kicker} · ${need}` : c.kicker}</p>
            <h3 className={styles.formTitle}>{c.title}</h3>
            <p className={styles.formCopy}>{c.copy}</p>
          </div>

          {status === "sent" ? (
            <div className={styles.done} role="status">
              <p className={styles.doneTitle}>{c.sentTitle}</p>
              <p>{c.sentCopy}</p>
            </div>
          ) : (
            <form ref={formRef} className={styles.form} onSubmit={onSubmit} onFocus={onStart} noValidate>
              <label className={styles.field}>
                <span>{c.name} *</span>
                <input type="text" maxLength={120} autoComplete="name" {...field("name")} />
                {hint("name")}
              </label>
              <label className={styles.field}>
                <span>{c.company}</span>
                <input name="company" type="text" maxLength={120} autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} />
              </label>
              <label className={styles.field}>
                <span>{c.email} *</span>
                <input type="email" maxLength={200} autoComplete="email" inputMode="email" {...field("email")} />
                {hint("email")}
              </label>
              <label className={styles.field}>
                <span>{c.need}</span>
                <select name="need" value={need} onChange={(e) => setNeed(e.target.value)}>
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
                  <a href={waHref} target="_blank" rel="noreferrer" data-track="whatsapp" data-track-place="engineering-form-error">
                    WhatsApp
                  </a>{" "}
                  · <a href={CONTACT.email.href}>{CONTACT.email.text}</a>
                </p>
              ) : null}
            </form>
          )}
        </div>
        <p className={`mono sm ${styles.orLabel}`}>{c.orLabel}</p>
        <div className={styles.buttons}>
          <a
            className={`${styles.btn} ${styles.wa}`}
            href={waHref}
            target="_blank"
            rel="noreferrer"
            data-track="whatsapp"
            data-track-place="engineering-contact"
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
            data-track="email"
            data-track-place="engineering-contact"
          >
            <span className={styles.btnText}>
              <span className={styles.btnLabel}>{c.emailLabel}</span>
              <span className={styles.btnNote}>{CONTACT.email.text}</span>
            </span>
            <FiMail aria-hidden="true" />
          </a>
        </div>

      </div>
    </section>
  );
}
