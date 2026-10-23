"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import styles from "./Copy.module.css";

gsap.registerPlugin(SplitText, ScrollTrigger, useGSAP);

function detachCallouts(roots) {
  const entries = [];

  roots.forEach((root) => {
    root.querySelectorAll("[data-callout]").forEach((callout) => {
      entries.push({
        callout,
        parent: callout.parentNode,
      });
      callout.remove();
    });
  });

  return entries;
}

function restoreCallouts(entries) {
  entries.forEach(({ callout, parent }) => {
    if (parent) parent.appendChild(callout);
  });
}

function prepareCallouts(entries) {
  const callouts = entries.map(({ callout }) => callout);
  if (!callouts.length) return callouts;

  callouts.forEach((callout) => {
    const rotation = Number(callout.dataset.rotation) || 0;
    gsap.set(callout, {
      scale: 0,
      rotation,
      transformOrigin: "center center",
    });
  });

  return callouts;
}

export default function Copy({
  children,
  variant = "slide",
  splitType = "lines",
  animateOnScroll = true,
  delay = 0,
  stagger = 0.1,
}) {
  const containerRef = useRef(null);

  useLenis(() => {
    ScrollTrigger.update();
  });

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      let cancelled = false;
      let hasPlayed = false;
      const splits = [];
      const triggers = [];
      const tweens = [];
      let calloutEntries = [];

      const getElements = () => {
        if (container.hasAttribute("data-copy-wrapper")) {
          return Array.from(container.children);
        }
        return [container];
      };

      const play = (tl) => {
        if (hasPlayed) return;
        hasPlayed = true;
        // play() — not play(0) — so timeline `delay` is respected
        // (route heroes depend on that to wait out the page transition)
        tl.play();
      };

      document.fonts.ready.then(() => {
        if (cancelled || !containerRef.current) return;

        const elements = getElements();
        calloutEntries = detachCallouts(elements);
        const callouts = prepareCallouts(calloutEntries);

        if (variant === "slide") {
          const type = splitType === "words" ? "words" : "lines";
          const allTargets = [];

          elements.forEach((element) => {
            const split = SplitText.create(element, {
              type,
              mask: type,
              linesClass: styles.line,
              wordsClass: styles.word,
            });

            splits.push(split);
            allTargets.push(...(type === "words" ? split.words : split.lines));
          });

          restoreCallouts(calloutEntries);
          prepareCallouts(calloutEntries);
          gsap.set(allTargets, { yPercent: 100 });

          const tl = gsap.timeline({
            delay,
            paused: animateOnScroll,
          });

          tl.to(allTargets, {
            yPercent: 0,
            duration: 0.75,
            ease: "power3.out",
            stagger,
          });

          if (callouts.length) {
            tl.to(
              callouts,
              {
                scale: 1,
                duration: 1,
                ease: "elastic.out(1, 0.45)",
                stagger: 0.08,
              },
              "-=0.55",
            );
          }

          tweens.push(tl);

          if (animateOnScroll) {
            triggers.push(
              ScrollTrigger.create({
                trigger: container,
                start: "top 90%",
                once: true,
                onEnter: () => play(tl),
                onEnterBack: () => play(tl),
                onRefresh: (self) => {
                  if (self.progress > 0) play(tl);
                },
              }),
            );
            requestAnimationFrame(() => ScrollTrigger.refresh());
          }
        }

        if (variant === "scramble") {
          const allChars = [];

          elements.forEach((element) => {
            const split = SplitText.create(element, {
              type: "chars",
              charsClass: styles.char,
            });

            splits.push(split);
            allChars.push(...split.chars);
          });

          restoreCallouts(calloutEntries);
          prepareCallouts(calloutEntries);
          gsap.set(allChars, { opacity: 0 });

          const tl = gsap.timeline({
            delay,
            paused: animateOnScroll,
          });

          tl.to(allChars, {
            duration: 0.05,
            opacity: 1,
            ease: "power2.inOut",
            stagger: {
              amount: 0.5,
              each: 0.1,
              from: "random",
            },
          });

          if (callouts.length) {
            tl.to(
              callouts,
              {
                scale: 1,
                duration: 1,
                ease: "elastic.out(1, 0.45)",
                stagger: 0.08,
              },
              "-=0.35",
            );
          }

          tweens.push(tl);

          if (animateOnScroll) {
            triggers.push(
              ScrollTrigger.create({
                trigger: container,
                start: "top 85%",
                once: true,
                onEnter: () => play(tl),
                onEnterBack: () => play(tl),
                onRefresh: (self) => {
                  if (self.progress > 0) play(tl);
                },
              }),
            );
            requestAnimationFrame(() => ScrollTrigger.refresh());
          }
        }
      });

      return () => {
        cancelled = true;
        tweens.forEach((tween) => tween.kill());
        triggers.forEach((trigger) => trigger.kill());

        const liveEntries =
          calloutEntries.length > 0
            ? calloutEntries
            : detachCallouts(getElements());

        liveEntries.forEach(({ callout }) => {
          if (callout.parentNode) callout.remove();
        });

        splits.forEach((split) => split.revert());
        restoreCallouts(liveEntries);

        liveEntries.forEach(({ callout }) => {
          gsap.set(callout, { clearProps: "transform" });
        });
      };
    },
    {
      scope: containerRef,
      dependencies: [variant, splitType, animateOnScroll, delay, stagger],
    },
  );

  if (React.Children.count(children) === 1) {
    return React.cloneElement(children, { ref: containerRef });
  }

  return (
    <div ref={containerRef} data-copy-wrapper="true">
      {children}
    </div>
  );
}
