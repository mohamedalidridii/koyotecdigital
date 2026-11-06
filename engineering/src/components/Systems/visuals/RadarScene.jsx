"use client";

// Cybersecurity — "Bastion", a dithered radar in ink on red. The sweep reveals the flaws (audit),
// they get ranked (report) and closed one by one while a shield forms (hardening); then attacks
// come in and break on the shield (monitoring), and the security score climbs.
import v from "./Visual.module.css";

import { useRef } from "react";

import { band, follow, rng, useStage } from "../lib";

const MAX_BLIPS = 32;
const VULNS = 12;
const SHIELD = 0.6;

const FRAG = /* glsl */ `
  precision highp float;
  uniform vec2 uRes;
  uniform vec2 uC;
  uniform float uR;
  uniform float uPix;
  uniform float uSweep;
  uniform float uShield;
  uniform float uTime;
  uniform vec4 uB[${MAX_BLIPS}];
  const float BAYER[16] = float[16](0., 8., 2., 10., 12., 4., 14., 6., 3., 11., 1., 9., 15., 7., 13., 5.);

  float ring(float r, float at, float w) { return 1. - smoothstep(0., w, abs(r - at)); }

  void main() {
    vec2 cell = floor(gl_FragCoord.xy / uPix);
    vec2 uv = ((cell + 0.5) * uPix - uC) / uR;
    float r = length(uv);
    float a = atan(uv.y, uv.x);
    float px = uPix / uR;
    float ink = 0.;
    float solid = 0.;

    // range rings and cross-hair
    for (int k = 1; k <= 4; k++) solid = max(solid, ring(r, float(k) * 0.25, px * 0.9) * (k == 4 ? 1. : 0.75));
    float inside = step(r, 1.);
    solid = max(solid, (1. - smoothstep(0., px * 0.9, abs(uv.x))) * inside * 0.55);
    solid = max(solid, (1. - smoothstep(0., px * 0.9, abs(uv.y))) * inside * 0.55);

    // the sweep and its fading trail
    float behind = mod(uSweep - a, 6.28318);
    ink = max(ink, exp(-behind * 2.4) * inside * 0.9);
    solid = max(solid, (1. - smoothstep(0., px * 1.2, behind * r)) * inside);

    // the shield, slightly alive
    float wob = 0.012 * sin(a * 9. + uTime * 2.) * uShield;
    solid = max(solid, ring(r, ${SHIELD.toFixed(2)} + wob, px * 1.6) * step(0.5, uShield) * uShield);
    ink = max(ink, ring(r, ${SHIELD.toFixed(2)} + wob, px * 7.) * uShield * 0.55);

    // blips: z = kind (0 flaw, 1 fixed, 2 attack, 3 burst), w = strength / size
    for (int i = 0; i < ${MAX_BLIPS}; i++) {
      vec4 b = uB[i];
      if (b.w <= 0.001) continue;
      vec2 d = uv - b.xy;
      float box = max(abs(d.x), abs(d.y));
      float len = length(d);
      if (b.z < 0.5) {
        float s = 0.03 + 0.015 * b.w;
        solid = max(solid, step(box, s));
        ink = max(ink, exp(-len * 18.) * 0.7);
      } else if (b.z < 1.5) {
        solid = max(solid, (step(box, 0.04) - step(box, 0.026)) * b.w);
      } else if (b.z < 2.5) {
        solid = max(solid, step(len, 0.022));
        ink = max(ink, exp(-len * 30.) * 0.8);
      } else {
        solid = max(solid, ring(len, (1. - b.w) * 0.14 + 0.02, px * 1.4) * b.w);
        ink = max(ink, exp(-len * 22.) * b.w * 0.8);
      }
    }

    ivec2 ip = ivec2(mod(cell, 4.));
    float threshold = (BAYER[ip.x + ip.y * 4] + 0.5) / 16.;
    float on = max(solid > 0.5 ? 1. : 0., step(threshold, ink));
    vec3 red = vec3(1., 0., 0.);
    vec3 dark = vec3(0.051);
    gl_FragColor = vec4(mix(red, dark, on), 1.);
  }
`;

