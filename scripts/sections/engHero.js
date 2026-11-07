// Home hero, second column: the KOYOTEC Engineering panel and its WebGL mesh.
// Clicking it opens Engineering without a visible page change: the panel grows to full screen,
// the knot dissolves into the Engineering hero photo, and the last frame is handed to the
// Engineering home (engineering/src/app/layout.js) which shows it until its own hero is ready.
// Runs even with reduced motion (the scene then renders one still frame, and the link is plain).
import { gsap } from "../core/gsap.js";
import { reduced } from "../core/env.js";
import { scroll } from "../core/scroll.js";

const HERO_IMAGE = "/engineering/images/home/hero.jpg";
export const HANDOFF_KEY = "koy-handoff";

export function engineeringHero(scope, { ready = Promise.resolve() } = {}) {
  const panel = scope.querySelector(".hero-eng");
  if (!panel) return;
  const canvas = panel.querySelector(".hero-eng-gl");
  let mesh = null;
  let cancelled = false;
  let leaving = false;

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
        mesh = createEngMesh(canvas, panel, { reduced });
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

  // ---------- the hand-off to Engineering ----------
  // 1. the panel fills the screen and the knot settles in the centre
  // 2. it ripples like a loader while a counter runs, as on the Engineering preloader
  // 3. the Engineering hero photo grows out of the centre (scale 0 → 1, −20° → 0, same ease)
  // 4. that last frame is handed to the Engineering home, which takes over without a cut
  const onClick = (e) => {
    if (reduced || !mesh || leaving) return; // plain link
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    leaving = true;
    const url = panel.href;
    const r = panel.getBoundingClientRect();
    const en = document.documentElement.lang === "en";

    const layer = document.createElement("div");
    layer.className = "eng-takeover";
    Object.assign(layer.style, { top: `${r.top}px`, left: `${r.left}px`, width: `${r.width}px`, height: `${r.height}px` });
    layer.innerHTML = `<div class="eng-loader" aria-hidden="true"><p>${en ? "Loading" : "Chargement"}</p><p class="eng-loader-n">0</p><i><b></b></i></div>`;
    document.body.appendChild(layer);
    layer.prepend(canvas);
    mesh.setHost(layer);
    scroll.lock();

    const loader = layer.querySelector(".eng-loader");
    const count = layer.querySelector(".eng-loader-n");
    const bar = layer.querySelector(".eng-loader b");
    const image = mesh.loadImage(HERO_IMAGE).catch(() => null);
    const u = mesh.uniforms;
    const st = mesh.state;
    const finalCell = 2 * mesh.dpr; // the Engineering hero dithers in 2 px cells
    const progress = { v: 0 };

    const reveal = () =>
      gsap
        .timeline()
        .to(loader, { autoAlpha: 0, y: 10, duration: 0.35, ease: "power2.in" }, 0)
        .to(u.uImgS, { value: 1, duration: 1.25, ease: "koy.hop" }, 0.1)
        .to(u.uImgR, { value: 0, duration: 1.25, ease: "koy.hop" }, 0.1)
        .to(u.uCell, { value: finalCell, duration: 1.25, ease: "koy.hop" }, 0.1)
        .to(st, { shrink: 1, wave: 0, duration: 0.9, ease: "power2.in" }, 0.1)
        .add(() => {
          try {
            sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({ t: Date.now(), img: mesh.capture() }));
          } catch {
            /* storage full or blocked: Engineering simply loads as usual */
          }
          window.location.href = url;
        }, "+=0.12");

    gsap
      .timeline({ defaults: { ease: "koy.io" } })
      .to(".site-nav, .cursor, .scroll-cue", { autoAlpha: 0, duration: 0.5, ease: "power2.out" }, 0)
      .to(panel.querySelectorAll(".hero-eng-top, .hero-eng-body"), { autoAlpha: 0, duration: 0.3, ease: "power2.out" }, 0)
      .to(layer, { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight, duration: 1.05 }, 0.05)
      .to(st, { takeover: 1, duration: 1.05 }, 0.05)
      // the loader: the knot ripples, the counter runs
      .to(st, { wave: 1, rush: 0.5, duration: 0.7, ease: "power2.inOut" }, 0.75)
      .fromTo(loader, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0.85)
      .to(progress, {
        v: 100,
        duration: 1.5,
        ease: "power1.inOut",
        onUpdate: () => {
          count.textContent = String(Math.round(progress.v));
          bar.style.transform = `scaleX(${progress.v / 100})`;
        },
      }, 0.9)
      .add(() => image.then(reveal), 2.45);
  };
  panel.addEventListener("click", onClick);

  // coming back with the browser's back button: the page may be restored from cache
  const onShow = (e) => {
    if (e.persisted) window.location.reload();
  };
  window.addEventListener("pageshow", onShow);

  return () => {
    cancelled = true;
    panel.removeEventListener("click", onClick);
    window.removeEventListener("pageshow", onShow);
    tweens.forEach((t) => t.kill());
    mesh?.dispose();
  };
}
