// The persistent WebGL stage: one particle system that lives behind every page and morphs
// between scenes (dunes, service icons, galaxy, orbit). Loaded lazily after first paint.
import {
  BufferAttribute,
  BufferGeometry,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Plane,
  Points,
  Raycaster,
  Scene,
  ShaderMaterial,
  Color,
  Sphere,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer,
} from "three";
import { gsap } from "../core/gsap.js";
import { getShape, TERRAIN } from "./shapes.js";
import noise from "./shaders/noise.glsl?raw";
import particlesVert from "./shaders/particles.vert.glsl?raw";
import particlesFrag from "./shaders/particles.frag.glsl?raw";
import moonFrag from "./shaders/moon.frag.glsl?raw";

const PULSES = 6;
const SPIN_3D = new Set(["orbit", "constellation"]);
const INK = new Color("#0d0d0d");

// where each object sits on screen: [x, y, z, scale]; text lives on the left on desktop
function layout(name, small) {
  if (name === "orbit") return small ? [0, 0.15, 0, 0.8] : [0, 0, 0, 1.2];
  if (name === "constellation") return small ? [0, 0.4, -1, 1.15] : [0.9, 0, -1.5, 1.7];
  return small ? [0, 1.05, 0, 0.6] : [2.35, 0.05, 0, 1];
}

function quality() {
  const small = Math.min(window.innerWidth, window.innerHeight) < 700 || window.matchMedia("(pointer: coarse)").matches;
  const mem = navigator.deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  if (small) return { count: 30000, dpr: Math.min(window.devicePixelRatio, 1.5), size: 22 };
  if (mem >= 8 && cores >= 8) return { count: 90000, dpr: Math.min(window.devicePixelRatio, 1.75), size: 18 };
  return { count: 60000, dpr: Math.min(window.devicePixelRatio, 1.5), size: 20 };
}

