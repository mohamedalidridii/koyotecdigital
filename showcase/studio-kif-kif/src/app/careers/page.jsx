"use client";
import CareersList from "@/components/CareersList/CareersList";
import Testimonials from "@/components/Testimonials/Testimonials";
import SectionFooter from "@/components/SectionFooter/SectionFooter";
import Callout from "@/components/Callout/Callout";
import styles from "./careers.module.css";
import Copy from "@/components/Copy/Copy";

export default function CareersPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Copy animateOnScroll={false} delay={1.125}>
          <h1>
            Come Make A Mess
            <Callout
              className={styles.callout}
              label="Aprons off"
              rotation={-10}
              top="0.25em"
              left="0em"
              variant={2}
            />
          </h1>
        </Copy>

        <div className={styles.sectionFooter}>
          <SectionFooter
            left={
              <Copy variant="scramble" animateOnScroll={false} delay={1.25}>
                <span>Open Seats</span>
              </Copy>
            }
            right={
              <Copy variant="scramble" animateOnScroll={false} delay={1.25}>
                <span>The Gigs</span>
              </Copy>
            }
          />
        </div>
      </section>

      <CareersList />

      <Testimonials />
    </main>
  );
}
