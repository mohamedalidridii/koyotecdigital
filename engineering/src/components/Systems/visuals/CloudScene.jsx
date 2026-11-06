"use client";

// Cloud — "Harbor", an isometric blueprint. One overloaded server drops requests; then the new
// infrastructure draws itself from code, spreads over three zones, scales with a traffic peak and
// ships its backups to a vault. Visitors' requests flow through it as particles.
import v from "./Visual.module.css";

import { useRef } from "react";

import { band, follow, rng, toScreen, useStage } from "../lib";

const CYAN = 0x79d0ff;
const RED = 0xff5a4f;
const ZONES = [-3, 0, 3];
const MAX_PARTICLES = 220;
const CODE = [
  'resource "aws_lb" "shop" {',
  "  subnets = module.vpc.public",
  "}",
  'resource "aws_autoscaling_group" "web" {',
  "  availability_zones = 3",
  "  min_size = 3",
  "  max_size = 9",
  "}",
];

export default function CloudScene({ progress, content, reduced, near }) {
  const hostRef = useRef(null);
  const tagRefs = useRef({});
  const codeRef = useRef(null);
  const codeLineRefs = useRef([]);
  const metricsRef = useRef(null);
  const loadRef = useRef(null);
  const loadValRef = useRef(null);
  const serversValRef = useRef(null);
  const costRef = useRef(null);

  useStage(hostRef, near, {
    camera: (THREE) => {
      const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -50, 100);
      cam.position.set(12, 12, 12);
      cam.lookAt(-0.5, 0.6, 0.9);
      return cam;
    },
    setup: ({ THREE, scene, camera }) => {
      const R = rng(5);
      const line = (color, opacity = 1) => new THREE.LineBasicMaterial({ color, transparent: true, opacity });
      const face = (color, opacity) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
      // a block grows from the ground: geometry sits on y = 0
      const block = (geo, { color = CYAN, faces = 0.07, wire = false } = {}) => {
        const g = new THREE.Group();
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), line(color));
        g.add(edges);
        if (!wire) g.add(new THREE.Mesh(geo, face(color, faces)));
        g.userData.edges = edges;
        g.userData.faces = faces;
        scene.add(g);
        return g;
      };
      const box = (w, h, d) => new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0);
      const setReveal = (g, r) => {
        g.visible = r > 0.001;
        g.scale.y = Math.max(r, 0.001);
        g.children.forEach((c) => {
          if (c.isLineSegments) c.material.opacity = r;
          else c.material.opacity = g.userData.faces * r;
        });
      };

      // blueprint grid
      const gp = [];
      for (let i = -9; i <= 9; i++) gp.push(i, 0, -9, i, 0, 9, -9, 0, i, 9, 0, i);
      const gridGeo = new THREE.BufferGeometry();
      gridGeo.setAttribute("position", new THREE.Float32BufferAttribute(gp, 3));
      scene.add(new THREE.LineSegments(gridGeo, line(CYAN, 0.09)));

      const mono = block(box(1.4, 1.9, 1.4));
      mono.position.set(0, 0, 0.6);
      const zones = ZONES.map((x) => {
        const z = block(box(2.6, 0.06, 3.5), { faces: 0.05 });
        z.position.set(x, 0, 0);
        return z;
      });
      const lb = block(box(7.6, 0.28, 0.7));
      lb.position.set(0, 0, 2.6);
      const cdn = block(new THREE.IcosahedronGeometry(0.6, 1), { wire: true });
      cdn.position.set(-2.6, 2.2, 4.6);
      const servers = ZONES.map((x) =>
        [-0.78, 0, 0.78].map((dx) => {
          const s = block(box(0.56, 0.95, 0.56), { faces: 0.12 });
          s.position.set(x + dx, 0.06, 0.55);
          return s;
        }),
      );
      const dbs = ZONES.map((x) => {
        const d = block(new THREE.CylinderGeometry(0.45, 0.45, 0.75, 24, 1).translate(0, 0.375, 0), { faces: 0.1 });
        d.position.set(x, 0.06, -1.0);
        return d;
      });
      const vault = block(box(1.3, 1.1, 1.3), { faces: 0.1 });
      vault.position.set(5.8, 0, -2.8);
      const snaps = [0, 1, 2].map(() => {
        const s = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), face(CYAN, 0.9));
        scene.add(s);
        return s;
      });

      // requests: particles that follow little routes through the system
      const pos = new Float32Array(MAX_PARTICLES * 3);
      const col = new Float32Array(MAX_PARTICLES * 3);
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      pGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.11, vertexColors: true, transparent: true, opacity: 0.95 }));
      pts.frustumCulled = false;
      scene.add(pts);
      const parts = Array.from({ length: MAX_PARTICLES }, () => ({ alive: false, route: null, lens: null, d: 0, speed: 0, drop: false }));

      return {
        THREE, R, setReveal, mono, zones, lb, cdn, servers, dbs, vault, snaps, parts, pos, col, pGeo,
        users: new THREE.Vector3(-5.9, 0.35, 5.0),
        tmp: new THREE.Vector3(),
        sc: {},
        spawnAcc: 0,
        anchors: {
          users: new THREE.Vector3(-5.9, 0.6, 5.0),
          cdn: new THREE.Vector3(-2.6, 3.0, 4.6),
          lb: new THREE.Vector3(-3.6, 0.5, 2.6),
          mono: new THREE.Vector3(0, 2.1, 0.6),
          zoneA: new THREE.Vector3(-3, 0.1, 1.85),
          zoneB: new THREE.Vector3(0, 0.1, 1.85),
          zoneC: new THREE.Vector3(3, 0.1, 1.85),
          db: new THREE.Vector3(3, 1.0, -1.0),
          vault: new THREE.Vector3(5.8, 1.35, -2.8),
        },
        resize(w, h) {
          const aspect = w / h;
          const needW = aspect < 1 ? 13.5 : 15;
          const needH = 8.2;
          let vw;
          let vh;
          if (aspect > needW / needH) {
            vh = needH;
            vw = vh * aspect;
          } else {
            vw = needW;
            vh = vw / aspect;
          }
          camera.left = -vw / 2;
          camera.right = vw / 2;
          camera.top = vh / 2;
          camera.bottom = -vh / 2;
          camera.updateProjectionMatrix();
        },
      };
    },
    frame: ({ camera, width, height, time }, s, dt) => {
      const p = follow(progress, reduced);
      const t = reduced ? 0 : time;
      const { THREE } = s;

      // ----- the story, as reveal amounts
      const monoR = 1 - band(p, 0.2, 0.28);
      const zoneR = ZONES.map((_, i) => band(p, 0.25 + i * 0.03, 0.31 + i * 0.03));
      const lbR = band(p, 0.3, 0.36);
      const cdnR = band(p, 0.32, 0.38);
      const dbR = [band(p, 0.34, 0.4), band(p, 0.46, 0.54), band(p, 0.48, 0.56)];
      const base = band(p, 0.42, 0.5);
      const peak = band(p, 0.62, 0.7) * (1 - band(p, 0.78, 0.84));
      const vaultR = band(p, 0.82, 0.88);

      s.setReveal(s.mono, monoR);
      // the lone server glows red while it chokes
      const warn = 0.5 + 0.5 * Math.sin(t * 6);
      s.mono.userData.edges.material.color.setHex(RED).lerp(new THREE.Color(CYAN), reduced ? 0 : warn * 0.25);
      s.zones.forEach((z, i) => s.setReveal(z, zoneR[i]));
      s.setReveal(s.lb, lbR);
      s.setReveal(s.cdn, cdnR);
      s.cdn.rotation.y = t * 0.3;
      s.dbs.forEach((d, i) => s.setReveal(d, dbR[i]));
      s.servers.forEach((row) =>
        row.forEach((srv, j) => s.setReveal(srv, j === 1 ? base : band(peak, j === 0 ? 0.1 : 0.4, j === 0 ? 0.5 : 0.85))),
      );
      s.setReveal(s.vault, vaultR);
      s.snaps.forEach((snap, i) => {
        const k = (t * 0.35 + i / 3) % 1;
        snap.visible = vaultR > 0.5 && !reduced;
        snap.position.lerpVectors(s.dbs[i].position.clone().setY(0.9), s.vault.position.clone().setY(0.6), k);
        snap.position.y += Math.sin(k * Math.PI) * 1.4;
      });

      // ----- requests
      const live = s.servers.flatMap((row) => row.filter((srv) => srv.scale.y > 0.6));
      const phaseOld = monoR > 0.5;
      const phaseNew = base > 0.5;
      const rate = reduced ? 0 : phaseOld ? 26 : phaseNew ? 16 + peak * 46 : 0;
      s.spawnAcc += rate * Math.min(dt, 0.05);
      const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
      while (s.spawnAcc >= 1) {
        s.spawnAcc -= 1;
        const part = s.parts.find((q) => !q.alive);
        if (!part) break;
        const jitter = () => (s.R() - 0.5) * 0.6;
        const from = v3(s.users.x + jitter(), s.users.y, s.users.z + jitter());
        let route;
        part.drop = false;
        if (phaseOld) {
          const hitPt = v3(jitter() * 0.6, 1.0 + s.R() * 0.8, 0.6 + jitter() * 0.6);
          part.drop = s.R() < 0.42;
          route = part.drop ? [from, hitPt, v3(hitPt.x + jitter() * 2, 0.02, hitPt.z + 1 + s.R())] : [from, hitPt];
        } else {
          const srv = live.length ? live[Math.floor(s.R() * live.length)] : s.servers[1][1];
          const zi = Math.round((srv.position.x + 3) / 3);
          const db = s.dbs[dbR[zi] > 0.5 ? zi : 0];
          route = [
            from,
            v3(s.cdn.position.x + jitter() * 0.3, s.cdn.position.y, s.cdn.position.z),
            v3(srv.position.x, 0.4, 2.6),
            v3(srv.position.x, 0.6, srv.position.z),
            v3(db.position.x + jitter() * 0.3, 0.5, db.position.z),
          ];
        }
        part.route = route;
        part.lens = route.slice(1).map((pt, i) => pt.distanceTo(route[i]));
        part.d = 0;
        part.speed = 4.2 + s.R() * 2.2;
        part.alive = true;
      }
      const cyan = new THREE.Color(CYAN);
      const red = new THREE.Color(RED);
      s.parts.forEach((part, i) => {
        if (!part.alive) {
          s.pos[i * 3 + 1] = -100;
          return;
        }
        part.d += part.speed * Math.min(dt, 0.05);
        let d = part.d;
        let k = 0;
        while (k < part.lens.length && d > part.lens[k]) {
          d -= part.lens[k];
          k += 1;
        }
        if (k >= part.lens.length) {
          part.alive = false;
          s.pos[i * 3 + 1] = -100;
          return;
        }
        s.tmp.lerpVectors(part.route[k], part.route[k + 1], d / part.lens[k]);
        s.pos.set([s.tmp.x, s.tmp.y, s.tmp.z], i * 3);
        const c = part.drop && k >= 1 ? red : cyan;
        s.col.set([c.r, c.g, c.b], i * 3);
      });
      s.pGeo.attributes.position.needsUpdate = true;
      s.pGeo.attributes.color.needsUpdate = true;

      // ----- labels and cards
      const tag = (key, anchor, opacity) => {
        const el = tagRefs.current[key];
        if (!el) return;
        toScreen(s.tmp.copy(anchor), camera, width, height, s.sc);
        el.style.transform = `translate(${s.sc.x}px, ${s.sc.y}px) translate(-50%, -100%)`;
        el.style.opacity = String(opacity);
      };
      const A = s.anchors;
      tag("users", A.users, 1);
      tag("mono", A.mono, monoR);
      tag("cdn", A.cdn, cdnR);
      tag("lb", A.lb, lbR);
      tag("zoneA", A.zoneA, zoneR[0]);
      tag("zoneB", A.zoneB, zoneR[1]);
      tag("zoneC", A.zoneC, zoneR[2]);
      tag("db", A.db, dbR[2]);
      tag("vault", A.vault, vaultR);

      const codeOn = band(p, 0.2, 0.24) * (1 - band(p, 0.4, 0.44));
      codeRef.current.style.opacity = String(codeOn);
      const typed = band(p, 0.22, 0.38) * CODE.length;
      codeLineRefs.current.forEach((el, i) => el && (el.style.opacity = String(Math.min(1, Math.max(0, typed - i)))));

      metricsRef.current.style.opacity = String(band(p, 0.58, 0.62));
      const load = 0.38 + peak * 0.5;
      loadRef.current.style.transform = `scaleX(${load})`;
      loadRef.current.parentElement.toggleAttribute("data-hot", load > 0.75);
      loadValRef.current.textContent = `${Math.round(load * 100)} %`;
      serversValRef.current.textContent = String(live.length || 3);
      costRef.current.style.opacity = String(band(p, 0.84, 0.9));
    },
  });

  const z = content.zones;
  const tags = [
    ["users", content.users],
    ["mono", `${content.monolith} · ${content.overload}`],
    ["cdn", content.cdn],
    ["lb", content.lb],
    ["zoneA", z[0]],
    ["zoneB", z[1]],
    ["zoneC", z[2]],
    ["db", content.db],
    ["vault", content.vault],
  ];

  return (
    <div ref={hostRef} className={`${v.host} ${v.cloud}`}>
      <div className={v.layer} aria-hidden="true">
        {tags.map(([key, label]) => (
          <span
            key={key}
            ref={(el) => (tagRefs.current[key] = el)}
            className={v.tag}
            style={{ opacity: 0 }}
            {...(key === "mono" ? { "data-warn": "" } : {})}
          >
            {label}
          </span>
        ))}
        <div ref={codeRef} className={`${v.card} ${v.code}`} style={{ opacity: 0 }}>
          {CODE.map((l, i) => (
            <div key={i} ref={(el) => (codeLineRefs.current[i] = el)} style={{ opacity: 0 }}>
              {l.startsWith("resource") ? (
                <>
                  <b>resource</b>
                  {l.slice(8)}
                </>
              ) : (
                l
              )}
            </div>
          ))}
        </div>
        <div ref={metricsRef} className={`${v.card} ${v.metrics}`} style={{ opacity: 0 }}>
          <div className={v.metric}>
            <span className={v.mono}>
              {content.load} <span ref={loadValRef}>38 %</span>
            </span>
            <span className={v.meter}>
              <i ref={loadRef} />
            </span>
          </div>
          <div className={v.metric}>
            <span className={v.mono}>
              {content.servers} <span ref={serversValRef}>3</span>
            </span>
          </div>
          <div ref={costRef} className={v.metric} style={{ opacity: 0 }}>
            <span className={v.mono}>
              {content.cost} <span>✓</span>
            </span>
            <span className={v.meter}>
              <i style={{ transform: "scaleX(0.62)" }} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
