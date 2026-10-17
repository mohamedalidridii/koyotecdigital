// Scroll and entrance animations for the clarity layer (home, services, blog).
// Rules: content must stay readable without motion, so everything is skipped for
// prefers-reduced-motion, and any failure reveals the content instead of hiding it.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const $ = (sel, root = document) => [...root.querySelectorAll(sel)];
const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// ---------- reveal helpers ----------
// split a heading into masked lines that slide up
function revealLines(el, { trigger, delay = 0, start = "top 85%" } = {}) {
  el.style.visibility = "visible";
  SplitText.create(el, {
    type: "lines",
    mask: "lines",
    autoSplit: true,
    onSplit(self) {
      return gsap.from(self.lines, {
        yPercent: 110,
        duration: 1,
        delay,
        ease: "power4.out",
        stagger: 0.1,
        scrollTrigger: trigger === false ? undefined : { trigger: el, start, once: true },
      });
    },
  });
}

// fade/slide groups of elements in as they enter the viewport
function batchReveal(selector, { y = 50, stagger = 0.12, start = "top 88%" } = {}) {
  const els = $(selector);
  if (!els.length) return;
  gsap.set(els, { opacity: 0, y });
  ScrollTrigger.batch(els, {
    start,
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger, overwrite: true, clearProps: "opacity,transform" }),
  });
}

function heroIntro() {
  const hero = document.querySelector(".hero-clear");
  if (!hero) return;
  const h1 = hero.querySelector("h1");
  const rest = $(".eyebrow, .sub, .btn-row, .hero-meta, .scroll-hint", hero);
  const wordmark = hero.querySelector(".wordmark");
  if (wordmark) {
    wordmark.style.visibility = "visible";
    SplitText.create(wordmark, {
      type: "chars",
      charsClass: "wm-char",
      onSplit(self) {
        gsap.from(self.chars, { yPercent: 115, duration: 1.2, ease: "power4.out", stagger: 0.07, delay: 0.1 });
        gsap.to(wordmark, {
          yPercent: -18, ease: "none",
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
        });
      },
    });
  }

  gsap.set(rest, { opacity: 0, y: 24, visibility: "visible" });
  const tl = gsap.timeline({ delay: 0.15 });
  tl.add(() => revealLines(h1, { trigger: false }), 0);
  tl.to(rest, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.12, clearProps: "opacity,transform" }, 0.5);

  // video drifts and the copy fades as the visitor scrolls away
  const video = hero.querySelector("video");
  if (video) {
    gsap.to(video, {
      yPercent: 14, scale: 1.12, ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
    });
  }
  gsap.to(hero.querySelector(".wrap"), {
    opacity: 0, y: -70, ease: "none",
    scrollTrigger: { trigger: hero, start: "top top", end: "70% top", scrub: true },
  });
}

// infinite marquee whose speed and direction follow the scroll
function marquee() {
  const track = document.querySelector(".marquee .track");
  if (!track) return;
  const tween = gsap.to(track, { xPercent: -50, ease: "none", duration: 30, repeat: -1 });
  let reset;
  ScrollTrigger.create({
    onUpdate(self) {
      const dir = self.direction;
      gsap.to(tween, { timeScale: dir * (1 + Math.min(Math.abs(self.getVelocity()) / 300, 8)), duration: 0.2, overwrite: true });
      clearTimeout(reset);
      reset = setTimeout(() => gsap.to(tween, { timeScale: dir, duration: 0.8 }), 120);
    },
  });
}

// outline word and solid word slide in from opposite sides
function mixHeadings() {
  $("h2.mix").forEach((h) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: h, start: "top 85%", once: true } });
    tl.from(h.querySelector(".outline"), { xPercent: -40, opacity: 0, duration: 1.1, ease: "power4.out" }, 0)
      .from(h.querySelector(".solid"), { xPercent: 40, opacity: 0, duration: 1.1, ease: "power4.out" }, 0.1);
  });
}

