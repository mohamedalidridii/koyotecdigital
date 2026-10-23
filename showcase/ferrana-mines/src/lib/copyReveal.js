import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(SplitText, ScrollTrigger);

export const COPY_FONTS = ["neue-montreal", "gt-america-mono"];

export async function waitForCopyFonts() {
  try {
    await document.fonts.ready;
    COPY_FONTS.forEach((font) => document.fonts.check(`16px "${font}"`));
    await new Promise((resolve) => setTimeout(resolve, 100));
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

export function resolveCopyTrigger(selector, fallback) {
  if (typeof selector === "string" && selector.trim().length > 0) {
    return (
      fallback.closest(selector) || document.querySelector(selector) || fallback
    );
  }

  return fallback;
}

export const COPY_REVEAL_STAGGER = 0.1;
export const COPY_REVEAL_DURATION = 1;

export function setupCopyReveal({
  elements,
  type = "lines",
  delay = 0,
  animateOnScroll = true,
  start = "top 80%",
  triggerElement,
  lineClass,
  wordClass,
  onComplete,
}) {
  const splitInstances = [];
  const scrollTriggers = [];
  const splitUnits = [];
  const indentedElements = [];
  const resolvedType = type === "words" ? "words" : "lines";

  elements.forEach((element) => {
    const isWordSplit = resolvedType === "words";
    const computedStyle = window.getComputedStyle(element);
    const textIndent = computedStyle.textIndent;

    // text-indent only affects the first visual line; padding on a split line
    // div indents every wrap inside that unit. Use a leading inline spacer instead.
    if (textIndent && textIndent !== "0px") {
      element.style.textIndent = "0";
      indentedElements.push(element);

      const spacer = document.createElement("span");
      spacer.setAttribute("aria-hidden", "true");
      spacer.setAttribute("data-copy-indent", "true");
      spacer.style.display = "inline-block";
      spacer.style.width = textIndent;
      element.insertBefore(spacer, element.firstChild);
    }

    const split = SplitText.create(element, {
      type: isWordSplit ? "words" : "lines",
      mask: isWordSplit ? "words" : "lines",
      ...(isWordSplit
        ? { wordsClass: wordClass }
        : { linesClass: lineClass, lineThreshold: 0.1 }),
    });

    splitInstances.push(split);

    const units = isWordSplit ? split.words : split.lines;

    splitUnits.push(...units);
  });

  gsap.set(splitUnits, { y: "110%" });

  const timeline = gsap.timeline({
    paused: animateOnScroll,
    onComplete,
  });

  timeline.to(
    splitUnits,
    {
      y: "0%",
      duration: COPY_REVEAL_DURATION,
      ease: "power4.out",
      stagger: COPY_REVEAL_STAGGER,
    },
    delay,
  );

  if (animateOnScroll) {
    scrollTriggers.push(
      ScrollTrigger.create({
        trigger: triggerElement,
        start,
        animation: timeline,
        once: true,
        refreshPriority: -1,
      }),
    );
  }

  const unitCount = splitUnits.length;

  return {
    timeline,
    unitCount,
    cleanup() {
      scrollTriggers.forEach((st) => st.kill());
      timeline.kill();
      splitInstances.forEach((split) => split?.revert());
      indentedElements.forEach((element) => {
        element.style.removeProperty("text-indent");
      });
    },
  };
}
