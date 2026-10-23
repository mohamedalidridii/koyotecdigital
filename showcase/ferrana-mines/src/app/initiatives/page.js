import styles from "./initiatives.module.css";

import InitiativesCarousel from "@/components/InitiativesCarousel";

export default function Initiatives() {
  return (
    <main className={styles.page}>
      <InitiativesCarousel />
    </main>
  );
}
