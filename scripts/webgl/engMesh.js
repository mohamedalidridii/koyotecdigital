// The engineering panel of the home hero: a knot built from ~1,800 small cubes (instanced
// meshes) with red data packets running along it, rendered off-screen and then dithered into
// paper / black / red cells, like the imagery of the Engineering site.
// On click (see sections/engHero.js) it becomes a centred loader, then the Engineering hero
// photo grows out of it the way the Engineering preloader opens its hero (scale 0 → 1, −20° → 0).
import * as THREE from "three";
import { gsap } from "../core/gsap.js";

const SEG = 260;
const RING = 7;
const TUBE = 0.3;
const PACKETS = 7;
// the knot is about this many units across, whatever its orientation
const KNOT = 3.7;

const DITHER = /* glsl */ `
  uniform sampler2D tScene;
  uniform sampler2D tImage;
  uniform vec2 uRes;
  uniform float uCell;
  uniform float uHasImg;
  uniform float uImgS;
  uniform float uImgR;
  uniform vec2 uImgScale;
  varying vec2 vUv;
  const float BAYER[16] = float[16](0., 8., 2., 10., 12., 4., 14., 6., 3., 11., 1., 9., 15., 7., 13., 5.);
  void main() {
    vec2 cell = floor(gl_FragCoord.xy / uCell);
    vec2 uv = (cell * uCell + uCell * 0.5) / uRes;
    vec3 c = texture2D(tScene, uv).rgb;
    float red = step(0.35, c.r - max(c.g, c.b));
    float l = pow(dot(c, vec3(0.299, 0.587, 0.114)), 1.35) * 1.15;

    // the Engineering hero photo, as a screen-sized frame scaled and turned about the centre
    float aspect = uRes.x / uRes.y;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.);
    float cs = cos(uImgR);
    float sn = sin(uImgR);
    vec2 q = vec2(cs * p.x + sn * p.y, -sn * p.x + cs * p.y) / max(uImgS, 1e-4);
    vec2 fuv = q / vec2(aspect, 1.) + 0.5;
    float inside = step(0., fuv.x) * step(fuv.x, 1.) * step(0., fuv.y) * step(fuv.y, 1.) * step(0.002, uImgS) * uHasImg;
    vec2 iuv = (fuv - 0.5) * uImgScale + 0.5;
    float li = dot(texture2D(tImage, iuv).rgb, vec3(0.2126, 0.7152, 0.0722));
    l = mix(l, li, inside);
    red *= 1. - inside;

    ivec2 ip = ivec2(mod(cell, 4.));
    float t = (BAYER[ip.x + ip.y * 4] + 0.5) / 16.;
    vec3 bg = vec3(0.051);
    vec3 paper = vec3(0.953, 0.945, 0.925);
    vec3 col = mix(bg, paper, step(t, l));
    col = mix(col, vec3(1., 0., 0.), red);
    gl_FragColor = vec4(col, 1.);
  }
`;

