// Home hero, second column: the KOYOTEC Engineering panel and its WebGL mesh.
// Clicking it opens Engineering without a visible page change: the panel grows to full screen,
// the knot's cubes build the Engineering hero's building, the photo fades in over it, and the
// last frame is handed to the Engineering home (engineering/src/lib/handoff.js), which shows it
// until its own hero is ready.
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
  // 1. the panel fills the screen and the knot settles in the centre, rippling like a loader
  // 2. its cubes fly into place and build the Engineering hero's building, floor by floor,
  //    each in the photo's tone, while the black turns into the photo's sky
  // 3. the photo fades in over the matching mesh building
  // 4. that last frame is handed to the Engineering home, which takes over without a cut
  const onClick = (e) => {
    if (reduced || !mesh || leaving) return; // plain link
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    leaving = true;
    const url = panel.href;
    const r = panel.getBoundingClientRect();

    const layer = document.createElement("div");
    layer.className = "eng-takeover";
    Object.assign(layer.style, { top: `${r.top}px`, left: `${r.left}px`, width: `${r.width}px`, height: `${r.height}px` });
    document.body.appendChild(layer);
    layer.appendChild(canvas);
    mesh.setHost(layer);
    scroll.lock();

    const loaded = mesh.loadImage(HERO_IMAGE).then(() => true, () => false);
    const u = mesh.uniforms;
    const st = mesh.state;
    const finalCell = 2 * mesh.dpr; // the Engineering hero dithers in 2 px cells
    const go = () => {
      try {
        sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({ t: Date.now(), img: mesh.capture() }));
      } catch {
        /* storage full or blocked: Engineering simply loads as usual */
      }
      window.location.href = url;
    };

    const assemble = () =>
      gsap
        .timeline()
        .add(() => mesh.beginBuild())
        .to(st, { build: 1, duration: 2.4, ease: "none" })
        .to(u.uMix, { value: 1, duration: 1, ease: "power2.inOut" }, "-=0.35")
        .to(u.uCell, { value: finalCell, duration: 1, ease: "power2.inOut" }, "<")
        .add(go, "+=0.1");

    gsap
      .timeline({ defaults: { ease: "koy.io" } })
      .to(".site-nav, .cursor, .scroll-cue", { autoAlpha: 0, duration: 0.5, ease: "power2.out" }, 0)
      .to(panel.querySelectorAll(".hero-eng-top, .hero-eng-body"), { autoAlpha: 0, duration: 0.3, ease: "power2.out" }, 0)
      .to(layer, { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight, duration: 1.05 }, 0.05)
      .to(st, { takeover: 1, duration: 1.05 }, 0.05)
      // a short loader ripple, then the ripple settles before the cubes leave
      .to(st, { wave: 1, rush: 0.5, duration: 0.6, ease: "power2.inOut" }, 0.7)
      .to(st, { wave: 0, rush: 0, duration: 0.45, ease: "power2.inOut" }, 1.55)
      .add(() => loaded.then((ok) => (ok ? assemble() : go())), 2.0);
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
