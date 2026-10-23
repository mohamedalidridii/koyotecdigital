"use client";

import styles from "./mission.module.css";

import Copy from "@/components/Copy";
import MissionBenefits from "@/components/MissionBenefits";
import MissionFeatures from "@/components/MissionFeatures";
import MissionHeader from "@/components/MissionHeader";
import MissionStack from "@/components/MissionStack";
import MissionUseCases from "@/components/MissionUseCases";
import ParallaxImage from "@/components/ParallaxImage";

export default function Mission() {
  return (
    <>
      <section className={styles.missionHero}>
        <div className={`container ${styles.missionHeroInner}`}>
          <div className={styles.missionHeroCols}>
            <Copy animateOnScroll={false} delay={1.85}>
              <h4 className={styles.missionHeroIndex}>Our Mission</h4>
            </Copy>

            <div className={styles.missionHeroCopy}>
              <Copy animateOnScroll={false} delay={1.5}>
                <h2>
                  We treat a site as something borrowed. What we take from the
                  ground is counted, and what we give back is the measure we are
                  judged by long after the crews have gone.
                </h2>
              </Copy>

              <div className={styles.missionHeroMeta}>
                <Copy animateOnScroll={false} delay={1.95}>
                  <h4>The Debt We Owe</h4>
                </Copy>

                <Copy animateOnScroll={false} delay={2.05}>
                  <h4>Ground Held in Trust</h4>
                </Copy>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.missionHeroMedia}>
          <ParallaxImage src="/images/img4.jpg" alt="" />
        </div>
      </section>

      <MissionStack />
      <MissionHeader />
      <MissionFeatures />
      <MissionUseCases />
      <MissionBenefits />
    </>
  );
}
