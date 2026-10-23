"use client";

import styles from "./MissionHeader.module.css";

import Copy from "@/components/Copy";

export default function MissionHeader() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.row}>
          <Copy>
            <h1 id="mission-land-heading" className={styles.heading}>
              The land keeps the longer record
            </h1>
          </Copy>
          <div className={styles.description}>
            <Copy triggerPoint="#mission-land-heading" delay={0.1}>
              <h3>
                Ore leaves a site once. The ground it came from stays for
                generations, holding the shape of how it was worked. Ferrana
                plans for that longer record from the outset, so the place a
                site becomes is one the land can carry without strain long after
                the last load has gone.
              </h3>
            </Copy>
            <Copy triggerPoint="#mission-land-heading" delay={0.25}>
              <h3>
                That outlook shapes every decision made on the ground, from
                where a road is cut to how a slope is left to settle. Nothing is
                treated as temporary, because the site does not disappear when
                the work does. It simply becomes the version of the land that
                remains, and that version is the one we are answerable for.
              </h3>
            </Copy>
          </div>
        </div>
      </div>
    </section>
  );
}
