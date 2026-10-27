// The founder's page: an inverted, cinematic portrait. A masked name and a wiping portrait open it,
// then words light up, figures count, a pinned photo reel scrolls sideways, topics stream by,
// chapters roll their numbers and the talk opens from the centre.
import { gsap, ScrollTrigger, SplitText } from "../core/gsap.js";
import { $, fine, isSmall } from "../core/env.js";
import { revealLines, batchReveal } from "../core/reveal.js";

const pad = (n) => String(n).padStart(2, "0");

// the dark palette lives on <html> so the nav, cursor and footer flip with the page
export function founderTheme() {
  document.documentElement.classList.add("is-founder");
  return () => document.documentElement.classList.remove("is-founder");
}

export function founderHero(scope, { ready }) {
  const hero = scope.querySelector(".fh");
  if (!hero) return;
  const off = [];
  const name = hero.querySelector(".fh-name");
  const portrait = hero.querySelector(".fh-portrait");
  const img = portrait.querySelector("img");
  const small = $(".fh-kicker, .fh-aside, .fh-meta span", hero);

  const split = SplitText.create(name, { type: "chars", mask: "chars" });
  gsap.set(split.chars, { yPercent: 110 });
  gsap.set(portrait, { clipPath: "inset(100% 0% 0% 0%)" });
  gsap.set(img, { scale: 1.08 });
  gsap.set(small, { autoAlpha: 0, y: 16 });

  const tl = gsap.timeline({ paused: true })
    .to(portrait, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "koy.io" }, 0)
    .to(img, { scale: 1, duration: 2.2 }, 0)
    .to(split.chars, { yPercent: 0, duration: 1.4, stagger: 0.035 }, 0.35)
    .to(small, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08, clearProps: "transform" }, 0.9);
  ready.then(() => tl.play());

  // the role ticker rolls through its lines forever
  const track = hero.querySelector(".fh-ticker-track");
  const lines = track ? track.children.length : 0;
  if (lines > 1) {
    const roll = gsap.timeline({ repeat: -1, delay: 2 });
    for (let n = 1; n < lines; n++) roll.to(track, { yPercent: (-100 * n) / lines, duration: 0.8, ease: "koy.io" }, `+=1.6`);
    roll.to(track, { yPercent: 0, duration: 0.8, ease: "koy.io" }, "+=1.6");
  }

  // the portrait floats against the pointer
  if (fine) {
    const x = gsap.quickTo(portrait, "x", { duration: 1.2, ease: "power3" });
    const y = gsap.quickTo(portrait, "y", { duration: 1.2, ease: "power3" });
    const move = (e) => {
      x((e.clientX / window.innerWidth - 0.5) * -30);
      y((e.clientY / window.innerHeight - 0.5) * -24);
    };
    window.addEventListener("pointermove", move);
    off.push(() => window.removeEventListener("pointermove", move));
  }

  // scrolling away: the name lifts faster than the portrait
  gsap.to(name, { yPercent: -60, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
  gsap.to(portrait, { yPercent: 18, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
  return () => off.forEach((fn) => fn());
}

// one sentence, every word lighting up as it scrolls through
export function founderManifesto(scope) {
  const words = $(".fmani .fw", scope);
  if (!words.length) return;
  gsap.fromTo(words, { opacity: 0.12 }, {
    opacity: 1,
    ease: "none",
    stagger: 0.1,
    scrollTrigger: { trigger: ".fmani", start: "top 75%", end: "bottom 45%", scrub: true },
  });
}

// "37,7K", "50+", "4K+": count the number up and keep its separator and suffix
export function founderCounters(scope) {
  $("[data-count]", scope).forEach((el) => {
    const m = el.dataset.count.match(/^([\d.,]+)(.*)$/);
    if (!m) return;
    const sep = m[1].includes(",") ? "," : ".";
    const target = parseFloat(m[1].replace(",", "."));
    const decimals = (m[1].split(/[.,]/)[1] || "").length;
    const state = { v: 0 };
    const show = () => (el.textContent = state.v.toFixed(decimals).replace(".", sep) + m[2]);
    show();
    gsap.to(state, { v: target, duration: 2, ease: "power2.out", onUpdate: show, scrollTrigger: { trigger: el, start: "top 88%", once: true } });
  });
}

// the reel: pinned and scrolled sideways on large screens, a native swipe on small ones
export function founderReel(scope) {
  const reel = scope.querySelector(".freel");
  if (!reel) return;
  const track = reel.querySelector(".freel-track");
  const items = $(".freel-item", reel);
  const counter = reel.querySelector(".freel-n");
  if (isSmall()) {
    batchReveal(items, { y: 40, stagger: 0.06 });
    return;
  }
  reel.classList.add("is-pinned");
  const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
  const tween = gsap.to(track, {
    x: () => -distance(),
    ease: "none",
    scrollTrigger: {
      trigger: reel,
      start: "top top",
      end: () => "+=" + distance(),
      pin: true,
      scrub: 0.6,
      invalidateOnRefresh: true,
      onUpdate: (self) => (counter.textContent = pad(Math.round(self.progress * (items.length - 1)) + 1)),
    },
  });
  items.forEach((li) => {
    const frame = li.querySelector(".freel-frame");
    const img = frame.querySelector("img");
    gsap.fromTo(frame, { clipPath: "inset(12% 12% 12% 12%)" }, {
      clipPath: "inset(0% 0% 0% 0%)",
      ease: "none",
      scrollTrigger: { trigger: li, containerAnimation: tween, start: "left right", end: "center center", scrub: true },
    });
    gsap.fromTo(img, { xPercent: -4, scale: 1.08 }, {
      xPercent: 4,
      scale: 1.08,
      ease: "none",
      scrollTrigger: { trigger: li, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
    });
  });
}

// two rows of topics streaming in opposite directions, pushed and leaned by the scroll speed
export function founderMarquee(scope) {
  const rows = $(".fm-row", scope);
  if (!rows.length) return;
  const loops = rows.map((row) => {
    const dir = Number(row.dataset.dir) || 1;
    const t = row.querySelector(".fm-track");
    gsap.set(t, { xPercent: dir > 0 ? 0 : -50 });
    return gsap.to(t, { xPercent: dir > 0 ? -50 : 0, duration: 38, ease: "none", repeat: -1 });
  });
  const skew = gsap.quickTo(rows, "skewX", { duration: 0.5, ease: "power3" });
  ScrollTrigger.create({
    trigger: ".fmarq",
    start: "top bottom",
    end: "bottom top",
    onUpdate(self) {
      const v = self.getVelocity();
      loops.forEach((l) => gsap.to(l, { timeScale: 1 + Math.min(4, Math.abs(v) / 400), duration: 0.3, overwrite: true }));
      skew(gsap.utils.clamp(-10, 10, v / -300));
    },
    onLeave: () => skew(0),
    onLeaveBack: () => skew(0),
  });
}

// chapters: the sticky number rolls to the chapter in view, its lines rise in
export function founderChapters(scope) {
  const roll = scope.querySelector(".fchap-roll");
  const items = $(".fchap-item", scope);
  if (!roll || !items.length) return;
  items.forEach((item, n) => {
    ScrollTrigger.create({
      trigger: item,
      start: "top 55%",
      end: "bottom 55%",
      onToggle: (self) => self.isActive && gsap.to(roll, { yPercent: (-100 * n) / items.length, duration: 0.9, ease: "koy.io", overwrite: true }),
    });
    batchReveal($("p", item), { y: 30, stagger: 0.08 });
  });
  batchReveal($(".ftime-list li", scope), { y: 30, stagger: 0.06, start: "top 92%" });
}

// the talk: the picture opens from the centre while it scales back, the title rises
export function founderStage(scope) {
  const stage = scope.querySelector(".fstage");
  if (!stage) return;
  const media = stage.querySelector(".fstage-media");
  gsap.fromTo(media, { clipPath: "inset(22% 30% 22% 30%)" }, {
    clipPath: "inset(0% 0% 0% 0%)",
    ease: "none",
    scrollTrigger: { trigger: stage, start: "top 85%", end: "top 15%", scrub: true },
  });
  gsap.fromTo(media.querySelector("img"), { scale: 1.1 }, { scale: 1, ease: "none", scrollTrigger: { trigger: stage, start: "top bottom", end: "bottom top", scrub: true } });
  revealLines(stage.querySelector(".fstage-title"));
  batchReveal($(".fstage-kicker, .fstage-text, .fstage-second, .ffollow-list li", scope), { y: 40, stagger: 0.08 });
}
