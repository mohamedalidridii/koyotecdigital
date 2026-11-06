"use client";

// GraphRAG — documents from three tools unfold into a knowledge graph; a question then walks a
// multi-hop path through it (machine → incident → procedure → decision) and the answer cites
// every hop.
import v from "@/components/Systems/visuals/Visual.module.css";
import s from "./AiVisual.module.css";

import { useRef } from "react";

import { band, follow, rng, toScreen, typed, useStage } from "@/components/Systems/lib";

const PATH_LEN = 5;
const BLOBS = [
  [-2.2, 0.35, 0],
  [0, -0.35, 0],
  [2.2, 0.35, 0],
];
// which tool each node of the answer path comes from (Jira, Confluence, Teams)
const PATH_SOURCE = [0, 0, 0, 1, 2];
// where the answer path sits in the final graph: spread left to right, zig-zagging
const PATH_AT = [
  [-2.0, 0.9, 0.2],
  [-1.05, -0.55, 0.5],
  [0.05, 0.85, 0.1],
  [1.05, -0.6, 0.45],
  [1.95, 0.7, 0.05],
];

const VERT = /* glsl */ `
  attribute vec3 posA;
  attribute vec3 posB;
  attribute float rnd;
  attribute float size;
  attribute float order;
  uniform float uMorph;
  uniform float uLit;
  uniform float uDim;
  uniform float uTime;
  uniform float uPR;
  varying float vLit;
  varying float vAlpha;
  void main() {
    float m = smoothstep(0., 1., clamp(uMorph * 1.4 - rnd * 0.4, 0., 1.));
    vec3 p = mix(posA, posB, m);
    p += 0.03 * vec3(sin(uTime * 0.8 + rnd * 30.), cos(uTime * 0.7 + rnd * 20.), 0.) * m;
    vec4 mv = modelViewMatrix * vec4(p, 1.);
    gl_Position = projectionMatrix * mv;
    vLit = order > 0. ? clamp(uLit - order + 1., 0., 1.) : 0.;
    float onPath = order > 0. ? 1. : 0.;
    gl_PointSize = (size * (1. + 0.8 * m) + vLit * 7.) * uPR * (6. / -mv.z);
    vAlpha = mix(1., 0.32, uDim * (1. - onPath));
  }
`;
const FRAG = /* glsl */ `
  varying float vLit;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float ring = smoothstep(0.5, 0.42, d) * (1. - smoothstep(0.3, 0.22, d));
    vec3 paper = vec3(0.953, 0.945, 0.925);
    vec3 red = vec3(1., 0., 0.);
    vec3 col = mix(paper, red, vLit);
    // lit nodes become rings with a core, the rest stay solid dots
    float a = mix(1., max(ring, step(d, 0.14)), vLit);
    gl_FragColor = vec4(col, a * vAlpha);
  }
`;