// numbered service rows: hairline draws in, row slides up
function serviceRows() {
  $(".svc-row").forEach((row) => {
    gsap.set(row, { "--line": 0 });
    gsap.to(row, { "--line": 1, duration: 1.2, ease: "power3.inOut", scrollTrigger: { trigger: row, start: "top 92%", once: true } });
  });
  batchReveal(".svc-row", { y: 30, stagger: 0.1 });
}

// giant call to action: letters rise one by one
function giantCta() {
  const link = document.querySelector(".giant-cta");
  if (!link) return;
  const text = link.textContent;
  link.setAttribute("aria-label", text);
  link.textContent = "";
  const chars = [...text].map((ch) => {
    const span = document.createElement("span");
    span.className = "gc";
    span.setAttribute("aria-hidden", "true");
    span.textContent = ch === " " ? "\u00a0" : ch;
    link.append(span);
    return span;
  });
  gsap.set(chars, { yPercent: 120 });
  ScrollTrigger.create({
    trigger: link,
    start: "top 92%",
    once: true,
    onEnter: () => gsap.to(chars, { yPercent: 0, duration: 0.9, ease: "power4.out", stagger: 0.04 }),
  });
}

// floating quote card slides in after a few seconds, can be dismissed for the session
function floatCta() {
  const card = document.querySelector(".float-cta");
  if (!card) return;
  let dismissed = false;
  try { dismissed = sessionStorage.getItem("floatCtaClosed") === "1"; } catch { /* storage blocked */ }
  if (dismissed) { card.style.display = "none"; return; }
  gsap.to(card, { y: 0, duration: 0.8, delay: 3, ease: "power3.out" });
  card.querySelector(".close").addEventListener("click", () => {
    try { sessionStorage.setItem("floatCtaClosed", "1"); } catch { /* storage blocked */ }
    gsap.to(card, { y: "160%", duration: 0.5, ease: "power3.in", onComplete: () => { card.style.display = "none"; } });
  });
  // step aside when the footer or final call to action is on screen
  ScrollTrigger.create({
    trigger: ".cta-band", start: "top 85%", end: () => ScrollTrigger.maxScroll(window) + 200,
    onToggle: (self) => { if (card.style.display !== "none") gsap.to(card, { autoAlpha: self.isActive ? 0 : 1, duration: 0.3 }); },
  });
}

function pageHeroIntro() {
  const hero = document.querySelector(".page-hero");
  if (!hero) return;
  revealLines(hero.querySelector("h1"), { trigger: false, delay: 0.1 });
  const rest = $(".sub, .btn-row", hero);
  gsap.set(rest, { visibility: "visible" });
  gsap.from(rest, { opacity: 0, y: 24, duration: 0.8, delay: 0.45, stagger: 0.12, ease: "power3.out", clearProps: "opacity,transform" });
}

