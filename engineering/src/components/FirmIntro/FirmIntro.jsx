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
            <h2 className={`h1 ${styles.heading}`}>{t.firmIntro.short}</h2>
          </Copy>
        </div>

        <div className={styles.block}>
          <Copy>
            <h2 className={`h1 ${styles.heading}`}>{t.firmIntro.long}</h2>
          </Copy>
          {t.firmIntro.founder ? (
            <p className={styles.founder}>
              {t.firmIntro.founder[0]}{" "}
              <a href={t.firmIntro.founderHref} data-track="founder-link" data-track-place="studio">
                {t.firmIntro.founder[1]}
              </a>{" "}
              {t.firmIntro.founder[2]}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
