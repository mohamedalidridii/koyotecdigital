import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { reduceMotion } from "./effects/env.js";
import { initCursor } from "./effects/cursor.js";
import { initMagnetic } from "./effects/magnetic.js";
import { initText } from "./effects/text.js";
import {
  initImages,
  initHoverPreview,
  initStickyGallery,
} from "./effects/images.js";
import { initHorizontal } from "./effects/horizontal.js";
import { initStack } from "./effects/stack.js";
import { initMarquee } from "./effects/marquee.js";
import { initScroll } from "./effects/scroll.js";

gsap.registerPlugin(ScrollTrigger, SplitText);

export const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

const nav = document.querySelector(".nav");
const overlay = document.querySelector(".page-transition");
const layers = overlay.querySelectorAll(".pt-layer");
const transitionLabel = overlay.querySelector(".pt-label");
const menu = document.querySelector(".menu");
const burger = document.querySelector(".burger");

// Names shown on the curtain while moving between pages
const PAGE_LABELS = {
  "/": "Accueil",
  "/index.html": "Accueil",
  "/a-propos.html": "À propos",
  "/services.html": "Services",
  "/conseils.html": "Conseils",
  "/contact.html": "Contact",
};

// Active link
const page = document.body.dataset.page;
document
  .querySelectorAll(`[data-nav="${page}"]`)
  .forEach((link) => link.classList.add("active"));

// Buttons: the label rolls up to reveal a copy of itself on hover
document.querySelectorAll(".btn").forEach((btn) => {
  const text = btn.textContent.trim();
  const roll = document.createElement("span");
  roll.className = "btn-roll";
  const inner = document.createElement("span");
  inner.dataset.text = text;
  inner.textContent = text;
  roll.appendChild(inner);
  btn.replaceChildren(roll);
});

initCursor();
initMagnetic();

// Mobile menu, built from the navbar links
document.querySelectorAll(".nav-links a").forEach((link) => {
  menu.appendChild(link.cloneNode(true));
});

let menuOpen = false;

const menuTl = gsap
  .timeline({ paused: true })
  .to(menu, {
    clipPath: "inset(0% 0% 0% 0%)",
    duration: 0.8,
    ease: "power4.inOut",
  })
  .from(
    ".menu a",
    {
      yPercent: 100,
      opacity: 0,
      stagger: 0.06,
      duration: 0.6,
      ease: "power3.out",
    },
    "-=0.3",
  );

function toggleMenu(open) {
  menuOpen = open;
  burger.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", open);
  menu.setAttribute("aria-hidden", !open);
  document.body.classList.toggle("menu-open", open);
  if (open) {
    lenis.stop();
    menuTl.timeScale(1).play();
  } else {
    lenis.start();
    menuTl.timeScale(1.5).reverse();
  }
}

burger.addEventListener("click", () => toggleMenu(!menuOpen));

// Navbar: solid background after 50px, hides when scrolling down
let navHidden = false;

lenis.on("scroll", ({ scroll, direction }) => {
  nav.classList.toggle("scrolled", scroll > 50);
  const hide = direction === 1 && scroll > 200 && !menuOpen;
  if (hide !== navHidden) {
    navHidden = hide;
    gsap.to(nav, {
      yPercent: hide ? -110 : 0,
      duration: 0.5,
      ease: "power3.out",
    });
  }
});

// Page transitions: an accent curtain then an ink one carrying the name of
// the destination page. The name is handed over to the next page so its
// curtain opens on the same word.
document.querySelectorAll('a[href^="/"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || link.target === "_blank")
      return;
    e.preventDefault();
    const href = link.getAttribute("href");
    const label = PAGE_LABELS[new URL(href, location.href).pathname] || "";
    try {
      sessionStorage.setItem("internal-nav", label || "1");
    } catch {}
    if (menuOpen) toggleMenu(false);
    if (reduceMotion) {
      location.href = href;
      return;
    }
    transitionLabel.textContent = label;
    gsap
      .timeline({ onComplete: () => (location.href = href) })
      .fromTo(
        layers,
        { yPercent: 100 },
        { yPercent: 0, duration: 0.8, stagger: 0.12, ease: "power4.inOut" },
      )
      .fromTo(
        transitionLabel,
        { yPercent: 110 },
        { yPercent: 0, duration: 0.6, ease: "power4.out" },
        "-=0.35",
      );
  });
});

window.addEventListener("pageshow", (e) => {
  if (e.persisted) gsap.set(layers, { yPercent: -100 });
});

// Preloader on every full load, skipped when arriving from an internal link.
// With reduced motion it still shows, as a simple fade.
let showPreloader = true;
try {
  const arrivedWith = sessionStorage.getItem("internal-nav");
  if (arrivedWith) {
    showPreloader = false;
    transitionLabel.textContent = arrivedWith === "1" ? "" : arrivedWith;
  }
  sessionStorage.removeItem("internal-nav");
} catch {}

const PRELOADER_IMAGES = [
  "/img12.jpg",
  "/portrait3.jpg",
  "/img5.jpg",
  "/portrait.jpg",
  "/img7.jpg",
];

const preloader = showPreloader ? createPreloader() : null;

function createPreloader() {
  const el = document.createElement("div");
  el.className = "preloader";
  el.innerHTML = `
    <p class="preloader-name"><span>Yasmine</span><span><em>Belkadi</em></span></p>
    <div class="preloader-images">
      ${PRELOADER_IMAGES.map((src) => `<img src="${src}" alt="" />`).join("")}
    </div>
    <p class="preloader-sub">
      <span>Nutritionniste · Diététicienne clinicienne</span>
      <span class="ar" lang="ar">صحتك في صحنك</span>
    </p>
    <p class="preloader-count"><span>0</span></p>`;
  document.body.appendChild(el);
  gsap.set(layers, { yPercent: -100 });
  lenis.stop();
  return el;
}

