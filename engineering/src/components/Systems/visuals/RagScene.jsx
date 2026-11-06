"use client";

// AI — "Atlas", a retrieval assistant. Thousands of points first draw six documents as lines of
// text, then fold into a 3D space of meaning (one cluster per kind of document). A question flies
// in, the closest passages light up and stream into a sourced answer.
import v from "./Visual.module.css";

import { useRef } from "react";

import { band, follow, rng, toScreen, useStage } from "../lib";

const PAGE_W = 1.25;
const PAGE_H = 1.6;
const GAP_X = 0.45;
const GAP_Y = 0.42;
const LINES = 15;
const HITS = 44;
// semantic space: RH and Procédures sit close together, the question lands between them
const CENTERS = [
  [-1.75, 0.55, 0.35],
  [0.15, 1.05, -0.45],
  [1.15, 0.75, 0.2],
  [-1.15, -1.0, -0.4],
  [0.35, -0.75, 0.85],
  [1.65, -0.95, -0.45],
];
const QUERY = [0.62, 0.86, -0.15];

const VERT = /* glsl */ `
  attribute vec3 posA;
  attribute vec3 posB;
  attribute float rnd;
  attribute float hit;
  uniform float uMorph;
  uniform float uHit;
  uniform float uPull;
  uniform float uRot;
  uniform float uTime;
  uniform float uPR;
  uniform vec3 uAnswer;
  varying float vHit;
  varying float vAlpha;
  mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0., -s, 0., 1., 0., s, 0., c); }
  void main() {
    float m = smoothstep(0., 1., clamp(uMorph * 1.5 - rnd * 0.5, 0., 1.));
    vec3 b = rotY(uRot) * posB;
    b += 0.035 * vec3(sin(uTime * 0.7 + rnd * 40.), cos(uTime * 0.6 + rnd * 31.), sin(uTime * 0.5 + rnd * 17.));
    // halfway through the fold, points arc forward instead of sliding flat
    vec3 p = mix(posA, b, m) + vec3(0., 0., sin(m * 3.14159) * (rnd - 0.3) * 1.2);
    float pull = hit * smoothstep(0., 1., clamp(uPull * 1.4 - rnd * 0.4, 0., 1.));
    vec3 target = uAnswer + vec3((rnd - 0.5) * 0.35, (fract(rnd * 7.31) - 0.5) * 0.35, (fract(rnd * 3.7) - 0.5) * 0.3);
    p = mix(p, target, pull);
    vec4 mv = modelViewMatrix * vec4(p, 1.);
    gl_Position = projectionMatrix * mv;
    vHit = hit * uHit;
    gl_PointSize = (2.1 + vHit * 3.2) * uPR * (6.5 / -mv.z);
    vAlpha = mix(0.62, 1., vHit) * (1. - (1. - hit) * uPull * 0.55);
  }
`;
const FRAG = /* glsl */ `
  varying float vHit;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (dot(c, c) > 0.25) discard;
    vec3 paper = vec3(0.953, 0.945, 0.925);
    vec3 red = vec3(1., 0., 0.);
    gl_FragColor = vec4(mix(paper, red, vHit), vAlpha);
  }
`;

