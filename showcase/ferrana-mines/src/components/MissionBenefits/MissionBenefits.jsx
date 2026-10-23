import styles from "./MissionBenefits.module.css";

import Copy from "@/components/Copy";
import MissionSectionHeader from "@/components/MissionSectionHeader";

const benefits = [
  {
    id: "land",
    title: "The Land",
    body: "The ground itself is the first party we answer to, returned to a state that can carry life on its own.",
  },
  {
    id: "communities",
    title: "The Communities",
    body: "The people who live nearest a site inherit whatever we leave, so they hold the final say on what good looks like.",
  },
  {
    id: "investors",
    title: "The Investors",
    body: "Backers gain a stake that does not turn into liability later, because every site is closed with its costs already met.",
  },
  {
    id: "record",
    title: "The Record",
    body: "The wider industry gains a public account it can measure against, raising the bar for what closure should mean.",
  },
];

export default function MissionBenefits() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <MissionSectionHeader className={styles.label} labelId="mission-serves-label">
          Who This Serves
        </MissionSectionHeader>

        <ol className={styles.grid}>
          {benefits.map(({ id, title, body }) => {
            const titleId = `mission-benefit-${id}-title`;

            return (
              <li key={title} className={styles.cell}>
                <Copy>
                  <h4 id={titleId} className={styles.title}>
                    {title}
                  </h4>
                </Copy>

                <div className={styles.copy}>
                  <Copy triggerPoint={`#${titleId}`} delay={0.1}>
                    <h4 className={styles.body}>{body}</h4>
                  </Copy>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
