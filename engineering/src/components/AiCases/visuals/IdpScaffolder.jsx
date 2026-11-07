"use client";

// Developer platform scaffolder — a request in the portal; the company's rules light up, the
// repository is generated file by file, compliance checks turn green and the repo is created.
import s from "./AiVisual.module.css";

import { useMemo, useRef } from "react";

import { band, follow, typed, useTick, useWide } from "@/components/Systems/lib";

const INDIGO = "#4b3df5";
const INK = "#15123a";
const GREEN = "#12a150";

function layoutFor(wide) {
  if (wide) {
    return {
      W: 1200, H: 720, wide,
      frame: { x: 30, y: 20, w: 1140, h: 680 },
      prompt: { x: 60, y: 92, w: 1080, h: 64 },
      docs: { x: 60, y: 186, w: 330, row: 74 },
      tree: { x: 420, y: 186, w: 360, row: 40 },
      checks: { x: 810, y: 186, w: 330, row: 52 },
      repo: { x: 810, y: 430, w: 330, h: 140 },
    };
  }
  return {
    W: 600, H: 1180, wide,
    frame: { x: 10, y: 10, w: 580, h: 1160 },
    prompt: { x: 30, y: 82, w: 540, h: 96 },
    docs: { x: 30, y: 206, w: 540, row: 66 },
    tree: { x: 30, y: 430, w: 540, row: 38 },
    checks: { x: 30, y: 770, w: 540, row: 50 },
    repo: { x: 30, y: 990, w: 540, h: 150 },
  };
}

