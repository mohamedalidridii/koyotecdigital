// WebGL scenes for the cloud pages, in the site's dither style: every particle is a square pixel
// snapped to a screen grid (same approach as components/Hypercube), drawn black and red on white.
// Scenes: "globe" (Tunis and the nearest AWS Regions, with travelling packets), "migration" (a server
// rack that dissolves wave by wave into a cloud as you scroll), "bridge" (Tunis and Paris linked over a
// dotted ground). Loaded on demand by CloudScene.jsx, so three.js only ships with the cloud pages.
import * as THREE from "three";

const INK = new THREE.Color("#0d0d0d");
const RED = new THREE.Color("#ff0000");
const GREY = new THREE.Color("#8c8c88");

const VERT = /* glsl */ `
  attribute vec3 posB;
  attribute vec3 aColor;
  attribute float aOffset;
  attribute float aKind;   // 0 dot, 1 packet trail, 2 pin
  attribute float aT;      // position along an arc, for packets
  uniform float uTime;
  uniform float uProgress;
  uniform float uPixel;
  uniform float uGrid;
  uniform float uDepthFade;
  uniform float uRadius;
  uniform vec2 uRes;
  uniform vec3 uRed;
  varying vec3 vColor;
  varying float vAlpha;

  float easeInOut(float x) { return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0; }

  void main() {
    // morph from position to posB; each particle leaves at its own time (aOffset), so the move happens in waves
    float p = easeInOut(clamp(uProgress * 1.7 - aOffset * 0.7, 0.0, 1.0));
    vec3 dir = vec3(sin(aOffset * 91.7 + 1.3), cos(aOffset * 57.3), sin(aOffset * 33.1 + 2.1));
    vec3 pos = mix(position, posB, p) + dir * sin(p * 3.14159) * 0.9;
    pos += dir * 0.012 * sin(uTime * 1.4 + aOffset * 40.0);

    vColor = aColor;
    vAlpha = 1.0;
    float size = uPixel;

    if (aKind > 0.5 && aKind < 1.5) {
      float head = fract(uTime * 0.22 + aOffset);
      float d = abs(aT - head);
      float glow = smoothstep(0.09, 0.0, d);
      vAlpha = 0.22 + glow * 0.78;
      vColor = mix(aColor, uRed, glow);
    } else if (aKind > 1.5) {
      size = uPixel * 2.4;
    }

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    if (uDepthFade > 0.5) {
      float zc = (modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).z;
      float facing = (mv.z - zc) / uRadius;
      vAlpha *= mix(0.08, 1.0, smoothstep(-0.25, 0.55, facing));
    }

    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / clip.w;
    vec2 screen = (ndc * 0.5 + 0.5) * uRes;
    screen = (floor(screen / uGrid) + 0.5) * uGrid;
    clip.xy = ((screen / uRes) * 2.0 - 1.0) * clip.w;
    gl_Position = clip;
    gl_PointSize = size;
  }
`;

const FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    if (vAlpha < 0.02) discard;
    gl_FragColor = vec4(vColor, vAlpha);
  }
