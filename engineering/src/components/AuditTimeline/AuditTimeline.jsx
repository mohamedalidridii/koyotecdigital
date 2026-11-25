"use client";

import styles from "./AuditTimeline.module.css";

import { useEffect, useRef } from "react";

import { useLang } from "@/lib/useLang";

// What the 2-week audit is, as a picture: three steps on one line, and what you leave with.
// An explanatory graphic (LIFT clarity: it shortens the time to understand the offer). The words are
// always visible; only the connecting line draws itself once, when the timeline comes into view.
const LABELS = {
  fr: { title: "L’audit, étape par étape", out: "Vous repartez avec" },
  en: { title: "The audit, step by step", out: "You leave with" },
};

export default function AuditTimeline({ variant = "compact", tone = "paper", showTitle = true }) {
  const { t, lang } = useLang();
  const rootRef = useRef(null);
  const steps = t.nearshoreAudit.map((s) => {
    const [when, what] = s.title.split(" · ");
    return { when, what: what || "", copy: s.copy };
  });
  const L = LABELS[lang] || LABELS.fr;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || typeof IntersectionObserver === "undefined") {
      el.dataset.drawn = "true";
      return;
    }
    el.dataset.drawn = "false";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.drawn = "true";
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure ref={rootRef} className={`${styles.timeline} ${styles[variant]} ${styles[tone]}`} aria-label={L.title}>
      {showTitle ? <figcaption className={`mono sm ${styles.title}`}>{L.title}</figcaption> : null}
      <ol className={styles.steps}>
        {steps.map((s, i) => (
          <li key={s.when} className={styles.step} style={{ "--i": i }}>
            <span className={`mono sm ${styles.no}`} aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className={styles.dot} aria-hidden="true" />
            <p className={`mono sm ${styles.when}`}>{s.when}</p>
            <p className={styles.what}>{s.what}</p>
            {variant === "full" ? <p className={styles.copy}>{s.copy}</p> : null}
          </li>
        ))}
      </ol>
      {variant === "full" ? null : (
        <div className={styles.out}>
          <p className={`mono sm ${styles.outLabel}`}>{L.out}</p>
          <p className={styles.outText}>{t.auditCta.points[1]}</p>
        </div>
      )}
    </figure>
  );
}
