"use client";

// GPU cost optimisation: nine model pods hold 24 whole GPUs on six nodes at low activity. The pods are
// grouped by need, the small ones get MIG slices, the rest are packed by ResourceClaims onto 14 GPUs, and
// the two empty nodes switch off. The mesh of pod → GPU links re-forms as the scroll moves on.
import s from "./AiVisual.module.css";

import { useMemo, useRef } from "react";

import { band, follow, lerp, rng, useTick, useWide } from "@/components/Systems/lib";

const FG = "#edf2ee";
const DIM = "rgba(237,242,238,0.38)";
const LINE = "rgba(237,242,238,0.22)";
const GREEN = "#8be06a";
const IDLE = "#ff7a59";

// GPUs each model held before (24 in all), and the size group it falls in once measured
const BEFORE = [3, 3, 3, 3, 2, 2, 2, 2, 4];
const SMALL = [false, false, true, true, true, true, true, true, false];
// after: each edge of a model goes to a whole GPU (cell index) or to a MIG slice ([cell, slice 0–2])
const AFTER = [
  [4, 5, 6], // OCR
  [7, 8, 9], // detection
  [[0, 0], [0, 1], [0, 1]], // classification
  [[0, 2], [1, 0], [1, 0]], // embeddings
  [[1, 1], [1, 2]], // segmentation
  [[2, 0], [2, 1]], // reranking
  [[2, 2], [3, 0]], // blurring
  [[3, 1], [3, 2]], // plates
  [10, 11, 12, 13], // fine-tuning (DRA claims, whole GPUs)
];
const MIG_CELLS = [0, 1, 2, 3];
const USED_AFTER = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
const OFF_NODES = [4, 5];

function layoutFor(wide) {
  if (wide) {
    const nodes = [0, 1, 2, 3, 4, 5].map((i) => ({ x: 430 + (i % 3) * 250, y: 70 + Math.floor(i / 3) * 250, w: 226, h: 224 }));
    return {
      W: 1200, H: 720, wide, nodes,
      pod: (i) => ({ x: 170, y: 92 + i * 56 }),
      cell: { pad: 16, top: 40, gap: 10 },
      kpi: [0, 1, 2].map((i) => ({ x: 70 + i * 362, y: 606, w: 346, h: 94 })),
      labelX: 152,
    };
  }
  const nodes = [0, 1, 2, 3, 4, 5].map((i) => ({ x: 236 + (i % 2) * 178, y: 60 + Math.floor(i / 2) * 196, w: 166, h: 168 }));
  return {
    W: 600, H: 1000, wide, nodes,
    pod: (i) => ({ x: 196, y: 84 + i * 60 }),
    cell: { pad: 12, top: 34, gap: 8 },
    kpi: [0, 1, 2].map((i) => ({ x: 40, y: 670 + i * 106, w: 520, h: 92 })),
    labelX: 180,
  };
}

// the 24 GPU cells: 4 per node, 2 × 2
function cellsFor(L) {
  const out = [];
  L.nodes.forEach((n) => {
    const cw = (n.w - L.cell.pad * 2 - L.cell.gap) / 2;
    const ch = (n.h - L.cell.top - L.cell.pad - L.cell.gap) / 2;
    for (let k = 0; k < 4; k++) {
      const x = n.x + L.cell.pad + (k % 2) * (cw + L.cell.gap);
      const y = n.y + L.cell.top + Math.floor(k / 2) * (ch + L.cell.gap);
      out.push({ x, y, w: cw, h: ch });
    }
  });
  return out;
}

const centre = (c) => [c.x + c.w / 2, c.y + c.h / 2];
const sliceAt = (c, k) => [c.x + (c.w * (k + 0.5)) / 3, c.y + c.h / 2];

