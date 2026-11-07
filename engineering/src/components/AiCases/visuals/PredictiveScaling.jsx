"use client";

// Predictive autoscaling — a time cursor sweeps 19:30 → 20:30. The real traffic is drawn as time
// passes and the forecast runs 15 minutes ahead; below, predictive pods rise before the flash sale
// while reactive pods lag behind it and latency suffers. Then the figures.
import s from "./AiVisual.module.css";

import { useMemo, useRef } from "react";

import { band, follow, useTick, useWide } from "@/components/Systems/lib";

const TEAL = "#00a383";
const RED = "#e5484d";
const INK = "#0d1f1a";
const MIN = 60; // minutes on the axis
const AHEAD = 15;
const CAP = 12; // requests one pod can take (arbitrary units)

// traffic: quiet evening, the 20:00 flash sale, then a slow ebb
const traffic = (t) => {
  const rise = 1 / (1 + Math.exp(-(t - 30.5) * 0.9));
  const ebb = t > 44 ? Math.exp(-(t - 44) * 0.09) : 1;
  return 18 + 3 * Math.sin(t * 0.7) + 82 * rise * (0.45 + 0.55 * ebb);
};
const forecast = (t) => traffic(t) * (0.97 + 0.03 * Math.sin(t)) + 2;
const podsPredictive = (t) => Math.max(2, Math.ceil(forecast(Math.min(MIN, t + AHEAD)) / CAP));
const podsReactive = (t) => Math.max(2, Math.ceil(traffic(Math.max(0, t - 5)) / CAP));

function layoutFor(wide) {
  if (wide) {
    return {
      W: 1200, H: 720, wide,
      top: { x: 70, y: 50, w: 1070, h: 250 },
      bot: { x: 70, y: 360, w: 1070, h: 200 },
      kpi: [0, 1, 2].map((i) => ({ x: 70 + i * 362, y: 610, w: 346, h: 90 })),
    };
  }
  return {
    W: 600, H: 1050, wide,
    top: { x: 40, y: 40, w: 540, h: 250 },
    bot: { x: 40, y: 400, w: 540, h: 230 },
    kpi: [0, 1, 2].map((i) => ({ x: 40, y: 690 + i * 110, w: 540, h: 96 })),
  };
}

