// "L'art de la différence": the exhibition page. Inverted palette, a headline whose letters
// never share a style, a pinned horizontal track of framed pieces, filters and a live viewer.
import { gsap, ScrollTrigger, SplitText } from "../core/gsap.js";
import { Flip } from "gsap/Flip";
import { $, fine, isSmall, reduced } from "../core/env.js";
import { scroll } from "../core/scroll.js";
import { gl } from "../core/gl.js";
import { batchReveal } from "../core/reveal.js";

gsap.registerPlugin(Flip);

const pad = (n) => String(n).padStart(2, "0");
// type treatments a letter can wear; css/art.css defines each one
const STYLES = ["s-serif", "s-italic", "s-wide", "s-thin", "s-outline", "s-mono", "s-black", "s-box"];

// the dark palette lives on <html> so the nav, cursor and footer flip with the page
export function artTheme() {
  document.documentElement.classList.add("is-art");
  return () => document.documentElement.classList.remove("is-art");
}

// the letters of "différence": each wears a style nobody else is wearing, and they keep trading
export function diffWord(word, { plain = false } = {}) {
  const letters = $(".art-l", word);
  const worn = letters.map((_, i) => (plain ? "s-serif" : STYLES[i % STYLES.length]));
  letters.forEach((l, i) => l.classList.add(worn[i]));
  const pick = () => {
    const free = STYLES.filter((s) => !worn.includes(s));
    return free[Math.floor(Math.random() * free.length)];
  };
  const wear = (i, style) => {
    letters[i].classList.replace(worn[i], style);
    worn[i] = style;
  };
  // one letter at a time drops out, changes and comes back
  const swap = () => {
    const i = Math.floor(Math.random() * letters.length);
    const next = pick();
    gsap.timeline()
      .to(letters[i], { yPercent: -100, autoAlpha: 0, duration: 0.35, ease: "power2.in" })
      .call(() => wear(i, next))
      .fromTo(letters[i], { yPercent: 100 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: "koy" });
  };
  const loop = gsap.delayedCall(2.2, () => {
    swap();
    loop.restart(true);
  }).pause();
  // hovering scrambles every letter at once
  const burst = () => letters.forEach((_, i) => gsap.delayedCall(i * 0.04, () => wear(i, pick())));
  if (fine) word.addEventListener("pointerenter", burst);
  return {
    letters,
    // dress letter i in its own style (used to diverge letters one by one)
    diverge: (i) => wear(i, STYLES[i % STYLES.length]),
    // back to the shared uniform
    uniform: () => letters.forEach((_, i) => wear(i, "s-serif")),
    play: () => loop.restart(true),
    stop: () => loop.pause(),
    off: () => word.removeEventListener("pointerenter", burst),
  };
}

// recorded previews: load the clip on first use, play and pause
function playPreview(el) {
  const v = el.querySelector("video");
  if (!v) return;
  if (!v.src) v.src = v.canPlayType("video/webm") ? v.dataset.webm : v.dataset.mp4;
  el.classList.add("is-playing");
  v.play().catch(() => {});
}
function stopPreview(el) {
  el.classList.remove("is-playing");
  el.querySelector("video")?.pause();
}

// the hero: every letter of the key word wears a different style, then they keep swapping
export function artHero(scope, { ready }) {
  const hero = scope.querySelector(".art-hero");
  if (!hero) return;
  const word = hero.querySelector(".art-word");
  const diff = diffWord(word);
  const letters = diff.letters;

  const lead = hero.querySelector(".art-title-a");
  const split = SplitText.create(lead, { type: "chars", mask: "chars" });
  const small = $(".art-brand, .art-hero-foot, .art-cue", hero);
  gsap.set(split.chars, { yPercent: 110 });
  gsap.set(letters, { yPercent: 120, rotate: () => gsap.utils.random(-25, 25), autoAlpha: 0 });
  gsap.set(small, { autoAlpha: 0, y: 20 });
  gsap.set(hero.querySelector("[data-line]"), { "--line": 0 });

  const tl = gsap.timeline({ paused: true });
  tl.to(split.chars, { yPercent: 0, duration: 1.2, stagger: 0.03 }, 0)
    .to(letters, { yPercent: 0, rotate: 0, autoAlpha: 1, duration: 1.4, stagger: { each: 0.06, from: "random" } }, 0.2)
    .to(small, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08, clearProps: "transform" }, 0.6)
    .to(hero.querySelector("[data-line]"), { "--line": 1, duration: 1.6, ease: "koy.io" }, 0.5);
  ready.then(() => tl.play());

  ready.then(() => diff.play());

  gsap.to(hero.querySelector(".art-title"), {
    yPercent: -18,
    ease: "none",
    scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
  });
  return () => diff.off();
}

