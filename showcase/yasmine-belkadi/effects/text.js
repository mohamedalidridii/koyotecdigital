import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { reduceMotion } from "./env.js";

gsap.registerPlugin(ScrollTrigger, SplitText);

export function initText() {
  if (reduceMotion) return;

  // Headings: lines rise out of a mask with a slight tilt
  document.querySelectorAll('[data-split="scroll"]').forEach((el) => {
    const split = SplitText.create(el, { type: "lines", mask: "lines" });
    gsap.from(split.lines, {
      yPercent: 115,
      rotation: 4,
      transformOrigin: "0% 0%",
      duration: 1.2,
      stagger: 0.1,
      ease: "power4.out",
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
  });

  // Display titles: letter by letter
  document.querySelectorAll('[data-split="chars"]').forEach((el) => {
    const split = SplitText.create(el, { type: "words,chars", mask: "words" });
    gsap.from(split.chars, {
      yPercent: 115,
      duration: 1.1,
      stagger: 0.025,
      ease: "power4.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });

  // Paragraphs whose words light up as they are scrolled through
  document.querySelectorAll("[data-scrub-text]").forEach((el) => {
    const split = SplitText.create(el, { type: "words" });
    gsap.fromTo(
      split.words,
      { opacity: 0.12 },
      {
        opacity: 1,
        stagger: 0.1,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          end: "bottom 45%",
          scrub: true,
        },
      },
    );
  });
}
