"use client";

import styles from "./AiCases.module.css";

import Link from "next/link";

import Copy from "@/components/Copy";
import SectionHeader from "@/components/SectionHeader";
import Emblem from "./Emblem";

import { useLang } from "@/lib/useLang";

const pad = (n) => String(n).padStart(2, "0");

// the five cases as big rows; hovering one floods it with its own colours and draws its emblem
// collection: the content key (aiCases, devopsCases); base: the route of the listing
export default function AiCasesList({ collection = "aiCases", base = "/ai" }) {
  const { t, href } = useLang();
  const a = t[collection];

  return (
    <section className={styles.list}>
      <Copy variant="flicker">
        <SectionHeader bullet left={a.intro.kicker[0]} right={a.intro.kicker[1]} />
      </Copy>
      <div className={`container ${styles.listInner}`}>
        <div className={styles.listHead}>
          <Copy>
            <h2 className={styles.listTitle}>{a.intro.title}</h2>
          </Copy>
          <Copy>
            <p className={styles.listText}>{a.intro.text}</p>
          </Copy>
        </div>
        <ol className={styles.rows}>
          {a.cases.map((c, i) => (
            <li key={c.slug}>
              <Link href={href(`${base}/${c.slug}`)} className={styles.row} data-theme={c.slug}>
                <span className={`mono sm ${styles.rowNum}`}>{pad(i + 1)}</span>
                <span className={styles.rowMain}>
                  <span className={`mono sm ${styles.rowClient}`}>
                    {c.client} · {c.sector}
                  </span>
                  <span className={styles.rowTitle}>{c.title}</span>
                  <span className={styles.rowChips}>
                    {c.stack.slice(0, 4).map((s) => (
                      <span key={s} className="mono sm">
                        {s}
                      </span>
                    ))}
                  </span>
                </span>
                <span className={styles.rowMetric}>
                  <span className={styles.rowMetricValue}>{c.metrics[0][0]}</span>
                  <span className={styles.rowMetricLabel}>{c.metrics[0][1]}</span>
                </span>
                <Emblem slug={c.slug} className={styles.emblem} />
                <span className={`mono sm ${styles.rowRead}`}>
                  {a.labels.read} <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <p className={`mono sm ${styles.note}`}>
          <span className={styles.dot} aria-hidden="true" />
          {a.note}
        </p>
      </div>
    </section>
  );
}