function sectionHeadings() {
  $(".sec h2:not(.mix):not(.visually-hidden), .cta-band h2, .blog-head h1").forEach((el) => revealLines(el));
  $(".sec .eyebrow, .sec .lead").forEach((el) => {
    gsap.from(el, { opacity: 0, y: 24, duration: 0.8, ease: "power3.out", clearProps: "opacity,transform", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
  });
}

// the red highlights sweep in behind the words
function highlights() {
  $(".sec .highlight").forEach((el) => {
    const parentColor = getComputedStyle(el.parentElement).color;
    gsap.set(el, { backgroundColor: "transparent", backgroundImage: "linear-gradient(var(--tone-500), var(--tone-500))", backgroundRepeat: "no-repeat", backgroundSize: "0% 100%", color: parentColor });
    gsap.to(el, {
      backgroundSize: "100% 100%", color: "#fff", duration: 0.8, ease: "power3.inOut", delay: 0.3,
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
  });
}

function ctaBand() {
  const band = document.querySelector(".cta-band");
  if (!band) return;
  gsap.fromTo(band.querySelector(".wrap"),
    { opacity: 0.35, scale: 0.94, transformOrigin: "left center" },
    { opacity: 1, scale: 1, ease: "none", scrollTrigger: { trigger: band, start: "top 95%", end: "top 45%", scrub: true } });
}

// smooth open/close for the FAQ <details>
function faq() {
  $(".faq details").forEach((d) => {
    const summary = d.querySelector("summary");
    const body = d.querySelector("p");
    let busy = false;
    summary.addEventListener("click", (e) => {
      e.preventDefault();
      if (busy) return;
      busy = true;
      if (d.open) {
        gsap.to(body, { height: 0, opacity: 0, duration: 0.35, ease: "power2.inOut", onComplete: () => { d.open = false; gsap.set(body, { clearProps: "all" }); busy = false; ScrollTrigger.refresh(); } });
      } else {
        d.open = true;
        gsap.fromTo(body, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.45, ease: "power2.out", onComplete: () => { gsap.set(body, { clearProps: "all" }); busy = false; ScrollTrigger.refresh(); } });
      }
    });
  });
}

// ---------- chrome ----------
function progressBar() {
  const bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.append(bar);
  gsap.to(bar, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.2 } });
}

// top bar hides while reading down, returns on scroll up
function smartNav() {
  const nav = document.querySelector(".site-nav");
  if (!nav) return;
  const menuOpen = () => document.querySelector(".menu-toggle-btn")?.classList.contains("menu-open");
  let hidden = false;
  const setHidden = (h) => {
    if (h === hidden) return;
    hidden = h;
    gsap.to(nav, { yPercent: h ? -100 : 0, duration: 0.35, ease: "power2.out", overwrite: true });
  };
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate(self) {
      nav.classList.toggle("scrolled", self.scroll() > 10);
      setHidden(!menuOpen() && self.scroll() > 120 && self.direction === 1);
    },
  });
}

// buttons lean toward the cursor (mouse only)
function magneticButtons() {
  if (!fine) return;
  $(".btn-cta, .btn-ghost").forEach((btn) => {
    const x = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3.out" });
    const y = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3.out" });
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * 0.25);
      y((e.clientY - (r.top + r.height / 2)) * 0.35);
    });
    btn.addEventListener("pointerleave", () => { x(0); y(0); });
  });
}

// service cards tilt slightly toward the cursor (mouse only)
function cardTilt() {
  if (!fine) return;
  $("a.card-s").forEach((card) => {
    const rx = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3.out" });
    const ry = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3.out" });
    gsap.set(card, { transformPerspective: 800 });
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 6);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 6);
    });
    card.addEventListener("pointerleave", () => { rx(0); ry(0); });
  });
}

// ---------- init ----------
function init() {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    try {
      progressBar();
      smartNav();
      heroIntro();
      pageHeroIntro();
      sectionHeadings();
      highlights();
      batchReveal(".cards .card-s");
      marquee();
      mixHeadings();
      serviceRows();
      giantCta();
      floatCta();
      batchReveal(".points .point", { y: 40 });
      batchReveal(".steps .step", { y: 40 });
      batchReveal(".faq details", { y: 30, stagger: 0.08 });
      batchReveal(".blog-card", { y: 40, stagger: 0.1 });
      batchReveal(".article > *:not(.crumbs)", { y: 24, stagger: 0.04 });
      ctaBand();
      faq();
      magneticButtons();
      cardTilt();
    } catch (err) {
      // never leave content hidden if an animation fails to set up
      console.error("animations disabled:", err);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.killTweensOf("*");
      $(".cards .card-s, .svc-row, .points .point, .steps .step, .faq details, .blog-card, .article > *, .eyebrow, .sub, .btn-row, .wrap, .float-cta").forEach((el) => { el.style.opacity = ""; el.style.transform = ""; });
    }
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    $(".hero-clear h1, .hero-clear .eyebrow, .hero-clear .sub, .hero-clear .btn-row, .page-hero h1, .page-hero .sub, .page-hero .btn-row, .hero-big .wordmark, .hero-meta, .scroll-hint").forEach((el) => { el.style.visibility = "visible"; });
  });
  window.addEventListener("load", () => ScrollTrigger.refresh());
}

document.fonts.ready.then(init);
