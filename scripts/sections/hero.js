// Page intros. Hidden states are set here and played once `ready` resolves
// (after the preloader on first visit, or as the transition curtain lifts).
import { gsap, SplitText } from "../core/gsap.js";
import { $ } from "../core/env.js";
import { gl } from "../core/gl.js";

export function homeHero(scope, { ready }) {
  const hero = scope.querySelector(".hero");
  if (!hero) return;
  const title = hero.querySelector(".hero-title");
  const word = hero.querySelector(".hero-word");
  const rest = $(".hero-top, .eyebrow, .hero-aside, .scroll-cue", hero);

  const lines = SplitText.create(title, { type: "lines", mask: "lines", linesClass: "split-line" });
  const chars = SplitText.create(word, { type: "chars", mask: "chars" });
  gsap.set(lines.lines, { yPercent: 105 });
  gsap.set(chars.chars, { yPercent: 105 });
  gsap.set(rest, { autoAlpha: 0, y: 24 });

  const tl = gsap
    .timeline({ paused: true })
    .to(chars.chars, { yPercent: 0, duration: 1.6, stagger: 0.06 }, 0)
    .to(lines.lines, { yPercent: 0, duration: 1.3, stagger: 0.1 }, 0.25)
    .to(rest, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08, clearProps: "transform" }, 0.55)
    .call(() => gl.pulse(0, -0.35, 1.6), null, 0.4);
  ready.then(() => tl.play());

  // scrolling away: copy lifts and fades, the wordmark sinks into the sand
  gsap.to(hero.querySelector(".hero-body"), {
    yPercent: -18,
    autoAlpha: 0,
    ease: "none",
    scrollTrigger: { trigger: hero, start: "top top", end: "bottom 20%", scrub: true },
  });
  gsap.to(word, {
    yPercent: 35,
    letterSpacing: "0.02em",
    ease: "none",
    scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
  });
}

// inner pages: title lines rise, the rest fades up
export function pageHero(scope, { ready }) {
  const head = scope.querySelector(".page-hero, .contact, .blog-head, .article-head");
  if (!head) return;
  const title = head.querySelector(".page-title, .article-title");
  const rest = $(".kicker, .page-hero-foot, .contact-addr, .contact-links, .contact-love, .contact-form, .lead, .crumbs, .meta", head);
  const split = title && SplitText.create(title, { type: "lines", mask: "lines", linesClass: "split-line" });
  if (split) gsap.set(split.lines, { yPercent: 105 });
  gsap.set(rest, { autoAlpha: 0, y: 30 });
  const tl = gsap.timeline({ paused: true });
  if (split) tl.to(split.lines, { yPercent: 0, duration: 1.3, stagger: 0.1 }, 0);
  tl.to(rest, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.07, clearProps: "transform,opacity,visibility" }, 0.3);
  ready.then(() => tl.play());
}
