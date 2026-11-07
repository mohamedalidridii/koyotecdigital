"use client";

// IaC security review — a Terraform pull request: classic scanners pass; the AI review links the
// bucket, its policy, the VPC endpoint and the public subnet into an exposure path, explains the
// risk in a comment, pushes the fix and every check turns green.
import s from "./AiVisual.module.css";

import { useMemo, useRef } from "react";

import { band, follow, typed, useTick, useWide } from "@/components/Systems/lib";

const GREEN = "#3fb950";
const RED = "#f85149";
const FG = "#e6edf3";
const MUTED = "#7d8590";

function layoutFor(wide) {
  if (wide) {
    return {
      W: 1200, H: 720, wide,
      pr: { x: 40, y: 24, w: 1120, h: 56 },
      diff: { x: 40, y: 100, w: 600, h: 300 },
      basic: { x: 40, y: 414, w: 600, h: 44 },
      graph: { x: 670, y: 100, w: 490, h: 300 },
      comment: { x: 670, y: 414, w: 490, h: 150 },
      fix: { x: 40, y: 476, w: 600, h: 150 },
      checks: { x: 670, y: 582, w: 490, h: 116 },
    };
  }
  return {
    W: 600, H: 1270, wide,
    pr: { x: 20, y: 20, w: 560, h: 56 },
    diff: { x: 20, y: 92, w: 560, h: 280 },
    basic: { x: 20, y: 384, w: 560, h: 44 },
    graph: { x: 20, y: 444, w: 560, h: 280 },
    comment: { x: 20, y: 740, w: 560, h: 170 },
    fix: { x: 20, y: 926, w: 560, h: 150 },
    checks: { x: 20, y: 1092, w: 560, h: 160 },
  };
}

