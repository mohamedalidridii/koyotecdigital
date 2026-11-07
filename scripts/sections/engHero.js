// Home hero, second column: the KOYOTEC Engineering panel and its WebGL mesh.
// Runs even with reduced motion (the scene then renders one still frame).
import { gsap } from "../core/gsap.js";
import { reduced } from "../core/env.js";

export function engineeringHero(scope, { ready = Promise.resolve() } = {}) {
  const panel = scope.querySelector(".hero-eng");
  if (!panel) return;
  const canvas = panel.querySelector(".hero-eng-gl");
  let dispose = null;
  let cancelled = false;

  const hasGL = (() => {
    try {
      const c = document.createElement("canvas");
      return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      return false;
    }
  })();
  if (!hasGL) panel.classList.add("no-gl");
  else {
    // three.js only loads once the first paint is done
    import("../webgl/engMesh.js")
      .then(({ createEngMesh }) => {
        if (cancelled) return;
        dispose = createEngMesh(canvas, panel, { reduced });
      })
      .catch(() => panel.classList.add("no-gl"));
  }

  const tweens = [];
  if (!reduced) {
    // the panel opens from the bottom after the preloader, its content follows
    const parts = panel.querySelectorAll(".hero-eng-top, .hero-eng-name, .hero-eng-lead, .hero-eng-items, .hero-eng-cta");
    gsap.set(panel, { clipPath: "inset(100% 0% 0% 0%)" });
    gsap.set(parts, { autoAlpha: 0, y: 24 });
    ready.then(() => {
      tweens.push(
        gsap.to(panel, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "koy.io", delay: 0.35, clearProps: "clipPath" }),
        gsap.to(parts, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.07, delay: 0.9, clearProps: "opacity,visibility,transform" }),
      );
    });
    // scrolling away: the panel slides up a little slower than the page
    tweens.push(
      gsap.to(panel, {
        yPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: panel.closest(".hero"), start: "top top", end: "bottom top", scrub: true },
      }),
    );
  }

  return () => {
    cancelled = true;
    tweens.forEach((t) => t.kill());
    dispose?.();
  };
}
