// Home page sections: marquee, manifesto, horizontal services, stacked process.
import { gsap, SplitText } from "../core/gsap.js";
import { $ } from "../core/env.js";
import { scroll } from "../core/scroll.js";
import { batchReveal } from "../core/reveal.js";
import { bindScenes } from "../core/gl.js";

// endless marquee whose speed, direction and skew follow the scroll
export function marquee(scope) {
  const track = scope.querySelector(".marquee-track");
  if (!track) return;
  const loop = gsap.to(track, { xPercent: -50, ease: "none", duration: 28, repeat: -1 });
  const skew = gsap.quickTo(track, "skewX", { duration: 0.5, ease: "power3" });
  let dir = 1;
  const tick = () => {
    const v = scroll.velocity;
    if (Math.abs(v) > 0.5) dir = Math.sign(v);
    loop.timeScale(dir * (1 + Math.min(Math.abs(v) / 6, 8)));
    skew(gsap.utils.clamp(-10, 10, -v * 0.35));
  };
  gsap.ticker.add(tick);
  return () => gsap.ticker.remove(tick);
}

// the statement lights up word by word as it is read
export function manifesto(scope) {
  const text = scope.querySelector("[data-words]");
  if (!text) return;
  SplitText.create(text, {
    type: "words",
    aria: "none",
    autoSplit: true,
    onSplit(self) {
      // highlighted words stay lit: they are the key phrases and glow first
      return gsap.fromTo(
        self.words.filter((w) => !w.closest(".highlight")),
        { opacity: 0.4 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: { trigger: text, start: "top 78%", end: "bottom 45%", scrub: true },
        },
      );
    },
  });
  batchReveal($(".pillars li", scope), { y: 60, stagger: 0.12 });
}

// desktop: the panels slide sideways while the section is pinned; small screens: a plain stack
export function services(scope) {
  const section = scope.querySelector(".services");
  if (!section) return;
  const track = section.querySelector(".services-track");
  const bar = section.querySelector(".services-progress i");
  const panels = $("[data-gl]", track);
  const mm = gsap.matchMedia();

  mm.add("(min-width: 961px)", () => {
    const distance = () => track.scrollWidth - window.innerWidth;
    const slide = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => "+=" + distance(),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
      },
    });
    bindScenes(panels, { containerAnimation: slide });
    // giant numbers drift against the slide
    $(".svc-num", track).forEach((num) => {
      gsap.fromTo(num, { xPercent: 30 }, {
        xPercent: -30,
        ease: "none",
        scrollTrigger: { trigger: num.parentElement, containerAnimation: slide, start: "left right", end: "right left", scrub: true },
      });
    });
    $(".svc-copy", track).forEach((copy) => {
      gsap.from(copy.children, {
        x: 120,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 1,
        scrollTrigger: { trigger: copy, containerAnimation: slide, start: "left 22%", toggleActions: "play none none reverse" },
      });
    });
  });

  mm.add("(max-width: 960px)", () => {
    bindScenes(panels);
    batchReveal($(".svc-copy", track), { y: 60 });
  });

  return () => mm.revert();
}

// glass cards pile up: each one recedes as the next slides over it
export function processStack(scope) {
  const cards = $(".stack-card", scope);
  cards.forEach((card, i) => {
    const next = cards[i + 1];
    if (!next) return;
    gsap.to(card, {
      scale: 0.9 + i * 0.015,
      autoAlpha: 0,
      ease: "none",
      scrollTrigger: { trigger: next, start: "top 85%", end: "top 25%", scrub: true },
    });
  });
  cards.forEach((card) => {
    const num = card.querySelector(".stack-num");
    gsap.from(num, { yPercent: 60, autoAlpha: 0, duration: 1.2, scrollTrigger: { trigger: card, start: "top 80%", once: true } });
  });
}