export default function GpuPacking({ progress, content, reduced, near }) {
  const hostRef = useRef(null);
  const wide = useWide(hostRef, 0.95);
  const L = useMemo(() => layoutFor(wide), [wide]);
  const cells = useMemo(() => cellsFor(L), [L]);

  // activity per GPU: about 23% before, about 52% on the GPUs still used after
  const levels = useMemo(() => {
    const r = rng(7);
    const before = cells.map(() => 0.1 + r() * 0.26);
    const after = cells.map((_, i) => (USED_AFTER.has(i) ? 0.4 + r() * 0.24 : 0));
    return { before, after };
  }, [cells]);

  // every link: from its pod to a GPU before, and to a GPU or a MIG slice after
  const edges = useMemo(() => {
    const list = [];
    let next = 0;
    BEFORE.forEach((n, m) => {
      for (let e = 0; e < n; e++) {
        const t = AFTER[m][Math.min(e, AFTER[m].length - 1)];
        list.push({ m, from: centre(cells[next]), to: Array.isArray(t) ? sliceAt(cells[t[0]], t[1]) : centre(cells[t]) });
        next++;
      }
    });
    return list;
  }, [cells]);

  const nodeRefs = useRef([]);
  const cellRefs = useRef([]);
  const fillRefs = useRef([]);
  const sliceRefs = useRef([]);
  const edgeRefs = useRef([]);
  const podRefs = useRef([]);
  const tagRefs = useRef([]);
  const actRef = useRef(null);
  const actValRef = useRef(null);
  const offRef = useRef(null);
  const claimRef = useRef(null);
  const migRef = useRef(null);
  const kpiRefs = useRef([]);

  useTick(
    near,
    () => {
      const p = follow(progress, reduced);
      const appear = band(p, 0.0, 0.06);
      const draw = band(p, 0.04, 0.14);
      const grow = band(p, 0.08, 0.18);
      const group = band(p, 0.22, 0.32);
      const slice = band(p, 0.42, 0.5);
      const moveSmall = band(p, 0.46, 0.58);
      const moveBig = band(p, 0.62, 0.72);
      const settle = band(p, 0.66, 0.78);
      const off = band(p, 0.8, 0.88);

      nodeRefs.current.forEach((n, i) => {
        if (!n) return;
        n.style.opacity = String(appear * (OFF_NODES.includes(i) ? 1 - off * 0.75 : 1));
      });
      cellRefs.current.forEach((g, i) => g && (g.style.opacity = String(appear * (OFF_NODES.includes(Math.floor(i / 4)) ? 1 - off * 0.75 : 1))));
      fillRefs.current.forEach((f, i) => {
        if (!f) return;
        const c = cells[i];
        const v = lerp(levels.before[i] * grow, levels.after[i], settle);
        f.setAttribute("y", String(c.y + c.h * (1 - v)));
        f.setAttribute("height", String(c.h * v));
        f.setAttribute("fill", settle > 0.5 && USED_AFTER.has(i) ? GREEN : settle > 0.5 ? "transparent" : IDLE);
        f.style.opacity = String(0.85);
      });
      sliceRefs.current.forEach((sl) => sl && (sl.style.opacity = String(slice)));
      edgeRefs.current.forEach((el, i) => {
        if (!el) return;
        const e = edges[i];
        const k = SMALL[e.m] ? moveSmall : moveBig;
        const pod = L.pod(e.m);
        const tx = lerp(e.from[0], e.to[0], k);
        const ty = lerp(e.from[1], e.to[1], k);
        const dx = (tx - pod.x) * 0.5;
        el.setAttribute("d", `M${pod.x} ${pod.y}C${pod.x + dx} ${pod.y} ${tx - dx} ${ty} ${tx} ${ty}`);
        el.style.strokeDashoffset = String(1 - draw);
        el.setAttribute("stroke", k > 0.5 ? GREEN : LINE);
      });
      podRefs.current.forEach((pd, i) => {
        if (!pd) return;
        pd.style.opacity = String(appear);
        pd.setAttribute("r", String(lerp(8, SMALL[i] ? 6 : 11, group)));
        pd.setAttribute("fill", group > 0.5 && SMALL[i] ? GREEN : FG);
      });
      tagRefs.current.forEach((t) => t && (t.style.opacity = String(group * (1 - band(p, 0.86, 0.9)))));
      actRef.current.style.opacity = String(band(p, 0.12, 0.18));
      actValRef.current.textContent = settle > 0.5 ? content.kpiActVal.split("→").pop().trim() : content.kpiActVal.split("→")[0].trim();
      migRef.current.style.opacity = String(slice * (1 - band(p, 0.86, 0.9)));
      claimRef.current.style.opacity = String(band(p, 0.64, 0.7) * (1 - band(p, 0.86, 0.9)));
      offRef.current.style.opacity = String(off);
      kpiRefs.current.forEach((kp, i) => {
        if (!kp) return;
        const v = band(p, 0.88 + i * 0.03, 0.92 + i * 0.03);
        kp.style.opacity = String(v);
        kp.setAttribute("transform", `translate(0 ${(1 - v) * 14})`);
      });
    },
    [L, cells, edges, levels, content, reduced],
  );

  const { W, H, nodes, kpi } = L;
  const kpis = [
    [content.kpiGpus, content.kpiGpusVal],
    [content.kpiAct, content.kpiActVal],
    [content.kpiBill, content.kpiBillVal],
  ];
  const right = Math.max(...nodes.map((n) => n.x + n.w));
  const head = wide ? 10.5 : 9.5;
  // "switched off" sits over the two empty nodes of the last row
  const offBox = { x: (nodes[4].x + nodes[5].x + nodes[5].w) / 2, y: nodes[4].y + nodes[4].h / 2 + 4 };
  return (
    <div ref={hostRef} className={`${s.host} ${s.gpu}`}>
      <svg className={s.svg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        {/* column titles */}
        <text x={L.labelX} y={L.pod(0).y - 40} textAnchor="end" className={s.monoText} fontSize="12" fill={DIM}>
          {content.pods}
        </text>
        <text x={nodes[0].x} y={nodes[0].y - 16} className={s.monoText} fontSize="12" fill={DIM}>
          {content.gpus}
        </text>
        <g ref={actRef} style={{ opacity: 0 }}>
          <text x={right} y={nodes[0].y - 16} textAnchor="end" className={s.monoText} fontSize="12" fill={DIM}>
            {content.activity} ·{" "}
            <tspan ref={actValRef} fill={FG} />
          </text>
        </g>

        {/* the mesh: one link per GPU a model holds */}
        {edges.map((e, i) => (
          <path key={i} ref={(el) => (edgeRefs.current[i] = el)} d="M0 0" fill="none" stroke={LINE} strokeWidth="1.6" pathLength="1" strokeDasharray="1" style={{ strokeDashoffset: 1 }} />
        ))}

        {/* nodes and their 4 GPUs */}
        {nodes.map((n, i) => (
          <g key={i} ref={(el) => (nodeRefs.current[i] = el)} style={{ opacity: 0 }}>
            <rect x={n.x} y={n.y} width={n.w} height={n.h} fill="rgba(237,242,238,0.04)" stroke={LINE} rx="6" />
            <text x={n.x + 12} y={n.y + 22} className={s.monoText} fontSize="11" fill={DIM}>
              {content.node} {i + 1}
            </text>
          </g>
        ))}
        {cells.map((c, i) => (
          <g key={i} ref={(el) => (cellRefs.current[i] = el)} style={{ opacity: 0 }}>
            <rect x={c.x} y={c.y} width={c.w} height={c.h} fill="none" stroke={LINE} rx="3" />
            <rect ref={(el) => (fillRefs.current[i] = el)} x={c.x + 1} y={c.y + c.h} width={c.w - 2} height="0" fill={IDLE} rx="2" />
            {MIG_CELLS.includes(i) ? (
              <g ref={(el) => (sliceRefs.current[i] = el)} style={{ opacity: 0 }}>
                <line x1={c.x + c.w / 3} x2={c.x + c.w / 3} y1={c.y + 3} y2={c.y + c.h - 3} stroke={FG} strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1={c.x + (2 * c.w) / 3} x2={c.x + (2 * c.w) / 3} y1={c.y + 3} y2={c.y + c.h - 3} stroke={FG} strokeWidth="1.5" strokeDasharray="3 3" />
              </g>
            ) : null}
          </g>
        ))}

        {/* the model pods */}
        {content.models.map((m, i) => {
          const pd = L.pod(i);
          return (
            <g key={m}>
              <circle ref={(el) => (podRefs.current[i] = el)} cx={pd.x} cy={pd.y} r="8" fill={FG} style={{ opacity: 0 }} />
              <text x={L.labelX - (wide ? 6 : 4)} y={pd.y + 4} textAnchor="end" fontSize={wide ? 14 : 13} fill={FG}>
                {m}
              </text>
              {SMALL[i] ? (
                <text ref={(el) => (tagRefs.current[i] = el)} x={L.labelX - (wide ? 6 : 4)} y={pd.y + 19} textAnchor="end" className={s.monoText} fontSize="9.5" fill={GREEN} style={{ opacity: 0 }}>
                  {content.small}
                </text>
              ) : null}
            </g>
          );
        })}

        {/* call-outs */}
        <g ref={migRef} style={{ opacity: 0 }}>
          <text x={nodes[0].x + nodes[0].w - 12} y={nodes[0].y + 22} textAnchor="end" className={s.monoText} fontSize={head} fill={GREEN}>
            {content.mig}
          </text>
        </g>
        <g ref={claimRef} style={{ opacity: 0 }}>
          <text x={nodes[3].x + nodes[3].w - 12} y={nodes[3].y + 22} textAnchor="end" className={s.monoText} fontSize={head} fill={GREEN}>
            {content.claim}
          </text>
        </g>
        <g ref={offRef} style={{ opacity: 0 }}>
          <text x={offBox.x} y={offBox.y} textAnchor="middle" className={s.monoText} fontSize={wide ? 13 : 11.5} fill={IDLE}>
            {content.off}
          </text>
        </g>

        {/* the figures */}
        {kpi.map((k, i) => (
          <g key={i} ref={(el) => (kpiRefs.current[i] = el)} style={{ opacity: 0 }}>
            <rect x={k.x} y={k.y} width={k.w} height={k.h} fill={i === 2 ? GREEN : "rgba(237,242,238,0.06)"} stroke={LINE} />
            <text x={k.x + 18} y={k.y + 26} className={s.monoText} fontSize="11" fill={i === 2 ? "rgba(15,20,25,.75)" : DIM}>
              {kpis[i][0]}
            </text>
            <text x={k.x + 18} y={k.y + 68} fontSize="32" fontWeight="700" letterSpacing="-1" fill={i === 2 ? "#0f1419" : FG}>
              {kpis[i][1]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
