"use client";

import styles from "./ResearchAreas.module.css";

import { SparklesIcon, LayersIcon, TerminalIcon, LockIcon, ChartIcon } from "@unlocalhosted/dither-icons";

import { useLang } from "@/lib/useLang";

// one icon per discipline, in the order of t.areas
const ICONS = [SparklesIcon, LayersIcon, TerminalIcon, LockIcon, ChartIcon];

// The five disciplines side by side, all readable at once (they used to stack and blur away while
// pinned over a photo).
export default function ResearchAreas() {
  const { t } = useLang();
  const CARDS = t.areas.map((area, n) => ({ ...area, Icon: ICONS[n] }));

  return (
    <section className={styles.researchAreas}>
      <ol className={`container ${styles.grid}`}>
        {CARDS.map(({ title, label, description, Icon }, i) => (
          <li key={title} className={styles.area}>
            <div className={styles.top}>
              <span className={`mono sm ${styles.no}`}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.icon} aria-hidden="true">
                <Icon size={44} texture="solid" animate={false} />
              </span>
            </div>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.description}>{description}</p>
            <p className={`mono sm ${styles.label}`}>{label}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
