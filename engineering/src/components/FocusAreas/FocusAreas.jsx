"use client";

import styles from "./FocusAreas.module.css";

import { TensorIcon, GradientCheckIcon, LockIcon } from "@unlocalhosted/dither-icons";

import { useLang } from "@/lib/useLang";

// card looks and icons; the copy comes from the dictionary (or the `items` prop). Static: the icons used
// to replay an animation every 1.8 s, motion that explained nothing (LIFT distraction).
const LOOKS = [
  { Icon: TensorIcon, cardClass: styles.accent },
  { Icon: GradientCheckIcon, cardClass: styles.dark },
  { Icon: LockIcon, cardClass: styles.light },
];

// offset: start the colour sequence later (under a red hero, start with the white card)
export default function FocusAreas({ items, offset = 0 }) {
  const { t } = useLang();
  const CARDS = (items ? t[items] : t.focus).map((card, i) => ({
    ...card,
    ...LOOKS[(i + offset) % LOOKS.length],
    index: String(i + 1).padStart(2, "0"),
  }));

  return (
    <section className={styles.focusAreas}>
      <div className={`container ${styles.inner}`}>
        {CARDS.map(({ index, title, copy, Icon, cardClass }) => (
          <div key={index} className={`${styles.area} ${cardClass}`}>
            <div className={styles.top}>
              <div className={styles.icon} aria-hidden="true">
                <Icon size={56} texture="solid" animate={false} />
              </div>
              <p className="mono sm">{index}</p>
            </div>
            <div className={styles.copy}>
              <p className="lg">{title}</p>
              <p>{copy}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
