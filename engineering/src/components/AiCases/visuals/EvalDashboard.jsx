"use client";

// RAG evaluation — a test set is replayed, every version is scored (faithfulness, relevance,
// context precision) against a threshold, ungrounded answers fall, and the release gate opens.
import s from "./AiVisual.module.css";

import { useMemo, useRef } from "react";

import { band, follow, useTick, useWide } from "@/components/Systems/lib";

const LIME = "#c6ff3d";
const RED = "#ff4d4d";
const FG = "#f1f1ea";
const VCOL = ["rgba(241,241,234,0.28)", "rgba(241,241,234,0.62)", LIME];
const GROW = [
  [0.22, 0.32],
  [0.6, 0.68],
  [0.7, 0.78],
];

function layoutFor(wide) {
  if (wide) {
    return {
      W: 1200, H: 700, wide,
      title: { x: 40, y: 54 },
      counter: { x: 40, y: 150 },
      rows: { x: 40, y: 190, w: 380, n: 10, gap: 22 },
      sample: { x: 40, y: 440, w: 380, h: 230 },
      chart: { x: 540, y: 110, w: 600, h: 280 },
      hall: { x: 540, y: 470, w: 520, row: 30 },
      gate: { x: 500, y: 610, w: 660, h: 60 },
    };
  }
  return {
    W: 600, H: 960, wide,
    title: { x: 30, y: 44 },
    counter: { x: 30, y: 130 },
    rows: { x: 30, y: 160, w: 540, n: 5, gap: 20 },
    sample: null,
    chart: { x: 60, y: 330, w: 510, h: 270 },
    hall: { x: 30, y: 700, w: 470, row: 30 },
    gate: { x: 30, y: 870, w: 540, h: 60 },
  };
}