export default function RagScene({ progress, content, reduced, near }) {
  const hostRef = useRef(null);
  const fileRefs = useRef([]);
  const clusterRefs = useRef([]);
  const bubbleRef = useRef(null);
  const questionRef = useRef(null);
  const answerRef = useRef(null);
  const answerTextRef = useRef(null);
  const sourcesRef = useRef(null);

  useStage(hostRef, near, {
    camera: (THREE) => new THREE.PerspectiveCamera(36, 1, 0.1, 100),
    setup: ({ THREE, scene, camera }) => {
      const small = window.innerWidth < 800;
      const N = small ? 2600 : 4600;
      const R = rng(11);
      const posA = new Float32Array(N * 3);
      const posB = new Float32Array(N * 3);
      const rnd = new Float32Array(N);
      const hit = new Float32Array(N);
      const gauss = () => (R() + R() + R() - 1.5) * 0.62;

      const pages = Array.from({ length: 6 }, (_, k) => {
        const c = k % 3;
        const r = Math.floor(k / 3);
        return new THREE.Vector3((c - 1) * (PAGE_W + GAP_X), (0.5 - r) * (PAGE_H + GAP_Y), 0);
      });
      // each page has its own pattern of line lengths, like real text
      const lineLen = pages.map(() => Array.from({ length: LINES }, (_, l) => (l === 0 ? 0.55 : l % 5 === 4 ? 0.35 : 0.72 + R() * 0.28)));

      for (let i = 0; i < N; i++) {
        const k = i % 6;
        rnd[i] = R();
        const line = Math.floor(R() * LINES);
        const x = -PAGE_W / 2 + 0.14 + R() * (PAGE_W - 0.28) * lineLen[k][line];
        const y = PAGE_H / 2 - 0.2 - line * ((PAGE_H - 0.34) / (LINES - 1)) + (R() - 0.5) * (line === 0 ? 0.05 : 0.018);
        posA.set([pages[k].x + x, pages[k].y + y, (R() - 0.5) * 0.02], i * 3);
        const c = CENTERS[k];
        posB.set([c[0] + gauss(), c[1] + gauss() * 0.85, c[2] + gauss()], i * 3);
      }

      // the passages closest to the question are the ones retrieved
      const q = new THREE.Vector3(...QUERY);
      const order = Array.from({ length: N }, (_, i) => i)
        .map((i) => [i, (posB[i * 3] - q.x) ** 2 + (posB[i * 3 + 1] - q.y) ** 2 + (posB[i * 3 + 2] - q.z) ** 2])
        .sort((a, b) => a[1] - b[1])
        .slice(0, HITS)
        .map(([i]) => i);
      order.forEach((i) => (hit[i] = 1));
      const hitClusters = new Set(order.map((i) => i % 6));

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(posA, 3));
      geo.setAttribute("posA", new THREE.BufferAttribute(posA, 3));
      geo.setAttribute("posB", new THREE.BufferAttribute(posB, 3));
      geo.setAttribute("rnd", new THREE.BufferAttribute(rnd, 1));
      geo.setAttribute("hit", new THREE.BufferAttribute(hit, 1));
      const uniforms = {
        uMorph: { value: 0 },
        uHit: { value: 0 },
        uPull: { value: 0 },
        uRot: { value: 0 },
        uTime: { value: 0 },
        uPR: { value: Math.min(window.devicePixelRatio, 2) },
        uAnswer: { value: new THREE.Vector3(2.2, -1.55, 0.6) },
      };
      const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, depthWrite: false });
      const points = new THREE.Points(geo, mat);
      points.frustumCulled = false;
      scene.add(points);

      // the question: a red core with a halo
      const query = new THREE.Group();
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.07, 20, 20), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
      const halo = new THREE.Mesh(new THREE.RingGeometry(0.14, 0.16, 48), new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, side: THREE.DoubleSide }));
      query.add(core, halo);
      scene.add(query);

      // retrieval lines from the question to every retrieved passage
      const linePos = new Float32Array(HITS * 6);
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
      const lineMat = new THREE.LineBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0 });
      const lines = new THREE.LineSegments(lineGeo, lineMat);
      lines.frustumCulled = false;
      scene.add(lines);

      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      const host = hostRef.current;
      const onMove = (e) => {
        const r = host.getBoundingClientRect();
        pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      };
      host.addEventListener("pointermove", onMove);

      clusterRefs.current.forEach((el, k) => el && el.toggleAttribute("data-hit", hitClusters.has(k)));

      return {
        uniforms, query, halo, lines, linePos, lineGeo, lineMat, order, posB, pages, pointer, q,
        tmp: new THREE.Vector3(),
        start: new THREE.Vector3(-3.4, -2.4, 1.6),
        rotY: (vec, a) => vec.set(vec.x * Math.cos(a) + vec.z * Math.sin(a), vec.y, -vec.x * Math.sin(a) + vec.z * Math.cos(a)),
        screen: {},
        resize(w, h) {
          camera.aspect = w / h;
          // fit the 4.7 x 3.7 world in view whatever the shape of the frame
          const fov = (camera.fov * Math.PI) / 180;
          const fitH = 3.9 / 2 / Math.tan(fov / 2);
          const fitW = 5.0 / 2 / (Math.tan(fov / 2) * camera.aspect);
          camera.position.set(0, 0, Math.max(fitH, fitW) * 1.04);
          camera.updateProjectionMatrix();
        },
        dispose() {
          host.removeEventListener("pointermove", onMove);
        },
      };
    },
    frame: ({ camera, width, height, time }, s) => {
      const p = follow(progress, reduced);
      const morph = band(p, 0.12, 0.36);
      const ask = band(p, 0.4, 0.54);
      const find = band(p, 0.58, 0.72);
      const pull = band(p, 0.8, 0.94);
      const t = reduced ? 0 : time;

      s.pointer.x += (s.pointer.tx - s.pointer.x) * 0.05;
      s.pointer.y += (s.pointer.ty - s.pointer.y) * 0.05;
      const rot = morph * (reduced ? 0.35 : 0.35 + t * 0.06) + s.pointer.x * 0.25 * morph;
      camera.position.y = -s.pointer.y * 0.25;
      camera.lookAt(0, 0, 0);

      const u = s.uniforms;
      // the retrieved passages fly to just above the answer card, wherever the layout puts it
      const card = answerRef.current;
      const ax = card.offsetLeft + 48;
      const ay = card.offsetTop - 40;
      s.tmp.set((ax / width) * 2 - 1, -(ay / height) * 2 + 1, 0.5).unproject(camera).sub(camera.position).normalize();
      u.uAnswer.value.copy(camera.position).addScaledVector(s.tmp, (0.4 - camera.position.z) / s.tmp.z);
      u.uMorph.value = morph;
      u.uHit.value = find;
      u.uPull.value = pull;
      u.uRot.value = rot;
      u.uTime.value = t;

      // the question travels from the bubble into the space, then hands over to the answer
      const qr = s.rotY(s.tmp.copy(s.q), rot);
      s.query.position.lerpVectors(s.start, qr, ask);
      const qs = ask * (1 - pull);
      s.query.scale.setScalar(Math.max(qs, 0.0001));
      s.halo.lookAt(camera.position);
      s.halo.scale.setScalar(1 + ((t * 0.8) % 1) * 1.4);
      s.halo.material.opacity = (1 - ((t * 0.8) % 1)) * qs;

      const lp = s.linePos;
      s.order.forEach((i, k) => {
        const b = s.rotY(s.tmp.set(s.posB[i * 3], s.posB[i * 3 + 1], s.posB[i * 3 + 2]), rot);
        lp[k * 6] = s.query.position.x;
        lp[k * 6 + 1] = s.query.position.y;
        lp[k * 6 + 2] = s.query.position.z;
        lp[k * 6 + 3] = b.x;
        lp[k * 6 + 4] = b.y;
        lp[k * 6 + 5] = b.z;
      });
      s.lineGeo.attributes.position.needsUpdate = true;
      s.lineMat.opacity = find * (1 - pull) * 0.55;

      // labels: file names under the pages, then the clusters' names in the space
      const sc = s.screen;
      fileRefs.current.forEach((el, k) => {
        if (!el) return;
        toScreen(s.tmp.copy(s.pages[k]).setY(s.pages[k].y - PAGE_H / 2 - 0.12), camera, width, height, sc);
        el.style.transform = `translate(${sc.x}px, ${sc.y}px) translate(-50%, 0)`;
        el.style.opacity = String(1 - band(morph, 0, 0.35));
      });
      clusterRefs.current.forEach((el, k) => {
        if (!el) return;
        const c = CENTERS[k];
        s.rotY(s.tmp.set(c[0], c[1] + 0.62, c[2]), rot);
        toScreen(s.tmp, camera, width, height, sc);
        el.style.transform = `translate(${sc.x}px, ${sc.y}px) translate(-50%, -50%)`;
        const lit = el.hasAttribute("data-hit") ? 1 : 1 - find * 0.6;
        el.style.opacity = String(band(morph, 0.65, 1) * lit * (1 - pull * 0.7));
      });

      // the bubble types the question, the answer card types the answer
      const qText = content.question;
      const typed = Math.round(qText.length * band(p, 0.41, 0.52));
      questionRef.current.textContent = qText.slice(0, typed);
      bubbleRef.current.style.opacity = String(band(p, 0.38, 0.42) * (1 - band(p, 0.96, 1) * 0));
      bubbleRef.current.style.transform = `translateY(${(1 - band(p, 0.38, 0.44)) * 14}px)`;

      const aText = content.answer;
      answerTextRef.current.textContent = aText.slice(0, Math.round(aText.length * band(p, 0.86, 0.96)));
      answerRef.current.style.opacity = String(band(p, 0.83, 0.87));
      answerRef.current.style.transform = `translateY(${(1 - band(p, 0.83, 0.9)) * 18}px)`;
      sourcesRef.current.style.opacity = String(band(p, 0.95, 0.99));
    },
  });

  return (
    <div ref={hostRef} className={`${v.host} ${v.ai}`}>
      <div className={v.layer} aria-hidden="true">
        {content.files.map((f, k) => (
          <span key={f} ref={(el) => (fileRefs.current[k] = el)} className={v.tag} style={{ opacity: 1 }}>
            {f}
          </span>
        ))}
        {content.clusters.map((c, k) => (
          <span key={c} ref={(el) => (clusterRefs.current[k] = el)} className={`${v.tag} ${v.clusterTag}`} style={{ opacity: 0 }}>
            {c}
          </span>
        ))}
        <div ref={bubbleRef} className={`${v.card} ${v.bubble}`} style={{ opacity: 0 }}>
          <span className={v.mono}>{content.you}</span>
          <span ref={questionRef} className={v.caret} />
        </div>
        <div ref={answerRef} className={`${v.card} ${v.answer}`} style={{ opacity: 0 }}>
          <span className={v.mono}>{content.assistant}</span>
          <span ref={answerTextRef} />
          <div ref={sourcesRef} className={v.sources} style={{ opacity: 0 }}>
            {content.sources.map((src) => (
              <span key={src}>{src}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
