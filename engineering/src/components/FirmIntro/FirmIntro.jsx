"use client";

import styles from "./FirmIntro.module.css";

import Copy from "@/components/Copy";

import { useLang } from "@/lib/useLang";

export default function FirmIntro() {
  const { t } = useLang();
  return (
    <section className={styles.firmIntro}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.block}>
          <Copy animateOnScroll={false} delay="1.25">
            <h1 className={styles.heading}>{t.firmIntro.short}</h1>
          </Copy>
        </div>

        <div className={styles.block}>
          <Copy>
            <h1 className={styles.heading}>{t.firmIntro.long}</h1>
          </Copy>
        </div>
      </div>
    </section>
  );
}
