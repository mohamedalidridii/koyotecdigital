// Bridge between the page and the lazily-loaded WebGL stage. Pages talk to `gl` right away;
// calls made before three.js has loaded are replayed once the stage exists.
import { gsap, ScrollTrigger } from "./gsap.js";
import { $, fine, reduced } from "./env.js";
import { scroll } from "./scroll.js";

let stage = null;
let load = null;
let disabled = false;
let gate = Promise.resolve(); // heavy WebGL setup waits for this (the preloader) so the intro never stutters
const queue = [];
const call = (method, ...args) => {
  if (stage) return stage[method](...args);
  if (disabled) return;
  queue.push([method, args]);
  // three.js is only fetched once a page actually asks for a scene (never on the blog)
  if (method === "morphTo" && load) {
    const go = load;
    load = null;
    gate.then(() => {
      if ("requestIdleCallback" in window) requestIdleCallback(go, { timeout: 1200 });
      else setTimeout(go, 300);
    });
  }
};

let scene = null; // the scene the scroll position asks for; hover focus returns to it
let focused = null; // while a hover preview is up, scroll scenes are remembered but not applied

export const gl = {
  shape: (name, opts) => call("morphTo", name, opts),
  // hover previews: gather the particles into a shape beside the pointer, then let go
  focus(name) {
    if (!stage) return;
    focused = name;
    stage.setDim(1);
    stage.setAlpha(1, 0.6);
    stage.focus(name);
  },
  blur() {
    if (!stage || !focused) return;
    focused = null;
    stage.unfocus();
    if (scene) applyScene(scene);
  },
  alpha: (v, d) => call("setAlpha", v, d),
  dim: (v) => call("setDim", v),
  pulse: (x, y, s) => call("pulse", x, y, s),
  scatter: (v, d) => (stage ? stage.scatter(v, d) : Promise.resolve()),
};

function supported() {
  try {
    const c = document.createElement("canvas");
    const ctx = window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"));
    if (!ctx) return false;
    // software rasterisers (no GPU) would stall the main thread: show the static night sky instead
    const info = ctx.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? ctx.getParameter(info.UNMASKED_RENDERER_WEBGL) : "";
    ctx.getExtension("WEBGL_lose_context")?.loseContext();
    return !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
  } catch {
    return false;
  }
}

export function bootGL({ after } = {}) {
  if (after) gate = after;
  const canvas = document.getElementById("gl");
  if (!canvas || !supported()) {
    disabled = true;
    document.documentElement.classList.add("no-webgl");
    return;
  }
  load = () =>
    import("../webgl/stage.js")
      .then(async ({ createStage }) => {
        // the brand glyph is drawn with the display font, so wait for it
        await document.fonts.load('600 64px "Clash Display"').catch(() => {});
        stage = createStage(canvas, { reduced });
        queue.splice(0).forEach(([m, args]) => stage[m](...args));
        bindPointer();
      })
      .catch((err) => {
        console.error("WebGL stage unavailable:", err);
        disabled = true;
        queue.length = 0;
        document.documentElement.classList.add("no-webgl");
      });}

function bindPointer() {
  const toNdc = (e) => [(e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1];
  let lastX = 0;
  let lastY = 0;
  let travelled = 0;
  window.addEventListener(
    "pointermove",
    (e) => {
      const [x, y] = toNdc(e);
      stage.setPointer(x, y);
      // a small howl every so often while the cursor travels over the dunes
      travelled += Math.hypot(e.clientX - lastX, e.clientY - lastY);
      lastX = e.clientX;
      lastY = e.clientY;
      if (fine && travelled > 420 && stage.shape === "dunes") {
        travelled = 0;
        stage.pulse(x, y, 0.45);
      }
    },
    { passive: true },
  );
  window.addEventListener(
    "pointerdown",
    (e) => {
      if (e.target.closest("a, button, input, textarea, label, summary")) return;
      const [x, y] = toNdc(e);
      stage.pulse(x, y, 1.2);
    },
    { passive: true },
  );
  // feed scroll velocity to the particles every frame
  gsap.ticker.add(() => stage.setVelocity(scroll.velocity));
}

// each [data-gl] block picks the scene while it holds the middle of the viewport. A fast jump can
// toggle many triggers in one frame (in any order), so the winner is resolved on the next frame:
// the last active block in document order.
const active = new Set();
let pending = 0;
function resolveScene() {
  pending = 0;
  const els = [...active].filter((el) => el.isConnected);
  if (!els.length) return;
  els.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  applyScene(els[els.length - 1]);
}

export const resetScenes = () => active.clear();

export function bindScenes(els, { containerAnimation } = {}) {
  return els.map((el) =>
    ScrollTrigger.create({
      trigger: el,
      containerAnimation,
      start: containerAnimation ? "left 55%" : "top 55%",
      end: containerAnimation ? "right 55%" : "bottom 55%",
      onToggle(self) {
        self.isActive ? active.add(el) : active.delete(el);
        if (!pending) pending = requestAnimationFrame(resolveScene);
      },
    }),
  );
}

export function applyScene(el, opts) {
  scene = el;
  if (focused) return;
  const name = el.dataset.gl;
  if (name === "off") {
    gl.alpha(0, 0.8);
    return;
  }
  gl.dim(el.dataset.glDim ? parseFloat(el.dataset.glDim) : 1);
  gl.alpha(1, 1.4);
  gl.shape(name, opts);
}

// pick the scene for whatever is on screen right now (page load and after transitions)
export function sceneAtViewport(scope, opts) {
  const mid = window.innerHeight * 0.55;
  const els = $("[data-gl]", scope);
  const current = els.find((el) => {
    const r = el.getBoundingClientRect();
    return r.top <= mid && r.bottom >= mid;
  }) || els[0];
  if (current) applyScene(current, opts);
}
