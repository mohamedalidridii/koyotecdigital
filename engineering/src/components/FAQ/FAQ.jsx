"use client";

import styles from "./FAQ.module.css";

import Copy from "@/components/Copy";
import SectionHeader from "@/components/SectionHeader";
import JsonLd from "@/components/JsonLd";

import { useLang } from "@/lib/useLang";

// Questions and answers, all readable at once on the page grid (LIFT anxiety: the objections are answered
// where people look for them). They used to appear as chat bubbles that typed themselves in on scroll.
// The FAQPage data is unchanged.
export default function FAQ({ k = "faq" }) {
  const c = useLang().t[k];

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: [].concat(item.answer).join(" ") },
    })),
  };

  return (
    <section className={styles.faq} data-umami-section="faq">
      <JsonLd data={schema} />
      <Copy variant="flicker">
        <SectionHeader bullet left={c.header[0]} right={c.header[1]} />
      </Copy>
      <div className={`container ${styles.inner}`}>
        <div className={styles.header}>
          <h2>{c.title}</h2>
        </div>
        <ol className={styles.list}>
          {c.items.map((item, i) => (
            <li key={item.question} className={styles.item}>
              <span className={`mono sm ${styles.no}`} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className={styles.qa}>
                <h3 className={styles.question}>{item.question}</h3>
                <div className={styles.answer}>
                  {[].concat(item.answer).map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
