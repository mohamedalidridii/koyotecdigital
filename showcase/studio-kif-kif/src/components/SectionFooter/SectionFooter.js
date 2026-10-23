import styles from "./SectionFooter.module.css";

export default function SectionFooter({ left, right }) {
  return (
    <div className={`container ${styles.footer}`}>
      <div className={styles.inner}>
        <p className="mono sm">{left}</p>
        <p className="mono sm">{right}</p>
      </div>
    </div>
  );
}
