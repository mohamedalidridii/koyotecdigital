"use client";

import styles from "./ContactBanner.module.css";

import Button from "@/components/Button";

import { useLang } from "@/lib/useLang";
import { localize } from "@/lib/i18n";
import { CONTACT } from "@/content/shared";

// The closing call to action of a page: one action (the project form), the reply promise, and every
// other way to reach us beside it. Plain red band, no picture behind the text.
function Line({ line }) {
  if (typeof line === "string") return <p>{line}</p>;

  return (
    <p>
      <a
        href={line.href}
        data-track={line.event}
        data-track-place={line.event ? "engineering" : undefined}
        {...(line.external ? { target: "_blank", rel: "noreferrer" } : undefined)}
      >
        {line.text}
      </a>
    </p>
  );
}

export default function ContactBanner() {
  const { t, lang } = useLang();
  const c = t.contact;
  // the project form lives on the contact page only: link there (this banner is on many pages).
  // Button is a Next <Link>, which adds the base path itself: no BASE prefix here.
  const formHref = `${localize(lang, c.form.route)}/#${c.form.hash}`;
  const GROUPS = [
    { label: c.labels.comms, lines: [CONTACT.phone, CONTACT.email] },
    { label: c.labels.address, lines: c.address },
    { label: c.labels.social, lines: CONTACT.social },
  ];

  return (
    <section className={styles.contactBanner} data-umami-section="contactBanner">
      <div className={`container ${styles.inner}`}>
        <div className={styles.intro}>
          <p className={`mono sm ${styles.kicker}`}>
            <i aria-hidden="true" />
            {t.navContact.title}
          </p>
          <h2 className={styles.title}>{c.title}</h2>
          <p className={styles.copy}>{c.copy}</p>
          <div className={styles.action}>
            <Button variant="light" href={formHref} event="eng-form-link" eventPlace="engineering">
              {c.form.text}
            </Button>
            <p className="mono sm">{c.formNote}</p>
          </div>
        </div>

        <div className={styles.meta}>
          {GROUPS.map(({ label, lines }) => (
            <div key={label} className={styles.group}>
              <p className={`mono sm ${styles.label}`}>{label}</p>
              <div className={styles.lines}>
                {lines.map((line) => (
                  <Line key={typeof line === "string" ? line : line.text} line={line} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
