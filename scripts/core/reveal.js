// Reusable text and block reveals. Content is never hidden by CSS: every hidden state is set
// here, right before its animation, so a script failure leaves the page readable.
import { gsap, ScrollTrigger, SplitText } from "./gsap.js";
import { $ } from "./env.js";

// split a heading into masked lines that slide up when it enters the viewport
export function revealLines(el, { delay = 0, start = "top 86%", immediate = false, stagger = 0.08 } = {}) {
  if (!el) return null;
  return SplitText.create(el, {
    type: "lines",
    mask: "lines",
    linesClass: "split-line",
    autoSplit: true,
    onSplit(self) {
      return gsap.from(self.lines, {
        yPercent: 105,
        duration: 1.25,
        delay,
        stagger,
        scrollTrigger: immediate ? undefined : { trigger: el, start, once: true },
      });
    },
  });
}

// split into masked characters (for display words like the wordmark)
export function revealChars(el, { delay = 0, stagger = 0.04, start = "top 90%", immediate = false, from = { yPercent: 110 } } = {}) {
  if (!el) return null;
  return SplitText.create(el, {
    type: "chars",
    mask: "chars",
    onSplit(self) {
      return gsap.from(self.chars, {
        ...from,
        duration: 1.3,
        delay,
        stagger,
        scrollTrigger: immediate ? undefined : { trigger: el, start, once: true },
      });
    },
  });
}

// every [data-split] in the scope that is not driven by a page intro
export function autoSplits(scope) {
  $("[data-split]", scope)
    .filter((el) => !el.closest(".hero, .page-hero, .article-head"))
    .forEach((el) => revealLines(el));
}

// hairlines draw from the left as they enter the viewport
export function drawLines(scope) {
  const lines = $("[data-line]", scope).filter((el) => !el.closest(".hero, .page-hero, .article-head"));
  if (!lines.length) return;
  gsap.set(lines, { "--line": 0 });
  ScrollTrigger.batch(lines, {
    start: "top 94%",
    once: true,
    onEnter: (batch) => gsap.to(batch, { "--line": 1, duration: 1.6, ease: "koy.io", stagger: 0.06 }),
  });
}

// fade/slide groups of elements in as they enter the viewport
export function batchReveal(targets, { y = 50, stagger = 0.1, start = "top 90%" } = {}) {
  const els = typeof targets === "string" ? $(targets) : targets;
  if (!els.length) return;
  gsap.set(els, { autoAlpha: 0, y });
  gsap.utils.toArray(els).forEach((el) => {
    gsap.to(el, {
      autoAlpha: 1,
      y: 0,
      duration: 1.1,
      delay: (els.indexOf(el) % 4) * stagger,
      clearProps: "opacity,visibility,transform",
      scrollTrigger: { trigger: el, start, once: true },
    });
  });
}
