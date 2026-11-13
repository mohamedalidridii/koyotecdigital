// The projects mesh (/projets): a living surface of points and lines, with every showcase piece
// as a node riding on it. Nodes are joined by arcs that hug the surface, and small packets of
// light travel along them. Hovering a node swells the surface under it and tints it with the
// project's accent; the page (sections/mesh.js) names the project and shows its preview.
// The surface displacement exists twice, in GLSL and in JS (surf), so the nodes and arcs, placed
// on the CPU, sit exactly on the surface drawn on the GPU.
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { gsap } from "../core/gsap.js";

const R = 2; // surface radius
const DETAIL = 14; // icosphere subdivisions (linear in three.js: about 2,200 vertices)
const LINKS = 3; // arcs from each node to its nearest neighbours
const ARC_STEPS = 18;
const PACKETS = 26;
const CREAM = new THREE.Color("#f3f1ec");

// ---- the shared displacement: a slow interference of three sine fields, plus the hover swell ----
const GLSL_SURF = /* glsl */ `
  uniform float uTime;
  uniform float uHover;
  uniform vec3 uHoverDir;
  uniform float uIntro;
  uniform float uScatter;
  float wave(vec3 p, float t) {
    return sin(2.6 * p.x + t * 0.6) * sin(2.2 * p.y + t * 0.5 + 1.3) * sin(2.4 * p.z + t * 0.4 + 2.1);
  }
  float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
  vec3 surf(vec3 d) {
    float w = 0.085 * wave(d, uTime) + 0.035 * wave(d * 2.3 + 1.7, uTime * 1.3);
    float dist = distance(d, uHoverDir);
    float h = exp(-dist * dist * 9.0) * uHover;
    return d * ${R.toFixed(1)} * (1.0 + w + 0.17 * h);
  }
  // hover glow around the swollen area
  float glow(vec3 d) { float dist = distance(d, uHoverDir); return exp(-dist * dist * 12.0) * uHover; }
  // intro: every vertex flies in from a scattered shell, each with its own delay
  vec3 intro(vec3 d, vec3 p) {
    float r = hash(d);
    float k = smoothstep(r * 0.55, r * 0.55 + 0.45, uIntro);
    vec3 far = d * ${R.toFixed(1)} * (2.6 + r * 2.4);
    // scrolling away: the surface dissolves outwards, each vertex at its own pace
    float s = smoothstep(r * 0.5, r * 0.5 + 0.5, uScatter);
    vec3 drift = d * ${R.toFixed(1)} * (1.6 + r * 3.2) + vec3(0.0, r * 1.5, 0.0);
    return mix(mix(far, p, k), drift, s);
  }
`;

const wave = (x, y, z, t) => Math.sin(2.6 * x + t * 0.6) * Math.sin(2.2 * y + t * 0.5 + 1.3) * Math.sin(2.4 * z + t * 0.4 + 2.1);
function surf(d, t, hover, hDir, out) {
  const w = 0.085 * wave(d.x, d.y, d.z, t) + 0.035 * wave(d.x * 2.3 + 1.7, d.y * 2.3 + 1.7, d.z * 2.3 + 1.7, t * 1.3);
  const dist = d.distanceTo(hDir);
  const h = Math.exp(-dist * dist * 9) * hover;
  return out.copy(d).multiplyScalar(R * (1 + w + 0.17 * h));
}

// even spread of n directions on the sphere (golden-angle spiral)
function fibonacci(n) {
  const dirs = [];
  const ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - ((i + 0.5) / n) * 2;
    const r = Math.sqrt(1 - y * y);
    dirs.push(new THREE.Vector3(Math.cos(ga * i) * r, y, Math.sin(ga * i) * r));
  }
  return dirs;
}

// accents can be very dark: lift them so they read on the night background
function lift(hex) {
  const c = new THREE.Color(hex);
  const hsl = {};
  c.getHSL(hsl);
  if (hsl.l < 0.55) c.setHSL(hsl.h, Math.max(hsl.s, hsl.s > 0.15 ? 0.6 : 0), 0.62);
  return c;
}