export function createEngMesh(canvas, hostEl, { reduced = false } = {}) {
  let host = hostEl;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
  const dpr = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(dpr);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);
  camera.position.set(0, 0, 9);

  // a (2,3) torus knot, as a curve with Frenet frames for the cube ring around it
  class Knot extends THREE.Curve {
    getPoint(u, target = new THREE.Vector3()) {
      const phi = u * Math.PI * 2;
      const r = Math.cos(3 * phi) + 2.1;
      return target.set(r * Math.cos(2 * phi), r * Math.sin(2 * phi), -Math.sin(3 * phi) * 1.1).multiplyScalar(0.62);
    }
  }
  const curve = new Knot();
  const frames = curve.computeFrenetFrames(SEG, true);
  const points = Array.from({ length: SEG }, (_, i) => curve.getPointAt(i / SEG));

  const group = new THREE.Group();
  group.rotation.set(0.5, -0.3, 0);
  scene.add(group);

  const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
  const cubes = new THREE.InstancedMesh(cubeGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, metalness: 0.05 }), SEG * RING);
  const base = [];
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const basis = new THREE.Matrix4();
  for (let i = 0; i < SEG; i++) {
    const P = points[i];
    const N = frames.normals[i];
    const B = frames.binormals[i];
    basis.makeBasis(frames.tangents[i], N, B);
    q.setFromRotationMatrix(basis);
    for (let j = 0; j < RING; j++) {
      const a = (j / RING) * Math.PI * 2 + i * 0.16;
      const dir = N.clone().multiplyScalar(Math.cos(a)).addScaledVector(B, Math.sin(a));
      const pos = P.clone().addScaledVector(dir, TUBE);
      const size = 0.058 + ((i * 7 + j * 13) % 5) * 0.005;
      base.push({ pos, dir, q: q.clone(), size, u: i / SEG, j });
    }
  }
  const tmpS = new THREE.Vector3();
  const tmpP = new THREE.Vector3();
  // pulse: a bright band travelling along the knot; wave: the loader ripple of the hand-off
  const writeCubes = (pulse, wave, time) => {
    base.forEach((c, k) => {
      let d = Math.abs(c.u - pulse);
      d = Math.min(d, 1 - d);
      const ripple = wave ? Math.sin(c.u * Math.PI * 2 * 6 - time * 6 + c.j * 0.9) : 0;
      const s = c.size * (1 + 0.9 * Math.exp(-d * d * 900) + wave * 0.35 * (ripple + 1));
      tmpP.copy(c.pos).addScaledVector(c.dir, wave * 0.17 * ripple);
      m.compose(tmpP, c.q, tmpS.setScalar(s));
      cubes.setMatrixAt(k, m);
    });
    cubes.instanceMatrix.needsUpdate = true;
  };
  writeCubes(0.2, 0, 0);
  group.add(cubes);

  const packets = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xff0000 }), PACKETS);
  group.add(packets);
  const pPos = new THREE.Vector3();
  const idQ = new THREE.Quaternion();
  let packetClock = 0;
  const writePackets = () => {
    for (let k = 0; k < PACKETS; k++) {
      const u = (packetClock * 0.035 + k / PACKETS) % 1;
      curve.getPointAt(u, pPos);
      const i = Math.floor(u * SEG) % SEG;
      pPos.addScaledVector(frames.normals[i], TUBE * 1.15);
      m.compose(pPos, idQ, tmpS.setScalar(0.17));
      packets.setMatrixAt(k, m);
    }
    packets.instanceMatrix.needsUpdate = true;
  };
  writePackets();

  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(3, 4, 6);
  const rim = new THREE.DirectionalLight(0xffffff, 0.7);
  rim.position.set(-5, -3, 2);
  scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.22));

  // off-screen render, then the dither pass
  const rt = new THREE.WebGLRenderTarget(1, 1);
  const quadScene = new THREE.Scene();
  const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms = {
    tScene: { value: rt.texture },
    tImage: { value: null },
    uRes: { value: new THREE.Vector2(1, 1) },
    uCell: { value: 3 * dpr },
    uHasImg: { value: 0 },
    uImgS: { value: 0 },
    uImgR: { value: -0.349 },
    uImgScale: { value: new THREE.Vector2(1, 1) },
  };
  let imgAspect = 16 / 9;
  // the photo is fitted like a CSS "cover", as the Engineering hero does
  const fitImage = () => {
    const a = uniforms.uRes.value.x / uniforms.uRes.value.y;
    uniforms.uImgScale.value.set(a > imgAspect ? 1 : a / imgAspect, a > imgAspect ? imgAspect / a : 1);
  };
  const quad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({ uniforms, vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }", fragmentShader: DITHER }),
  );
  quadScene.add(quad);

  // hand-off state, tweened from outside
  let takeover = 0; // 0 in the panel, 1 centred full screen as a loader
  let wave = 0; // loader ripple
  let shrink = 0; // the knot folding away as the photo grows
  let rush = 0; // extra spin

  const frame = () => {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    camera.aspect = w / h;
    const tanH = Math.tan((camera.fov * Math.PI) / 360);
    // in the panel: the knot fills the upper part
    const zPanel = Math.max(2.95 / (tanH * camera.aspect), 2.6 / tanH);
    const lookPanel = -0.55 + (h > w ? -1.7 : -0.35);
    // full screen: a centred loader, about a third of the screen's short side
    const share = 0.34;
    const zCentre = h > w ? KNOT / (share * 1.6 * 2 * tanH * camera.aspect) : KNOT / (share * 2 * tanH);
    camera.position.set(0, -0.55 * (1 - takeover), zPanel + (zCentre - zPanel) * takeover);
    camera.lookAt(0, lookPanel * (1 - takeover), 0);
    camera.updateProjectionMatrix();
  };

  function render() {
    renderer.setRenderTarget(rt);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(quadScene, quadCam);
  }

  const resize = () => {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    rt.setSize(Math.round(w * dpr), Math.round(h * dpr));
    uniforms.uRes.value.set(w * dpr, h * dpr);
    fitImage();
    frame();
    render();
  };

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let spin = 0;
  let boost = 0;
  let hover = false;
  const onMove = (e) => {
    const r = host.getBoundingClientRect();
    pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
  };
  const onEnter = () => (hover = true);
  const onLeave = () => {
    hover = false;
    pointer.tx = 0;
    pointer.ty = 0;
  };
  host.addEventListener("pointermove", onMove);
  hostEl.addEventListener("pointerenter", onEnter);
  hostEl.addEventListener("pointerleave", onLeave);

  let visible = true;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  io.observe(host);
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  let last = 0;
  const tick = (time) => {
    if (!visible) return;
    const dt = Math.min(0.05, time - last || 0.016);
    last = time;
    boost += ((hover ? 1 : 0) - boost) * 0.05;
    spin += dt * (0.14 + boost * 0.5 + rush * 1.6);
    packetClock += dt * (1 + rush * 4 + wave * 3);
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    const calm = 1 - takeover;
    group.rotation.y = -0.3 + spin + pointer.x * 0.35 * calm;
    group.rotation.x = 0.5 + pointer.y * 0.25 * calm;
    group.scale.setScalar(Math.max(0.0001, 1 - shrink * 0.85));
    writeCubes((time * (0.09 + wave * 0.25)) % 1, wave, time);
    writePackets();
    frame();
    render();
  };

  if (reduced) render();
  else gsap.ticker.add(tick);

  // ---------- hand-off API, used when the visitor opens Engineering from the panel ----------
  const setHost = (el) => {
    ro.unobserve(host);
    io.unobserve(host);
    host.removeEventListener("pointermove", onMove);
    host = el;
    ro.observe(host);
    io.observe(host);
    host.addEventListener("pointermove", onMove);
    visible = true;
  };
  const state = {};
  for (const [name, get, set] of [
    ["takeover", () => takeover, (v) => (takeover = v)],
    ["wave", () => wave, (v) => (wave = v)],
    ["shrink", () => shrink, (v) => (shrink = v)],
    ["rush", () => rush, (v) => (rush = v)],
  ]) {
    Object.defineProperty(state, name, { get, set, enumerable: true });
  }
  const loadImage = (url) =>
    new Promise((resolve, reject) => {
      new THREE.TextureLoader().load(
        url,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          uniforms.tImage.value = tex;
          imgAspect = tex.image.width / tex.image.height;
          fitImage();
          uniforms.uHasImg.value = 1;
          resolve();
        },
        undefined,
        reject,
      );
    });
  // the last frame, one pixel per dither cell (tiny PNG, scaled back up with pixelated rendering)
  const capture = () => {
    render();
    const cell = uniforms.uCell.value;
    const w = Math.max(1, Math.round(canvas.width / cell));
    const h = Math.max(1, Math.round(canvas.height / cell));
    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    const ctx = out.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, w, h);
    return out.toDataURL("image/png");
  };

  const dispose = () => {
    gsap.ticker.remove(tick);
    io.disconnect();
    ro.disconnect();
    host.removeEventListener("pointermove", onMove);
    hostEl.removeEventListener("pointerenter", onEnter);
    hostEl.removeEventListener("pointerleave", onLeave);
    cubeGeo.dispose();
    cubes.material.dispose();
    packets.geometry.dispose();
    packets.material.dispose();
    quad.geometry.dispose();
    quad.material.dispose();
    rt.dispose();
    uniforms.tImage.value?.dispose();
    renderer.dispose();
  };

  return { dispose, setHost, state, uniforms, loadImage, capture, dpr };
}