// the track: pinned and scrolled sideways on large screens, a plain column on small ones
export function artExpo(scope) {
  const expo = scope.querySelector(".art-expo");
  if (!expo) return;
  const track = expo.querySelector(".art-track");
  const items = $(".art-piece", expo);
  const counter = expo.querySelector(".art-progress-n");
  const off = [];
  let st = null;

  const visible = () => items.filter((li) => !li.hidden);
  const setCount = (i) => {
    counter.textContent = pad(Math.min(visible().length, i + 1));
  };

  function horizontal() {
    if (isSmall()) return;
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const skew = gsap.quickTo($(".art-frame", expo), "skewX", { duration: 0.6, ease: "power3" });
    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: expo,
        start: "top top",
        end: () => "+=" + distance(),
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate(self) {
          skew(gsap.utils.clamp(-8, 8, self.getVelocity() / -320));
          setCount(Math.round(self.progress * (visible().length - 1)));
        },
        onScrubComplete: () => skew(0),
      },
    });
    st = tween.scrollTrigger;
    // each poster slides inside its frame as the frame crosses the screen
    items.forEach((li) => {
      gsap.fromTo(
        li.querySelector(".art-poster"),
        { xPercent: -6 },
        { xPercent: 6, ease: "none", scrollTrigger: { trigger: li, containerAnimation: tween, start: "left right", end: "right left", scrub: true } },
      );
    });
  }

  function vertical() {
    if (!isSmall()) return;
    ScrollTrigger.batch(items, {
      start: "top 88%",
      once: true,
      onEnter: (batch) => gsap.from(batch, { y: 60, autoAlpha: 0, duration: 1.1, stagger: 0.08 }),
    });
  }

  horizontal();
  vertical();

  // hover (or, on touch screens, being in view) plays the recorded preview
  const play = playPreview;
  const stop = stopPreview;
  if (fine) {
    items.forEach((li) => {
      const enter = () => play(li);
      const leave = () => stop(li);
      li.addEventListener("pointerenter", enter);
      li.addEventListener("pointerleave", leave);
      off.push(() => {
        li.removeEventListener("pointerenter", enter);
        li.removeEventListener("pointerleave", leave);
      });
    });
  } else {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? play(e.target) : stop(e.target))),
      { threshold: 0.6 },
    );
    items.forEach((li) => io.observe(li));
    off.push(() => io.disconnect());
  }

  // filters: the remaining pieces glide into their new places
  const buttons = $(".art-filter", expo);
  const filter = (e) => {
    const kind = e.currentTarget.dataset.filter;
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === e.currentTarget)));
    const state = Flip.getState(items);
    items.forEach((li) => (li.hidden = kind !== "all" && li.dataset.kind !== kind));
    Flip.from(state, {
      duration: 0.9,
      ease: "koy",
      scale: true,
      absolute: true,
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.8 }),
      onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.85, duration: 0.5 }),
      onComplete: () => {
        ScrollTrigger.refresh();
        setCount(0);
      },
    });
    if (st) scroll.to(st.start, { duration: 0.8 });
  };
  buttons.forEach((b) => b.addEventListener("click", filter));
  off.push(() => buttons.forEach((b) => b.removeEventListener("click", filter)));

  return () => off.forEach((fn) => fn());
}

