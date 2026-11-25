"use client";

import styles from "./ProcessSteps.module.css";

import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

import Copy from "@/components/Copy";
import SectionFooter from "@/components/SectionFooter";

import { useLang } from "@/lib/useLang";

// How a need becomes a system in production: four steps on one line (they used to stack and shrink
// while pinned). The last step leads to the engagement models.
export default function ProcessSteps() {
  const { t, href } = useLang();
  const CARDS = t.process.steps.map((copy, i) => ({
    index: String(i + 1).padStart(2, "0"),
    copy,
  }));
  const last = String(CARDS.length + 1).padStart(2, "0");

  return (
    <section className={styles.processSteps} data-umami-section="processSteps">
      <div className={`container ${styles.inner}`}>
        <Copy>
          <h2 className={styles.headline}>{t.process.headline}</h2>
        </Copy>
        <ol className={styles.list}>
          {CARDS.map(({ index, copy }) => (
            <li key={index} className={styles.step}>
              <span className={`mono sm ${styles.index}`}>{index}</span>
              <span className={styles.dot} aria-hidden="true" />
              <p className={styles.copy}>{copy}</p>
            </li>
          ))}
          <li className={`${styles.step} ${styles.last}`}>
            <span className={`mono sm ${styles.index}`}>{last}</span>
            <span className={styles.dot} aria-hidden="true" />
            <Link href={href("/engagements")} className={styles.cta}>
              {t.process.cta} <FiArrowRight aria-hidden="true" />
            </Link>
          </li>
        </ol>
      </div>

      <Copy variant="flicker">
        <SectionFooter bullet left={t.process.footer[0]} right={t.process.footer[1]} />
      </Copy>
    </section>
  );
}
