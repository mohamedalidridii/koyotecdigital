"use client";

import styles from "./ImpactClock.module.css";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Copy from "@/components/Copy";

gsap.registerPlugin(ScrollTrigger);

const hands = [
  { rotation: 60, length: "38vmin", thickness: "3.5px" },
  { rotation: -60, length: "22vmin", thickness: "3px" },
  { rotation: 180, length: "30vmin", thickness: "2px" },
];

function clockwiseFromTwelve(degrees) {
  return ((degrees % 360) + 360) % 360;
}

export default function ImpactClock() {
  const sectionRef = useRef(null);
  const handsRef = useRef([]);
  const hubRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const handEls = handsRef.current.filter(Boolean);
    const hub = hubRef.current;
    if (!section || !handEls.length || !hub) return;

    const ctx = gsap.context(() => {
      gsap.set(handEls, {
        rotation: 0,
        transformOrigin: "center bottom",
      });
      gsap.set(hub, { scale: 0 });

      ScrollTrigger.create({
        trigger: section,
        start: "top 90%",
        once: true,
        onEnter: () => {
          gsap.to(handEls, {
            rotation: (i) => `+=${clockwiseFromTwelve(hands[i].rotation)}`,
            duration: 1.5,
            stagger: 0.1,
            ease: "power4.inOut",
          });

          gsap.to(hub, {
            scale: 1,
            duration: 0.45,
            delay: 0.35,
            ease: "back.out(2.5)",
          });
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.impactClock}>
      <Copy>
        <p id="impact-clock-top" className={`${styles.copy} ${styles.copyTopLeft}`}>
          It begins before the first machine arrives, while the land is still
          whole.
        </p>
      </Copy>

      <div className={styles.impactClockInner}>
        <Copy triggerPoint="#impact-clock-top" delay={0.1}>
          <p className={`${styles.copy} ${styles.copyLeft}`}>
            Through the working life of the site, recovery is logged beside
            output.
          </p>
        </Copy>

        <div className={styles.dial}>
          {hands.map((hand, i) => (
            <span
              key={i}
              ref={(el) => {
                handsRef.current[i] = el;
              }}
              className={styles.hand}
              style={{
                "--length": hand.length,
                "--thickness": hand.thickness,
              }}
            />
          ))}
          <span ref={hubRef} className={styles.hub} />
        </div>

        <Copy triggerPoint="#impact-clock-top" delay={0.2}>
          <p className={`${styles.copy} ${styles.copyRight}`}>
            Nothing reaches this page until an outside assessor confirms it.
          </p>
        </Copy>
      </div>

      <Copy triggerPoint="#impact-clock-top" delay={0.3}>
        <p className={`${styles.copy} ${styles.copyBottomLeft}`}>
          The cycle closes only when the land is signed back, stable on its own.
        </p>
      </Copy>
    </section>
  );
}
