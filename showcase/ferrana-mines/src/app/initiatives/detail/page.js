"use client";

import styles from "./detail.module.css";

import Btn from "@/components/Btn";
import Copy from "@/components/Copy";
import Minimap from "@/components/Minimap";
import ParallaxImage from "@/components/ParallaxImage";

export default function InitiativeDetailPage() {
  return (
    <>
      <section className={styles.detailsHero}>
        <div className={`container ${styles.detailsHeroInner}`}>
          <div className={styles.detailsHeroCols}>
            <div className={styles.detailsHeroLead}>
              <Copy delay={1.6} animateOnScroll={false}>
                <p className={`mono-sm ${styles.detailsHeroYear}`}>2017</p>
              </Copy>
              <Copy delay={1.7} animateOnScroll={false}>
                <h3 className={styles.detailsHeroTitle}>Groundbreak</h3>
              </Copy>
            </div>

            <div className={styles.detailsHeroMeta}>
              <div className={styles.metaItem}>
                <Copy delay={1.8} animateOnScroll={false}>
                  <p className={`mono-sm ${styles.metaLabel}`}>Client</p>
                </Copy>
                <Copy delay={1.9} animateOnScroll={false}>
                  <h3 className={styles.metaValue}>Northern Ridge Partners</h3>
                </Copy>
              </div>
              <div className={styles.metaItem}>
                <Copy delay={2} animateOnScroll={false}>
                  <p className={`mono-sm ${styles.metaLabel}`}>Industry</p>
                </Copy>
                <Copy delay={2.1} animateOnScroll={false}>
                  <h3 className={styles.metaValue}>Mining &amp; Metals</h3>
                </Copy>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.detailsHeroMedia}>
          <ParallaxImage src="/images/img10.jpg" alt="" />
        </div>
      </section>

      <Minimap />

      <section className={styles.detailsInfo}>
        <div className={styles.detailsInfoBg} aria-hidden="true">
          <ParallaxImage src="/images/img9.jpg" alt="" />
        </div>

        <div className={`container ${styles.detailsInfoInner}`}>
          <div className={styles.detailsInfoGrid}>
            <div className={styles.detailsInfoSpacer} aria-hidden="true" />

            <div className={styles.detailsInfoContent}>
              <Copy>
                <h2 id="details-info-heading">
                  The site that taught us how to leave
                </h2>

                <p>
                  Groundbreak was the first place Ferrana proved that a mine and
                  its recovery could be planned as one thing rather than two.
                  Before a single machine reached the site, the land was walked
                  end to end, its water tracked, its living corridors marked.
                </p>

                <p>
                  What began here as caution became the way the whole company
                  works. The lessons Groundbreak forced on us, that a promise
                  made at the start is worth nothing unless the money and the
                  method are locked in beside it, now sit behind every site we
                  open. It remains the site we measure the others against, and
                  the one we return to whenever we need reminding what finished
                  ground is supposed to look like.
                </p>
              </Copy>
              <Btn
                href="/initiatives"
                label="Browse all sites"
                reveal
                triggerPoint="#details-info-heading"
                delay={1.5}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
