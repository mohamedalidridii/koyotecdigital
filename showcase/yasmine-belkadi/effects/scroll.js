import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { reduceMotion } from "./env.js";

gsap.registerPlugin(ScrollTrigger, SplitText);

export function initScroll(lenis) {
  document
    .querySelectorAll("[data-to-top]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        lenis.scrollTo(0, { duration: 2 }),
      ),
    );

  if (reduceMotion) return;

  // Lines drawn as their parent is scrolled through
  document.querySelectorAll("[data-draw]").forEach((line) => {
    const axis = line.dataset.draw === "x" ? "scaleX" : "scaleY";
    gsap.fromTo(
      line,
      { [axis]: 0 },
      {
        [axis]: 1,
        ease: "none",
        scrollTrigger: {
          trigger: line.parentElement,
          start: "top 70%",
          end: "bottom 60%",
          scrub: true,
        },
      },
    );
  });

  // Timeline steps light up once the line reaches them
  document.querySelectorAll("[data-timeline]").forEach((timeline) => {
    timeline.classList.add("is-ready");
    timeline.querySelectorAll("[data-timeline-item]").forEach((item) =>
      ScrollTrigger.create({
        trigger: item,
        start: "top 65%",
        onEnter: () => item.classList.add("is-active"),
        onLeaveBack: () => item.classList.remove("is-active"),
      }),
    );
  });

  // Elements drifting at their own speed (negative values go the other way)
  document.querySelectorAll("[data-speed]").forEach((el) => {
    const shift = () => window.innerHeight * Number(el.dataset.speed) * 0.25;
    gsap.fromTo(
      el,
      { y: () => shift() },
      {
        y: () => -shift(),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    );
  });

  // Hero content lifting away as the page scrolls
  document.querySelectorAll("[data-hero-exit]").forEach((el) =>
    gsap.to(el, {
      yPercent: -20,
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: el.closest("section"),
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    }),
  );

  // Footer slides out from under the page, then its big name rises. On
  // phones the footer is taller than the screen, so the slide would leave
  // its heading cut off for most of the scroll: only the name rises there.
  const footer = document.querySelector(".footer");
  if (footer) {
    gsap.matchMedia().add("(min-width: 1001px)", () => {
      gsap.fromTo(
        ".footer-inner",
        { yPercent: -35 },
        {
          yPercent: 0,
          ease: "none",
          scrollTrigger: {
            trigger: footer,
            start: "top bottom",
            end: "bottom bottom",
            scrub: true,
          },
        },
      );
    });

    const giant = footer.querySelector(".footer-giant");
    if (giant) {
      const split = SplitText.create(giant, { type: "chars", mask: "chars" });
      gsap.from(split.chars, {
        yPercent: 100,
        stagger: 0.04,
        ease: "power2.out",
        scrollTrigger: {
          trigger: giant,
          start: "top bottom",
          end: "bottom bottom",
          scrub: true,
        },
      });
    }
  }
}
