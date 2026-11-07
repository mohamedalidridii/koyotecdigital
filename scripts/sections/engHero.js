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
  const onClick = (e) => {
    if (reduced || !mesh || leaving) return; // plain link
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    leaving = true;
    const url = panel.href;
    const r = panel.getBoundingClientRect();

    // a fixed layer takes the panel's place and carries the live canvas to full screen
    const layer = document.createElement("div");
    layer.className = "eng-takeover";
    Object.assign(layer.style, { top: `${r.top}px`, left: `${r.left}px`, width: `${r.width}px`, height: `${r.height}px` });
    document.body.appendChild(layer);
    layer.appendChild(canvas);
    mesh.setHost(layer);
    scroll.lock();

    const image = mesh.loadImage(HERO_IMAGE).catch(() => null);
    const u = mesh.uniforms;
    const st = mesh.state;
    const finalCell = 2 * mesh.dpr; // the Engineering hero dithers in 2 px cells

    const tl = gsap.timeline({ defaults: { ease: "koy.io" } });
    tl.to(".site-nav, .cursor, .scroll-cue", { autoAlpha: 0, duration: 0.5, ease: "power2.out" }, 0)
      .to(panel.querySelectorAll(".hero-eng-top, .hero-eng-body"), { autoAlpha: 0, duration: 0.35, ease: "power2.out" }, 0)
      .to(layer, { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight, duration: 1.15 }, 0.05)
      .to(st, { takeover: 1, rush: 1, duration: 1.15 }, 0.05)
      // the knot speeds up while the photo arrives cell by cell
      .add(() => {
        image.then(() => {
          gsap
            .timeline({ defaults: { ease: "power2.inOut" } })
            .to(u.uMix, { value: 1, duration: 1.8 }, 0)
            .to(u.uCell, { value: finalCell, duration: 1.8 }, 0)
            .to(st, { rush: 0, duration: 1.8 }, 0)
            .add(() => {
              try {
                sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({ t: Date.now(), img: mesh.capture() }));
              } catch {
                /* storage full or blocked: Engineering simply loads as usual */
              }
              window.location.href = url;
            }, "+=0.1");
        });
      });
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
