import styles from "./SectionNav.module.css";

export default function SectionNav({ left, right }) {
  return (
    <div className={`container ${styles.nav}`}>
      <div className={styles.inner}>
        <p className="mono sm">{left}</p>
        <p className="mono sm">{right}</p>
      </div>
    </div>
  );
}
