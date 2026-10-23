"use client";

import ExpertiseCards from "@/components/ExpertiseCards/ExpertiseCards";
import ExpertiseServices from "@/components/ExpertiseServices/ExpertiseServices";
import Callout from "@/components/Callout/Callout";
import SectionFooter from "@/components/SectionFooter/SectionFooter";
import styles from "./expertise.module.css";
import Copy from "@/components/Copy/Copy";

export default function ExpertisePage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Copy animateOnScroll={false} delay={1.125}>
          <h1>
            Our Bag Of Tricks
            <Callout
              className={styles.callout}
              label="Open sesame"
              rotation={20}
              variant={3}
              top="0em"
              right="0.25em"
            />
          </h1>
        </Copy>

        <div className={styles.sectionFooter}>
          <SectionFooter
            left={
              <Copy variant="scramble" animateOnScroll={false} delay={1.25}>
                <span>The Toolkit</span>
              </Copy>
            }
            right={
              <Copy variant="scramble" animateOnScroll={false} delay={1.25}>
                <span>Pick A Weapon</span>
              </Copy>
            }
          />
        </div>
      </section>

      <ExpertiseCards />

      <ExpertiseServices />
    </main>
  );
}
