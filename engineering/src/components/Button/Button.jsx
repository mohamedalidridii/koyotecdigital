"use client";

import styles from "./Button.module.css";

import { useRef } from "react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, SplitText);

const DURATION = 0.3;
const STAGGER = 0.035;

export default function Button({
  variant = "primary",
  href = "#",
  children,
  className = "",
  showArrow = true,
}) {
  const rootRef = useRef(null);
  const labelRef = useRef(null);

  useGSAP(() => {
    const root = rootRef.current;
    const label = labelRef.current;
    if (!root || !label) return;

    const desktopMq = window.matchMedia("(min-width: 769px)");
    let split = null;
    let unbind = null;
    let alive = true;

    const teardown = () => {
      unbind?.();
      unbind = null;
      if (split) {
        split.revert();
        split = null;
      }
    };

    const bind = () => {
      teardown();
      if (!alive || !desktopMq.matches) return;

      split = new SplitText(label, {
        type: "words",
        mask: "words",
        wordsClass: styles.word,
      });
      const words = split.words;
      if (!words?.length) {
        teardown();
        return;
      }

      const applyShift = () => {
        if (!alive || !split) return;
        words.forEach((word) => {
          word.style.setProperty("--shift", `${word.offsetHeight}px`);
        });
      };

      applyShift();
      document.fonts?.ready.then(applyShift);

      const play = (enter) => {
        if (!split) return;
        gsap.to(words, {
          y: (_index, word) => (enter ? word.offsetHeight : 0),
          duration: DURATION,
          ease: "power1.inOut",
          stagger: STAGGER,
          overwrite: "auto",
        });
      };

      const onEnter = () => play(true);
      const onLeave = () => play(false);
      root.addEventListener("mouseenter", onEnter);
      root.addEventListener("mouseleave", onLeave);
      unbind = () => {
        root.removeEventListener("mouseenter", onEnter);
        root.removeEventListener("mouseleave", onLeave);
      };
    };

    bind();
    desktopMq.addEventListener("change", bind);

    return () => {
      alive = false;
      desktopMq.removeEventListener("change", bind);
      teardown();
    };
  });

  const classNames = [styles.button, styles[variant], className]
    .filter(Boolean)
    .join(" ");

  return (
    <Link ref={rootRef} href={href} className={classNames}>
      <span ref={labelRef} className={styles.label}>
        {children}
      </span>
      {showArrow && (
        <span className={styles.arrow} aria-hidden="true">
          <FiArrowRight />
        </span>
      )}
    </Link>
  );
}
