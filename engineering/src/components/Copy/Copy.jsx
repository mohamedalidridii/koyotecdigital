"use client";

import styles from "./Copy.module.css";

import { Children, cloneElement, isValidElement, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(SplitText, ScrollTrigger, useGSAP);

const TEXT_SELECTOR = "h1,h2,h3,h4,h5,h6,p,a,li,label,blockquote,figcaption";

const SLIDE_DURATION = 0.75;
const SLIDE_EASE = "power3.out";
const SLIDE_STAGGER = 0.1;
const SLIDE_START = "top 80%";

const FLICKER_DURATION = 0.05;
const FLICKER_EASE = "power2.inOut";
const FLICKER_STAGGER = 0.1;
const FLICKER_AMOUNT = 0.5;
const FLICKER_START = "top 85%";
const BULLET_DURATION = 0.5;
const BULLET_EASE = "power3.out";

function singleChild(children) {
  const items = Children.toArray(children).filter((child) => {
    if (typeof child === "string") return child.trim().length > 0;
    return child != null && typeof child !== "boolean";
  });
  return items.length === 1 && isValidElement(items[0]) ? items[0] : null;
}

function mergeRefs(...refs) {
  return (node) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    });
  };
}

function getAnimatableElements(root) {
  const marked = Array.from(root.querySelectorAll("[data-copy-text]")).filter(
    (element) => element.textContent?.trim(),
  );
  if (marked.length > 0) return marked;

  const candidates = Array.from(root.querySelectorAll(TEXT_SELECTOR)).filter(
    (element) => element.textContent?.trim(),
  );
  const leaves = candidates.filter(
    (element) =>
      !candidates.some((other) => other !== element && element.contains(other)),
  );

  if (leaves.length > 0) return leaves;

  if (root.hasAttribute("data-copy-wrapper") && root.children.length > 0) {
    return Array.from(root.children);
  }

  return [root];
}

function resolveTrigger(selector, fallback) {
  if (typeof selector === "string" && selector.trim()) {
    return (
      fallback.closest(selector) || document.querySelector(selector) || fallback
    );
  }
  return fallback;
}

function preserveTextIndent(element, units) {
  const textIndent = getComputedStyle(element).textIndent;
  if (!textIndent || textIndent === "0px" || !units.length) return;

  units[0].style.paddingLeft = textIndent;
  element.style.textIndent = "0";
}

function setReady(root, variant, ready) {
  root.classList.remove("copy-slide-ready", "copy-flicker-ready");
  if (!ready) return;
  root.classList.add(
    variant === "flicker" ? "copy-flicker-ready" : "copy-slide-ready",
  );
}