export function createStage(canvas, { reduced = false } = {}) {
  const q = quality();
  const N = q.count;
  let small = window.innerWidth <= 960;

  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(q.dpr);
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const scene = new Scene();
  const camera = new PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 80);
  camera.position.set(0, 0.25, 7);

  // ---------- particles ----------
  const geometry = new BufferGeometry();
  const aFrom = new BufferAttribute(new Float32Array(N * 3), 3);
  const aTo = new BufferAttribute(new Float32Array(N * 3), 3);
  const rand = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) {
    rand[i * 4] = Math.random() * 2 - 1;
    rand[i * 4 + 1] = Math.random() * 2 - 1;
    rand[i * 4 + 2] = Math.random() * 2 - 1;
    rand[i * 4 + 3] = Math.random();
  }
  geometry.setAttribute("position", aTo);
  geometry.setAttribute("aFrom", aFrom);
  geometry.setAttribute("aTo", aTo);
  geometry.setAttribute("aRand", new BufferAttribute(rand, 4));
  geometry.boundingSphere = new Sphere(new Vector3(), 40);

  const u = {
    uTime: { value: 0 },
    uMorph: { value: 1 },
    uChaos: { value: 0 },
    uScatter: { value: 0 },
    uFromSpin: { value: 0 },
    uToSpin: { value: 0 },
    uSize: { value: q.size },
    uPixelRatio: { value: renderer.getPixelRatio() },
    uFlow: { value: reduced ? 0 : 0.55 },
    uFromTerrain: { value: 0 },
    uToTerrain: { value: 0 },
    uFromXform: { value: new Vector4(0, 0, 0, 1) },
    uToXform: { value: new Vector4(0, 0, 0, 1) },
    uMouse: { value: new Vector3(99, 99, 99) },
    uMouseForce: { value: 0 },
    uPulsePos: { value: Array.from({ length: PULSES }, () => new Vector3()) },
    uPulseData: { value: Array.from({ length: PULSES }, () => new Vector2(-10, 0)) },
    uInk: { value: INK },
    uAlpha: { value: 0 },
  };

  const material = new ShaderMaterial({
    uniforms: u,
    vertexShader: particlesVert.replace("// include: noise", noise),
    fragmentShader: particlesFrag,
    transparent: true,
    depthWrite: false,
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  // ---------- moon ----------
  const moonU = { uInk: { value: INK }, uAlpha: { value: 0 }, uTime: u.uTime };
  const moon = new Mesh(
    new PlaneGeometry(9, 9),
    new ShaderMaterial({
      uniforms: moonU,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: moonFrag,
      transparent: true,
      depthWrite: false,
    }),
  );
  moon.renderOrder = -1;
  scene.add(moon);
  const placeMoon = () => (small ? moon.position.set(1.3, 3.4, -16) : moon.position.set(4.4, 4.6, -16));
  placeMoon();

  // ---------- morphing ----------
  let fromName = null;
  let toName = null;
  let morphTween = null;
  let alphaTarget = 0;
  let dim = 1;
  const burst = { value: 0 }; // extra turbulence that masks an interrupted morph

  const setXform = (vec, name) => vec.set(...layout(name, small));
  const write = (attr, name) => {
    attr.array.set(getShape(name, N));
    attr.needsUpdate = true;
  };

  function morphTo(name, { duration = 2, instant = reduced } = {}) {
    if (name === toName) return;
    if (!toName || instant) {
      write(aFrom, name);
      write(aTo, name);
      fromName = toName = name;
      u.uFromTerrain.value = u.uToTerrain.value = TERRAIN.has(name) ? 1 : 0;
      setXform(u.uFromXform.value, name);
      setXform(u.uToXform.value, name);
      u.uMorph.value = 1;
      return;
    }
    const m = u.uMorph.value;
    const interrupted = morphTween?.isActive();
    if (interrupted && m < 0.5) {
      // still early in the trip: just change the destination
      write(aTo, name);
    } else {
      // promote the current destination to the new origin
      aFrom.array.set(aTo.array);
      aFrom.needsUpdate = true;
      fromName = toName;
      u.uFromTerrain.value = u.uToTerrain.value;
      u.uFromXform.value.copy(u.uToXform.value);
      write(aTo, name);
      u.uMorph.value = 0;
    }
    toName = name;
    u.uToTerrain.value = TERRAIN.has(name) ? 1 : 0;
    setXform(u.uToXform.value, name);
    morphTween?.kill();
    morphTween = gsap.to(u.uMorph, { value: 1, duration, ease: "power2.inOut" });
    if (interrupted) gsap.fromTo(burst, { value: 0.55 }, { value: 0, duration: 1.4, ease: "power2.out", overwrite: true });
  }

  function relayout() {
    const next = window.innerWidth <= 960;
    if (next === small) return;
    small = next;
    if (fromName) setXform(u.uFromXform.value, fromName);
    if (toName) setXform(u.uToXform.value, toName);
    placeMoon();
  }

  // ---------- pointer: repulsion + howl rings ----------
  const ray = new Raycaster();
  const ground = new Plane(new Vector3(0, 1, 0), 1.2);
  const front = new Plane(new Vector3(0, 0, 1), 0);
  const ndc = new Vector2();
  const hit = new Vector3();
  const pointer = { x: 0, y: 0, sx: 0, sy: 0, active: false };
  let pulseIndex = 0;

  function project(x, y, out) {
    ndc.set(x, y);
    ray.setFromCamera(ndc, camera);
    const terrain = u.uToTerrain.value > 0.5;
    return ray.ray.intersectPlane(terrain ? ground : front, out);
  }

  function setPointer(x, y) {
    pointer.x = x;
    pointer.y = y;
    pointer.active = true;
  }

  function pulse(x, y, strength = 1) {
    if (reduced || !project(x, y, hit)) return;
    u.uPulsePos.value[pulseIndex].copy(hit);
    u.uPulseData.value[pulseIndex].set(u.uTime.value, strength);
    pulseIndex = (pulseIndex + 1) % PULSES;
  }

  // ---------- hover focus ----------
  let following = false;
  const followAt = new Vector3();
  function focus(name) {
    const fresh = !following;
    following = true;
    morphTo(name, { duration: 1.2 });
    // start at the pointer rather than flying in from the section layout
    if (fresh && project(pointer.x, pointer.y, hit)) u.uToXform.value.set(hit.x + (small ? 0 : 1.15), hit.y - 0.1, 0.4, 0.48);
  }
  function unfocus() {
    following = false;
  }

  // ---------- visibility ----------
  function setAlpha(value, duration = 1.2) {
    alphaTarget = value;
    gsap.to(u.uAlpha, { value: value * dim * (small ? 0.65 : 1), duration, ease: "power2.out", overwrite: true });
  }
  function setDim(value) {
    dim = value;
    setAlpha(alphaTarget);
  }
  function scatter(value, duration = 0.9) {
    return gsap.to(u.uScatter, { value, duration, ease: value ? "power3.in" : "power3.out", overwrite: true });
  }

  // ---------- loop ----------
  let velocity = 0;
  let stir = 0;
  let frames = 0;
  let slow = 0;
  let downgraded = false;
  let last = performance.now();

  function render() {
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (!reduced) u.uTime.value += dt;

    // adapt once if the device struggles (sampled after warm-up)
    frames++;
    if (!downgraded && frames > 90 && frames < 300) {
      if (dt > 0.024) slow++;
      if (slow > 60) {
        downgraded = true;
        renderer.setPixelRatio(1);
        u.uPixelRatio.value = 1;
        geometry.setDrawRange(0, Math.floor(N * 0.6));
      }
    }

    // pointer smoothing and camera parallax
    pointer.sx += (pointer.x - pointer.sx) * 0.06;
    pointer.sy += (pointer.y - pointer.sy) * 0.06;
    camera.position.x = pointer.sx * 0.45;
    camera.position.y = 0.25 + pointer.sy * 0.22;
    camera.lookAt(0, -0.15, 0);
    if (pointer.active && !reduced && project(pointer.x, pointer.y, hit)) {
      u.uMouse.value.lerp(hit, 0.2);
      u.uMouseForce.value += (1 - u.uMouseForce.value) * 0.05;
    }

    // hover focus: the current shape shrinks and trails just beside the pointer
    if (following && project(pointer.x, pointer.y, hit)) {
      followAt.set(hit.x + (small ? 0 : 1.15), hit.y - 0.1, 0.4);
      const xf = u.uToXform.value;
      xf.x += (followAt.x - xf.x) * 0.09;
      xf.y += (followAt.y - xf.y) * 0.09;
      xf.z += (followAt.z - xf.z) * 0.09;
      xf.w += (0.48 - xf.w) * 0.09;
    }

    // 3D shapes turn slowly; flat icons only sway, so they never go edge-on or mirrored
    const t = u.uTime.value;
    const turn = t * 0.14;
    const sway = Math.sin(t * 0.35) * 0.3 + pointer.sx * 0.35;
    u.uFromSpin.value = SPIN_3D.has(fromName) ? turn : sway;
    u.uToSpin.value = SPIN_3D.has(toName) ? turn : sway;

    // fast scrolling stirs the particles
    stir += (Math.min(Math.abs(velocity) / 90, 0.35) - stir) * 0.06;
    u.uChaos.value = stir + burst.value;

    const terrain = u.uFromTerrain.value + (u.uToTerrain.value - u.uFromTerrain.value) * u.uMorph.value;
    moonU.uAlpha.value = terrain * u.uAlpha.value;
    moon.visible = moonU.uAlpha.value > 0.002;

    if (u.uAlpha.value > 0.001 || canvas.dataset.dirty !== "0") {
      renderer.render(scene, camera);
      canvas.dataset.dirty = u.uAlpha.value > 0.001 ? "1" : "0";
    }
  }

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 52 : 40;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    relayout();
  }

  gsap.ticker.add(render);
  window.addEventListener("resize", resize);
  canvas.classList.add("is-live");

  return {
    morphTo,
    focus,
    unfocus,
    pulse,
    setPointer,
    setAlpha,
    setDim,
    scatter,
    setVelocity: (v) => (velocity = v),
    get shape() {
      return toName;
    },
  };
}
