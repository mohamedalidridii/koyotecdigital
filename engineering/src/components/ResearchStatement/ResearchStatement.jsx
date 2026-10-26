"use client";

import styles from "./ResearchStatement.module.css";

import Copy from "@/components/Copy";
import SectionHeader from "@/components/SectionHeader";

import { useLang } from "@/lib/useLang";

export default function ResearchStatement() {
  const { researchStatement: c } = useLang().t;
  return (
    <section className={styles.researchStatement}>
      <Copy variant="flicker">
        <SectionHeader bullet left={c.header[0]} right={c.header[1]} />
      </Copy>
      <div className={`container ${styles.inner}`}>
        <div className={styles.cols}>
          <Copy>
            <p className={`lg ${styles.statement}`}>{c.statement}</p>
          </Copy>

          <div className={styles.aside}>
            <Copy>
              <p className={`lg ${styles.copy}`}>{c.copy}</p>
            </Copy>

            <div className={styles.stats}>
              {c.stats.map(({ label, value }) => (
                <div key={label} className={styles.stat}>
                  <Copy variant="flicker">
                    <p className="mono sm">{label}</p>
                  </Copy>
                  <Copy type="chars">
                    <h2>{value}</h2>
                  </Copy>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