export default function Copy({
  children,
  variant = "slide",
  type = "lines",
  animateOnScroll = true,
  delay = 0,
  stagger,
  duration,
  ease,
  start,
  trigger = null,
  triggerPoint = null,
}) {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      const root = containerRef.current;
      if (!root) return;

      let active = true;
      let played = false;
      let rebuildTimer = null;
      let tween = null;
      const splits = [];
      const triggers = [];

      const destroy = () => {
        if (rebuildTimer) {
          clearTimeout(rebuildTimer);
          rebuildTimer = null;
        }
        tween?.kill();
        tween = null;
        triggers.forEach((scrollTrigger) => scrollTrigger.kill());
        triggers.length = 0;
        splits.forEach((split) => split.revert());
        splits.length = 0;
        setReady(root, variant, false);
      };

      const unitsOf = (split) =>
        variant === "flicker" || type === "chars"
          ? split.chars
          : type === "words"
            ? split.words
            : split.lines;

      const play = () => {
        if (!active) return;

        tween?.kill();
        tween = null;
        triggers.forEach((scrollTrigger) => scrollTrigger.kill());
        triggers.length = 0;

        const units = [];
        splits.forEach((split) => {
          const group = unitsOf(split) ?? [];
          const element = split.elements?.[0];
          if (element && variant !== "flicker" && type !== "chars") {
            preserveTextIndent(element, group);
          }
          units.push(...group);
        });

        const bullets = root.querySelectorAll("[data-copy-bullet]");

        if (!units.length && !bullets.length) {
          setReady(root, variant, true);
          return;
        }

        if (played) {
          if (units.length) {
            gsap.set(
              units,
              variant === "flicker" ? { opacity: 1 } : { yPercent: 0 },
            );
          }
          if (bullets.length) gsap.set(bullets, { scale: 1 });
          setReady(root, variant, true);
          return;
        }

        const isFlicker = variant === "flicker";
        const resolvedDuration =
          duration ?? (isFlicker ? FLICKER_DURATION : SLIDE_DURATION);
        const resolvedEase = ease ?? (isFlicker ? FLICKER_EASE : SLIDE_EASE);
        const resolvedStart =
          start ?? (isFlicker ? FLICKER_START : SLIDE_START);
        const triggerElement = resolveTrigger(triggerPoint ?? trigger, root);

        if (units.length) {
          gsap.set(units, isFlicker ? { opacity: 0 } : { yPercent: 120 });
        }
        if (bullets.length) {
          gsap.set(bullets, { scale: 0, transformOrigin: "center" });
        }
        setReady(root, variant, true);

        tween = gsap.timeline({
          paused: animateOnScroll,
          delay,
          onStart: () => {
            played = true;
          },
        });

        if (units.length) {
          tween.to(
            units,
            {
              ...(isFlicker ? { opacity: 1 } : { yPercent: 0 }),
              duration: resolvedDuration,
              ease: resolvedEase,
              stagger: isFlicker
                ? {
                    amount: FLICKER_AMOUNT,
                    each:
                      typeof stagger === "number" ? stagger : FLICKER_STAGGER,
                    from: "random",
                  }
                : (stagger ?? SLIDE_STAGGER),
            },
            0,
          );
        }

        if (bullets.length) {
          tween.to(
            bullets,
            {
              scale: 1,
              duration: BULLET_DURATION,
              ease: BULLET_EASE,
              stagger: 0.06,
            },
            0,
          );
        }

        if (!animateOnScroll) {
          tween.play();
          return;
        }

        triggers.push(
          ScrollTrigger.create({
            trigger: triggerElement,
            start: resolvedStart,
            animation: tween,
            toggleActions: "play none none none",
            once: true,
            refreshPriority: -1,
          }),
        );
      };

      const schedulePlay = () => {
        if (rebuildTimer) clearTimeout(rebuildTimer);
        rebuildTimer = setTimeout(() => {
          rebuildTimer = null;
          if (active) play();
        }, 50);
      };

      const build = async () => {
        try {
          await document.fonts.ready;
        } catch {

        }
        if (!active || !containerRef.current) return;

        destroy();
        played = false;

        const isFlicker = variant === "flicker";
        const isWords = type === "words";
        const isChars = type === "chars";

        getAnimatableElements(root).forEach((element) => {
          const split = SplitText.create(element, {
            type: isFlicker || isChars ? "chars" : isWords ? "words" : "lines",
            autoSplit: true,
            ...(isFlicker
              ? { charsClass: styles.char }
              : isChars
                ? { mask: "chars", charsClass: styles.char }
                : isWords
                  ? { mask: "words", wordsClass: styles.word }
                  : {
                      mask: "lines",
                      linesClass: styles.line,
                      lineThreshold: 0.1,
                    }),
            onSplit: () => schedulePlay(),
          });
          splits.push(split);
        });
      };

      build();

      return () => {
        active = false;
        destroy();
      };
    },
    {
      scope: containerRef,
      dependencies: [
        variant,
        type,
        animateOnScroll,
        delay,
        stagger,
        duration,
        ease,
        start,
        trigger,
        triggerPoint,
      ],
    },
  );

  const marker = {
    "data-copy": variant === "flicker" ? "flicker" : "slide",
  };

  const onlyChild = singleChild(children);

  if (onlyChild) {
    return cloneElement(onlyChild, {
      ...marker,
      ref: mergeRefs(containerRef, onlyChild.props.ref),
    });
  }

  return (
    <div
      ref={containerRef}
      className={styles.wrapper}
      data-copy-wrapper="true"
      {...marker}
    >
      {children}
    </div>
  );
}
