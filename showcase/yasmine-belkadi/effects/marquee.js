import gsap from "gsap";
import { reduceMotion } from "./env.js";

// Infinite marquees that speed up with the scroll, follow its direction and
// skew while moving. Each track holds its content twice so that wrapping
// between -50% and 0% is seamless. data-direction="1" makes a row run the
// other way.
export function initMarquee(lenis) {
  document.querySelectorAll(".marquee").forEach((marquee) => {
    const track = marquee.querySelector(".marquee-track");
    const baseDirection = Number(marquee.dataset.direction) || -1;
    const wrap = gsap.utils.wrap(-50, 0);
    const setX = gsap.quickSetter(track, "xPercent");
    const skewTo = gsap.quickTo(track, "skewX", {
      duration: 0.5,
      ease: "power3",
    });

    let x = 0;
    let velocity = 0;
    let scrollDirection = 1;

    lenis.on("scroll", (e) => {
      velocity = e.velocity;
      if (Math.abs(velocity) > 0.5) scrollDirection = Math.sign(velocity);
    });

    gsap.ticker.add((time, deltaTime) => {
      const v = gsap.utils.clamp(-40, 40, velocity);
      const speed = reduceMotion ? 0.4 : 1 + Math.abs(v) * 0.35;
      x = wrap(x + baseDirection * scrollDirection * speed * deltaTime * 0.002);
      setX(x);
      if (!reduceMotion) skewTo(-v * 0.25);
      velocity *= 0.9;
    });
  });
}
