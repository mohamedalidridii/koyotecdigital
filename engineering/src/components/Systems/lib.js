"use client";

// Shared helpers for the /systems visuals: math, visibility, reduced motion, and a small
// three.js stage that only exists while its chapter is near the viewport.
import { useEffect, useState } from "react";
import gsap from "gsap";

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
// 0 before a, 1 after b, eased in between
export const band = (p, a, b) => {
  const t = clamp((p - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const lerp = (a, b, t) => a + (b - a) * t;

// deterministic random, so every visit draws the same scene
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

// true while the element is within `margin` of the viewport: heavy visuals mount only then
export function useNear(ref, margin = "60% 0px") {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return near;
}

// eased copy of the chapter's scroll progress, read once per frame by its visual. Time-based, so a
// slow device lags no more than a fast one.
export function follow(progress, reduced) {
  const p = progress.current;
  const now = performance.now();
  const dt = Math.min(0.1, (now - (p.at || now)) / 1000);
  p.at = now;
  if (reduced) p.value = p.target;
  else p.value += (p.target - p.value) * (1 - Math.exp(-dt * 7));
  return p.value;
}

// three.js stage: renderer + resize + a ticker loop. Returns a dispose function.
export async function createStage(host, { camera: makeCamera, setup, frame, alpha = true }) {
  const THREE = await import("three");
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const canvas = renderer.domElement;
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
  host.prepend(canvas);

  const scene = new THREE.Scene();
  const camera = makeCamera(THREE);
  const state = { THREE, renderer, scene, camera, width: 1, height: 1, time: 0, visible: true };
  const user = (await setup?.(state)) || {};

  const resize = () => {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    state.width = w;
    state.height = h;
    renderer.setSize(w, h, false);
    user.resize?.(w, h);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  // pause the loop while the canvas is off screen
  const io = new IntersectionObserver(([e]) => (state.visible = e.isIntersecting));
  io.observe(host);

  const tick = (time, delta) => {
    if (!state.visible) return;
    state.time = time;
    frame?.(state, user, delta / 1000);
    renderer.render(scene, camera);
  };
  gsap.ticker.add(tick);

  return () => {
    gsap.ticker.remove(tick);
    ro.disconnect();
    io.disconnect();
    user.dispose?.();
    scene.traverse((o) => {
      o.geometry?.dispose?.();
      const m = o.material;
      (Array.isArray(m) ? m : m ? [m] : []).forEach((x) => x.dispose());
    });
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  };
}

// mounts a stage while `near` is true, tears it down otherwise
export function useStage(hostRef, near, options, deps = []) {
  useEffect(() => {
    if (!near || !hostRef.current) return;
    let dispose = null;
    let cancelled = false;
    createStage(hostRef.current, options).then((d) => {
      if (cancelled) d();
      else dispose = d;
    });
    return () => {
      cancelled = true;
      dispose?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [near, ...deps]);
}

// project a 3D point to CSS pixels inside the canvas
export function toScreen(v, camera, w, h, out = {}) {
  const p = v.clone().project(camera);
  out.x = (p.x * 0.5 + 0.5) * w;
  out.y = (-p.y * 0.5 + 0.5) * h;
  out.behind = p.z > 1;
  return out;
}
