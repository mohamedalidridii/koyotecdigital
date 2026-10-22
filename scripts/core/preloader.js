// First visit: a counted intro over the wordmark. Repeat visits: the ember curtain lifts.
// Resolves when the page intro should start (slightly before the overlay is fully gone).
import { gsap, SplitText } from "./gsap.js";
import { reduced } from "./env.js";

export function runPreloader() {
  const root = document.documentElement;
  const pre = document.querySelector(".preloader");
  const panel = document.querySelector(".curtain-panel");
  try {
    sessionStorage.setItem("ky-visited", "1");
  } catch {
    /* storage blocked */
  }

  if (reduced) return Promise.resolve();

  if (root.classList.contains("is-visited") || !pre) {
    if (!panel) return Promise.resolve();
    panel.style.animation = "none";
    return new Promise((resolve) => {
      gsap.timeline({ delay: 0.1, onComplete: () => gsap.set(panel, { clipPath: "inset(100% 0 0 0)" }) })
        .to(panel, { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "koy.io" })
        .call(resolve, null, 0.45);
    });
  }

  pre.style.animation = "none";
  const count = pre.querySelector(".pl-count span");
  const word = pre.querySelector(".pl-word");
  const split = SplitText.create(word, { type: "chars", mask: "chars" });
  const n = { v: 0 };
  const pad = (v) => String(Math.round(v)).padStart(3, "0");

  return new Promise((resolve) => {
    const fonts = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);
    const tl = gsap.timeline();
    tl.from(split.chars, { yPercent: 110, duration: 1.2, stagger: 0.06 }, 0)
      .from(".pl-coords", { autoAlpha: 0, y: 10, duration: 0.8 }, 0.2)
      .to(n, { v: 100, duration: 1.7, ease: "power2.inOut", onUpdate: () => (count.textContent = pad(n.v)) }, 0);

    tl.then(() => fonts).then(() => {
      gsap.timeline({ onComplete: () => pre.remove() })
        .to(split.chars, { yPercent: -110, duration: 0.8, stagger: 0.035, ease: "koy.io" }, 0)
        .to([count, ".pl-coords"], { autoAlpha: 0, duration: 0.4 }, 0)
        .to(pre, { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "koy.io" }, 0.35)
        .call(resolve, null, 0.7);
    });
  });
}
