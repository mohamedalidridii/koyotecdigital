"use client";

import styles from "./OpenPositions.module.css";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ExternalLinkIcon } from "@unlocalhosted/dither-icons";

import Copy from "@/components/Copy";

import { useLang } from "@/lib/useLang";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ROW_STAGGER = 0.06;


export default function OpenPositions() {
  const { positions: c } = useLang().t;
  const ROLES = c.roles;
  const sectionRef = useRef(null);
  const listRef = useRef(null);
  const count = String(ROLES.length).padStart(2, "0");

  useGSAP(
    () => {
      const list = listRef.current;
      if (!list) return;

      const rows = list.querySelectorAll(`.${styles.row}`);
      if (!rows.length) return;

      const tl = gsap.timeline({
        defaults: { ease: "power3.out", force3D: false },
        scrollTrigger: {
          trigger: list,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });

      rows.forEach((row, index) => {
        const bits = row.querySelectorAll(`.${styles.tag}, .${styles.arrow}`);
        if (!bits.length) return;
        gsap.set(bits, { scale: 0, transformOrigin: "center", force3D: false });
        tl.to(
          bits,
          { scale: 1, duration: 0.5 },
          index * ROW_STAGGER,
        );
      });
    },
    { scope: sectionRef, dependencies: [] },
  );

  return (
    <section ref={sectionRef} className={styles.openPositions}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.header}>
          <div className={styles.meta}>
            <Copy variant="flicker">
              <p className="mono sm">{c.meta}</p>
            </Copy>
            <Copy variant="flicker">
              <p className="mono sm">({count})</p>
            </Copy>
          </div>
          <Copy>
            <h2 className={styles.title}>
              {c.title[0]}
              <br />
              {c.title[1]}
            </h2>
          </Copy>
        </div>

        <div ref={listRef} className={styles.list}>
          {ROLES.map(({ title, tag, location }, index) => (
            <Copy
              key={title}
              delay={index * ROW_STAGGER}
              stagger={0}
              trigger={`.${styles.list}`}
            >
              <a href={c.email} className={styles.row}>
                <p className={`lg ${styles.role}`} data-copy-text>
                  {title}
                </p>
                <div className={styles.details}>
                  <span className={`mono sm ${styles.tag}`}>
                    <span className={styles.dot} aria-hidden="true" />
                    <span data-copy-text>{tag}</span>
                  </span>
                  <p className="mono sm" data-copy-text>
                    {location}
                  </p>
                  <span
                    className={`di-trigger ${styles.arrow}`}
                    aria-hidden="true"
                  >
                    <ExternalLinkIcon size={28} texture="dither" animate />
                  </span>
                </div>
              </a>
            </Copy>
          ))}
        </div>
      </div>
    </section>
  );
}
