// Every full page load: the KOYOTEC mark draws itself while an odometer counts, the strokes turn
// into holes cut in the paper, then the K zooms until the page fills the screen and the red square
// flies onto the logo in the nav. Client-side navigations never reach this (the curtain covers them).
// Resolves when the page intro should start, so the headline rises inside the growing K.
import { gsap } from "./gsap.js";
import { reduced, isSmall } from "./env.js";

const W = 250; // logo units (see public/koyotec-logo.svg)
const H = 195;
const ORIGIN = [79.5, 104]; // where the stem crosses the bar: the zoom grows from here
const DOT = [232, 2, 18]; // red square: x, y, size in logo units
const ZOOM = 30; // enough for the strokes to outgrow a phone screen; the final fade covers the rest

// `done` resolves once the overlay is gone; heavy work (the WebGL stage) waits for it
let markDone;
export const preloaderDone = new Promise((r) => (markDone = r));

export function runPreloader() {
  const pre = document.querySelector(".preloader");
  if (!pre) {
    markDone();
    return Promise.resolve();
  }
  pre.style.animation = "none";

  const svg = pre.querySelector(".pl-svg");
  const ink = pre.querySelector(".pl-ink");
  const cut = pre.querySelector(".pl-cut");
  const paper = pre.querySelector(".pl-paper");
  const strokes = ink.querySelectorAll("path");
  const dot = pre.querySelector(".pl-dot");
  const texts = pre.querySelectorAll(".pl-top, .pl-bottom");
  const navDot = document.querySelector(".brand .logo-dot");

  // place the K centred on screen (the zoom itself is a CSS transform on the whole overlay)
  let k = 1;
  let origin = [0, 0];
  let flying = false;
  const layout = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    svg.setAttribute("viewBox", `0 0 ${vw} ${vh}`);
    // the ink screen (and its mask area) only needs to cover the viewport, plus a margin
    for (const el of [...pre.querySelectorAll(".pl-fill"), pre.querySelector("#pl-hole")]) {
      el.setAttribute("x", -vw);
      el.setAttribute("y", -vh);
      el.setAttribute("width", vw * 3);
      el.setAttribute("height", vh * 3);
    }
    k = Math.min((isSmall() ? 0.62 : 0.3) * vw, 0.42 * vh * (W / H)) / W;
    origin = [vw / 2 + (ORIGIN[0] - W / 2) * k, vh * 0.46 + (ORIGIN[1] - H / 2) * k];
    render();
    if (!flying) {
      gsap.set(dot, {
        x: origin[0] + (DOT[0] - ORIGIN[0]) * k,
        y: origin[1] + (DOT[1] - ORIGIN[1]) * k,
        width: DOT[2] * k,
        height: DOT[2] * k,
      });
    }
  };
  const render = () => {
    const t = `translate(${origin[0]} ${origin[1]}) scale(${k}) translate(${-ORIGIN[0]} ${-ORIGIN[1]})`;
    ink.setAttribute("transform", t);
    cut.setAttribute("transform", t);
  };
  layout();
  window.addEventListener("resize", layout);
  const finish = () => {
    window.removeEventListener("resize", layout);
    if (navDot) navDot.style.opacity = "";
    pre.remove();
    markDone();
  };

  // reduced motion: the mark is shown whole, then the overlay simply fades out
  if (reduced) {
    return new Promise((resolve) => {
      gsap.to(pre, { autoAlpha: 0, duration: 0.4, delay: 0.7, onComplete: () => (finish(), resolve()) });
    });
  }

  // ---------- odometer: units roll continuously, tens and hundreds tick ----------
  const strips = pre.querySelectorAll(".odo-strip");
  const tickH = gsap.quickTo(strips[0], "yPercent", { duration: 0.45, ease: "koy" });
  const tickT = gsap.quickTo(strips[1], "yPercent", { duration: 0.45, ease: "koy" });
  const count = { v: 0 };
  const showCount = () => {
    const v = count.v;
    tickH(-Math.floor(v / 100) * 10);
    tickT(-(Math.floor(v / 10) % 10) * 10);
    // the units strip has 11 cells (0-9 then 0 again) so 9 -> 0 rolls on instead of jumping back
    gsap.set(strips[2], { yPercent: v >= 100 ? 0 : (-(v % 10) * 100) / 11 });
  };

  // ---------- cycling service words ----------
  const words = pre.querySelector(".pl-words-strip");
  const n = words.children.length;
  const cycle = gsap.timeline({ repeat: -1 });
  for (let i = 1; i <= n; i++) {
    cycle.to(words, { yPercent: (-100 * (i % n)) / n, duration: 0.45, ease: "koy.io", delay: 0.12 });
  }

  // every stroke has pathLength=1, so a dash of 1 offset by 1 hides it completely
  gsap.set(strokes, { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.set(dot, { scale: 0, transformOrigin: "50% 50%" });
  if (navDot) navDot.style.opacity = "0";

  return new Promise((resolve) => {
    const fonts = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);
    const draw = gsap.timeline();
    draw
      .from(texts, { autoAlpha: 0, y: 14, duration: 0.8, stagger: 0.1 }, 0)
      .to(count, { v: 100, duration: 2, ease: "power2.inOut", onUpdate: showCount }, 0)
      // bar, stem, then the sweeping curve into the leg, then the second leg
      .to(strokes[3], { strokeDashoffset: 0, duration: 0.8, ease: "koy.io" }, 0.15)
      .to(strokes[1], { strokeDashoffset: 0, duration: 0.7, ease: "koy.io" }, 0.45)
      .to(strokes[0], { strokeDashoffset: 0, duration: 1.1, ease: "koy.io" }, 0.7)
      .to(strokes[2], { strokeDashoffset: 0, duration: 0.7, ease: "koy.io" }, 1.15)
      .to(dot, { scale: 1, duration: 0.6, ease: "back.out(3)" }, 1.6);

    draw.then(() => fonts).then(() => {
      cycle.kill();
      const target = navDot?.getBoundingClientRect();
      gsap
        .timeline({ onComplete: finish })
        // the cut: the ink K turns into holes in the paper
        .to(texts, { autoAlpha: 0, y: -10, duration: 0.4, stagger: 0.05 }, 0)
        .to(ink, { opacity: 0, duration: 0.35, ease: "none" }, 0.05)
        .to(cut, { opacity: 1, duration: 0.35, ease: "none" }, 0.05)
        // the zoom: the finished overlay scales around the stem/bar crossing on the compositor
        // (no repaint per frame), until the page fills the screen through the K
        .call(() => {
          flying = true;
          window.removeEventListener("resize", layout);
          gsap.set(svg, { transformOrigin: `${origin[0]}px ${origin[1]}px`, willChange: "transform" });
          // the red square flies with transforms only: fixed size, scaled to the nav logo's square
          const size = DOT[2] * k;
          gsap.set(dot, { transformOrigin: "0 0", width: size, height: size });
          if (target) {
            gsap.to(dot, { x: target.left, y: target.top, scale: target.width / size, duration: 1.1, ease: "koy.io" });
          } else {
            gsap.to(dot, { autoAlpha: 0, duration: 0.4 });
          }
          resolve();
        }, null, 0.4)
        .to(svg, { scale: ZOOM, duration: 1.15, ease: "expo.in", onComplete: () => gsap.set(svg, { willChange: "auto" }) }, 0.4)
        .to(paper, { opacity: 0, duration: 0.3, ease: "none" }, 1.2);
    });
  });
}
