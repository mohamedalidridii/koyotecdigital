// The engineering panel of the home hero: a knot built from ~1,800 small cubes (instanced
// meshes) with red data packets running along it, rendered off-screen and then dithered into
// paper / black / red cells, like the imagery of the Engineering site.
import * as THREE from "three";
import { gsap } from "../core/gsap.js";

const SEG = 260;
const RING = 7;
const TUBE = 0.3;
const PACKETS = 7;

const DITHER = /* glsl */ `
  uniform sampler2D tScene;
  uniform vec2 uRes;
  uniform float uCell;
  varying vec2 vUv;
  const float BAYER[16] = float[16](0., 8., 2., 10., 12., 4., 14., 6., 3., 11., 1., 9., 15., 7., 13., 5.);
  void main() {
    vec2 cell = floor(gl_FragCoord.xy / uCell);
    vec2 uv = (cell * uCell + uCell * 0.5) / uRes;
    vec3 c = texture2D(tScene, uv).rgb;
    float red = step(0.35, c.r - max(c.g, c.b));
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    ivec2 ip = ivec2(mod(cell, 4.));
    float t = (BAYER[ip.x + ip.y * 4] + 0.5) / 16.;
    vec3 bg = vec3(0.051);
    vec3 paper = vec3(0.953, 0.945, 0.925);
    vec3 col = mix(bg, paper, step(t, pow(l, 1.35) * 1.15));
    col = mix(col, vec3(1., 0., 0.), red);
    gl_FragColor = vec4(col, 1.);
  }
`;

export function createEngMesh(canvas, host, { reduced = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
  const dpr = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(dpr);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
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
    const T = frames.tangents[i];
    basis.makeBasis(T, N, B);
    q.setFromRotationMatrix(basis);
    for (let j = 0; j < RING; j++) {
      const a = (j / RING) * Math.PI * 2 + i * 0.16;
      const pos = P.clone().addScaledVector(N, Math.cos(a) * TUBE).addScaledVector(B, Math.sin(a) * TUBE);
      const size = 0.058 + ((i * 7 + j * 13) % 5) * 0.005;
      base.push({ pos, q: q.clone(), size, u: i / SEG });
    }
  }
  const tmpS = new THREE.Vector3();
  const writeCubes = (wave) => {
    base.forEach((c, k) => {
      // a pulse of light and size travels along the knot
      let d = Math.abs(c.u - wave);
      d = Math.min(d, 1 - d);
      const s = c.size * (1 + 0.9 * Math.exp(-d * d * 900));
      m.compose(c.pos, c.q, tmpS.setScalar(s));
      cubes.setMatrixAt(k, m);
    });
    cubes.instanceMatrix.needsUpdate = true;
  };
  writeCubes(0.2);
  group.add(cubes);

  const packets = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xff0000 }), PACKETS);
  group.add(packets);
  const pPos = new THREE.Vector3();
  const writePackets = (time) => {
    for (let k = 0; k < PACKETS; k++) {
      const u = (time * 0.035 + k / PACKETS) % 1;
      curve.getPointAt(u, pPos);
      const i = Math.floor(u * SEG) % SEG;
      pPos.addScaledVector(frames.normals[i], TUBE * 1.15);
      m.compose(pPos, q.identity(), tmpS.setScalar(0.17));
      packets.setMatrixAt(k, m);
    }
    packets.instanceMatrix.needsUpdate = true;
  };
  writePackets(0);

  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(3, 4, 6);
  const rim = new THREE.DirectionalLight(0xffffff, 0.7);
  rim.position.set(-5, -3, 2);
  scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.22));

  // off-screen render, then the dither pass
  const rt = new THREE.WebGLRenderTarget(1, 1);
  const quadScene = new THREE.Scene();
  const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms = { tScene: { value: rt.texture }, uRes: { value: new THREE.Vector2(1, 1) }, uCell: { value: 3 * dpr } };
  const quad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({ uniforms, vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }", fragmentShader: DITHER }),
  );
  quadScene.add(quad);

  const resize = () => {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    rt.setSize(Math.round(w * dpr), Math.round(h * dpr));
    uniforms.uRes.value.set(w * dpr, h * dpr);
    camera.aspect = w / h;
    // the knot (about 3.9 units across) fills the upper part of the panel
    const fov = (camera.fov * Math.PI) / 180;
    const fitW = 2.95 / (Math.tan(fov / 2) * camera.aspect);
    const fitH = 2.6 / Math.tan(fov / 2);
    camera.position.z = Math.max(fitW, fitH);
    camera.position.y = -0.55;
    // portrait panels (phones) carry more text below: the knot sits higher
    camera.lookAt(0, -0.55 + (h > w ? -1.7 : -0.35), 0);
    camera.updateProjectionMatrix();
    render(0);
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
  host.addEventListener("pointerenter", onEnter);
  host.addEventListener("pointerleave", onLeave);

  function render(time) {
    renderer.setRenderTarget(rt);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(quadScene, quadCam);
    return time;
  }

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
    spin += dt * (0.14 + boost * 0.5);
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    group.rotation.y = -0.3 + spin + pointer.x * 0.35;
    group.rotation.x = 0.5 + pointer.y * 0.25;
    writeCubes((time * 0.09) % 1);
    writePackets(time);
    render(time);
  };

  if (reduced) render(0);
  else gsap.ticker.add(tick);

  return () => {
    gsap.ticker.remove(tick);
    io.disconnect();
    ro.disconnect();
    host.removeEventListener("pointermove", onMove);
    host.removeEventListener("pointerenter", onEnter);
    host.removeEventListener("pointerleave", onLeave);
    cubeGeo.dispose();
    cubes.material.dispose();
    packets.geometry.dispose();
    packets.material.dispose();
    quad.geometry.dispose();
    quad.material.dispose();
    rt.dispose();
    renderer.dispose();
  };
}
