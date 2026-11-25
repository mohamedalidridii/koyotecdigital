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

export function founderHero(scope) {
  // 2026-11 redesign (LIFT): the name, portrait and roles are on screen at once. The letter-by-letter
  // reveal, the endless role ticker and the portrait that followed the pointer are gone.
  const hero = scope.querySelector(".fh");
  if (!hero) return;
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
  batchReveal($(".fstage-kicker, .fstage-text, .fstage-talks li, .fstage-more, .fstage-second, .ffollow-list li", scope), { y: 40, stagger: 0.08 });
}
