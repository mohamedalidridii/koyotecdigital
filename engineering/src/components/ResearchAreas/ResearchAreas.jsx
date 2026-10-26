"use client";

import styles from "./ResearchAreas.module.css";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  SparklesIcon,
  LayersIcon,
  TerminalIcon,
  LockIcon,
  ChartIcon,
} from "@unlocalhosted/dither-icons";

import DitherImage from "@/components/DitherImage/DitherImage";

import { useLang } from "@/lib/useLang";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// one icon per discipline, in the order of t.areas
const ICONS = [SparklesIcon, LayersIcon, TerminalIcon, LockIcon, ChartIcon];

export default function ResearchAreas() {
  const { t } = useLang();
  const CARDS = t.areas.map((area, n) => ({ ...area, Icon: ICONS[n] }));
  const container = useRef(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray(
        container.current.querySelectorAll(`.${styles.area}`),
      );

      cards.forEach((card, index) => {
        if (index >= cards.length - 1) return;

        ScrollTrigger.create({
          trigger: card,
          start: "top top",
          endTrigger: cards[cards.length - 1],
          end: "top top",
          pin: true,
          pinSpacing: false,
        });

        ScrollTrigger.create({
          trigger: cards[index + 1],
          start: "top bottom",
          end: "top top",
          onUpdate: (self) => {
            const progress = self.progress;
            gsap.set(card, {
              scale: 1 - progress * 0.25,
              rotation: (index % 2 === 0 ? 5 : -5) * progress,
              opacity: 1 - progress,
              filter: `blur(${progress * 8}px)`,
            });
          },
        });
      });
    },
    { scope: container },
  );

  return (
    <section className={styles.researchAreas} ref={container}>
      <div className={styles.bg} aria-hidden="true">
        <DitherImage
          src="/images/research/areas.jpg"
          alt=""
          darkColor="#ff0000"
          lightColor="#f3f1ec"
        />
      </div>

      <div className={styles.stack}>
        {CARDS.map(({ title, label, description, Icon }) => (
          <article key={title} className={styles.area}>
            <div className={styles.panel}>
              <div className={styles.main}>
                <h2 className={styles.title}>{title}</h2>
                <p className="lg">{description}</p>
              </div>

              <div className={styles.side}>
                <div className={`di-trigger ${styles.icon}`}>
                  <Icon size={160} texture="dither" animate />
                </div>
                <p className="mono sm">{label}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
