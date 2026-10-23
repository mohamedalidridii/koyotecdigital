"use client";

import styles from "./impact.module.css";

import Btn from "@/components/Btn";
import Copy from "@/components/Copy";
import ImpactClock from "@/components/ImpactClock";
import ImpactSlider from "@/components/ImpactSlider";
import ParallaxImage from "@/components/ParallaxImage";

const impactStats = [
  {
    index: "01",
    title:
      "Every closure is signed off by an outside assessor before we publish it.",
  },
  {
    index: "02",
    title:
      "Restoration runs alongside extraction rather than waiting until a site shuts down.",
  },
  {
    index: "03",
    title:
      "The figures we report trace back to raw field data anyone can request and check.",
  },
];

export default function Impact() {
  return (
    <>
      <section className={styles.impactHero}>
        <div className={`container ${styles.impactHeroInner}`}>
          <div className={`cols ${styles.impactHeroCols}`}>
            <div className="col-3">
              <Copy animateOnScroll={false} delay={1.5}>
                <h1>The Record</h1>
              </Copy>
            </div>

            <div
              className={`col-6 ${styles.impactHeroSpacer}`}
              aria-hidden="true"
            />

            <div className="col-3">
              <Copy animateOnScroll={false} delay={1.75}>
                <h4>
                  A site by site account of what Ferrana opened, closed, and
                  handed back. Keep scrolling for the full record.
                </h4>
              </Copy>
            </div>
          </div>
        </div>

        <div className={styles.impactHeroMedia}>
          <ParallaxImage src="/images/img2.jpg" alt="" />
        </div>
      </section>

      <section className={styles.impactInfo}>
        <div className={`container ${styles.impactInfoInner}`}>
          <div className={`cols ${styles.impactInfoHeader}`}>
            <div className={`col-3 ${styles.impactInfoLabels}`}>
              <Copy>
                <p id="impact-info-label" className="mono-sm">
                  Track record
                </p>
              </Copy>
              <Copy triggerPoint="#impact-info-label" delay={0.05}>
                <p className="mono-sm">Method</p>
              </Copy>
            </div>

            <div className="col-6">
              <Copy>
                <h2 id="impact-info-heading">
                  Proof that holds up under audit
                </h2>
              </Copy>
            </div>

            <div className={`col-3 ${styles.impactInfoLink}`}>
              <Btn
                href="/initiatives"
                label="Browse every site"
                reveal
                triggerPoint="#impact-info-heading"
                delay={0.15}
              />
            </div>
          </div>

          <div className={`cols ${styles.impactInfoIntro}`}>
            <div className="col-9">
              <Copy triggerPoint="#impact-info-heading" delay={0.2}>
                <h2>
                  On land Ferrana has closed, the recovery is real enough to
                  survey, document, and defend against any independent review.
                </h2>
              </Copy>
            </div>

            <div className="col-3">
              <div className={styles.impactInfoMedia}>
                <ParallaxImage src="/images/img4.jpg" alt="" />
              </div>
            </div>
          </div>

          <div className={`cols ${styles.impactInfoStats}`}>
            {impactStats.map((stat) => {
              const statId = `impact-stat-${stat.index}`;

              return (
                <div
                  key={stat.index}
                  className={`col-4 ${styles.impactInfoStat}`}
                >
                  <Copy>
                    <h2 id={statId}>{stat.index}</h2>
                  </Copy>
                  <Copy triggerPoint={`#${statId}`} delay={0.1}>
                    <p>{stat.title}</p>
                  </Copy>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div id="impact-record">
        <ImpactSlider />
      </div>

      <ImpactClock />
    </>
  );
}
