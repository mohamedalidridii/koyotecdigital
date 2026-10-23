"use client";

import { useRef, useEffect } from "react";
import { TransitionRouter } from "next-transition-router";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./TransitionProvider.module.css";

gsap.registerPlugin(CustomEase, SplitText, ScrollTrigger);
CustomEase.create("hop", "0.8, 0, 0.2, 1");

const ROWS = 4;

const BLOCK_COLORS = [
  "var(--base-900)",
  "var(--base-800)",
  "var(--base-500)",
  "var(--base-400)",
];

const TRANSITION_LINES = [
  "Hold That Thought",
  "Wet Paint Ahead",
  "Redrawing The Screen",
  "Give It A Sec",
  "Ink Still Wet",
  "Turning The Page",
  "Cooking Something Weird",
  "Don't Blink Now",
  "Loading The Chaos",
  "Mixing New Colors",
];

function shuffle(items) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export default function TransitionProvider({ children }) {
  const gridRef = useRef(null);
  const blocksRef = useRef([]);
  const headingRef = useRef(null);
  const wordsRef = useRef([]);
  const splitRef = useRef(null);
  const lastLineRef = useRef("");
  const lastColorsRef = useRef("");

  const prepareColors = () => {
    let colors = shuffle(BLOCK_COLORS);
    const key = colors.join("|");
    if (BLOCK_COLORS.length > 1 && key === lastColorsRef.current) {
      colors = shuffle(BLOCK_COLORS);
    }
    lastColorsRef.current = colors.join("|");

    blocksRef.current.forEach((block, i) => {
      if (block) block.style.backgroundColor = colors[i];
    });

    // Last block paints on top of the full-screen stack
    const topColor = colors[colors.length - 1];
    if (headingRef.current) {
      const darkText =
        topColor === "var(--base-500)" ||
        topColor === "var(--base-800)" ||
        topColor === "var(--base-900)";
      headingRef.current.style.color = darkText
        ? "var(--base-1000)"
        : "var(--base-100)";
    }
  };

  const prepareLine = () => {
    if (!headingRef.current) return;

    let nextLine = TRANSITION_LINES[Math.floor(Math.random() * TRANSITION_LINES.length)];
    if (TRANSITION_LINES.length > 1) {
      while (nextLine === lastLineRef.current) {
        nextLine =
          TRANSITION_LINES[Math.floor(Math.random() * TRANSITION_LINES.length)];
      }
    }
    lastLineRef.current = nextLine;

    splitRef.current?.revert();
    headingRef.current.textContent = nextLine;

    splitRef.current = SplitText.create(headingRef.current, {
      type: "words",
      wordsClass: "word",
      mask: "words",
    });

    wordsRef.current = splitRef.current.words;
    gsap.set(wordsRef.current, { y: "100%" });
  };

  useEffect(() => {
    prepareColors();
    prepareLine();
    return () => splitRef.current?.revert();
  }, []);

  const animateIn = (onComplete) => {
    prepareColors();
    prepareLine();

    const tl = gsap.timeline({ onComplete });

    tl.set(gridRef.current, { pointerEvents: "all" });

    tl.set(blocksRef.current, {
      transformOrigin: "left center",
      scaleX: 0,
    });

    tl.set(wordsRef.current, { y: "100%" });

    tl.to(blocksRef.current, {
      scaleX: 1,
      duration: 1.25,
      ease: "hop",
      stagger: 0.075,
    });

    tl.to(
      wordsRef.current,
      {
        y: "0%",
        duration: 1,
        ease: "power4.out",
        stagger: 0.1,
      },
      "-=0.6",
    );

    return tl;
  };

  const animateOut = (onComplete) => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(gridRef.current, { pointerEvents: "none" });
        ScrollTrigger.refresh();
        onComplete?.();
      },
    });

    tl.set(blocksRef.current, {
      transformOrigin: "right center",
      scaleX: 1,
    });

    tl.to(wordsRef.current, {
      y: "100%",
      duration: 1,
      ease: "power4.out",
      stagger: 0.1,
    });

    tl.to(
      blocksRef.current,
      {
        scaleX: 0,
        duration: 1.25,
        ease: "hop",
        stagger: -0.075,
      },
      "-=1",
    );

    return tl;
  };

  return (
    <TransitionRouter
      auto
      leave={(next) => {
        const tl = animateIn(next);
        return () => tl.kill();
      }}
      enter={(next) => {
        const tl = animateOut(next);
        return () => tl.kill();
      }}
    >
      <div ref={gridRef} className={styles.grid}>
        {Array.from({ length: ROWS }).map((_, i) => (
          <div
            key={i}
            className={styles.block}
            ref={(el) => {
              blocksRef.current[i] = el;
            }}
          />
        ))}
      </div>

      <div className={styles.text}>
        <h1 ref={headingRef} />
      </div>

      {children}
    </TransitionRouter>
  );
}