export default function RadarScene({ progress, content, reduced, near }) {
  const hostRef = useRef(null);
  const countRef = useRef(null);
  const reportRef = useRef(null);
  const barRefs = useRef([]);
  const logRef = useRef(null);
  const scoreRef = useRef(null);
  const scoreNumRef = useRef(null);
  const counterRef = useRef(null);
  const counterLabelRef = useRef(null);

  useStage(hostRef, near, {
    camera: (THREE) => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1),
    alpha: false,
    setup: ({ THREE, scene }) => {
      const R = rng(9);
      const uniforms = {
        uRes: { value: new THREE.Vector2(1, 1) },
        uC: { value: new THREE.Vector2(0, 0) },
        uR: { value: 100 },
        uPix: { value: 3 },
        uSweep: { value: 0 },
        uShield: { value: 0 },
        uTime: { value: 0 },
        uB: { value: Array.from({ length: MAX_BLIPS }, () => new THREE.Vector4(0, 0, 0, 0)) },
      };
      const mat = new THREE.ShaderMaterial({
        vertexShader: "void main() { gl_Position = vec4(position.xy, 0., 1.); }",
        fragmentShader: FRAG,
        uniforms,
      });
      scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

      // the flaws: fixed spots, a few critical (bigger), ordered so the sweep finds them in turn
      const severity = [2, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0];
      const vulns = Array.from({ length: VULNS }, (_, i) => {
        const ang = (i / VULNS) * Math.PI * 2 + R() * 0.4;
        const rad = 0.22 + R() * 0.68;
        return { x: Math.cos(ang) * rad, y: Math.sin(ang) * rad, sev: severity[(i * 5) % VULNS] };
      });
      const attacks = [];
      const dpr = Math.min(window.devicePixelRatio, 2);

      return {
        uniforms, vulns, attacks, R, dpr,
        nextAttack: 0,
        logs: [],
        resize(w, h) {
          uniforms.uRes.value.set(w * dpr, h * dpr);
          const small = w < 700;
          uniforms.uC.value.set((w / 2) * dpr, (small ? h * 0.5 : h * 0.5) * dpr);
          uniforms.uR.value = Math.min(w, h) * (small ? 0.4 : 0.42) * dpr;
          uniforms.uPix.value = Math.round(3 * dpr);
        },
      };
    },
    frame: ({ time }, s, dt) => {
      const p = follow(progress, reduced);
      const t = reduced ? 1.2 : time;
      const u = s.uniforms;
      u.uTime.value = t;
      u.uSweep.value = (t * 1.6) % (Math.PI * 2);
      u.uShield.value = band(p, 0.46, 0.6);

      // audit: each flaw shows up in turn; hardening: each one is closed in turn
      const found = Math.round(band(p, 0.03, 0.18) * VULNS);
      const fixedCount = Math.round(band(p, 0.44, 0.58) * VULNS);
      let slot = 0;
      s.vulns.forEach((f, i) => {
        const b = u.uB.value[slot++];
        if (i >= found) return b.set(0, 0, 0, 0);
        if (i < fixedCount) b.set(f.x, f.y, 1, 1 - band(p, 0.62, 0.8) * 0.6);
        else b.set(f.x, f.y, 0, f.sev);
      });

      // monitoring: attacks come from the edge and break on the shield
      const watching = p > 0.6;
      if (watching && !reduced && time > s.nextAttack) {
        s.nextAttack = time + 0.55 + s.R() * 0.6;
        const ang = s.R() * Math.PI * 2;
        s.attacks.push({ ang, born: time });
        if (s.attacks.length > MAX_BLIPS - VULNS) s.attacks.shift();
        const ip = `${45 + Math.floor(s.R() * 180)}.${Math.floor(s.R() * 255)}.${Math.floor(s.R() * 255)}.x`;
        const what = content.attacks[Math.floor(s.R() * content.attacks.length)];
        s.logs.unshift(`${content.blocked} · ${ip} · ${what}`);
        s.logs.length = Math.min(s.logs.length, 5);
        if (logRef.current) logRef.current.innerHTML = s.logs.map((l) => `<p>${l}</p>`).join("");
      }
      s.attacks.forEach((a) => {
        const b = u.uB.value[slot++];
        if (!b) return;
        const age = time - a.born;
        const travel = 1.5;
        if (age < travel) {
          const r = 1.15 - (1.15 - SHIELD - 0.02) * (age / travel);
          b.set(Math.cos(a.ang) * r, Math.sin(a.ang) * r, 2, 1);
        } else if (age < travel + 0.7) {
          const r = SHIELD + 0.02;
          b.set(Math.cos(a.ang) * r, Math.sin(a.ang) * r, 3, 1 - (age - travel) / 0.7);
        } else b.set(0, 0, 0, 0);
      });
      if (!watching) s.attacks.length = 0;
      if (reduced && watching && !s.stillLog && logRef.current) {
        s.stillLog = true;
        logRef.current.innerHTML = ["185.220.101.x", "45.155.205.x", "103.75.190.x"]
          .map((ip, i) => `<p>${content.blocked} · ${ip} · ${content.attacks[i]}</p>`)
          .join("");
      }
      if (reduced && watching) {
        // a still picture of three blocked attempts
        [0.6, 2.4, 4.3].forEach((ang) => {
          const b = u.uB.value[slot++];
          b?.set(Math.cos(ang) * (SHIELD + 0.02), Math.sin(ang) * (SHIELD + 0.02), 3, 0.8);
        });
      }
      for (; slot < MAX_BLIPS; slot++) u.uB.value[slot].set(0, 0, 0, 0);

      // overlays
      const auditing = p < 0.44;
      counterLabelRef.current.textContent = auditing ? content.found : content.fixed;
      countRef.current.textContent = String(auditing ? found : fixedCount).padStart(2, "0");
      counterRef.current.style.opacity = String(band(p, 0.0, 0.03) * (1 - band(p, 0.6, 0.64)));
      reportRef.current.style.opacity = String(band(p, 0.2, 0.25) * (1 - band(p, 0.42, 0.46)));
      const rep = band(p, 0.22, 0.34);
      barRefs.current.forEach((el, i) => el && (el.style.transform = `scaleX(${band(rep, i * 0.2, 0.5 + i * 0.2)})`));
      logRef.current.parentElement.style.opacity = String(band(p, 0.62, 0.66));
      scoreRef.current.style.opacity = String(band(p, 0.78, 0.82));
      scoreNumRef.current.textContent = String(Math.round(42 + 49 * band(p, 0.8, 0.96)));
    },
  });

  const total = content.report.reduce((a, [, n]) => a + n, 0);

  return (
    <div ref={hostRef} className={`${v.host} ${v.sec}`}>
      <div className={v.layer} aria-hidden="true">
        <div ref={counterRef} className={`${v.card} ${v.counter}`} style={{ opacity: 0 }}>
          <span ref={counterLabelRef} className={v.mono}>
            {content.found}
          </span>
          <span ref={countRef} className={v.counterNum}>
            00
          </span>
        </div>
        <div ref={reportRef} className={`${v.card} ${v.report}`} style={{ opacity: 0 }}>
          {content.report.map(([label, n], i) => (
            <div key={label} className={v.reportRow}>
              <span>{label}</span>
              <span>×{n}</span>
              <span className={v.reportBar}>
                <i ref={(el) => (barRefs.current[i] = el)} style={{ width: `${(n / total) * 100 * 2}%`, maxWidth: "100%", transform: "scaleX(0)" }} />
              </span>
            </div>
          ))}
        </div>
        <div className={`${v.card} ${v.log}`} style={{ opacity: 0 }}>
          <div ref={logRef} />
        </div>
        <div ref={scoreRef} className={`${v.card} ${v.score}`} style={{ opacity: 0 }}>
          <span className={v.mono}>{content.score}</span>
          <span className={v.counterNum}>
            <span ref={scoreNumRef}>42</span>
            <span style={{ fontSize: "0.4em" }}>/100</span>
          </span>
        </div>
      </div>
    </div>
  );
}