// the viewer: a full-screen frame that loads the live concept, with prev/next through the visible pieces
export function artViewer(scope) {
  const dialog = scope.querySelector(".art-viewer");
  if (!dialog || typeof dialog.showModal !== "function") return;
  const frame = dialog.querySelector("iframe");
  const open = dialog.querySelector(".art-viewer-open");
  const story = dialog.querySelector(".art-viewer-case");
  const num = dialog.querySelector(".art-viewer-num");
  const client = dialog.querySelector(".art-viewer-client");
  const sector = dialog.querySelector(".art-viewer-sector");
  const cards = $(".art-card", scope);
  const total = pad(cards.length);
  let current = -1;

  const show = (i) => {
    current = i;
    const card = cards[i];
    frame.src = card.getAttribute("href");
    open.href = card.getAttribute("href");
    if (story) {
      story.hidden = !card.dataset.case;
      story.href = card.dataset.case || "#";
    }
    num.textContent = `${dialog.dataset.labelPiece} ${pad(i + 1)}/${total}`;
    client.textContent = card.querySelector(".art-client").textContent;
    sector.textContent = card.querySelector(".art-sector").textContent;
    dialog.style.setProperty("--accent", card.parentElement.style.getPropertyValue("--accent"));
  };

  const enter = (i) => {
    show(i);
    dialog.showModal();
    scroll.lock();
    if (!reduced) {
      gsap.fromTo(dialog, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "koy.io" });
      gsap.fromTo(dialog.querySelector(".art-viewer-screen"), { y: 80, scale: 0.94 }, { y: 0, scale: 1, duration: 1.1, delay: 0.25 });
    }
  };

  const leave = async () => {
    if (!dialog.open) return;
    if (!reduced) await gsap.to(dialog, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.7, ease: "koy.io" });
    dialog.close();
    frame.src = "about:blank";
    scroll.unlock();
    cards[current]?.focus({ preventScroll: true });
  };

  const step = (dir) => {
    const shown = cards.map((c, i) => [c, i]).filter(([c]) => !c.parentElement.hidden).map(([, i]) => i);
    const at = shown.indexOf(current);
    const next = shown[(at + dir + shown.length) % shown.length];
    if (reduced) return show(next);
    const screen = dialog.querySelector(".art-viewer-screen");
    gsap.timeline()
      .to(screen, { xPercent: -8 * dir, autoAlpha: 0, duration: 0.35, ease: "power2.in" })
      .call(() => show(next))
      .fromTo(screen, { xPercent: 8 * dir }, { xPercent: 0, autoAlpha: 1, duration: 0.7 });
  };

  const onCard = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // let "open in new tab" through
    e.preventDefault();
    enter(cards.indexOf(e.currentTarget));
  };
  const onCancel = (e) => {
    e.preventDefault();
    leave();
  };
  const onClick = (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    if (btn.classList.contains("art-viewer-close")) leave();
    else if (btn.dataset.step) step(Number(btn.dataset.step));
  };
  const onKey = (e) => {
    if (!dialog.open) return;
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  };

  cards.forEach((c) => c.addEventListener("click", onCard));
  dialog.addEventListener("cancel", onCancel);
  dialog.addEventListener("click", onClick);
  window.addEventListener("keydown", onKey);
  return () => {
    cards.forEach((c) => c.removeEventListener("click", onCard));
    dialog.removeEventListener("cancel", onCancel);
    dialog.removeEventListener("click", onClick);
    window.removeEventListener("keydown", onKey);
    if (dialog.open) {
      dialog.close();
      scroll.unlock();
    }
  };
}

// with reduced motion no module animates the word, but its letters still each wear their own style
export function staticLetters(scope) {
  if (!reduced) return;
  const words = $(".art-word", scope).map((w) => diffWord(w));
  return () => words.forEach((d) => d.off());
}

// where each card lands, from the middle of the stage (vw, vh): placed by hand so the
// constellation keeps the headline (top left) and the footer line (bottom) readable
const SLOTS = [
  { x: 10, y: -24, rotation: -7, scale: 0.82 },
  { x: 33, y: -19, rotation: 8, scale: 0.95 },
  { x: -30, y: 3, rotation: -12, scale: 0.88 },
  { x: 1, y: 2, rotation: 4, scale: 1.05 },
  { x: 32, y: 6, rotation: -5, scale: 0.84 },
  { x: -14, y: 17, rotation: 9, scale: 0.74 },
  { x: 16, y: 18, rotation: -10, scale: 0.78 },
  { x: -41, y: -4, rotation: 14, scale: 0.68 },
];

