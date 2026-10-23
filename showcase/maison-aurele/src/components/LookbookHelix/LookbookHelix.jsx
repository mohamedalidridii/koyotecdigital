"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

// Planes billow like fabric when the carousel spins
const vertex = /* glsl */ `
  uniform float uVelocity;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z += sin(uv.y * 3.14159) * uVelocity * 0.55;
    p.y += sin(uv.x * 3.14159) * uVelocity * 0.12;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

// Focused look in full colour with a gold hairline; the others turn sepia
// and sink into the velvet black as they rotate away.
const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform vec2 uImg;
  uniform vec2 uPlane;
  uniform float uFacing;
  uniform float uFocus;
  uniform float uVelocity;
  uniform float uLoaded;
  varying vec2 vUv;

  vec2 cover(vec2 uv) {
    float rp = uPlane.x / uPlane.y;
    float ri = uImg.x / uImg.y;
    vec2 s = rp > ri ? vec2(1.0, ri / rp) : vec2(rp / ri, 1.0);
    return (uv - 0.5) * s + 0.5;
  }

  void main() {
    vec2 uv = cover(vUv);
    float shift = uVelocity * 0.018;
    vec3 col = vec3(
      texture2D(uTex, uv + vec2(shift, 0.0)).r,
      texture2D(uTex, uv).g,
      texture2D(uTex, uv - vec2(shift, 0.0)).b
    );

    float gray = dot(col, vec3(0.299, 0.587, 0.114));
    vec3 sepia = vec3(gray) * vec3(1.07, 0.96, 0.8);
    col = mix(sepia * 0.8, col, uFocus);

    float vig = smoothstep(0.0, 0.22, vUv.x) * smoothstep(1.0, 0.78, vUv.x)
              * smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.82, vUv.y);
    col *= mix(0.72, 1.0, vig);

    float light = smoothstep(-0.25, 1.0, uFacing);
    col = mix(vec3(0.106, 0.094, 0.082), col, light * uLoaded);

    float ex = 0.012;
    float ey = ex * 0.66;
    float border = step(vUv.x, ex) + step(1.0 - ex, vUv.x) + step(vUv.y, ey) + step(1.0 - ey, vUv.y);
    col = mix(col, vec3(0.86, 0.75, 0.54), clamp(border, 0.0, 1.0) * uFocus);

    gl_FragColor = vec4(col, 1.0);
  }
`;