const pageLoaded = Promise.race([
  new Promise((resolve) =>
    document.readyState === "complete"
      ? resolve()
      : window.addEventListener("load", resolve, { once: true }),
  ),
  new Promise((resolve) => setTimeout(resolve, 5000)),
]);

function playPreloader() {
  const count = preloader.querySelector(".preloader-count span");
  const images = preloader.querySelectorAll(".preloader-images img");
  const progress = { value: 0 };
  const middle = (images.length - 1) / 2;

  const tl = gsap.timeline();
  if (reduceMotion) {
    tl.from(".preloader-name, .preloader-sub, .preloader-images", {
      opacity: 0,
      duration: 0.8,
    });
  } else {
    tl.from(".preloader-name span", {
      yPercent: 110,
      duration: 1.2,
      stagger: 0.1,
      ease: "power4.out",
    })
      .from(
        ".preloader-sub span",
        { opacity: 0, y: 12, stagger: 0.12, duration: 0.8, ease: "power3.out" },
        "-=0.8",
      )
      .fromTo(
        images,
        { clipPath: "inset(100% 0% 0% 0%)", scale: 1.2 },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          scale: 1,
          duration: 0.9,
          stagger: 0.35,
          ease: "power4.inOut",
        },
        0.2,
      )
      // The stack of photos fans out once the count is almost done
      .to(images, {
        rotation: (i) => (i - middle) * 7,
        x: (i) => `${(i - middle) * 9}vw`,
        y: (i) => `${Math.abs(i - middle) * 2}vh`,
        duration: 1,
        stagger: 0.03,
        ease: "power3.inOut",
      });
  }
  tl.to(
    progress,
    {
      value: 100,
      duration: 2.6,
      ease: "power2.inOut",
      onUpdate: () => (count.textContent = Math.round(progress.value)),
    },
    0,
  );

  const done = new Promise((resolve) =>
    tl.eventCallback("onComplete", resolve),
  );
  return Promise.all([done, pageLoaded]);
}

// Waits for fonts (max 1.5s) so SplitText measures the right glyphs
const fontsReady = Promise.race([
  document.fonts.ready,
  new Promise((resolve) => setTimeout(resolve, 1500)),
]);

// Resolves when the page intro starts (after the preloader, if any)
export const introStarted = fontsReady.then(() => preloader && playPreloader());

function removePreloader() {
  preloader.remove();
  lenis.start();
}

introStarted.then(() => {
  if (reduceMotion) {
    gsap.set(layers, { yPercent: -100 });
    if (preloader)
      gsap.to(preloader, {
        opacity: 0,
        duration: 0.5,
        onComplete: removePreloader,
      });
    initEffects();
    return;
  }

  const intro = gsap.timeline();
  if (preloader) {
    intro
      .to(".preloader-name span, .preloader-sub span, .preloader-count span", {
        yPercent: -110,
        opacity: 0,
        duration: 0.6,
        stagger: 0.04,
        ease: "power3.in",
      })
      .to(
        ".preloader-images img",
        {
          y: "-110vh",
          rotation: (i) => (i % 2 ? 12 : -12),
          duration: 1,
          stagger: 0.06,
          ease: "power4.in",
        },
        "<",
      )
      .to(preloader, {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 1.1,
        ease: "power4.inOut",
        onComplete: removePreloader,
      });
  } else {
    intro
      .to(transitionLabel, {
        yPercent: -110,
        duration: 0.5,
        ease: "power3.in",
      })
      .to([...layers].reverse(), {
        yPercent: -100,
        duration: 0.9,
        stagger: 0.1,
        ease: "power4.inOut",
      });
  }
  intro.from(
    nav,
    { yPercent: -110, duration: 0.8, ease: "power3.out" },
    "-=0.4",
  );

  document.querySelectorAll('[data-split="load"]').forEach((el) => {
    const split = SplitText.create(el, { type: "words,chars", mask: "words" });
    intro.from(
      split.chars,
      { yPercent: 115, duration: 1.2, stagger: 0.02, ease: "power4.out" },
      "-=0.75",
    );
  });

  document.querySelectorAll("[data-intro-img]").forEach((frame) => {
    intro
      .fromTo(
        frame,
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power4.inOut" },
        "-=1.1",
      )
      .from(
        frame.querySelector("img"),
        { scale: 1.4, duration: 1.8, ease: "power3.out" },
        "<",
      );
  });

  intro.from(
    "[data-intro]",
    { opacity: 0, y: 30, stagger: 0.1, duration: 0.9, ease: "power3.out" },
    "-=1.2",
  );

  initEffects();
});

function initEffects() {
  // Pinned sections first, so the triggers created after them are measured
  // with the pin spacing in place
  initHorizontal();
  initStickyGallery();
  initStack();
  initText();
  initImages();
  initHoverPreview();
  initScroll(lenis);
  initMarquee(lenis);
  initReveals();
  ScrollTrigger.refresh();
}

function initReveals() {
  if (reduceMotion) return;

  // Fade-up reveals in batches
  gsap.set("[data-reveal]", { opacity: 0, y: 60 });
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        stagger: 0.12,
        duration: 1,
        ease: "power3.out",
      }),
  });

  // Counters
  document.querySelectorAll("[data-count]").forEach((el) => {
    const counter = { value: 0 };
    el.textContent = "0";
    gsap.to(counter, {
      value: Number(el.dataset.count),
      duration: 2.4,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
      onUpdate: () =>
        (el.textContent = Math.round(counter.value).toLocaleString("fr-FR")),
    });
  });
}
