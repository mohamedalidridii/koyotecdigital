import styles from "./SectionHeader.module.css";

export default function SectionHeader({
  left,
  right,
  variant = "v1",
  bullet = false,
  ref,
  ...rest
}) {
  return (
    <div ref={ref} className={styles.wrap} {...rest}>
      <div
        className={`container ${styles.bar}${variant === "v2" ? ` ${styles.v2}` : ""}`}
      >
        {left ? (
          <p className={`mono sm ${styles.label}`}>
            {bullet ? (
              <span
                className={styles.bullet}
                data-copy-bullet
                aria-hidden="true"
              />
            ) : null}
            <span data-copy-text>{left}</span>
          </p>
        ) : null}
        {right ? (
          <p className={`mono sm ${styles.label}`}>
            {bullet ? (
              <span
                className={styles.bullet}
                data-copy-bullet
                aria-hidden="true"
              />
            ) : null}
            <span data-copy-text>{right}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
