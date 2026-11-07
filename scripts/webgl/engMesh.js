// The engineering panel of the home hero: a knot built from ~1,800 small cubes (instanced
// meshes) with red data packets running along it, rendered off-screen and then dithered into
// paper / black / red cells, like the imagery of the Engineering site.
// On click (see sections/engHero.js) the knot settles in the centre and ripples like a loader;
// then its cubes fly into place and build the Engineering hero's building, each one taking the
// photo's tone at its spot, while the background turns into the photo's sky. Once the mesh
// building matches the photo, the photo itself fades in over it.
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
  uniform float uBuild;
  uniform float uMix;
  uniform vec2 uImgScale;
  varying vec2 vUv;
  const float BAYER[16] = float[16](0., 8., 2., 10., 12., 4., 14., 6., 3., 11., 1., 9., 15., 7., 13., 5.);
  void main() {
    vec2 cell = floor(gl_FragCoord.xy / uCell);
    vec2 uv = (cell * uCell + uCell * 0.5) / uRes;
    vec3 c = texture2D(tScene, uv).rgb;
    float red = step(0.35, c.r - max(c.g, c.b));
    float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
    // the lit knot gets a contrast curve; the building of cubes keeps the photo's tones as they are
    float l = mix(pow(lum, 1.35) * 1.15, lum, uBuild);
    red *= 1. - uBuild;
    // the Engineering hero photo (CSS "cover"), faded in over the matching mesh building
    vec2 iuv = (uv - 0.5) * uImgScale + 0.5;
    float li = dot(texture2D(tImage, iuv).rgb, vec3(0.2126, 0.7152, 0.0722));
    l = mix(l, li, uMix * uHasImg);

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
  const COUNT = SEG * RING;
  const cubes = new THREE.InstancedMesh(cubeGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, metalness: 0.05, transparent: true }), COUNT);
  // same cubes, unlit, coloured with the photo's tone at each cube's place in the building
  const tones = new THREE.InstancedMesh(cubeGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }), COUNT);
  tones.visible = false;
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
  group.add(cubes, tones);

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
    uBuild: { value: 0 },
    uMix: { value: 0 },
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
  let build = 0; // 0 knot, 1 cubes in place as the building
  let rush = 0; // extra spin
  let plan = null; // where each cube goes, computed when the building starts

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
    if (plan) {
      frame();
      writeBuild();
      render();
      return;
    }
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
    frame();
    if (plan) writeBuild();
    else {
      group.scale.setScalar(1);
      writeCubes((time * (0.09 + wave * 0.25)) % 1, wave, time);
      writePackets();
    }
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
    ["build", () => build, (v) => (build = v)],
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
  // ---------- the building of cubes ----------
  // sky = bright cells connected to the top edge; everything else is the building
  const planCells = (img, W, H) => {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const c2 = document.createElement("canvas");
    const ctx = c2.getContext("2d", { willReadFrequently: true });
    let cols = Math.round(Math.sqrt((COUNT / 0.5) * (W / H)));
    for (;;) {
      const rows = Math.max(2, Math.round((cols * H) / W));
      c2.width = cols;
      c2.height = rows;
      const sc = Math.max(cols / iw, rows / ih);
      ctx.drawImage(img, (cols - iw * sc) / 2, (rows - ih * sc) / 2, iw * sc, ih * sc);
      const px = ctx.getImageData(0, 0, cols, rows).data;
      const lum = new Float32Array(cols * rows);
      for (let i = 0; i < cols * rows; i++) lum[i] = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;
      const sky = new Uint8Array(cols * rows);
      const queue = [];
      for (let x = 0; x < cols; x++) if (lum[x] > 0.8) (sky[x] = 1), queue.push(x);
      while (queue.length) {
        const i = queue.pop();
        const x = i % cols;
        const y = (i - x) / cols;
        for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
          if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
          const j = ny * cols + nx;
          if (!sky[j] && lum[j] > 0.78) (sky[j] = 1), queue.push(j);
        }
      }
      const cells = [];
      let skySum = [0, 0, 0];
      let skyN = 0;
      for (let i = 0; i < cols * rows; i++) {
        if (sky[i]) {
          skySum = [skySum[0] + px[i * 4], skySum[1] + px[i * 4 + 1], skySum[2] + px[i * 4 + 2]];
          skyN += 1;
        } else cells.push({ x: i % cols, y: Math.floor(i / cols), rgb: [px[i * 4], px[i * 4 + 1], px[i * 4 + 2]] });
      }
      if (cells.length <= COUNT || cols < 12) {
        const n = Math.max(1, skyN);
        return { cols, rows, cells, sky: [skySum[0] / n, skySum[1] / n, skySum[2] / n] };
      }
      cols -= 2;
    }
  };

  const black = new THREE.Color(0x000000);
  const skyColor = new THREE.Color();
  const startPos = [];
  const startQ = [];
  const startS = [];
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const tq = new THREE.Quaternion();
  const tPos = new THREE.Vector3();
  const one = new THREE.Quaternion();

  const beginBuild = () => {
    const img = uniforms.tImage.value?.image;
    const W = host.clientWidth || 1;
    const H = host.clientHeight || 1;
    frame();
    // freeze the knot as it is now, in world space, then hand the cubes over to the plan
    group.updateMatrixWorld(true);
    const mw = new THREE.Matrix4();
    const sv = new THREE.Vector3();
    for (let k = 0; k < COUNT; k++) {
      cubes.getMatrixAt(k, m);
      mw.multiplyMatrices(group.matrixWorld, m);
      const p = new THREE.Vector3();
      const qq = new THREE.Quaternion();
      mw.decompose(p, qq, sv);
      startPos.push(p);
      startQ.push(qq);
      startS.push(sv.x);
    }
    group.rotation.set(0, 0, 0);
    group.scale.setScalar(1);
    group.updateMatrixWorld(true);
    packets.visible = false;

    const { cols, rows, cells, sky } = img ? planCells(img, W, H) : { cols: 40, rows: 25, cells: [], sky: [230, 230, 230] };
    skyColor.setRGB(sky[0] / 255, sky[1] / 255, sky[2] / 255, THREE.SRGBColorSpace);
    // the visible plane through the origin, seen by the centred camera
    const hw = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360);
    const ww = hw * camera.aspect;
    const cw = ww / cols;
    const ch = hw / rows;
    // pair cubes and cells bottom-up, so the building rises floor by floor
    const order = startPos.map((p, k) => k).sort((a, b) => startPos[a].y - startPos[b].y);
    const targets = cells
      .map((c) => ({ ...c, wx: -ww / 2 + (c.x + 0.5) * cw, wy: hw / 2 - (c.y + 0.5) * ch }))
      .sort((a, b) => a.wy - b.wy || a.wx - b.wx);
    const color = new THREE.Color();
    plan = { to: new Array(COUNT), delay: new Float32Array(COUNT), size: Math.max(cw, ch) * 1.02 };
    order.forEach((k, n) => {
      const tgt = targets.length ? targets[Math.floor((n / COUNT) * targets.length)] : { wx: 0, wy: 0, rgb: [200, 200, 200], y: rows };
      plan.to[k] = new THREE.Vector3(tgt.wx, tgt.wy, 0);
      plan.delay[k] = (1 - tgt.y / rows) * 0.45 + ((k * 37) % 100) / 100 * 0.06;
      color.setRGB(tgt.rgb[0] / 255, tgt.rgb[1] / 255, tgt.rgb[2] / 255, THREE.SRGBColorSpace);
      tones.setColorAt(k, color);
    });
    tones.instanceColor.needsUpdate = true;
    tones.visible = true;
  };

  const writeBuild = () => {
    for (let k = 0; k < COUNT; k++) {
      const t = ease(Math.min(1, Math.max(0, (build - plan.delay[k]) / 0.5)));
      // each cube arcs towards the viewer on its way, then lands flat in its cell
      tPos.lerpVectors(startPos[k], plan.to[k], t);
      tPos.z += Math.sin(t * Math.PI) * 0.8;
      tq.slerpQuaternions(startQ[k], one, t);
      m.compose(tPos, tq, tmpS.setScalar(startS[k] + (plan.size - startS[k]) * t));
      cubes.setMatrixAt(k, m);
      tones.setMatrixAt(k, m);
    }
    cubes.instanceMatrix.needsUpdate = true;
    tones.instanceMatrix.needsUpdate = true;
    const look = Math.min(1, Math.max(0, (build - 0.25) / 0.6));
    cubes.material.opacity = 1 - look;
    tones.material.opacity = look;
    uniforms.uBuild.value = look;
    scene.background.lerpColors(black, skyColor, Math.min(1, Math.max(0, (build - 0.45) / 0.55)));
  };

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
    tones.material.dispose();
    packets.geometry.dispose();
    packets.material.dispose();
    quad.geometry.dispose();
    quad.material.dispose();
    rt.dispose();
    uniforms.tImage.value?.dispose();
    renderer.dispose();
  };

  return { dispose, setHost, state, uniforms, loadImage, beginBuild, capture, dpr };
}