// home teaser: a stack of identical grey cards bursts into a constellation of different identities
export function artTeaser(scope) {
  const sec = scope.querySelector(".art-teaser");
  if (!sec) return;
  const chips = $(".art-chip", sec);
  const word = sec.querySelector(".art-word");
  const diff = diffWord(word, { plain: !isSmall() });
  const count = sec.querySelector(".art-teaser-n");
  const total = Number(sec.querySelector(".art-teaser-count i").textContent.replace(/\D/g, "")) || 30;
  const off = [() => diff.off()];

  // the marquee of client names runs forever and races with the scroll
  const track = sec.querySelector(".art-marquee-track");
  const marquee = gsap.to(track, { xPercent: -50, ease: "none", duration: 60, repeat: -1 });
  const skew = gsap.quickTo(track, "skewX", { duration: 0.5, ease: "power3" });
  ScrollTrigger.create({
    trigger: sec,
    start: "top bottom",
    end: "bottom top",
    onUpdate(self) {
      const v = self.getVelocity();
      gsap.to(marquee, { timeScale: 1 + Math.min(Math.abs(v) / 250, 8), duration: 0.2, overwrite: true });
      gsap.to(marquee, { timeScale: 1, duration: 1.2, delay: 0.2 });
      skew(gsap.utils.clamp(-10, 10, v / -300));
    },
  });

  // hover plays the recorded preview (touch screens: while the card is in view)
  const hover = (chip) => {
    const enter = () => playPreview(chip);
    const leave = () => stopPreview(chip);
    chip.addEventListener("pointerenter", enter);
    chip.addEventListener("pointerleave", leave);
    off.push(() => {
      chip.removeEventListener("pointerenter", enter);
      chip.removeEventListener("pointerleave", leave);
    });
  };

  // small screens: a swipeable row of cards, no pin
  if (isSmall()) {
    batchReveal(chips, { y: 60, stagger: 0.08 });
    count.textContent = String(total);
    const io = new IntersectionObserver((entries) => entries.forEach((e) => (e.isIntersecting ? playPreview(e.target) : stopPreview(e.target))), { threshold: 0.7 });
    chips.forEach((c) => io.observe(c));
    ScrollTrigger.create({ trigger: sec, start: "top 70%", once: true, onEnter: () => diff.play() });
    off.push(() => io.disconnect());
    return () => off.forEach((fn) => fn());
  }

  sec.classList.add("is-staged");
  off.push(() => sec.classList.remove("is-staged"));
  const spots = chips.map((_, i) => SLOTS[i % SLOTS.length]);
  const foot = sec.querySelectorAll(".art-teaser-lead, .art-teaser-cta");
  const lead = SplitText.create(sec.querySelector(".art-teaser-a"), { type: "chars", mask: "chars" });

  // 1. uniform: one neat grey stack, as alike as templates
  gsap.set(chips, {
    xPercent: -50,
    yPercent: -50,
    x: (i) => i * 6 - chips.length * 3,
    y: (i) => -i * 6,
    rotation: (i) => (i - chips.length / 2) * 1.2,
    scale: 0.86,
    filter: "grayscale(1) brightness(0.75) contrast(1.1)",
    "--glow": 0,
  });
  gsap.set(foot, { autoAlpha: 0, y: 30 });
  gsap.set(lead.chars, { yPercent: 110 });

  // the letters of the word diverge one by one as the cards do
  let dressed = 0;
  const dress = (n) => {
    while (dressed < n) diff.diverge(dressed++);
    if (n === 0 && dressed) {
      diff.uniform();
      dressed = 0;
    }
  };

  let burst = false;
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: sec,
      start: "top top",
      end: "+=220%",
      pin: true,
      scrub: 0.8,
      onUpdate(self) {
        const p = self.progress;
        dress(Math.round(gsap.utils.clamp(0, 1, (p - 0.12) / 0.45) * diff.letters.length));
        count.textContent = String(Math.max(1, Math.round(gsap.utils.clamp(0, 1, (p - 0.2) / 0.6) * total))).padStart(2, "0");
        // the particles feel the burst, once each way
        if (p > 0.18 !== burst) {
          burst = p > 0.18;
          if (burst) {
            gl.pulse(0, 0, 1.6);
            gl.scatter(0.45, 0.5).then(() => gl.scatter(0, 1.4));
          }
        }
        if (p > 0.9) diff.play();
        else diff.stop();
      },
    },
  });
  tl.to(lead.chars, { yPercent: 0, stagger: 0.01, duration: 0.12 }, 0)
    // a breath before the burst: the stack lifts and fans a little
    .to(chips, { y: (i) => -i * 14 - 20, rotation: (i) => (i - chips.length / 2) * 3, duration: 0.12 }, 0.02)
    // 2. divergence: each card takes its own place, angle, size and colour
    .to(chips, {
      x: (i) => (spots[i].x * window.innerWidth) / 100,
      y: (i) => (spots[i].y * window.innerHeight) / 100,
      rotation: (i) => spots[i].rotation,
      scale: (i) => spots[i].scale,
      filter: "grayscale(0) brightness(1) contrast(1)",
      "--glow": 1,
      ease: "expo.out",
      duration: 0.45,
      stagger: { each: 0.025, from: "center" },
    }, 0.15)
    // 3. signature: the cards drift apart a touch more while the words arrive
    .to(chips, { x: (i) => (spots[i].x * window.innerWidth) / 96, y: (i) => (spots[i].y * window.innerHeight) / 97, duration: 0.3 }, 0.62)
    .to(foot, { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.15 }, 0.7);

  // once settled, the cards lean toward the pointer
  if (fine) {
    const tilts = chips.map((c) => ({
      rx: gsap.quickTo(c, "rotationX", { duration: 0.8, ease: "power3" }),
      ry: gsap.quickTo(c, "rotationY", { duration: 0.8, ease: "power3" }),
    }));
    const move = (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      const k = tl.scrollTrigger.progress > 0.5 ? 1 : 0.3;
      tilts.forEach((t, i) => {
        const depth = 0.6 + (i % 3) * 0.25;
        t.ry(nx * 26 * depth * k);
        t.rx(-ny * 20 * depth * k);
      });
    };
    sec.addEventListener("pointermove", move);
    off.push(() => sec.removeEventListener("pointermove", move));
    chips.forEach(hover);
  }
  return () => off.forEach((fn) => fn());
}