export default function GraphScene({ progress, content, reduced, near }) {
  const hostRef = useRef(null);
  const srcRefs = useRef([]);
  const pathRefs = useRef([]);
  const legendRef = useRef(null);
  const bubbleRef = useRef(null);
  const qRef = useRef(null);
  const answerRef = useRef(null);
  const aRef = useRef(null);
  const citesRef = useRef(null);

  useStage(hostRef, near, {
    camera: (THREE) => new THREE.PerspectiveCamera(36, 1, 0.1, 100),
    setup: ({ THREE, scene, camera }) => {
      const R = rng(21);
      const N = window.innerWidth < 800 ? 120 : 170;
      const gauss = () => (R() + R() + R() - 1.5) * 0.5;
      const src = new Array(N);
      const order = new Float32Array(N);
      for (let i = 0; i < N; i++) src[i] = i < PATH_LEN ? PATH_SOURCE[i] : i % 3;
      for (let i = 0; i < PATH_LEN; i++) order[i] = i + 1;

      // edges: a few links per node, often across tools, plus the answer path itself
      const edges = [];
      const has = new Set();
      const link = (a, b) => {
        if (a === b) return;
        const k = a < b ? `${a}-${b}` : `${b}-${a}`;
        if (has.has(k)) return;
        has.add(k);
        edges.push([a, b]);
      };
      for (let i = 0; i < PATH_LEN - 1; i++) link(i, i + 1);
      for (let i = 0; i < N; i++) {
        const n = 1 + Math.floor(R() * 2);
        for (let j = 0; j < n; j++) {
          let t = Math.floor(R() * N);
          if (R() < 0.55) while (src[t] !== src[i]) t = Math.floor(R() * N);
          link(i, t);
        }
      }

      // force-directed layout, computed once
      const P = Array.from({ length: N }, () => [(R() - 0.5) * 4, (R() - 0.5) * 3, (R() - 0.5) * 3]);
      const F = P.map(() => [0, 0, 0]);
      // pinned nodes use the force layout's own scale (it is fitted to 2.5 afterwards)
      PATH_AT.forEach((at, i) => (P[i] = [at[0], at[1], at[2]]));
      for (let it = 0; it < 160; it++) {
        F.forEach((f) => f.fill(0));
        for (let a = 0; a < N; a++) {
          for (let b = a + 1; b < N; b++) {
            const d = [P[a][0] - P[b][0], P[a][1] - P[b][1], P[a][2] - P[b][2]];
            const l2 = d[0] * d[0] + d[1] * d[1] + d[2] * d[2] + 0.01;
            const k = 0.012 / l2;
            for (let x = 0; x < 3; x++) {
              F[a][x] += d[x] * k;
              F[b][x] -= d[x] * k;
            }
          }
        }
        for (const [a, b] of edges) {
          for (let x = 0; x < 3; x++) {
            const d = (P[b][x] - P[a][x]) * 0.035;
            F[a][x] += d;
            F[b][x] -= d;
          }
        }
        for (let a = PATH_LEN; a < N; a++) for (let x = 0; x < 3; x++) P[a][x] += F[a][x] - P[a][x] * 0.004;
      }
      // fit into a 2.4 radius, flattened a little in depth
      const maxR = Math.max(...P.slice(PATH_LEN).map((p) => Math.hypot(p[0], p[1] * 1.3, p[2])));
      const posB = new Float32Array(N * 3);
      P.forEach((p, i) => posB.set([(p[0] / maxR) * 2.5, (p[1] / maxR) * 1.9, (p[2] / maxR) * 1.6], i * 3));
      // the path keeps its exact, readable positions
      PATH_AT.forEach((at, i) => posB.set([at[0] * 0.85, at[1] * 0.85, at[2]], i * 3));

      const posA = new Float32Array(N * 3);
      const rnd = new Float32Array(N);
      const size = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        const b = BLOBS[src[i]];
        posA.set([b[0] + gauss() * 0.9, b[1] + gauss() * 1.2, b[2] + gauss() * 0.6], i * 3);
        rnd[i] = R();
        size[i] = i < PATH_LEN ? 4.2 : 2 + R() * 2.4;
      }

      const group = new THREE.Group();
      scene.add(group);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(posB, 3));
      geo.setAttribute("posA", new THREE.BufferAttribute(posA, 3));
      geo.setAttribute("posB", new THREE.BufferAttribute(posB, 3));
      geo.setAttribute("rnd", new THREE.BufferAttribute(rnd, 1));
      geo.setAttribute("size", new THREE.BufferAttribute(size, 1));
      geo.setAttribute("order", new THREE.BufferAttribute(order, 1));
      const uniforms = {
        uMorph: { value: 0 },
        uLit: { value: 0 },
        uDim: { value: 0 },
        uTime: { value: 0 },
        uPR: { value: Math.min(window.devicePixelRatio, 2) },
      };
      const points = new THREE.Points(
        geo,
        new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, depthWrite: false }),
      );
      points.frustumCulled = false;
      group.add(points);

      const ep = new Float32Array(edges.length * 6);
      edges.forEach(([a, b], k) => {
        ep.set(posB.subarray(a * 3, a * 3 + 3), k * 6);
        ep.set(posB.subarray(b * 3, b * 3 + 3), k * 6 + 3);
      });
      const eGeo = new THREE.BufferGeometry();
      eGeo.setAttribute("position", new THREE.BufferAttribute(ep, 3));
      const eMat = new THREE.LineBasicMaterial({ color: 0xf3f1ec, transparent: true, opacity: 0 });
      group.add(new THREE.LineSegments(eGeo, eMat));

      // the answer path, drawn hop by hop in red
      const pp = new Float32Array((PATH_LEN - 1) * 6);
      for (let i = 0; i < PATH_LEN - 1; i++) {
        pp.set(posB.subarray(i * 3, i * 3 + 3), i * 6);
        pp.set(posB.subarray((i + 1) * 3, (i + 1) * 3 + 3), i * 6 + 3);
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute("position", new THREE.BufferAttribute(pp, 3));
      pGeo.setDrawRange(0, 0);
      const pMat = new THREE.LineBasicMaterial({ color: 0xff0000, transparent: true, opacity: 1 });
      group.add(new THREE.LineSegments(pGeo, pMat));

      const host = hostRef.current;
      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      const onMove = (e) => {
        const r = host.getBoundingClientRect();
        pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      };
      host.addEventListener("pointermove", onMove);

      return {
        uniforms, group, eMat, pGeo, posB, pointer,
        v3: new THREE.Vector3(),
        sc: {},
        resize(w, h) {
          camera.aspect = w / h;
          const fov = (camera.fov * Math.PI) / 180;
          const fitH = 2.6 / Math.tan(fov / 2);
          const fitW = 3.3 / (Math.tan(fov / 2) * camera.aspect);
          camera.position.set(0, 0, Math.max(fitH, fitW));
          camera.updateProjectionMatrix();
        },
        dispose() {
          host.removeEventListener("pointermove", onMove);
        },
      };
    },
    frame: ({ camera, width, height, time }, st) => {
      const p = follow(progress, reduced);
      const t = reduced ? 0 : time;
      const morph = band(p, 0.18, 0.38);
      const edges = band(p, 0.36, 0.5);
      const lit = band(p, 0.6, 0.78) * PATH_LEN;
      const dim = band(p, 0.58, 0.66);

      st.pointer.x += (st.pointer.tx - st.pointer.x) * 0.05;
      st.pointer.y += (st.pointer.ty - st.pointer.y) * 0.05;
      // the graph turns slowly, and slows down to let the path be read
      st.group.rotation.y = morph * ((reduced ? 0.4 : 0.4 + t * 0.07 * (1 - dim * 0.8)) + st.pointer.x * 0.3);
      st.group.rotation.x = st.pointer.y * 0.12 * morph;

      const u = st.uniforms;
      u.uMorph.value = morph;
      u.uLit.value = lit;
      u.uDim.value = dim;
      u.uTime.value = t;
      st.eMat.opacity = edges * (0.16 - dim * 0.08);
      st.pGeo.setDrawRange(0, Math.max(0, Math.floor(lit - 0.5)) * 2);
      st.group.updateMatrixWorld();

      srcRefs.current.forEach((el, i) => {
        if (!el) return;
        toScreen(st.v3.set(BLOBS[i][0], BLOBS[i][1] + 1.25, 0), camera, width, height, st.sc);
        el.style.transform = `translate(${st.sc.x}px, ${st.sc.y}px) translate(-50%, -50%)`;
        el.style.opacity = String(1 - band(morph, 0, 0.4));
      });
      pathRefs.current.forEach((el, i) => {
        if (!el) return;
        st.v3.fromArray(st.posB, i * 3);
        st.group.localToWorld(st.v3);
        toScreen(st.v3, camera, width, height, st.sc);
        // labels near the right edge sit on the left of their node, so they never leave the frame
        const flip = st.sc.x > width * 0.62;
        el.style.transform = `translate(${st.sc.x}px, ${st.sc.y}px) translate(${flip ? "calc(-100% - 12px)" : "12px"}, -50%)`;
        el.style.opacity = String(band(lit, i + 0.3, i + 0.9));
      });
      legendRef.current.style.opacity = String(band(p, 0.4, 0.46) * (1 - dim * 0.5));

      bubbleRef.current.style.opacity = String(band(p, 0.56, 0.6));
      qRef.current.textContent = typed(content.question, band(p, 0.57, 0.66));
      answerRef.current.style.opacity = String(band(p, 0.82, 0.86));
      answerRef.current.style.transform = `translateY(${(1 - band(p, 0.82, 0.88)) * 16}px)`;
      aRef.current.textContent = typed(content.answer, band(p, 0.84, 0.95));
      citesRef.current.style.opacity = String(band(p, 0.95, 0.99));
    },
  });

  return (
    <div ref={hostRef} className={`${v.host} ${v.ai}`}>
      <div className={v.layer} aria-hidden="true">
        {content.sources.map((name, i) => (
          <span key={name} ref={(el) => (srcRefs.current[i] = el)} className={`${v.tag} ${v.clusterTag}`}>
            {name}
          </span>
        ))}
        {content.path.map((name, i) => (
          <span key={name} ref={(el) => (pathRefs.current[i] = el)} className={`${v.tag} ${s.pathTag}`} style={{ opacity: 0 }}>
            <i>{content.sources[PATH_SOURCE[i]]}</i> {name}
          </span>
        ))}
        <div ref={legendRef} className={s.legend} style={{ opacity: 0 }}>
          {content.kinds.map((k) => (
            <span key={k}>
              <i /> {k}
            </span>
          ))}
        </div>
        <div ref={bubbleRef} className={`${v.card} ${v.bubble}`} style={{ opacity: 0 }}>
          <span className={v.mono}>{content.you}</span>
          <span ref={qRef} className={v.caret} />
        </div>
        <div ref={answerRef} className={`${v.card} ${v.answer}`} style={{ opacity: 0 }}>
          <span className={v.mono}>{content.assistant}</span>
          <span ref={aRef} />
          <div ref={citesRef} className={v.sources} style={{ opacity: 0 }}>
            {content.cites.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
