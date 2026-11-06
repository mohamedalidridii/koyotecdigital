"use client";

import styles from "./Systems.module.css";

import { useLenis } from "lenis/react";

import Copy from "@/components/Copy";
import SectionHeader from "@/components/SectionHeader";

import { useLang } from "@/lib/useLang";

const pad = (n) => String(n).padStart(2, "0");

// the page's table of contents: one row per field, each glides to its chapter
export default function SystemsIntro() {
  const { t } = useLang();
  const s = t.systems;
  const lenis = useLenis();

  const go = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.6 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className={styles.intro}>
      <Copy variant="flicker">
        <SectionHeader bullet left={s.intro.kicker[0]} right={s.intro.kicker[1]} />
      </Copy>
      <div className={`container ${styles.introInner}`}>
        <div className={styles.introHead}>
          <Copy>
            <h2 className={styles.introTitle}>{s.intro.title}</h2>
          </Copy>
          <Copy>
            <p className={styles.introText}>{s.intro.text}</p>
          </Copy>
        </div>
        <ol className={styles.index}>
          {s.chapters.map((c, i) => (
            <li key={c.id}>
              <a href={`#${c.id}`} onClick={(e) => go(e, c.id)} className={styles.indexRow} data-theme={c.id}>
                <span className={`mono sm ${styles.indexNum}`}>{pad(i + 1)}</span>
                <span className={styles.indexName}>{c.discipline}</span>
                <span className={styles.indexTitle}>{c.title}</span>
                <span className={`mono sm ${styles.indexCode}`}>« {c.code} »</span>
                <span className={styles.indexArrow} aria-hidden="true">↓</span>
              </a>
            </li>
          ))}
        </ol>
        <p className={`mono sm ${styles.disclaimer}`}>
          <span className={styles.dot} aria-hidden="true" />
          {s.intro.disclaimer}
        </p>
      </div>
    </section>
  );
}