export default function EvalDashboard({ progress, content, reduced, near }) {
  const hostRef = useRef(null);
  const wide = useWide(hostRef, 0.95);
  const L = useMemo(() => layoutFor(wide), [wide]);
  const countRef = useRef(null);
  const rowRefs = useRef([]);
  const barRefs = useRef([]);
  const hallRefs = useRef([]);
  const hallNumRefs = useRef([]);
  const gateRef = useRef(null);
  const gateTextRef = useRef(null);
  const sampleRef = useRef(null);
  const judgeRefs = useRef([]);

  const { chart } = L;
  const groupW = chart.w / content.metrics.length;
  const barW = Math.min(46, (groupW - 40) / 3);
  const yOf = (v) => chart.y + chart.h - v * chart.h;

  useTick(
    near,
    () => {
      const p = follow(progress, reduced);
      const k = band(p, 0.02, 0.18);
      countRef.current.textContent = String(Math.round(content.total * k));
      rowRefs.current.forEach((r, i) => {
        if (!r) return;
        const n = rowRefs.current.length;
        r.setAttribute("width", String(L.rows.w * Math.min(1, Math.max(0, k * n - i))));
      });
      barRefs.current.forEach((b, idx) => {
        if (!b) return;
        const m = Math.floor(idx / 3);
        const ver = idx % 3;
        const g = band(p, GROW[ver][0], GROW[ver][1]);
        const v = content.scores[ver][m] * g;
        b.setAttribute("y", String(yOf(v)));
        b.setAttribute("height", String(Math.max(0, v * chart.h)));
      });
      hallRefs.current.forEach((h, ver) => {
        if (!h) return;
        const g = band(p, GROW[ver][0] + 0.02, GROW[ver][1]);
        const n = content.hall[ver];
        h.setAttribute("width", String((n / content.hall[0]) * L.hall.w * g));
        hallNumRefs.current[ver].textContent = g > 0 ? String(Math.round(n * g)) : "";
      });

      const shown = band(p, 0.3, 0.34);
      const go = p >= 0.84;
      gateRef.current.style.opacity = String(shown);
      gateRef.current.toggleAttribute("data-go", go);
      gateTextRef.current.textContent = go ? content.go : content.nogo;

      if (sampleRef.current) {
        sampleRef.current.style.opacity = String(band(p, 0.42, 0.46));
        const ver = p >= 0.78 ? 2 : 0;
        judgeRefs.current.forEach((j, i) => {
          if (!j) return;
          j.style.opacity = String(band(p, 0.46 + i * 0.03, 0.5 + i * 0.03));
          const v = content.scores[ver][i];
          const ok = v >= content.threshold;
          j.querySelector("[data-v]").textContent = `${content.versions[ver]} · ${v.toFixed(2)}`;
          j.querySelector("[data-ok]").textContent = ok ? "✓" : "✗";
          j.toggleAttribute("data-pass", ok);
        });
      }
    },
    [L, content, reduced],
  );

  const { W, H, title, counter, rows, sample, hall, gate } = L;
  return (
    <div ref={hostRef} className={`${s.host} ${s.evalv}`}>
      <svg className={s.svg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <text x={title.x} y={title.y} className={s.monoText} fontSize="15" fill={FG}>
          {content.title}
        </text>
        <line x1={title.x} x2={W - title.x} y1={title.y + 18} y2={title.y + 18} stroke="rgba(241,241,234,0.15)" />

        {/* the test set being replayed */}
        <text x={counter.x} y={counter.y} fontSize="64" fontWeight="600" fill={FG} letterSpacing="-2">
          <tspan ref={countRef}>0</tspan>
          <tspan fontSize="22" fill="rgba(241,241,234,.55)" dx="10">
            / {content.total} {content.tests}
          </tspan>
        </text>
        {Array.from({ length: rows.n }, (_, i) => (
          <g key={i}>
            <rect x={rows.x} y={rows.y + i * rows.gap} width={rows.w} height="10" fill="rgba(241,241,234,0.08)" />
            <rect ref={(el) => (rowRefs.current[i] = el)} x={rows.x} y={rows.y + i * rows.gap} width="0" height="10" fill="rgba(198,255,61,0.75)" />
          </g>
        ))}

        {/* a sample question being judged */}
        {sample ? (
          <g ref={sampleRef} style={{ opacity: 0 }}>
            <rect x={sample.x} y={sample.y} width={sample.w} height={sample.h} fill="rgba(241,241,234,0.06)" stroke="rgba(241,241,234,0.2)" />
            <text x={sample.x + 18} y={sample.y + 30} className={s.monoText} fontSize="12" fill="rgba(241,241,234,.55)">
              {content.sample}
            </text>
            <foreignObject x={sample.x + 18} y={sample.y + 40} width={sample.w - 36} height="60">
              <div className={s.sampleQ}>{content.sampleQ}</div>
            </foreignObject>
            <text x={sample.x + 18} y={sample.y + 116} className={s.monoText} fontSize="12" fill={LIME}>
              {content.judge}
            </text>
            {content.metrics.map((m, i) => (
              <g key={m} ref={(el) => (judgeRefs.current[i] = el)} className={s.judge} style={{ opacity: 0 }}>
                <text x={sample.x + 18} y={sample.y + 146 + i * 28} fontSize="14" fill={FG}>
                  {m}
                </text>
                <text data-v="" x={sample.x + sample.w - 54} y={sample.y + 146 + i * 28} textAnchor="end" className={s.monoText} fontSize="12" fill="rgba(241,241,234,.7)" />
                <text data-ok="" x={sample.x + sample.w - 24} y={sample.y + 147 + i * 28} textAnchor="end" fontSize="16" fontWeight="700" />
              </g>
            ))}
          </g>
        ) : null}

        {/* scores per metric and version */}
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <line key={g} x1={chart.x} x2={chart.x + chart.w} y1={yOf(g)} y2={yOf(g)} stroke="rgba(241,241,234,0.08)" />
        ))}
        <line x1={chart.x} x2={chart.x + chart.w} y1={chart.y + chart.h} y2={chart.y + chart.h} stroke="rgba(241,241,234,0.4)" />
        {content.metrics.map((m, mi) => (
          <g key={m}>
            {content.versions.map((ver, vi) => (
              <rect
                key={ver}
                ref={(el) => (barRefs.current[mi * 3 + vi] = el)}
                x={chart.x + mi * groupW + 20 + vi * (barW + 6)}
                y={chart.y + chart.h}
                width={barW}
                height="0"
                fill={VCOL[vi]}
              />
            ))}
            <text x={chart.x + mi * groupW + 20} y={chart.y + chart.h + 26} fontSize="14" fill="rgba(241,241,234,.75)">
              {m}
            </text>
          </g>
        ))}
        <line
          x1={chart.x}
          x2={chart.x + chart.w}
          y1={yOf(content.threshold)}
          y2={yOf(content.threshold)}
          stroke={LIME}
          strokeWidth="1.5"
          strokeDasharray="8 6"
        />
        <text x={chart.x + chart.w} y={yOf(content.threshold) - 8} textAnchor="end" className={s.monoText} fontSize="12" fill={LIME}>
          {content.thresholdLabel} {content.threshold.toFixed(2)}
        </text>
        {content.versions.map((ver, vi) => (
          <g key={ver}>
            <rect x={chart.x + vi * 64} y={chart.y - 34} width="14" height="14" fill={VCOL[vi]} />
            <text x={chart.x + vi * 64 + 20} y={chart.y - 22} className={s.monoText} fontSize="12" fill={FG}>
              {ver}
            </text>
          </g>
        ))}

        {/* ungrounded answers per version */}
        <text x={hall.x} y={hall.y} className={s.monoText} fontSize="12" fill="rgba(241,241,234,.6)">
          {content.hallLabel}
        </text>
        {content.versions.map((ver, vi) => (
          <g key={ver}>
            <text x={hall.x} y={hall.y + 28 + vi * hall.row} className={s.monoText} fontSize="12" fill={FG}>
              {ver}
            </text>
            <rect
              ref={(el) => (hallRefs.current[vi] = el)}
              x={hall.x + 40}
              y={hall.y + 16 + vi * hall.row}
              width="0"
              height="16"
              fill={vi === 2 ? LIME : RED}
              opacity={vi === 2 ? 1 : 0.55 + vi * 0.2}
            />
            <text ref={(el) => (hallNumRefs.current[vi] = el)} x={hall.x + 50 + hall.w} y={hall.y + 29 + vi * hall.row} fontSize="14" fontWeight="600" fill={FG} />
          </g>
        ))}

        {/* the release gate */}
        <g ref={gateRef} className={s.gate} style={{ opacity: 0 }}>
          <rect className={s.gateBox} x={gate.x} y={gate.y} width={gate.w} height={gate.h} />
          <text ref={gateTextRef} className={s.gateText} x={gate.x + 24} y={gate.y + gate.h / 2 + 7} fontSize="20" fontWeight="600" />
        </g>
      </svg>
    </div>
  );
}