// Spiral staircase of curved image planes. Wheel, drag, arrow keys or
// `jumpRef.current(index)` turn it; clicking the front look selects it.
// While `paused` (lightbox open) it ignores input and stops rendering.
export default function LookbookHelix({ images, onSelect, onChange, jumpRef, paused = false }) {
  const ref = useRef(null);
  const callbacks = useRef({ onSelect, onChange });
  callbacks.current = { onSelect, onChange };
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const el = ref.current;
    if (!el || !images.length) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const mobile = window.innerWidth < 768;
    const R = mobile ? 2.6 : 4.2;
    const W = mobile ? 1.25 : 1.75;
    const H = W * 1.5;
    const STEP = (Math.PI * 2) / (mobile ? 7 : 9);
    const RISE = H * 0.3;
    const MAX = (images.length - 1) * STEP;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, R + (mobile ? 7 : 7.2));

    const tilt = new THREE.Group();
    tilt.rotation.x = 0.1;
    const helix = new THREE.Group();
    tilt.add(helix);
    scene.add(tilt);

    // One curved plane hugging the cylinder, shared by every look
    const geometry = new THREE.PlaneGeometry(W, H, 48, 1);
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const a = pos.getX(i) / R;
      pos.setX(i, R * Math.sin(a));
      pos.setZ(i, R * Math.cos(a) - R);
    }
    pos.needsUpdate = true;

    let disposed = false;
    const loader = new THREE.ImageLoader();
    // Phones run out of GPU memory with two dozen 2048px textures, which
    // blanks the rest of the page: downscale them first
    const MAX_TEX = mobile ? 1024 : 2048;
    const shrink = (image) => {
      const scale = MAX_TEX / Math.max(image.width, image.height);
      if (scale >= 1) return image;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas;
    };
    const meshes = images.map((src, i) => {
      const uniforms = {
        uTex: { value: null },
        uImg: { value: new THREE.Vector2(2, 3) },
        uPlane: { value: new THREE.Vector2(W, H) },
        uFacing: { value: 1 },
        uFocus: { value: 0 },
        uVelocity: { value: 0 },
        uLoaded: { value: 0 },
      };
      const material = new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geometry, material);
      const theta = i * STEP;
      mesh.position.set(R * Math.sin(theta), -i * RISE, R * Math.cos(theta));
      mesh.rotation.y = theta;
      mesh.userData = { index: i, theta, uniforms, loaded: false };
      helix.add(mesh);

      loader.load(src, (image) => {
        if (disposed) return;
        const texture = new THREE.Texture(shrink(image));
        texture.needsUpdate = true;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        uniforms.uTex.value = texture;
        uniforms.uImg.value.set(image.width, image.height);
        mesh.userData.loaded = true;
      });
      return mesh;
    });

    // ---------- Input ----------
    let target = 0;
    let current = 0;
    let velocity = 0;
    let idle;
    const clamp = (v) => Math.min(MAX, Math.max(0, v));
    const snap = () => (target = Math.round(target / STEP) * STEP);
    const nudge = (delta) => {
      target = clamp(target + delta);
      clearTimeout(idle);
      idle = setTimeout(snap, 160);
    };
    const goTo = (index) => (target = clamp(index * STEP));
    if (jumpRef) jumpRef.current = goTo;

    const onWheel = (e) => {
      e.preventDefault();
      if (pausedRef.current) return;
      nudge((e.deltaY + e.deltaX) * 0.0016);
    };

    const pointer = { down: false, x: 0, y: 0, startX: 0, startY: 0 };
    const mouse = { x: 0, y: 0 };
    const onDown = (e) => {
      if (pausedRef.current) return;
      Object.assign(pointer, { down: true, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY });
      el.classList.add("is-dragging");
    };
    const onMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
      if (!pointer.down) return;
      const dx = e.clientX - pointer.x;
      const dy = e.clientY - pointer.y;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      nudge(-(dx + dy * 0.6) * (mobile ? 0.01 : 0.006));
    };

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const onUp = (e) => {
      if (!pointer.down) return;
      pointer.down = false;
      el.classList.remove("is-dragging");
      if (Math.hypot(e.clientX - pointer.startX, e.clientY - pointer.startY) > 6) return;
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      // Only planes turned towards the viewer are clickable
      const hit = raycaster
        .intersectObjects(meshes)
        .find((h) => h.object.userData.uniforms.uFacing.value > 0.2);
      if (!hit) return;
      const index = hit.object.userData.index;
      if (index === Math.round(current / STEP)) callbacks.current.onSelect?.(index);
      else goTo(index);
    };

    const onKey = (e) => {
      if (pausedRef.current) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goTo(Math.round(target / STEP) + 1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goTo(Math.round(target / STEP) - 1);
      if (e.key === "Enter") callbacks.current.onSelect?.(Math.round(current / STEP));
    };

    // A tap opens the lightbox on pointerup; the click the browser synthesises
    // afterwards would land on the lightbox veil and close it again
    const onTouchEnd = (e) => e.preventDefault();

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: false });
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("keydown", onKey);

    const resize = () => {
      const { width, height } = el.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // ---------- Loop ----------
    let raf = 0;
    let lastIndex = -1;
    let then = performance.now();
    const tick = (now = performance.now()) => {
      raf = requestAnimationFrame(tick);
      if (pausedRef.current) {
        then = now;
        return;
      }
      // Frame-rate independent easing: `k` is the per-frame factor at 60fps
      const dt = Math.min((now - then) / (1000 / 60), 4);
      then = now;
      const ease = (k) => 1 - Math.pow(1 - k, dt);
      current += (target - current) * ease(0.075);
      velocity += (target - current - velocity) * ease(0.18);
      const v = Math.max(-1, Math.min(1, velocity * 3));

      helix.rotation.y = -current;
      helix.position.y = (current / STEP) * RISE;
      tilt.rotation.z = -0.05 + v * 0.04;

      camera.position.x += (mouse.x * 0.5 - camera.position.x) * ease(0.05);
      camera.position.y += (-mouse.y * 0.3 - camera.position.y) * ease(0.05);
      camera.lookAt(0, 0, 0);

      const front = current / STEP;
      for (const mesh of meshes) {
        const u = mesh.userData.uniforms;
        u.uFacing.value = Math.cos(mesh.userData.theta - current);
        u.uFocus.value += ((Math.abs(mesh.userData.index - front) < 0.5 ? 1 : 0) - u.uFocus.value) * ease(0.08);
        u.uVelocity.value = v;
        if (mesh.userData.loaded) u.uLoaded.value += (1 - u.uLoaded.value) * ease(0.05);
      }

      const index = Math.round(front);
      if (index !== lastIndex) {
        lastIndex = index;
        callbacks.current.onChange?.(index);
      }
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      clearTimeout(idle);
      ro.disconnect();
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("keydown", onKey);
      meshes.forEach((mesh) => {
        mesh.userData.uniforms.uTex.value?.dispose();
        mesh.material.dispose();
      });
      geometry.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      if (jumpRef) jumpRef.current = null;
    };
  }, [images, jumpRef]);

  return <div className="lb-helix" ref={ref} />;
}
