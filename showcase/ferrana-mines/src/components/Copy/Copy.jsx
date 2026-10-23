"use client";

import styles from "./Copy.module.css";

import {
  Children,
  cloneElement,
  isValidElement,
  useRef,
} from "react";
import { useGSAP } from "@gsap/react";

import {
  resolveCopyTrigger,
  setupCopyReveal,
  waitForCopyFonts,
} from "@/lib/copyReveal";

function mergeRefs(...refs) {
  return (node) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    });
  };
}

export default function Copy({
  children,
  animateOnScroll = true,
  delay = 0,
  type = "lines",
  trigger = null,
  triggerPoint = null,
  start = null,
}) {
  const containerRef = useRef(null);
  const cleanupRef = useRef(() => {});

  useGSAP(
    () => {
      if (!containerRef.current) return;

      let isActive = true;

      const buildAnimations = async () => {
        await waitForCopyFonts();
        if (!isActive || !containerRef.current) return;

        cleanupRef.current();

        const targetElements = containerRef.current.hasAttribute(
          "data-copy-wrapper",
        )
          ? Array.from(containerRef.current.children)
          : [containerRef.current];

        const triggerElement = resolveCopyTrigger(
          triggerPoint ?? trigger,
          targetElements[0] ?? containerRef.current,
        );

        const { cleanup } = setupCopyReveal({
          elements: targetElements,
          type,
          delay,
          animateOnScroll,
          start: start ?? "top 80%",
          triggerElement,
          lineClass: styles.line,
          wordClass: styles.word,
        });

        cleanupRef.current = cleanup;
      };

      buildAnimations();

      return () => {
        isActive = false;
        cleanupRef.current();
        cleanupRef.current = () => {};
      };
    },
    {
      scope: containerRef,
      dependencies: [
        animateOnScroll,
        delay,
        type,
        trigger,
        triggerPoint,
        start,
      ],
    },
  );

  if (Children.count(children) === 1 && isValidElement(children)) {
    return cloneElement(children, {
      ref: mergeRefs(containerRef, children.ref),
    });
  }

  return (
    <div
      ref={containerRef}
      className={styles.wrapper}
      data-copy-wrapper="true"
    >
      {children}
    </div>
  );
}