export default function IacReview({ progress, content, reduced, near }) {
  const hostRef = useRef(null);
  const wide = useWide(hostRef, 0.95);
  const L = useMemo(() => layoutFor(wide), [wide]);
  const lineRefs = useRef([]);
  const basicRef = useRef(null);
  const graphRef = useRef(null);
  const nodeRefs = useRef([]);
  const edgeRefs = useRef([]);
  const commentRef = useRef(null);
  const riskRef = useRef(null);
  const fixRef = useRef(null);
  const checkRefs = useRef([]);
  const mergeRef = useRef(null);

  const { graph } = L;
  // the exposure path: bucket → policy → endpoint → public subnet
  const nodes = [
    [graph.x + graph.w * 0.22, graph.y + graph.h * 0.3],
    [graph.x + graph.w * 0.72, graph.y + graph.h * 0.3],
    [graph.x + graph.w * 0.72, graph.y + graph.h * 0.74],
    [graph.x + graph.w * 0.22, graph.y + graph.h * 0.74],
  ];

  useTick(
    near,
    () => {
      const p = follow(progress, reduced);
      const lines = band(p, 0.04, 0.18) * content.diff.length;
      lineRefs.current.forEach((l, i) => l && (l.style.opacity = String(Math.min(1, Math.max(0, lines - i)))));
      basicRef.current.style.opacity = String(band(p, 0.22, 0.27));
      graphRef.current.style.opacity = String(band(p, 0.38, 0.42));
      nodeRefs.current.forEach((n, i) => {
        if (!n) return;
        n.style.opacity = String(band(p, 0.4 + i * 0.03, 0.44 + i * 0.03));
        n.toggleAttribute("data-risk", p > 0.56 && p < 0.84);
        n.toggleAttribute("data-safe", p >= 0.84);
      });
      edgeRefs.current.forEach((e, i) => {
        if (!e) return;
        e.style.strokeDashoffset = String(1 - band(p, 0.46 + i * 0.03, 0.52 + i * 0.03));
        e.style.stroke = p >= 0.84 ? GREEN : p > 0.56 ? RED : MUTED;
      });
      commentRef.current.style.opacity = String(band(p, 0.58, 0.62));
      riskRef.current.textContent = typed(content.risk, band(p, 0.6, 0.72));
      fixRef.current.style.opacity = String(band(p, 0.74, 0.78));
      checkRefs.current.forEach((c, i) => {
        if (!c) return;
        c.style.opacity = String(band(p, 0.78, 0.81));
        c.toggleAttribute("data-pass", p > 0.84 + i * 0.03);
      });
      mergeRef.current.style.opacity = String(band(p, 0.94, 0.97));
    },
    [L, content, reduced],
  );

  const { W, H, pr, diff, basic, comment, fix, checks } = L;
  const fs = wide ? 14 : 12.5;
  const diffLine = (l, x, y, key, ref) => (
    <g key={key} ref={ref}>
      <rect x={x} y={y - 15} width={diff.w - 20} height="22" fill={l.startsWith("+") ? "rgba(63,185,80,0.15)" : l.startsWith("-") ? "rgba(248,81,73,0.15)" : "transparent"} />
      <text x={x + 8} y={y} className={s.codeText} fontSize={fs} fill={l.startsWith("+") ? "#aff5b4" : l.startsWith("-") ? "#ffdcd7" : FG} xmlSpace="preserve">
        {l}
      </text>
    </g>
  );
  return (
    <div ref={hostRef} className={`${s.host} ${s.iac}`}>
      <svg className={s.svg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        {/* the pull request */}
        <rect x={pr.x} y={pr.y} width={pr.w} height={pr.h} fill="#161b22" stroke="#30363d" rx="6" />
        <rect x={pr.x + 14} y={pr.y + 14} width="64" height="28" rx="14" fill="#238636" />
        <text x={pr.x + 46} y={pr.y + 33} textAnchor="middle" fontSize="12" fontWeight="600" fill="#fff">
          Open
        </text>
        <text x={pr.x + 92} y={pr.y + 34} fontSize={wide ? 17 : 14} fontWeight="600" fill={FG}>
          {content.pr}
        </text>

        {/* the diff */}
        <rect x={diff.x} y={diff.y} width={diff.w} height={diff.h} fill="#0d1117" stroke="#30363d" rx="6" />
        <rect x={diff.x} y={diff.y} width={diff.w} height="36" fill="#161b22" rx="6" />
        <text x={diff.x + 14} y={diff.y + 23} className={s.codeText} fontSize="13" fill={FG}>
          {content.file}
        </text>
        {content.diff.map((l, i) => diffLine(l, diff.x + 10, diff.y + 66 + i * 32, i, (el) => (lineRefs.current[i] = el)))}

        {/* classic scanners: nothing to report */}
        <g ref={basicRef} style={{ opacity: 0 }}>
          <rect x={basic.x} y={basic.y} width={basic.w} height={basic.h} fill="rgba(63,185,80,0.1)" stroke="rgba(63,185,80,0.4)" rx="6" />
          <text x={basic.x + 16} y={basic.y + 28} fontSize="14" fill={GREEN}>
            ✓ {content.classic} · {content.classicOk}
          </text>
        </g>

        {/* the AI review: the resources, linked in context */}
        <g ref={graphRef} style={{ opacity: 0 }}>
          <rect x={graph.x} y={graph.y} width={graph.w} height={graph.h} fill="#161b22" stroke="#30363d" rx="6" />
          <text x={graph.x + 16} y={graph.y + 28} className={s.monoText} fontSize="12" fill={GREEN}>
            ◆ {content.agent}
          </text>
        </g>
        {nodes.slice(1).map((n, i) => (
          <path
            key={i}
            ref={(el) => (edgeRefs.current[i] = el)}
            d={`M${nodes[i][0]} ${nodes[i][1]}L${n[0]} ${n[1]}`}
            pathLength="1"
            stroke={MUTED}
            strokeWidth="2.5"
            strokeDasharray="1"
            style={{ strokeDashoffset: 1 }}
          />
        ))}
        {nodes.map(([x, y], i) => (
          <g key={i} ref={(el) => (nodeRefs.current[i] = el)} className={s.iacNode} style={{ opacity: 0 }}>
            <rect x={x - 82} y={y - 22} width="164" height="44" rx="6" />
            <foreignObject x={x - 78} y={y - 20} width="156" height="40">
              <div className={s.iacNodeText}>{content.nodes[i]}</div>
            </foreignObject>
          </g>
        ))}

        {/* the comment */}
        <g ref={commentRef} style={{ opacity: 0 }}>
          <rect x={comment.x} y={comment.y} width={comment.w} height={comment.h} fill="#161b22" stroke={RED} rx="6" />
          <circle cx={comment.x + 26} cy={comment.y + 26} r="12" fill={GREEN} />
          <text x={comment.x + 26} y={comment.y + 31} textAnchor="middle" fontSize="13" fontWeight="700" fill="#0d1117">
            K
          </text>
          <text x={comment.x + 48} y={comment.y + 31} fontSize="13" fontWeight="600" fill={FG}>
            koyotec-review[bot]
          </text>
          <foreignObject x={comment.x + 16} y={comment.y + 44} width={comment.w - 32} height={comment.h - 52}>
            <div className={s.iacRisk}>
              <span ref={riskRef} />
            </div>
          </foreignObject>
        </g>

        {/* the fix commit */}
        <g ref={fixRef} style={{ opacity: 0 }}>
          <rect x={fix.x} y={fix.y} width={fix.w} height={fix.h} fill="#0d1117" stroke="#30363d" rx="6" />
          <text x={fix.x + 14} y={fix.y + 26} className={s.codeText} fontSize="12.5" fill={MUTED}>
            ⎇ {content.commit}
          </text>
          {content.fix.map((l, i) => diffLine(l, fix.x + 10, fix.y + 64 + i * 32, `f${i}`))}
        </g>

        {/* status checks */}
        {content.checks.map((c, i) => (
          <g key={c} ref={(el) => (checkRefs.current[i] = el)} className={s.iacCheck} style={{ opacity: 0 }}>
            <circle cx={checks.x + 22} cy={checks.y + 20 + i * 30} r="8" />
            <text x={checks.x + 40} y={checks.y + 25 + i * 30} fontSize="14" fill={FG}>
              {c}
            </text>
          </g>
        ))}
        <g ref={mergeRef} style={{ opacity: 0 }}>
          <rect x={checks.x + checks.w - 170} y={checks.y + (wide ? 34 : 110)} width="160" height="36" rx="6" fill="#238636" />
          <text x={checks.x + checks.w - 90} y={checks.y + (wide ? 57 : 133)} textAnchor="middle" fontSize="14" fontWeight="600" fill="#fff">
            Merge ✓
          </text>
        </g>
      </svg>
    </div>
  );
}
