"use client";

import styles from "./Btn.module.css";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import copyStyles from "@/components/Copy/Copy.module.css";
import TransitionLink from "@/components/TransitionLink";

import {
  resolveCopyTrigger,
  setupCopyReveal,
  waitForCopyFonts,
} from "@/lib/copyReveal";

const DESKTOP_HOVER_QUERY = "(min-width: 1001px)";

export default function Btn({
  href,
  label,
  className = "",
  reveal = false,
  delay = 0,
  underlineDelay = 0.25,
  type = "lines",
  animateOnScroll = true,
  start = null,
  trigger = null,
  triggerPoint = null,
  ...props
}) {
  const rootRef = useRef(null);
  const labelRef = useRef(null);
  const underlineRef = useRef(null);
  const isHoverAnimatingRef = useRef(false);
  const revealDoneRef = useRef(!reveal);

  useGSAP(
    () => {
      if (!reveal || !labelRef.current) return;

      let isActive = true;
      let cleanupReveal = () => {};

      revealDoneRef.current = false;
      gsap.set(underlineRef.current, {
        scaleX: 0,
        transformOrigin: "left center",
      });

      const buildReveal = async () => {
        await waitForCopyFonts();
        if (!isActive || !labelRef.current) return;

        cleanupReveal();

        const triggerElement = resolveCopyTrigger(
          triggerPoint ?? trigger,
          rootRef.current ?? labelRef.current,
        );

        const { cleanup, timeline } = setupCopyReveal({
          elements: [labelRef.current],
          type,
          delay,
          animateOnScroll,
          start: start ?? "top 80%",
          triggerElement,
          lineClass: copyStyles.line,
          wordClass: copyStyles.word,
        });

        timeline.to(
          underlineRef.current,
          {
            scaleX: 1,
            duration: 0.6,
            ease: "power4.out",
            transformOrigin: "left center",
            onComplete: () => {
              if (!isActive) return;
              revealDoneRef.current = true;
            },
          },
          delay + underlineDelay,
        );

        cleanupReveal = cleanup;
      };

      buildReveal();

      return () => {
        isActive = false;
        cleanupReveal();
        revealDoneRef.current = !reveal;
      };
    },
    {
      scope: rootRef,
      dependencies: [
        reveal,
        delay,
        underlineDelay,
        type,
        animateOnScroll,
        start,
        trigger,
        triggerPoint,
        label,
      ],
    },
  );

  function playUnderline() {
    if (!window.matchMedia(DESKTOP_HOVER_QUERY).matches) return;
    if (reveal && !revealDoneRef.current) return;

    const el = underlineRef.current;
    if (!el || isHoverAnimatingRef.current) return;

    isHoverAnimatingRef.current = true;
    el.classList.remove(styles.animating);
    void el.offsetWidth;
    el.classList.add(styles.animating);
  }

  function handleAnimationEnd() {
    isHoverAnimatingRef.current = false;
    underlineRef.current?.classList.remove(styles.animating);
  }

  return (
    <TransitionLink
      ref={rootRef}
      href={href}
      className={`${styles.btn}${className ? ` ${className}` : ""}`}
      onMouseEnter={playUnderline}
      {...props}
    >
      <span ref={labelRef} className={styles.label}>
        {label}
      </span>
      <span
        ref={underlineRef}
        className={styles.underline}
        aria-hidden="true"
        onAnimationEnd={handleAnimationEnd}
      />
    </TransitionLink>
  );
}
