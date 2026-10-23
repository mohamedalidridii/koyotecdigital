"use client";
import ContactCards from "@/components/ContactCards/ContactCards";
import SectionNav from "@/components/SectionNav/SectionNav";
import SectionFooter from "@/components/SectionFooter/SectionFooter";
import Callout from "@/components/Callout/Callout";
import styles from "./contact.module.css";
import Copy from "@/components/Copy/Copy";

export default function ContactPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Copy animateOnScroll={false} delay={1.125}>
          <h1>
            Come Bug The Studio
            <Callout
              className={styles.callout}
              label="Pull up"
              rotation={12}
              top="0.25em"
              right="0.5em"
              variant={1}
            />
          </h1>
        </Copy>

        <div className={styles.sectionFooter}>
          <SectionFooter
            left={
              <Copy variant="scramble" animateOnScroll={false} delay={1.25}>
                <span>Roll The Cards</span>
              </Copy>
            }
            right={
              <Copy variant="scramble" animateOnScroll={false} delay={1.25}>
                <span>Say Hello</span>
              </Copy>
            }
          />
        </div>
      </section>

      <ContactCards />
    </main>
  );
}
