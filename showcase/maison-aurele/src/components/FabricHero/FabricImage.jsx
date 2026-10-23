"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Cover-fit image whose surface ripples like fabric around the pointer.
// uReveal unveils the image from the bottom with a soft wavy hem.
const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform vec2 uRes;
  uniform vec2 uImg;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uTime;
  uniform float uReveal;
  uniform float uZoom;
  varying vec2 vUv;

  vec2 cover(vec2 uv) {
    float rs = uRes.x / uRes.y;
    float ri = uImg.x / uImg.y;
    vec2 scale = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
    return (uv - 0.5) * scale / uZoom + 0.5;
  }

  void main() {
    vec2 uv = vUv;
    vec2 aspect = vec2(uRes.x / uRes.y, 1.0);

    // Pointer bulge + travelling folds
    float d = distance(uv * aspect, uMouse * aspect);
    float bulge = smoothstep(0.45, 0.0, d) * uHover;
    float folds = sin(uv.y * 14.0 + uTime * 1.2 + uv.x * 3.0) * 0.004;
    folds += sin(uv.x * 9.0 - uTime * 0.8) * 0.003;
    vec2 dir = normalize(uv - uMouse + 0.0001);
    vec2 offset = dir * bulge * 0.045 + vec2(folds, folds * 0.6) * (0.4 + uHover);

    vec2 st = cover(uv + offset);
    float shift = bulge * 0.006;
    vec3 col;
    col.r = texture2D(uTex, st + vec2(shift, 0.0)).r;
    col.g = texture2D(uTex, st).g;
    col.b = texture2D(uTex, st - vec2(shift, 0.0)).b;

    // Soft gold sheen following the folds
    float sheen = smoothstep(0.6, 1.0, sin((uv.x + uv.y) * 6.0 - uTime * 0.6 + bulge * 6.0)) * 0.06;
    col += vec3(0.86, 0.75, 0.54) * sheen * (0.3 + uHover);

    // Wavy hem reveal from the bottom
    float hem = 1.0 - uReveal * 1.15 + sin(uv.x * 10.0 + uTime) * 0.025 * (1.0 - uReveal);
    float alpha = smoothstep(hem, hem + 0.02, 1.0 - uv.y);
    gl_FragColor = vec4(col, alpha);
  }
`;

// `controlRef.current.set({ reveal, zoom })` lets a parent timeline drive the
// shader (and the <img> fallback) without re-rendering React every frame.
export default function FabricImage({ src, alt = "", className = "", reveal = 1, zoom = 1, controlRef, priority = false }) {
  const wrapRef = useRef(null);
  const uniformsRef = useRef(null);
  const [glReady, setGlReady] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!wrap || !fine || reduced || window.innerWidth < 768) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
    } catch {
      return;
    }

    let disposed = false;
    let raf = 0;
    let visible = true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.domElement.className = "fabric-canvas";
    wrap.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {
      uTex: { value: null },
      uRes: { value: new THREE.Vector2(1, 1) },
      uImg: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 },
      uTime: { value: 0 },
      uReveal: { value: controlRef?.current?.get().reveal ?? reveal },
      uZoom: { value: controlRef?.current?.get().zoom ?? zoom },
    };
    uniformsRef.current = uniforms;

    const material = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms, transparent: true });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    new THREE.TextureLoader().load(src, (texture) => {
      if (disposed) return texture.dispose();
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      uniforms.uTex.value = texture;
      uniforms.uImg.value.set(texture.image.width, texture.image.height);
      setGlReady(true);
    });

    const resize = () => {
      const { width, height } = wrap.getBoundingClientRect();
      renderer.setSize(width, height, false);
      uniforms.uRes.value.set(width, height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const target = { x: 0.5, y: 0.5, hover: 0 };
    const onMove = (e) => {
      const rect = wrap.getBoundingClientRect();
      target.x = (e.clientX - rect.left) / rect.width;
      target.y = 1 - (e.clientY - rect.top) / rect.height;
      target.hover = target.x >= 0 && target.x <= 1 && target.y >= 0 && target.y <= 1 ? 1 : 0;
    };
    window.addEventListener("pointermove", onMove);

    // Skip rendering while scrolled out of view (checked every 20 frames)
    const clock = new THREE.Clock();
    let frame = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (frame++ % 20 === 0) {
        const rect = wrap.getBoundingClientRect();
        visible = rect.bottom > 0 && rect.top < window.innerHeight;
      }
      if (!visible || !uniforms.uTex.value) return;
      uniforms.uTime.value = clock.getElapsedTime();
      uniforms.uMouse.value.x += (target.x - uniforms.uMouse.value.x) * 0.08;
      uniforms.uMouse.value.y += (target.y - uniforms.uMouse.value.y) * 0.08;
      uniforms.uHover.value += (target.hover - uniforms.uHover.value) * 0.06;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      uniforms.uTex.value?.dispose();
      material.dispose();
      mesh.geometry.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      uniformsRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    if (!controlRef) return;
    const state = { reveal, zoom };
    controlRef.current = {
      set(next) {
        Object.assign(state, next);
        const wrap = wrapRef.current;
        if (wrap) {
          wrap.style.setProperty("--reveal", state.reveal);
          wrap.style.setProperty("--zoom", state.zoom);
        }
        if (uniformsRef.current) {
          uniformsRef.current.uReveal.value = state.reveal;
          uniformsRef.current.uZoom.value = state.zoom;
        }
      },
      get: () => ({ ...state }),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlRef]);

  return (
    <div
      ref={wrapRef}
      className={`fabric ${glReady ? "is-gl" : ""} ${className}`}
      style={{ "--reveal": reveal, "--zoom": zoom }}
    >
      <img src={src} alt={alt} fetchPriority={priority ? "high" : undefined} />
    </div>
  );
}
