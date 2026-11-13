// The /architecture scene: five platform layers as slabs of voxel tiles, each carrying its blocks
// (services) as small skylines of columns. Rendered off-screen, then ordered-dithered into the
// site's ink / paper cells, with saturated red kept as red (hovered block, data packets).
// Scroll drives everything through store.p (0..1): the stack assembles, explodes, the camera visits
// each layer, then the stack closes again while packets run through it.
import { createStage, follow, band, clamp, lerp, rng } from "../Systems/lib";

const LAYERS = 5;
const GAP_CLOSED = 1.55;
const GAP_OPEN = 4.4;
// four block footprints on every slab (grid coordinates of their corner, 3x3 columns each)
const SLOTS = [
  [-4, -4],
  [1, -4],
  [-4, 1],
  [1, 1],
];
const CONNECT = [
  [-0.5, -0.5],
  [3.5, -0.5],
  [-0.5, 3.5],
  [3.5, 3.5],
];

const DITHER = /* glsl */ `
  uniform sampler2D tScene;
  uniform vec2 uRes;
  uniform float uCell;
  uniform vec3 uInk;
  uniform vec3 uPaper;
  varying vec2 vUv;
  const float BAYER[16] = float[16](0., 8., 2., 10., 12., 4., 14., 6., 3., 11., 1., 9., 15., 7., 13., 5.);
  void main() {
    vec2 cell = floor(gl_FragCoord.xy / uCell);
    vec2 uv = (cell * uCell + uCell * 0.5) / uRes;
    vec3 c = texture2D(tScene, uv).rgb;
    float red = step(0.22, c.r - max(c.g, c.b));
    float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
    float l = pow(lum, 1.15) * 1.05;
    ivec2 ip = ivec2(mod(cell, 4.));
    float t = (BAYER[ip.x + ip.y * 4] + 0.5) / 16.;
    vec3 col = mix(uInk, uPaper, step(t, l));
    col = mix(col, vec3(1.0, 0.0, 0.0), red);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createArchitectureScene(host, opts) {
  return createStage(host, {
    camera: (THREE) => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1),
    setup: (state) => setup(state, opts),
    frame: (state, user, dt) => user.frame(state, dt),
  });
}

function setup({ THREE, renderer, scene: screen }, { store, blocksPerLayer, mobile, reduced, onHover, onPick, tip }) {
  const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.6 : 2);
  renderer.setPixelRatio(dpr);
  const N = mobile ? 9 : 12; // tiles per slab side
  const rand = rng(7);

  // ---- the 3D world, rendered into a target ----
  const world = new THREE.Scene();
  world.background = new THREE.Color(0x000000);
  const cam = new THREE.PerspectiveCamera(28, 1, 0.1, 300);
  world.add(new THREE.AmbientLight(0xffffff, 0.28));
  const sun = new THREE.DirectionalLight(0xffffff, 1.55);
  sun.position.set(7, 12, 5);
  world.add(sun);
  const fill = new THREE.DirectionalLight(0xffffff, 0.35);
  fill.position.set(-8, 3, -6);
  world.add(fill);

  const box = new THREE.BoxGeometry(0.9, 1, 0.9);
  box.translate(0, 0.5, 0); // scale.y = height from the base
  const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });

  // slab tiles
  const tiles = [];
  for (let l = 0; l < LAYERS; l++) {
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const edge = i === 0 || j === 0 || i === N - 1 || j === N - 1;
        if (edge && rand() < 0.12) continue; // a slightly eroded outline
        const x = i - (N - 1) / 2;
        const z = j - (N - 1) / 2;
        tiles.push({ l, x, z, h: 0.26 + rand() * 0.1, g: 0.3 + rand() * 0.14, d: Math.hypot(x, z) / N });
      }
    }
  }
  const tileMesh = new THREE.InstancedMesh(box, mat, tiles.length);
  tileMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  // block columns
  const cols = [];
  const blockIndex = []; // instanceId -> global block index
  let g = 0;
  const scale = N / 12;
  for (let l = 0; l < LAYERS; l++) {
    for (let b = 0; b < blocksPerLayer[l]; b++, g++) {
      const [sx, sz] = SLOTS[b % SLOTS.length];
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const x = (sx + i + 0.5) * scale;
          const z = (sz + j + 0.5) * scale;
          cols.push({ l, b: g, x, z, h: 0.45 + rand() * 1.1 + (i === 1 && j === 1 ? 0.5 : 0), w: scale });
          blockIndex.push(g);
        }
      }
    }
  }
  const blockMesh = new THREE.InstancedMesh(box, mat, cols.length);
  blockMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  world.add(tileMesh, blockMesh);
  // per-block centre (top) for the tooltip
  const blockTop = [];

  // vertical connectors between layers, and the red packets that travel them
  const conn = CONNECT.map(([x, z]) => [x * scale, z * scale]);
  const lineGeo = new THREE.BufferGeometry();
  const linePos = new Float32Array(conn.length * (LAYERS - 1) * 2 * 3);
  lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3).setUsage(THREE.DynamicDrawUsage));
  const lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: 0x8a8a8a }));
  world.add(lines);
  const PACK = 36;
  const packets = Array.from({ length: PACK }, (_, k) => ({ c: k % conn.length, y: rand(), v: 0.08 + rand() * 0.1 }));
  const packPos = new Float32Array(PACK * 3);
  const packGeo = new THREE.BufferGeometry();
  packGeo.setAttribute("position", new THREE.BufferAttribute(packPos, 3).setUsage(THREE.DynamicDrawUsage));
  const packMat = new THREE.PointsMaterial({ color: 0xff0000, size: mobile ? 0.34 : 0.28, sizeAttenuation: true });
  const pack = new THREE.Points(packGeo, packMat);
  world.add(pack);

  // ---- the dither pass, drawn by the stage on its full-screen quad ----
  const rt = new THREE.WebGLRenderTarget(2, 2, { depthBuffer: true });
  const quadMat = new THREE.ShaderMaterial({
    uniforms: {
      tScene: { value: rt.texture },
      uRes: { value: new THREE.Vector2(1, 1) },
      uCell: { value: (mobile ? 2.5 : 3) * dpr },
      uInk: { value: new THREE.Color("#0d0d0d") },
      uPaper: { value: new THREE.Color("#f3f1ec") },
    },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: DITHER,
    depthTest: false,
    depthWrite: false,
  });
  screen.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), quadMat));

  // ---- input: drag to orbit, hover / pick blocks ----
  const pointer = { x: 0, y: 0, inside: false, down: false, moved: 0, lx: 0, ly: 0, type: "mouse", dirty: false };
  const orbit = { yaw: 0, v: 0 };
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const canvas = renderer.domElement;
  canvas.style.touchAction = "pan-y";
  canvas.style.cursor = "grab";
  const rect = () => canvas.getBoundingClientRect();
  function move(e) {
    const r = rect();
    pointer.x = e.clientX - r.left;
    pointer.y = e.clientY - r.top;
    pointer.inside = true;
    pointer.type = e.pointerType || "mouse";
    pointer.dirty = true;
    if (pointer.down) {
      const dx = e.clientX - pointer.lx;
      pointer.moved += Math.abs(dx) + Math.abs(e.clientY - pointer.ly);
      pointer.lx = e.clientX;
      pointer.ly = e.clientY;
      orbit.v = dx * 0.005;
      orbit.yaw = clamp(orbit.yaw + dx * 0.005, -0.7, 0.7);
    }
  }
  function down(e) {
    pointer.down = true;
    pointer.moved = 0;
    pointer.lx = e.clientX;
    pointer.ly = e.clientY;
    canvas.style.cursor = "grabbing";
  }
  function up(e) {
    const click = pointer.down && pointer.moved < 8;
    pointer.down = false;
    canvas.style.cursor = "grab";
    if (!click) return;
    const r = rect();
    const hit = pickAt(e.clientX - r.left, e.clientY - r.top);
    if (hit >= 0) onPick(hit);
  }
  function leave() {
    pointer.inside = false;
    if (pointer.type === "mouse") setHover(-1);
  }
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerdown", down);
  window.addEventListener("pointerup", up);
  canvas.addEventListener("pointerleave", leave);

  let size = { w: 1, h: 1 };
  let hovered = -1;
  function setHover(i) {
    if (i === hovered) return;
    hovered = i;
    onHover(i);
  }
  function pickAt(x, y) {
    ndc.set((x / size.w) * 2 - 1, -(y / size.h) * 2 + 1);
    ray.setFromCamera(ndc, cam);
    const hit = ray.intersectObject(blockMesh, false)[0];
    return hit && hit.instanceId != null ? blockIndex[hit.instanceId] : -1;
  }

  // ---- per frame ----
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  const scl = new THREE.Vector3();
  const col = new THREE.Color();
  const target = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const layerDim = new Float32Array(LAYERS).fill(1);
  const blockGlow = new Float32Array(g);
  let clock = 0;
  const progress = { current: store.p }; // follow() reads a ref
  let intro = reduced ? 1 : 0;
  let idle = 0;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  function frame({ width, height }, dt) {
    clock += dt;
    if (!reduced) intro = Math.min(1, intro + dt / 2.8);
    const p = follow(progress, reduced);

    // the story along the scroll
    const open = band(p, 0.08, 0.2) * (1 - band(p, 0.88, 0.97));
    const gap = lerp(GAP_CLOSED, GAP_OPEN, open);
    const k = clamp((p - 0.2) / 0.68, 0, 0.9999) * LAYERS;
    const ci = Math.floor(k);
    const focusF = ci + band(k - ci, 0.72, 1);
    const focusAmt = band(p, 0.16, 0.24) * (1 - band(p, 0.86, 0.92));
    const outro = band(p, 0.88, 0.97);
    const active = Math.round(clamp(focusF, 0, LAYERS - 1));
    const layerY = (l) => l * gap;

    // layers out of focus fade towards the background
    for (let l = 0; l < LAYERS; l++) {
      const want = focusAmt > 0.05 ? (l === active ? 1.15 : 0.14) : 1;
      layerDim[l] += (want - layerDim[l]) * Math.min(1, dt * 5);
    }

    // slab tiles: rain down at load, then follow the layer heights
    tiles.forEach((t, i) => {
      const delay = t.l * 0.16 + t.d * 0.7;
      const a = reduced ? 1 : easeOut(clamp((intro * 2.8 - delay) / 0.9));
      pos.set(t.x, layerY(t.l) + (1 - a) * (7 + t.l * 1.5), t.z);
      scl.set(1, t.h * Math.max(a, 0.001), 1);
      m4.compose(pos, q, scl);
      tileMesh.setMatrixAt(i, m4);
      const v = t.g * layerDim[t.l] * (0.55 + 0.45 * a);
      tileMesh.setColorAt(i, col.setRGB(v, v, v));
    });
    tileMesh.instanceMatrix.needsUpdate = true;
    tileMesh.instanceColor.needsUpdate = true;

    // block columns: grow after the slabs land; the focused layer's blocks stand taller
    for (let b = 0; b < g; b++) {
      const want = b === hovered || b === store.selected ? 1 : 0;
      blockGlow[b] += (want - blockGlow[b]) * Math.min(1, dt * 9);
    }
    blockTop.length = 0;
    cols.forEach((c, i) => {
      const a = reduced ? 1 : easeOut(clamp((intro * 2.8 - 1.4 - c.l * 0.1) / 0.8));
      const lift = c.l === active ? focusAmt * 0.45 : 0;
      const h = c.h * (1 + lift) * Math.max(a, 0.001);
      const base = layerY(c.l) + 0.32;
      pos.set(c.x, base, c.z);
      scl.set(c.w, h, c.w);
      m4.compose(pos, q, scl);
      blockMesh.setMatrixAt(i, m4);
      const glow = blockGlow[c.b];
      const v = 0.92 * layerDim[c.l];
      blockMesh.setColorAt(i, col.setRGB(lerp(v, 1, glow), lerp(v, 0.02, glow), lerp(v, 0.02, glow)));
      if (!blockTop[c.b] || base + h > blockTop[c.b].y) blockTop[c.b] = { x: c.x, y: base + h, z: c.z };
    });
    blockMesh.instanceMatrix.needsUpdate = true;
    blockMesh.instanceColor.needsUpdate = true;

    // connectors and packets
    let n = 0;
    for (let l = 0; l < LAYERS - 1; l++) {
      for (const [x, z] of conn) {
        linePos[n++] = x; linePos[n++] = layerY(l) + 0.3; linePos[n++] = z;
        linePos[n++] = x; linePos[n++] = layerY(l + 1); linePos[n++] = z;
      }
    }
    lineGeo.attributes.position.needsUpdate = true;
    lines.material.opacity = 1;
    const top = layerY(LAYERS - 1) + 0.3;
    const rush = 1 + outro * 2.2;
    const shown = Math.round(PACK * (0.45 + 0.55 * Math.max(outro, focusAmt * 0.5)));
    packets.forEach((k2, i) => {
      if (!reduced) k2.y += dt * k2.v * rush;
      if (k2.y > 1) {
        k2.y = 0;
        k2.c = Math.floor(rand() * conn.length);
      }
      const [x, z] = conn[k2.c];
      packPos[i * 3] = x;
      packPos[i * 3 + 1] = k2.y * top;
      packPos[i * 3 + 2] = z;
    });
    packGeo.attributes.position.needsUpdate = true;
    packGeo.setDrawRange(0, intro > 0.85 ? shown : 0);

    // camera: overview, then each layer in turn, then the whole stack again
    if (!reduced) idle += dt * 0.05;
    if (!pointer.down) {
      orbit.yaw += orbit.v;
      orbit.v *= Math.pow(0.02, dt);
    }
    const yaw = 0.72 + idle + orbit.yaw;
    const mid = layerY((LAYERS - 1) / 2);
    const aspect = width / Math.max(1, height);
    const portrait = aspect < 0.9;
    const fit = portrait ? 0.75 / aspect : Math.max(1, 1.35 / aspect);
    const dist = lerp(lerp(44, 52, open) * (N / 12 * 0.85 + 0.15), 31 * (N / 12 * 0.8 + 0.2), focusAmt) * fit;
    target.set(0, lerp(mid, layerY(focusF) + 0.8, focusAmt), 0);
    // lowering the aim lifts the stack on screen: above the closing text, and above the mobile panel
    target.y -= outro * dist * 0.16 + (portrait ? focusAmt * dist * 0.17 : 0);
    const pitch = lerp(0.62, 0.46, focusAmt) + outro * 0.06;
    cam.position.set(
      Math.sin(yaw) * Math.cos(pitch) * dist,
      target.y + Math.sin(pitch) * dist,
      Math.cos(yaw) * Math.cos(pitch) * dist,
    );
    // on wide screens the panel sits on the right: aim right of the stack so it shows on the left
    // and in the intro, aim left so the stack sits right of the title
    const shift = aspect > 1.15 ? dist * (0.11 * focusAmt - 0.1 * (1 - band(p, 0.02, 0.14))) : 0;
    tmp.set(Math.cos(yaw), 0, -Math.sin(yaw)).multiplyScalar(shift);
    cam.lookAt(target.x + tmp.x, target.y, target.z + tmp.z);

    // hover follows the mouse
    if (pointer.type === "mouse" && pointer.inside && !pointer.down && pointer.dirty) {
      pointer.dirty = false;
      setHover(pickAt(pointer.x, pointer.y));
    }
    // the tooltip rides on the hovered block's top
    const shownTip = hovered >= 0 ? hovered : -1;
    if (tip.current) {
      if (shownTip >= 0 && blockTop[shownTip]) {
        tmp.copy(blockTop[shownTip]).add(new THREE.Vector3(0, 0.4, 0)).project(cam);
        tip.current.style.transform = `translate3d(${(tmp.x * 0.5 + 0.5) * width}px, ${(-tmp.y * 0.5 + 0.5) * height}px, 0)`;
      }
    }

    // world -> target, then the stage draws the dithered quad
    renderer.setRenderTarget(rt);
    renderer.render(world, cam);
    renderer.setRenderTarget(null);
  }

  return {
    frame,
    resize(w, h) {
      size = { w, h };
      cam.aspect = w / Math.max(1, h);
      cam.updateProjectionMatrix();
      rt.setSize(Math.round(w * dpr), Math.round(h * dpr));
      quadMat.uniforms.uRes.value.set(Math.round(w * dpr), Math.round(h * dpr));
    },
    dispose() {
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointerleave", leave);
      [box, lineGeo, packGeo].forEach((x) => x.dispose());
      [mat, lines.material, packMat].forEach((x) => x.dispose());
      tileMesh.dispose();
      blockMesh.dispose();
      rt.dispose();
    },
  };
}