export default function IdpScaffolder({ progress, content, reduced, near }) {
  const hostRef = useRef(null);
  const wide = useWide(hostRef, 0.95);
  const L = useMemo(() => layoutFor(wide), [wide]);
  const promptRef = useRef(null);
  const docRefs = useRef([]);
  const treeRefs = useRef([]);
  const checkRefs = useRef([]);
  const repoRef = useRef(null);

  useTick(
    near,
    () => {
      const p = follow(progress, reduced);
      promptRef.current.textContent = typed(content.prompt, band(p, 0.02, 0.16));
      docRefs.current.forEach((d, i) => {
        if (!d) return;
        d.style.opacity = String(0.35 + band(p, 0.22 + i * 0.04, 0.26 + i * 0.04) * 0.65);
        d.toggleAttribute("data-on", p > 0.24 + i * 0.04);
      });
      const files = band(p, 0.4, 0.62) * content.tree.length;
      treeRefs.current.forEach((t, i) => {
        if (!t) return;
        const k = Math.min(1, Math.max(0, files - i));
        t.style.opacity = String(k);
        t.setAttribute("transform", `translate(${(1 - k) * 12} 0)`);
      });
      checkRefs.current.forEach((c, i) => {
        if (!c) return;
        c.style.opacity = String(band(p, 0.64, 0.67));
        c.toggleAttribute("data-pass", p > 0.68 + i * 0.03);
      });
      repoRef.current.style.opacity = String(band(p, 0.84, 0.88));
      repoRef.current.setAttribute("transform", `translate(0 ${(1 - band(p, 0.84, 0.9)) * 14})`);
    },
    [L, content, reduced],
  );

  const { W, H, frame, prompt, docs, tree, checks, repo } = L;
  return (
    <div ref={hostRef} className={`${s.host} ${s.idp}`}>
      <svg className={s.svg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        {/* the portal */}
        <rect x={frame.x} y={frame.y} width={frame.w} height={frame.h} rx="10" fill="#fff" stroke="rgba(21,18,58,.12)" />
        <rect x={frame.x} y={frame.y} width={frame.w} height="50" rx="10" fill={INK} />
        <rect x={frame.x} y={frame.y + 40} width={frame.w} height="10" fill={INK} />
        <text x={frame.x + 24} y={frame.y + 31} fontSize="15" fontWeight="600" fill="#fff">
          {content.portal}
        </text>
        <rect x={frame.x + frame.w - 184} y={frame.y + 11} width="164" height="28" rx="14" fill={INDIGO} />
        <text x={frame.x + frame.w - 102} y={frame.y + 30} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#fff">
          + {content.create}
        </text>

        {/* the request */}
        <rect x={prompt.x} y={prompt.y} width={prompt.w} height={prompt.h} rx="8" fill="#f6f5fd" stroke={INDIGO} strokeWidth="1.5" />
        <foreignObject x={prompt.x + 16} y={prompt.y} width={prompt.w - 32} height={prompt.h}>
          <div className={s.idpPrompt}>
            <span ref={promptRef} className={s.caret} />
          </div>
        </foreignObject>

        {/* the rules that apply */}
        <text x={docs.x} y={docs.y - 4} className={s.monoText} fontSize="11.5" fill="rgba(21,18,58,.55)">
          {content.docsLabel}
        </text>
        {content.docs.map((d, i) => (
          <g key={d} ref={(el) => (docRefs.current[i] = el)} className={s.idpDoc} style={{ opacity: 0.35 }}>
            <rect x={docs.x} y={docs.y + 10 + i * docs.row} width={docs.w} height={docs.row - 14} rx="8" />
            <path d={`M${docs.x + 18} ${docs.y + 24 + i * docs.row}h16l6 6v20h-22z`} fill="none" stroke={INDIGO} strokeWidth="1.5" />
            <text x={docs.x + 54} y={docs.y + 44 + i * docs.row} fontSize="14.5" fontWeight="500" fill={INK}>
              {d}
            </text>
            <text className={s.idpTick} x={docs.x + docs.w - 18} y={docs.y + 45 + i * docs.row} textAnchor="end" fontSize="16" fontWeight="700" fill={GREEN}>
              ✓
            </text>
          </g>
        ))}

        {/* the repository, file by file */}
        <rect x={tree.x} y={tree.y} width={tree.w} height={content.tree.length * tree.row + 24} rx="8" fill="#15123a" />
        {content.tree.map(([name, depth], i) => (
          <g key={name} ref={(el) => (treeRefs.current[i] = el)} style={{ opacity: 0 }}>
            <text x={tree.x + 20 + depth * 22} y={tree.y + 36 + i * tree.row} className={s.codeText} fontSize={wide ? 14 : 14.5} fill={depth ? "#e9e7ff" : "#a99fff"}>
              {depth ? "├─ " : "▾ "}
              {name}
            </text>
          </g>
        ))}

        {/* compliance checks */}
        {content.checks.map((c, i) => (
          <g key={c} ref={(el) => (checkRefs.current[i] = el)} className={s.idpCheck} style={{ opacity: 0 }}>
            <rect x={checks.x} y={checks.y + i * checks.row} width={checks.w} height={checks.row - 10} rx="8" />
            <circle cx={checks.x + 22} cy={checks.y + i * checks.row + (checks.row - 10) / 2} r="9" />
            <text x={checks.x + 42} y={checks.y + i * checks.row + (checks.row - 10) / 2 + 5} fontSize="14" fill={INK}>
              {c}
            </text>
          </g>
        ))}

        {/* the repository is created */}
        <g ref={repoRef} style={{ opacity: 0 }}>
          <rect x={repo.x} y={repo.y} width={repo.w} height={repo.h} rx="10" fill={INDIGO} />
          <text x={repo.x + 22} y={repo.y + 44} fontSize="17" fontWeight="600" fill="#fff">
            ✓ {content.repo}
          </text>
          <text x={repo.x + 22} y={repo.y + 80} className={s.codeText} fontSize="12.5" fill="rgba(255,255,255,.75)">
            $ git clone …/payments-service
          </text>
          <text x={repo.x + 22} y={repo.y + 118} fontSize="22" fontWeight="700" fill="#fff">
            {content.ready}
          </text>
        </g>
      </svg>
    </div>
  );
}
