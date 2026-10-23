import gsap from "gsap";
import { isTouch, reduceMotion } from "./env.js";

// [data-magnetic] elements lean towards the pointer. The value is the pull
// strength (0.35 by default). Never put it on an element that also has
// [data-reveal]: both animate y and would fight.
export function initMagnetic() {
  if (isTouch || reduceMotion) return;

  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    const strength = Number(el.dataset.magnetic) || 0.35;
    const xTo = gsap.quickTo(el, "x", {
      duration: 0.8,
      ease: "elastic.out(1, 0.4)",
    });
    const yTo = gsap.quickTo(el, "y", {
      duration: 0.8,
      ease: "elastic.out(1, 0.4)",
    });

    el.addEventListener("pointermove", (e) => {
      const rect = el.getBoundingClientRect();
      xTo((e.clientX - rect.left - rect.width / 2) * strength);
      yTo((e.clientY - rect.top - rect.height / 2) * strength);
    });

    el.addEventListener("pointerleave", () => {
      xTo(0);
      yTo(0);
    });
  });
}
