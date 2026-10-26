"use client";

import styles from "./Marquee.module.css";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

import { useLang } from "@/lib/useLang";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export default function Marquee() {
  const PHRASE = useLang().t.marquee;
  const LINE = `${PHRASE}${"\u00A0".repeat(6)}`.repeat(4);
  const rootRef = useRef(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const lines = gsap.utils.toArray(`.${styles.line}`);
      if (!lines.length) return;

      let active = true;
      const splits = [];
      let tween = null;

      const setup = async () => {
        try {
          await document.fonts.ready;
        } catch {

        }
        if (!active || !rootRef.current) return;

        const wordSets = lines.map((element) => {
          const split = SplitText.create(element, {
            type: "words",
            mask: "words",
            wordsClass: styles.word,
          });
          splits.push(split);
          return split.words ?? [];
        });

        wordSets.forEach((words) => {
          if (words.length) gsap.set(words, { yPercent: 110 });
        });
        root.classList.add(styles.ready);

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: root,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        });
        tween = tl;

        wordSets.forEach((words) => {
          if (!words.length) return;
          tl.to(words, { yPercent: 0, duration: 0.75, stagger: 0.08 }, 0);
        });

        ScrollTrigger.refresh();
      };

      setup();

      return () => {
        active = false;
        tween?.kill();
        splits.forEach((split) => split.revert());
      };
    },
    { scope: rootRef, dependencies: [] },
  );

  return (
    <section ref={rootRef} className={styles.marquee} aria-label={PHRASE}>
      <div className={`container ${styles.marqueeInner}`}>
        <div className={styles.track}>
          {[0, 1].map((copy) => (
            <h1
              key={copy}
              className={styles.line}
              aria-hidden={copy === 1 ? true : undefined}
            >
              {LINE}
            </h1>
          ))}
        </div>
      </div>
    </section>
  );
}