export default function PredictiveScaling({ progress, content, reduced, near }) {
  const hostRef = useRef(null);
  const wide = useWide(hostRef, 0.95);
  const L = useMemo(() => layoutFor(wide), [wide]);
  const clipRef = useRef(null);
  const clipFRef = useRef(null);
  const clipBRef = useRef(null);
  const cursorRef = useRef(null);
  const aheadRef = useRef(null);
  const eventRef = useRef(null);
  const kpiRefs = useRef([]);
  const id = useMemo(() => Math.random().toString(36).slice(2, 8), []);

  const { top, bot } = L;
  const xT = (t, box) => box.x + (t / MIN) * box.w;
  const yTop = (v) => top.y + top.h - (v / 110) * top.h;
  const yPod = (n) => bot.y + bot.h - (n / 10) * bot.h;
  const series = (fn, box, y) =>
    Array.from({ length: MIN + 1 }, (_, t) => `${t ? "L" : "M"}${xT(t, box).toFixed(1)} ${y(fn(t)).toFixed(1)}`).join("");
  const steps = (fn) =>
    Array.from({ length: MIN + 1 }, (_, t) => {
      const x = xT(t, bot).toFixed(1);
      const y = yPod(fn(t)).toFixed(1);
      return t ? `H${x}V${y}` : `M${x} ${y}`;
    }).join("");
  // where the reactive pods can't keep up: latency suffers
  const pain = [];
  for (let t = 0; t < MIN; t++) {
    if (traffic(t) <= podsReactive(t) * CAP) continue;
    const last = pain[pain.length - 1];
    if (last && last[1] === t) last[1] = t + 1;
    else pain.push([t, t + 1]);
  }

  useTick(
    near,
    () => {
      const p = follow(progress, reduced);
      const t = band(p, 0.04, 0.84) * MIN;
      const w = (t / MIN) * top.w;
      clipRef.current.setAttribute("width", String(w));
      clipFRef.current.setAttribute("width", String(Math.min(top.w, ((t + AHEAD) / MIN) * top.w)));
      clipBRef.current.setAttribute("width", String((t / MIN) * bot.w));
      cursorRef.current.setAttribute("transform", `translate(${xT(t, top)} 0)`);
      cursorRef.current.style.opacity = String(band(p, 0.03, 0.06) * (1 - band(p, 0.86, 0.9)));
      aheadRef.current.style.opacity = String(band(p, 0.12, 0.16) * (1 - band(p, 0.8, 0.84)));
      eventRef.current.style.opacity = String(band(p, 0.2, 0.25));
      kpiRefs.current.forEach((k, i) => {
        if (!k) return;
        const v = band(p, 0.86 + i * 0.03, 0.9 + i * 0.03);
        k.style.opacity = String(v);
        k.setAttribute("transform", `translate(0 ${(1 - v) * 14})`);
      });
    },
    [L, reduced],
  );

  const kpis = [
    [content.latency, content.latPredictive, `${content.reactive} : ${content.latReactive}`],
    [content.pods, "+15 min", content.ahead],
    [content.cost, content.costVal, content.predictive],
  ];
  return (
    <div ref={hostRef} className={`${s.host} ${s.scaling}`}>
      <svg className={s.svg} viewBox={`0 0 ${L.W} ${L.H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <clipPath id={`ct-${id}`}>
            <rect ref={clipRef} x={top.x} y={top.y - 20} width="0" height={top.h + 40} />
          </clipPath>
          <clipPath id={`cf-${id}`}>
            <rect ref={clipFRef} x={top.x} y={top.y - 20} width="0" height={top.h + 40} />
          </clipPath>
          <clipPath id={`cb-${id}`}>
            <rect ref={clipBRef} x={bot.x} y={bot.y - 20} width="0" height={bot.h + 40} />
          </clipPath>
        </defs>

        {/* traffic and its forecast */}
        <text x={top.x} y={top.y - 16} className={s.monoText} fontSize="12" fill="rgba(13,31,26,.6)">
          {content.traffic}
        </text>
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <line key={g} x1={top.x} x2={top.x + top.w} y1={top.y + top.h * (1 - g)} y2={top.y + top.h * (1 - g)} stroke="rgba(13,31,26,.08)" />
        ))}
        {content.times.map((tm, i) => (
          <text key={tm} x={xT(i * 15, top)} y={top.y + top.h + 22} textAnchor="middle" className={s.monoText} fontSize="11" fill="rgba(13,31,26,.5)">
            {tm}
          </text>
        ))}
        <g ref={eventRef} style={{ opacity: 0 }}>
          <line x1={xT(30, top)} x2={xT(30, top)} y1={top.y} y2={bot.y + bot.h} stroke={RED} strokeWidth="1.5" strokeDasharray="5 5" />
          <rect x={xT(30, top) + 8} y={top.y + top.h - 34} width={content.event.length * 7.6 + 18} height="26" fill={RED} />
          <text x={xT(30, top) + 17} y={top.y + top.h - 16} className={s.monoText} fontSize="11.5" fill="#fff">
            {content.event}
          </text>
        </g>
        <path d={series(forecast, top, yTop)} fill="none" stroke={TEAL} strokeWidth="2.5" strokeDasharray="7 6" clipPath={`url(#cf-${id})`} />
        <path d={series(traffic, top, yTop)} fill="none" stroke={INK} strokeWidth="3" clipPath={`url(#ct-${id})`} />
        <g ref={cursorRef} style={{ opacity: 0 }}>
          <line x1="0" x2="0" y1={top.y} y2={bot.y + bot.h} stroke={INK} strokeWidth="1" />
          <circle cx="0" cy={top.y} r="4" fill={INK} />
        </g>
        <g ref={aheadRef} style={{ opacity: 0 }}>
          <text x={top.x + top.w} y={top.y - 16} textAnchor="end" className={s.monoText} fontSize="12" fill={TEAL}>
            - - {content.forecast} · {content.ahead}
          </text>
        </g>

        {/* pods: predictive (ahead) vs reactive (late) */}
        <text x={bot.x} y={bot.y - 14} className={s.monoText} fontSize="12" fill="rgba(13,31,26,.6)">
          {content.pods}
        </text>
        <line x1={bot.x} x2={bot.x + bot.w} y1={bot.y + bot.h} y2={bot.y + bot.h} stroke="rgba(13,31,26,.25)" />
        <g clipPath={`url(#cb-${id})`}>
          {pain.map(([a, b]) => (
            <rect key={a} x={xT(a, bot)} y={bot.y} width={xT(b, bot) - xT(a, bot)} height={bot.h} fill="rgba(229,72,77,0.12)" />
          ))}
          <path d={steps(podsReactive)} fill="none" stroke={RED} strokeWidth="2.5" strokeDasharray="4 4" />
          <path d={steps(podsPredictive)} fill="none" stroke={TEAL} strokeWidth="3" />
        </g>
        <g>
          <rect x={bot.x + bot.w - (wide ? 450 : 210)} y={bot.y - (wide ? 22 : 40)} width="14" height="4" fill={TEAL} />
          <text x={bot.x + bot.w - (wide ? 430 : 190)} y={bot.y - (wide ? 15 : 33)} fontSize="13" fill={INK}>
            {content.predictive}
          </text>
          <rect x={bot.x + bot.w - (wide ? 210 : 210)} y={bot.y - (wide ? 22 : 18)} width="14" height="4" fill={RED} />
          <text x={bot.x + bot.w - (wide ? 190 : 190)} y={bot.y - (wide ? 15 : 11)} fontSize="13" fill={INK}>
            {content.reactive}
          </text>
        </g>

        {/* the figures */}
        {L.kpi.map((k, i) => (
          <g key={i} ref={(el) => (kpiRefs.current[i] = el)} style={{ opacity: 0 }}>
            <rect x={k.x} y={k.y} width={k.w} height={k.h} fill={i === 2 ? TEAL : "#fff"} stroke="rgba(13,31,26,.12)" />
            <text x={k.x + 18} y={k.y + 26} className={s.monoText} fontSize="11" fill={i === 2 ? "rgba(255,255,255,.8)" : "rgba(13,31,26,.55)"}>
              {kpis[i][0]}
            </text>
            <text x={k.x + 18} y={k.y + 66} fontSize="32" fontWeight="700" letterSpacing="-1" fill={i === 2 ? "#fff" : INK}>
              {kpis[i][1]}
            </text>
            <text x={k.x + k.w - 18} y={k.y + 66} textAnchor="end" fontSize="13" fill={i === 2 ? "rgba(255,255,255,.85)" : i === 0 ? RED : TEAL}>
              {kpis[i][2]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