export function createProjectMesh(canvas, { items, reduced = false, onHover = () => {}, onPick = () => {} }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 9);
  const root = new THREE.Group();
  scene.add(root);

  const N = items.length;
  const colors = items.map((it) => lift(it.accent));
  const uniforms = {
    uTime: { value: 0 },
    uHover: { value: 0 },
    uHoverDir: { value: new THREE.Vector3(0, 0, 1) },
    uIntro: { value: reduced ? 1 : 0 },
    uScatter: { value: 0 },
    uAccent: { value: colors[0].clone() },
    uCream: { value: CREAM.clone() },
    uDpr: { value: 1 },
  };

  // ---- the surface: points + wireframe of one icosphere, displaced in the vertex shader ----
  // positions are unit directions; merged so shared vertices and edges are drawn once
  const raw = new THREE.IcosahedronGeometry(1, DETAIL);
  raw.deleteAttribute("normal");
  raw.deleteAttribute("uv");
  const ico = mergeVertices(raw);
  raw.dispose();
  const pointsGeo = ico;
  const surfVert = /* glsl */ `
    ${GLSL_SURF}
    uniform float uDpr;
    varying float vFace;
    varying float vGlow;
    void main() {
      vec3 d = normalize(position);
      vec3 p = intro(d, surf(d));
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      vFace = (normalize(mat3(modelViewMatrix) * d)).z;
      vGlow = glow(d);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = (1.6 + vGlow * 2.6) * uDpr * (9.0 / -mv.z);
    }
  `;
  const surfFragPoints = /* glsl */ `
    uniform vec3 uAccent;
    uniform vec3 uCream;
    varying float vFace;
    varying float vGlow;
    void main() {
      vec2 c = gl_PointCoord - 0.5;
      if (dot(c, c) > 0.25) discard;
      float a = mix(0.05, 0.55, smoothstep(-0.35, 0.7, vFace)) + vGlow * 0.6;
      gl_FragColor = vec4(mix(uCream, uAccent, min(vGlow * 1.4, 1.0)), a);
    }
  `;
  const surfFragLines = /* glsl */ `
    uniform float uScatter;
    uniform vec3 uAccent;
    uniform vec3 uCream;
    varying float vFace;
    varying float vGlow;
    void main() {
      float a = (mix(0.012, 0.11, smoothstep(-0.35, 0.75, vFace)) + vGlow * 0.42) * (1.0 - uScatter * 0.9);
      gl_FragColor = vec4(mix(uCream, uAccent, min(vGlow * 1.6, 1.0)), a);
    }
  `;
  const surfMat = (frag) =>
    new THREE.ShaderMaterial({ uniforms, vertexShader: surfVert, fragmentShader: frag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const points = new THREE.Points(pointsGeo, surfMat(surfFragPoints));
  const wire = new THREE.LineSegments(new THREE.WireframeGeometry(ico), surfMat(surfFragLines));
  root.add(wire, points);

  // ---- the project nodes ----
  const dirs = fibonacci(N);
  const nodePos = new Float32Array(N * 3);
  const nodeCol = new Float32Array(N * 3);
  const nodeState = new Float32Array(N); // 0 idle, 1 hovered
  const nodeDim = new Float32Array(N); // 0 visible, 1 filtered out
  const dimTarget = new Float32Array(N);
  const nodeIn = new Float32Array(N).fill(reduced ? 1 : 0); // intro pop
  colors.forEach((c, i) => c.toArray(nodeCol, i * 3));
  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodePos, 3).setUsage(THREE.DynamicDrawUsage));
  nodeGeo.setAttribute("aColor", new THREE.BufferAttribute(nodeCol, 3));
  nodeGeo.setAttribute("aState", new THREE.BufferAttribute(nodeState, 1).setUsage(THREE.DynamicDrawUsage));
  nodeGeo.setAttribute("aDim", new THREE.BufferAttribute(nodeDim, 1).setUsage(THREE.DynamicDrawUsage));
  nodeGeo.setAttribute("aIn", new THREE.BufferAttribute(nodeIn, 1).setUsage(THREE.DynamicDrawUsage));
  const nodeMat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      uniform float uDpr;
      uniform float uScatter;
      attribute vec3 aColor;
      attribute float aState;
      attribute float aDim;
      attribute float aIn;
      varying vec3 vColor;
      varying float vState;
      varying float vAlpha;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float face = (normalize(mat3(modelViewMatrix) * normalize(position))).z;
        vColor = aColor;
        vState = aState;
        vAlpha = (1.0 - uScatter) * aIn * mix(1.0, 0.18, aDim) * mix(0.22, 1.0, smoothstep(-0.25, 0.35, face));
        gl_Position = projectionMatrix * mv;
        gl_PointSize = mix(32.0, 80.0, aState) * mix(1.0, 0.6, aDim) * aIn * uDpr * (9.0 / -mv.z);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uCream;
      varying vec3 vColor;
      varying float vState;
      varying float vAlpha;
      void main() {
        float r = length(gl_PointCoord - 0.5);
        float core = smoothstep(0.17, 0.13, r);
        float ring = smoothstep(0.035, 0.0, abs(r - mix(0.3, 0.42, vState))) * mix(0.55, 1.0, vState);
        float halo = smoothstep(0.5, 0.0, r) * 0.22 * vState;
        vec3 col = mix(uCream, vColor, mix(0.55, 1.0, vState));
        float a = (core + ring + halo) * vAlpha;
        if (a < 0.01) discard;
        gl_FragColor = vec4(col, a);
      }
    `,
  });
  const nodes = new THREE.Points(nodeGeo, nodeMat);
  nodes.renderOrder = 3;
  root.add(nodes);

  // ---- arcs between neighbouring nodes, drawn on the surface ----
  const pairs = [];
  const seen = new Set();
  dirs.forEach((d, i) => {
    dirs
      .map((e, j) => [j, d.distanceTo(e)])
      .filter(([j]) => j !== i)
      .sort((a, b) => a[1] - b[1])
      .slice(0, LINKS)
      .forEach(([j]) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!seen.has(key)) {
          seen.add(key);
          pairs.push([i, j]);
        }
      });
  });
  const arcPos = new Float32Array(pairs.length * ARC_STEPS * 2 * 3);
  const arcCol = new Float32Array(pairs.length * ARC_STEPS * 2 * 4);
  const arcGeo = new THREE.BufferGeometry();
  arcGeo.setAttribute("position", new THREE.BufferAttribute(arcPos, 3).setUsage(THREE.DynamicDrawUsage));
  arcGeo.setAttribute("color", new THREE.BufferAttribute(arcCol, 4).setUsage(THREE.DynamicDrawUsage));
  const arcs = new THREE.LineSegments(
    arcGeo,
    new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  arcs.renderOrder = 2;
  root.add(arcs);

  // ---- packets of light running along the arcs ----
  const packets = Array.from({ length: PACKETS }, (_, k) => ({ arc: (k * 7) % pairs.length, t: Math.random(), speed: 0.12 + Math.random() * 0.16, dir: Math.random() < 0.5 ? 1 : -1 }));
  const packPos = new Float32Array(PACKETS * 3);
  const packGeo = new THREE.BufferGeometry();
  packGeo.setAttribute("position", new THREE.BufferAttribute(packPos, 3).setUsage(THREE.DynamicDrawUsage));
  const packMat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uDpr;
      uniform float uIntro;
      uniform float uScatter;
      varying float vFace;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vFace = (normalize(mat3(modelViewMatrix) * normalize(position))).z;
        gl_Position = projectionMatrix * mv;
        gl_PointSize = 7.0 * uDpr * smoothstep(0.7, 1.0, uIntro) * (1.0 - uScatter) * (9.0 / -mv.z);
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vFace;
      void main() {
        float r = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, r) * mix(0.08, 0.95, smoothstep(-0.2, 0.5, vFace));
        gl_FragColor = vec4(1.0, 0.18, 0.12, a);
      }
    `,
  });
  const pack = new THREE.Points(packGeo, packMat);
  pack.renderOrder = 4;
  root.add(pack);

  // ---- state ----
  let hovered = -1;
  let raf = 0;
  let running = false;
  let visible = true;
  let destroyed = false;
  let last = performance.now();
  let time = 0;
  let introAt = Infinity;
  let lostAt = 0; // when the pointer left the hovered node (a short grace avoids flicker at its edge)
  const rot = { x: 0.32, y: 0, vx: 0, vy: 0 };
  const AUTO = reduced ? 0 : 0.055; // rad/s
  const pointer = { x: 0, y: 0, sx: -9999, sy: -9999, inside: false, down: false, moved: 0, lastX: 0, lastY: 0, type: "mouse" };
  const parallax = { x: 0, y: 0 };
  const size = { w: 1, h: 1 };
  const tmp = new THREE.Vector3();
  const tmpD = new THREE.Vector3();
  const tmpN = new THREE.Vector3();
  const local = Array.from({ length: N }, () => new THREE.Vector3());
  const screen = Array.from({ length: N }, () => ({ x: 0, y: 0, face: 0 }));
  const hoverTween = { v: 0 };

  function resize() {
    const r = canvas.getBoundingClientRect();
    size.w = Math.max(1, r.width);
    size.h = Math.max(1, r.height);
    const dpr = Math.min(window.devicePixelRatio || 1, size.w < 700 ? 1.6 : 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(size.w, size.h, false);
    uniforms.uDpr.value = dpr;
    camera.aspect = size.w / size.h;
    // keep the sphere at about 64% of the short side; on wide screens it moves right of the title
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const fill = size.w < 700 ? 0.82 : 0.64;
    const visH = (R * 2.5) / fill;
    const z = visH / (2 * Math.tan(fov / 2)) / Math.min(1, camera.aspect);
    camera.position.z = z;
    root.position.x = camera.aspect > 1.25 ? Math.tan(fov / 2) * z * camera.aspect * 0.22 : 0;
    root.position.y = camera.aspect > 1.25 ? Math.tan(fov / 2) * z * 0.04 : Math.tan(fov / 2) * z * 0.08;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // ---- picking: nearest node in screen space, front-facing only ----
  function pick(px, py, radius) {
    let best = -1;
    let bestD = radius * radius;
    for (let i = 0; i < N; i++) {
      const s = screen[i];
      if (s.face < 0.12 || nodeDim[i] > 0.5 || nodeIn[i] < 0.9 || uniforms.uScatter.value > 0.05) continue;
      const dx = s.x - px;
      const dy = s.y - py;
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  }

  function setHover(i, { silent = false } = {}) {
    if (i === hovered) return;
    const prev = hovered;
    hovered = i;
    gsap.killTweensOf(hoverTween);
    const enter = () => {
      if (i < 0) return;
      uniforms.uHoverDir.value.copy(dirs[i]);
      uniforms.uAccent.value.copy(colors[i]);
      gsap.to(hoverTween, { v: 1, duration: reduced ? 0 : 0.7, ease: "power3.out" });
    };
    if (prev >= 0 && hoverTween.v > 0.02) gsap.to(hoverTween, { v: 0, duration: reduced ? 0 : 0.16, ease: "power2.in", onComplete: enter });
    else enter();
    if (!silent) onHover(i);
  }

  // ---- input ----
  const rect = () => canvas.getBoundingClientRect();
  function onMove(e) {
    const r = rect();
    pointer.type = e.pointerType || "mouse";
    pointer.sx = e.clientX - r.left;
    pointer.sy = e.clientY - r.top;
    pointer.x = (pointer.sx / r.width) * 2 - 1;
    pointer.y = (pointer.sy / r.height) * 2 - 1;
    pointer.inside = true;
    if (pointer.down) {
      const dx = e.clientX - pointer.lastX;
      const dy = e.clientY - pointer.lastY;
      pointer.moved += Math.abs(dx) + Math.abs(dy);
      pointer.lastX = e.clientX;
      pointer.lastY = e.clientY;
      rot.vy = dx * 0.006;
      if (pointer.type === "mouse") rot.vx = dy * 0.004;
      rot.y += dx * 0.006;
      if (pointer.type === "mouse") rot.x = THREE.MathUtils.clamp(rot.x + dy * 0.004, -0.9, 0.9);
    }
  }
  function onDown(e) {
    pointer.down = true;
    pointer.moved = 0;
    pointer.lastX = e.clientX;
    pointer.lastY = e.clientY;
    pointer.type = e.pointerType || "mouse";
    if (pointer.type === "mouse") canvas.setPointerCapture?.(e.pointerId);
    canvas.classList.add("is-dragging");
  }
  function onUp(e) {
    const r = rect();
    const wasClick = pointer.down && pointer.moved < 8;
    pointer.down = false;
    canvas.classList.remove("is-dragging");
    if (!wasClick) return;
    const touch = (e.pointerType || pointer.type) !== "mouse";
    const i = pick(e.clientX - r.left, e.clientY - r.top, touch ? 46 : 34);
    if (touch) {
      // first tap names the project, a second tap on it opens it
      if (i >= 0 && i === hovered) onPick(i);
      else setHover(i);
    } else if (i >= 0) onPick(i);
  }
  function onLeave() {
    pointer.inside = false;
    pointer.sx = pointer.sy = -9999;
    if (pointer.type === "mouse" && !pointer.down) setHover(-1);
  }
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerdown", onDown);
  window.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointerleave", onLeave);

  // ---- visibility: render only while on screen and the tab is visible ----
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) start();
  });
  io.observe(canvas);
  const onVis = () => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", onVis);

  // ---- frame ----
  const hDir = uniforms.uHoverDir.value;
  function frame(now) {
    raf = 0;
    if (destroyed) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!reduced) time += dt;
    uniforms.uTime.value = time;
    uniforms.uHover.value = hoverTween.v;

    // rotation: drag inertia decays into the idle drift; hovering nearly stops it so a node can be clicked
    if (!pointer.down) {
      const drift = hovered >= 0 ? AUTO * 0.08 : AUTO;
      rot.vy += (drift * dt - rot.vy) * Math.min(1, dt * 2.2);
      rot.vx *= Math.pow(0.04, dt);
      rot.y += rot.vy;
      rot.x = THREE.MathUtils.clamp(rot.x + rot.vx, -0.9, 0.9);
      if (!reduced) rot.x += (0.32 - rot.x) * Math.min(1, dt * 0.35);
    }
    root.rotation.set(rot.x, rot.y, 0);
    if (!reduced && pointer.type === "mouse") {
      parallax.x += ((pointer.inside ? pointer.x : 0) * 0.35 - parallax.x) * Math.min(1, dt * 3);
      parallax.y += ((pointer.inside ? -pointer.y : 0) * 0.25 - parallax.y) * Math.min(1, dt * 3);
      camera.position.x = parallax.x;
      camera.position.y = parallax.y;
      camera.lookAt(root.position.x * 0.5, root.position.y * 0.5, 0);
    }
    root.updateMatrixWorld();

    // nodes ride the surface
    const intro = uniforms.uIntro.value;
    for (let i = 0; i < N; i++) {
      surf(dirs[i], time, hoverTween.v, hDir, local[i]);
      local[i].multiplyScalar(1.012);
      local[i].toArray(nodePos, i * 3);
      nodeDim[i] += (dimTarget[i] - nodeDim[i]) * Math.min(1, dt * 5);
      const target = i === hovered ? 1 : 0;
      nodeState[i] += (target - nodeState[i]) * Math.min(1, dt * (target ? 10 : 6));
      if (!reduced && now > introAt) nodeIn[i] = Math.min(1, nodeIn[i] + dt * 2.2 * (now - introAt - i * 45 > 0 ? 1 : 0));
      // screen position and facing, for picking
      tmp.copy(local[i]).applyMatrix4(root.matrixWorld);
      tmpD.copy(camera.position).sub(tmp).normalize();
      const nrm = tmpN.copy(tmp).sub(root.position).normalize();
      screen[i].face = nrm.dot(tmpD);
      tmp.project(camera);
      screen[i].x = (tmp.x * 0.5 + 0.5) * size.w;
      screen[i].y = (-tmp.y * 0.5 + 0.5) * size.h;
    }
    nodeGeo.attributes.position.needsUpdate = true;
    nodeGeo.attributes.aState.needsUpdate = true;
    nodeGeo.attributes.aIn.needsUpdate = true;
    nodeGeo.attributes.aDim.needsUpdate = true;

    // arcs: slerp between the two directions, lifted onto the surface
    let p = 0;
    let q = 0;
    const lit = hovered;
    for (const [a, b] of pairs) {
      const on = lit >= 0 && (a === lit || b === lit);
      const dim = Math.max(nodeDim[a], nodeDim[b]);
      const vis = Math.min(nodeIn[a], nodeIn[b]) * (1 - dim * 0.85);
      const col = on ? colors[lit] : CREAM;
      const base = (on ? 0.85 : 0.13) * vis * (1 - uniforms.uScatter.value);
      for (let s = 0; s < ARC_STEPS; s++) {
        for (const t of [s / ARC_STEPS, (s + 1) / ARC_STEPS]) {
          tmpD.copy(dirs[a]).lerp(dirs[b], t).normalize();
          surf(tmpD, time, hoverTween.v, hDir, tmp).multiplyScalar(1.006);
          arcPos[p++] = tmp.x;
          arcPos[p++] = tmp.y;
          arcPos[p++] = tmp.z;
          arcCol[q++] = col.r;
          arcCol[q++] = col.g;
          arcCol[q++] = col.b;
          arcCol[q++] = base * (0.55 + 0.45 * Math.sin(t * Math.PI));
        }
      }
    }
    arcGeo.attributes.position.needsUpdate = true;
    arcGeo.attributes.color.needsUpdate = true;

    // packets
    packets.forEach((k, i) => {
      if (!reduced) k.t += dt * k.speed * k.dir;
      if (k.t > 1 || k.t < 0) {
        k.arc = Math.floor(Math.random() * pairs.length);
        k.t = k.dir > 0 ? 0 : 1;
      }
      const [a, b] = pairs[k.arc];
      tmpD.copy(dirs[a]).lerp(dirs[b], k.t).normalize();
      surf(tmpD, time, hoverTween.v, hDir, tmp).multiplyScalar(1.01);
      tmp.toArray(packPos, i * 3);
    });
    packGeo.attributes.position.needsUpdate = true;

    // hover follows the pointer (mouse only; touch selects on tap)
    if (pointer.type === "mouse" && pointer.inside && !pointer.down) {
      const i = pick(pointer.sx, pointer.sy, hovered >= 0 ? 46 : 34);
      if (i === hovered) lostAt = 0;
      else if (i >= 0) setHover(i);
      else if (!lostAt) lostAt = now;
      else if (now - lostAt > 160) {
        lostAt = 0;
        setHover(-1);
      }
    }

    renderer.render(scene, camera);
    if (running) raf = requestAnimationFrame(frame);
  }

  function start() {
    if (destroyed || running || !visible || document.hidden) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  return {
    // the surface assembles, then the nodes pop in one after another
    intro() {
      if (reduced) return;
      gsap.to(uniforms.uIntro, { value: 1, duration: 2.6, ease: "power3.out" });
      introAt = performance.now() + 1300;
    },
    // 0 = whole, 1 = dissolved (driven by the page scroll); picking stops once it starts
    scatter(v) {
      uniforms.uScatter.value = v;
      if (v > 0.05 && hovered >= 0) setHover(-1);
    },
    // nodes whose project is filtered out shrink and fade (and can't be picked)
    filter(keep) {
      items.forEach((it, i) => (dimTarget[i] = keep(it) ? 0 : 1));
      if (reduced) nodeDim.set(dimTarget);
      if (hovered >= 0 && !keep(items[hovered])) setHover(-1);
    },
    // name a node from outside (keyboard focus in the index); silent: no onHover callback
    highlight(i) {
      setHover(i, { silent: true });
    },
    start,
    stop,
    destroy() {
      destroyed = true;
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(hoverTween);
      gsap.killTweensOf(uniforms.uIntro);
      [ico, nodeGeo, arcGeo, packGeo, wire.geometry].forEach((g) => g.dispose());
      [points.material, wire.material, nodeMat, arcs.material, packMat].forEach((m) => m.dispose());
      renderer.dispose();
    },
  };
}