`;

// accumulates particles, then builds one BufferGeometry
class Cloud {
  constructor() {
    this.a = [];
    this.b = [];
    this.c = [];
    this.o = [];
    this.k = [];
    this.t = [];
  }
  add(pa, pb = pa, color = INK, offset = Math.random(), kind = 0, t = 0) {
    this.a.push(pa.x, pa.y, pa.z);
    this.b.push(pb.x, pb.y, pb.z);
    this.c.push(color.r, color.g, color.b);
    this.o.push(offset);
    this.k.push(kind);
    this.t.push(t);
  }
  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.a, 3));
    g.setAttribute("posB", new THREE.Float32BufferAttribute(this.b, 3));
    g.setAttribute("aColor", new THREE.Float32BufferAttribute(this.c, 3));
    g.setAttribute("aOffset", new THREE.Float32BufferAttribute(this.o, 1));
    g.setAttribute("aKind", new THREE.Float32BufferAttribute(this.k, 1));
    g.setAttribute("aT", new THREE.Float32BufferAttribute(this.t, 1));
    return g;
  }
}

const rad = (d) => (d * Math.PI) / 180;
// lat/lon to a point on a sphere; lon 0, lat 0 faces +z (the camera)
const geo = (lat, lon, r) =>
  new THREE.Vector3(r * Math.cos(rad(lat)) * Math.sin(rad(lon)), r * Math.sin(rad(lat)), r * Math.cos(rad(lat)) * Math.cos(rad(lon)));

export const PLACES = {
  tunis: { lat: 36.81, lon: 10.18 },
  paris: { lat: 48.86, lon: 2.35 },
  frankfurt: { lat: 50.11, lon: 8.68 },
  bahrain: { lat: 26.07, lon: 50.56 },
  uae: { lat: 24.45, lon: 54.38 },
};

/* ---------- scene builders: each returns { object, update(time, state), labels: {id: Vector3}, radius, depthFade } ---------- */

function buildGlobe() {
  const R = 2.35;
  const pts = new Cloud();
  const N = 4200;
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    const v = new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r).multiplyScalar(R);
    pts.add(v, v, GREY, Math.random() * 0.2);
  }
  // latitude rings every 30 degrees, a little darker, for a sense of volume
  for (let lat = -60; lat <= 60; lat += 30) {
    for (let lon = 0; lon < 360; lon += 2.2) {
      const v = geo(lat, lon, R);
      pts.add(v, v, INK, Math.random() * 0.2);
    }
  }
  const labels = {};
  const from = geo(PLACES.tunis.lat, PLACES.tunis.lon, R);
  labels.tunis = from.clone().multiplyScalar(1.02);
  pts.add(from, from, RED, 0, 2);
  ["paris", "frankfurt", "bahrain", "uae"].forEach((id, arcIndex) => {
    const p = PLACES[id];
    const to = geo(p.lat, p.lon, R);
    labels[id] = to.clone().multiplyScalar(1.02);
    pts.add(to, to, INK, 0, 2);
    const steps = 140;
    const a = from.clone().normalize();
    const b = to.clone().normalize();
    const angle = a.angleTo(b);
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const v = new THREE.Vector3()
        .copy(a)
        .multiplyScalar(Math.sin((1 - t) * angle) / Math.sin(angle))
        .add(b.clone().multiplyScalar(Math.sin(t * angle) / Math.sin(angle)))
        .multiplyScalar(R * (1 + Math.sin(Math.PI * t) * (0.06 + angle * 0.35)));
      pts.add(v, v, INK, arcIndex * 0.27, 1, t);
    }
  });

  const mesh = new THREE.Points(pts.geometry());
  const group = new THREE.Group();
  group.add(mesh);
  // face the Mediterranean, between Tunis, Europe and the Gulf
  const base = { x: rad(37), y: -rad(27) };
  group.rotation.set(base.x, base.y, 0);

  return {
    object: group,
    mesh,
    labels,
    radius: R,
    depthFade: true,
    update(time, s) {
      const sway = Math.sin(time * 0.18) * rad(9);
      group.rotation.y += (base.y + sway + s.pointer.x * rad(18) - group.rotation.y) * 0.05;
      group.rotation.x += (base.x + s.pointer.y * rad(8) - group.rotation.x) * 0.05;
    },
  };
}

function buildMigration() {
  const pts = new Cloud();
  const W = 1.3, H = 2.3, D = 0.85;
  const units = 6;
  const rackPoints = [];
  // rack frame edges
  const corners = [];
  for (const x of [-W / 2, W / 2]) for (const y of [-H / 2, H / 2]) for (const z of [-D / 2, D / 2]) corners.push(new THREE.Vector3(x, y, z));
  const edges = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  edges.forEach(([i, j]) => {
    for (let s = 0; s <= 60; s++) rackPoints.push({ v: new THREE.Vector3().lerpVectors(corners[i], corners[j], s / 60), c: INK });
  });
  // six server units on the front face, each with slots and a red status light
  for (let u = 0; u < units; u++) {
    const y0 = H / 2 - (u + 0.5) * (H / units);
    for (let row = -1; row <= 1; row++) {
      for (let s = 0; s <= 50; s++) {
        const x = -W / 2 + 0.12 + (s / 50) * (W - 0.4);
        rackPoints.push({ v: new THREE.Vector3(x, y0 + row * 0.06, D / 2), c: row === 0 ? INK : GREY, u });
      }
    }
    for (let l = 0; l < 3; l++) rackPoints.push({ v: new THREE.Vector3(W / 2 - 0.14 + l * 0.04, y0, D / 2), c: RED, u });
    // a few points inside the unit, so it has depth
    for (let s = 0; s < 120; s++) {
      rackPoints.push({
        v: new THREE.Vector3((Math.random() - 0.5) * W * 0.9, y0 + (Math.random() - 0.5) * (H / units) * 0.7, (Math.random() - 0.5) * D * 0.9),
        c: GREY,
        u,
      });
    }
  }
  // the cloud: a union of puffs, sampled on its surface, with a flat base
  const puffs = [
    [0, 0.15, 0, 0.95], [-0.95, -0.15, 0.1, 0.7], [0.95, -0.12, -0.05, 0.75], [-0.4, 0.55, -0.1, 0.62], [0.45, 0.5, 0.1, 0.6], [1.55, -0.32, 0, 0.45], [-1.5, -0.35, 0, 0.42],
  ];
  const inside = (v, skip) => puffs.some((p, i) => i !== skip && v.distanceTo(new THREE.Vector3(p[0], p[1], p[2])) < p[3] * 0.995);
  const cloudSurface = () => {
    for (;;) {
      const i = Math.floor(Math.random() * puffs.length);
      const p = puffs[i];
      const u = Math.random() * 2 - 1;
      const th = Math.random() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      const v = new THREE.Vector3(p[0] + r * Math.cos(th) * p[3], p[1] + u * p[3], p[2] + r * Math.sin(th) * p[3] * 0.8);
      if (v.y < -0.62) continue;
      if (!inside(v, i)) return v;
    }
  };
  rackPoints.forEach((p, i) => {
    const target = cloudSurface().multiplyScalar(1.05).add(new THREE.Vector3(0, 0.15, 0));
    // the top unit moves first, then the next: a migration in waves
    const wave = p.u === undefined ? Math.random() : p.u / units;
    pts.add(p.v, target, p.c, Math.min(1, wave * 0.85 + Math.random() * 0.15), p.c === RED ? 2 : 0);
    if (i % 3 === 0) {
      // the cloud is denser than the rack: extra particles that appear from the rack's centre
      pts.add(new THREE.Vector3(0, 0, 0), cloudSurface().multiplyScalar(1.05).add(new THREE.Vector3(0, 0.15, 0)), GREY, 0.6 + Math.random() * 0.4);
    }
  });
  const mesh = new THREE.Points(pts.geometry());
  const group = new THREE.Group();
  group.add(mesh);
  group.rotation.set(rad(8), -rad(28), 0);
  return {
    object: group,
    mesh,
    labels: {},
    radius: 2,
    depthFade: false,
    morph: true,
    update(time, s) {
      group.rotation.y += (-rad(28) + Math.sin(time * 0.25) * rad(10) + s.pointer.x * rad(12) - group.rotation.y) * 0.05;
      group.rotation.x += (rad(8) + s.pointer.y * rad(6) - group.rotation.x) * 0.05;
    },
  };
}

function buildBridge() {
  const pts = new Cloud();
  // dotted ground
  for (let x = -3.2; x <= 3.2; x += 0.13) {
    for (let z = -2.4; z <= 2.4; z += 0.13) {
      const v = new THREE.Vector3(x, 0, z);
      pts.add(v, v, GREY, Math.random() * 0.2);
    }
  }
  const paris = new THREE.Vector3(-1.1, 0, -1.25);
  const tunis = new THREE.Vector3(1.0, 0, 1.15);
  // two small skylines of points: Paris in ink, Tunis in red
  const city = (center, color, seed) => {
    for (let b = 0; b < 9; b++) {
      const bx = center.x + ((b % 3) - 1) * 0.22 + Math.sin(seed + b) * 0.03;
      const bz = center.z + (Math.floor(b / 3) - 1) * 0.22;
      const h = 0.25 + ((Math.sin(seed * 3 + b * 1.7) + 1) / 2) * 0.75;
      for (let y = 0; y <= h; y += 0.05) {
        for (const [dx, dz] of [[-0.06, -0.06], [0.06, -0.06], [-0.06, 0.06], [0.06, 0.06]]) {
          const v = new THREE.Vector3(bx + dx, y, bz + dz);
          pts.add(v, v, color, Math.random() * 0.2);
        }
      }
    }
  };
  city(paris, INK, 1);
  city(tunis, RED, 4);
  // two arcs, one each way, carrying packets
  const arc = (a, b, offset) => {
    for (let s = 0; s <= 160; s++) {
      const t = s / 160;
      const v = new THREE.Vector3().lerpVectors(a, b, t);
      v.y = 1.05 + Math.sin(Math.PI * t) * 0.7;
      pts.add(v, v, INK, offset, 1, t);
    }
  };
  arc(tunis, paris, 0);
  arc(paris.clone().add(new THREE.Vector3(0.15, 0, 0.1)), tunis.clone().add(new THREE.Vector3(0.15, 0, 0.1)), 0.5);
  const mesh = new THREE.Points(pts.geometry());
  const group = new THREE.Group();
  group.add(mesh);
  group.rotation.set(rad(28), -rad(18), 0);
  return {
    object: group,
    mesh,
    labels: { paris: paris.clone().add(new THREE.Vector3(0, 1.1, 0)), tunis: tunis.clone().add(new THREE.Vector3(0, 1.1, 0)) },
    radius: 3,
    depthFade: false,
    update(time, s) {
      group.rotation.y += (-rad(18) + Math.sin(time * 0.2) * rad(6) + s.pointer.x * rad(10) - group.rotation.y) * 0.05;
      group.rotation.x += (rad(28) + s.pointer.y * rad(5) - group.rotation.x) * 0.05;
    },
  };
}

const BUILDERS = { globe: buildGlobe, migration: buildMigration, bridge: buildBridge };

/**
 * Mounts a scene in `container`.
 * @param {{ scene: string, labels?: Record<string, HTMLElement>, getProgress?: () => number, still?: boolean }} opts
 * @returns {{ setActive(on: boolean): void, destroy(): void }}
 */
export function mountScene(container, { scene, labels = {}, getProgress, still = false }) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "low-power" });
  renderer.setClearColor(0xffffff, 0);
  renderer.setPixelRatio(dpr);
  container.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");

  const camera = new THREE.PerspectiveCamera(scene === "bridge" ? 38 : 40, 1, 0.1, 100);
  camera.position.set(0, scene === "bridge" ? 0.6 : 0, { bridge: 8.2, globe: 7.6, migration: 6.4 }[scene] ?? 6);
  if (scene === "bridge") camera.lookAt(0, 0.9, 0);

  const built = (BUILDERS[scene] || buildGlobe)();
  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uPixel: { value: 3 * dpr },
      uGrid: { value: 3 * dpr },
      uDepthFade: { value: built.depthFade ? 1 : 0 },
      uRadius: { value: built.radius },
      uRes: { value: new THREE.Vector2(1, 1) },
      uRed: { value: RED },
    },
  });
  built.mesh.material = material;
  const world = new THREE.Scene();
  world.add(built.object);

  const state = { pointer: { x: 0, y: 0 }, progress: 0 };
  const onPointer = (e) => {
    state.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    state.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  const resize = () => {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    camera.aspect = w / h;
    // keep the whole scene in frame on narrow screens
    camera.zoom = w / h < 0.8 ? 0.72 : 1;
    camera.updateProjectionMatrix();
    material.uniforms.uRes.value.set(w * dpr, h * dpr);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  const tmp = new THREE.Vector3();
  const placeLabels = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    for (const [id, el] of Object.entries(labels)) {
      const anchor = built.labels[id];
      if (!el || !anchor) continue;
      tmp.copy(anchor).applyMatrix4(built.mesh.matrixWorld);
      const facing = built.depthFade ? tmp.clone().sub(new THREE.Vector3().setFromMatrixPosition(built.mesh.matrixWorld)).dot(camera.position.clone().normalize()) : 1;
      tmp.project(camera);
      el.style.transform = `translate3d(${((tmp.x + 1) / 2) * w}px, ${((1 - tmp.y) / 2) * h}px, 0)${el.dataset.side === "left" ? " translateX(-100%)" : ""}`;
      el.style.opacity = facing > 0.15 ? "1" : "0";
    }
  };

  let raf = 0;
  let active = false;
  const clock = new THREE.Clock();
  const frame = () => {
    const time = clock.getElapsedTime();
    material.uniforms.uTime.value = time;
    if (built.morph && getProgress) {
      state.progress = still ? getProgress() : state.progress + (getProgress() - state.progress) * 0.08;
      material.uniforms.uProgress.value = state.progress;
    }
    built.update(time, state);
    renderer.render(world, camera);
    placeLabels();
    if (active && !still) raf = requestAnimationFrame(frame);
  };

  const api = {
    setActive(on) {
      if (on === active) return;
      active = on;
      cancelAnimationFrame(raf);
      if (on || still) raf = requestAnimationFrame(frame);
    },
    destroy() {
      active = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      built.mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
  // a still frame for reduced motion, otherwise the loop starts when the scene is on screen
  if (still) requestAnimationFrame(frame);
  return api;
}
