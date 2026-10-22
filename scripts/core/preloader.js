// Every full page load: the KOYOTEC mark draws itself while a counter runs, then the paper lifts.
// Client-side navigations never reach this (the router's curtain covers those).
// Resolves when the page intro should start (slightly before the overlay is fully gone).
import { gsap } from "./gsap.js";
import { reduced } from "./env.js";

export function runPreloader() {
  const pre = document.querySelector(".preloader");
  if (!pre) return Promise.resolve();
  pre.style.animation = "none";

  const count = pre.querySelector(".pl-count");
  const mark = pre.querySelector(".logo-mark");
  const strokes = mark.querySelectorAll(".logo-strokes path");
  const dot = mark.querySelector(".logo-dot");
  const pad = (v) => String(Math.round(v)).padStart(3, "0");

  // reduced motion: the mark is shown whole and the overlay simply fades out
  if (reduced) {
    count.textContent = "100";
    return new Promise((resolve) => {
      gsap.to(pre, { autoAlpha: 0, duration: 0.4, delay: 0.6, onComplete: () => (pre.remove(), resolve()) });
    });
  }

  const n = { v: 0 };
  // every stroke has pathLength=1, so a dash of 1 offset by 1 hides it completely
  gsap.set(strokes, { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.set(dot, { scale: 0 });

  return new Promise((resolve) => {
    const fonts = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);
    const tl = gsap.timeline();
    tl.from(".pl-top, .pl-bottom", { autoAlpha: 0, y: 10, duration: 0.8 }, 0)
      .to(n, { v: 100, duration: 2.2, ease: "power2.inOut", onUpdate: () => (count.textContent = pad(n.v)) }, 0)
      // bar, stem, then the sweeping curve into the leg, then the second leg
      .to(strokes[3], { strokeDashoffset: 0, duration: 0.8, ease: "koy.io" }, 0.15)
      .to(strokes[1], { strokeDashoffset: 0, duration: 0.7, ease: "koy.io" }, 0.45)
      .to(strokes[0], { strokeDashoffset: 0, duration: 1.1, ease: "koy.io" }, 0.7)
      .to(strokes[2], { strokeDashoffset: 0, duration: 0.7, ease: "koy.io" }, 1.15)
      .to(dot, { scale: 1, duration: 0.6, ease: "back.out(3)" }, 1.7)
      .to({}, { duration: 0.35 });

    tl.then(() => fonts).then(() => {
      gsap.timeline({ onComplete: () => pre.remove() })
        .to(mark, { yPercent: -30, autoAlpha: 0, duration: 0.8, ease: "koy.io" }, 0)
        .to(".pl-top, .pl-bottom", { autoAlpha: 0, duration: 0.4 }, 0)
        .to(pre, { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "koy.io" }, 0.3)
        .call(resolve, null, 0.65);
    });
  });
}
