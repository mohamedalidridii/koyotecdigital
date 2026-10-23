import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reduceMotion } from "./env.js";

gsap.registerPlugin(ScrollTrigger);

// [data-stack-card] elements are sticky in CSS. Each one shrinks and tilts
// away as the next card slides over it.
export function initStack() {
  if (reduceMotion) return;

  document.querySelectorAll("[data-stack]").forEach((stack) => {
    const cards = stack.querySelectorAll("[data-stack-card]");

    cards.forEach((card, i) => {
      const next = cards[i + 1];
      if (!next) return;
      gsap.to(card, {
        scale: 0.9,
        rotation: i % 2 ? 1.5 : -1.5,
        ease: "none",
        scrollTrigger: {
          trigger: next,
          start: "top bottom",
          end: "top 20%",
          scrub: true,
        },
      });
    });
  });
}
