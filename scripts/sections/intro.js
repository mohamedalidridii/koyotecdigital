// Page intros. Hidden states are set here and played once `ready` resolves
// (after the preloader on first visit, or as the transition curtain lifts).
import { gsap, SplitText } from "../core/gsap.js";
import { $ } from "../core/env.js";
import { gl } from "../core/gl.js";

// shared: headline lines rise out of their masks, the small print fades in, the hairline draws
function intro(head, { ready, small, lines: lineSel = ".lockup-h1, .page-title, .article-title" }) {
  const title = head.querySelector(lineSel);
  const rest = $(small, head);
  const rules = $("[data-line]", head);
  const split = title && SplitText.create(title, { type: "lines", mask: "lines", linesClass: "split-line" });
  if (split) gsap.set(split.lines, { yPercent: 105 });
  gsap.set(rest, { autoAlpha: 0, y: 16 });
  gsap.set(rules, { "--line": 0 });
  const tl = gsap.timeline({ paused: true });
  if (split) tl.to(split.lines, { yPercent: 0, duration: 1.5, stagger: 0.09 }, 0);
  tl.to(rest, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.06, clearProps: "transform" }, 0.35)
    .to(rules, { "--line": 1, duration: 1.6, ease: "koy.io" }, 0.3);
  ready.then(() => tl.play());
  return tl;
}

export function homeHero(scope, { ready }) {
  const hero = scope.querySelector(".hero");
  if (!hero) return;
  const tl = intro(hero, { ready, small: ".lockup-brand, .hero-aside, .hero-float p, .scroll-cue" });
  tl.call(() => gl.pulse(0, -0.4, 1.6), null, 0.5);

  // scrolling away: the lockup drifts up more slowly than the page and lets go of the ink
  gsap.to(hero.querySelector(".hero-foot"), {
    yPercent: -40,
    autoAlpha: 0,
    ease: "none",
    scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
  });
}

export function pageHero(scope, { ready }) {
  const head = scope.querySelector(".page-hero, .article-head");
  if (!head) return;
  intro(head, { ready, small: ".lockup-brand, .page-hero-foot, .crumbs, .meta" });
  // the contact body and the first rows of a list follow right behind the headline
  const follow = $(".contact-body .shell > *", scope);
  if (follow.length) {
    gsap.set(follow, { autoAlpha: 0, y: 40 });
    ready.then(() => gsap.to(follow, { autoAlpha: 1, y: 0, duration: 1.2, delay: 0.5, stagger: 0.1, clearProps: "transform" }));
  }
}
