import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// [data-horizontal] sections are pinned while their [data-horizontal-track]
// slides sideways. Below 1000px, or with reduced motion, the track stays a
// normal grid: the horizontal layout only exists while .is-horizontal is set.
export function initHorizontal() {
  const mm = gsap.matchMedia();

  mm.add(
    "(min-width: 1001px) and (prefers-reduced-motion: no-preference)",
    () => {
      const sections = document.querySelectorAll("[data-horizontal]");

      sections.forEach((section) => {
        section.classList.add("is-horizontal");
        const track = section.querySelector("[data-horizontal-track]");
        const distance = () => track.scrollWidth - window.innerWidth;

        const slide = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        const bar = section.querySelector("[data-horizontal-progress]");
        if (bar)
          gsap.fromTo(
            bar,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top top",
                end: () => `+=${distance()}`,
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );

        // Photos drift inside their frames as the cards pass by
        section.querySelectorAll("[data-h-parallax]").forEach((img) =>
          gsap.fromTo(
            img,
            { xPercent: -8 },
            {
              xPercent: 8,
              ease: "none",
              scrollTrigger: {
                trigger: img.parentElement,
                containerAnimation: slide,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          ),
        );
      });

      return () =>
        sections.forEach((section) =>
          section.classList.remove("is-horizontal"),
        );
    },
  );
}
