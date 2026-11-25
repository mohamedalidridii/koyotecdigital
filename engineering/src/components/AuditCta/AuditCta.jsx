"use client";

import styles from "./AuditCta.module.css";

import { FiArrowRight } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

import Button from "@/components/Button";
import { useLang } from "@/lib/useLang";
import { CONTACT } from "@/content/shared";

// the 2-week audit offer: what you get + one primary action (the project form, topic pre-selected)
// place: where it sits on the page, sent with the click events
export default function AuditCta({ place = "nearshore", compact = false }) {
  const { t, href } = useLang();
  const c = t.auditCta;
  const wa = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(c.waText)}`;
  return (
    <section className={`${styles.band}${compact ? ` ${styles.compact}` : ""}`} aria-label={c.title} data-umami-section="auditCta">
      <div className={`container ${styles.inner}`}>
        <div className={styles.text}>
          <p className={`mono sm ${styles.kicker}`}>
            <i aria-hidden="true" />
            {c.kicker}
          </p>
          <h2 className={styles.title}>{c.title}</h2>
          {compact ? null : (
            <ul className={styles.points}>
              {c.points.map((p, i) => (
                <li key={p}>
                  <span className="mono sm" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={styles.actions}>
          <Button variant="primary" href={href("/contact/?need=devops-audit#project-form")} event="eng-audit-cta" eventPlace={place}>
            {c.cta}
          </Button>
          <a className={styles.wa} href={wa} target="_blank" rel="noreferrer" data-track="whatsapp" data-track-place={`engineering-${place}`}>
            <FaWhatsapp aria-hidden="true" /> {c.wa} <FiArrowRight aria-hidden="true" />
          </a>
          <p className={`mono sm ${styles.note}`}>{c.note}</p>
        </div>
      </div>
    </section>
  );
}
