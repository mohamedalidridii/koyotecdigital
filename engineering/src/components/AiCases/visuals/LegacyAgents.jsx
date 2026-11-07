"use client";

// Legacy modernisation — three agents on cobalt: the Analyser maps the COBOL and its modules, the
// Translator writes the Python, the Tester proves old and new give the same results, then a pull
// request lands for review.
import s from "./AiVisual.module.css";

import { useMemo, useRef } from "react";

import { band, follow, useTick, useWide } from "@/components/Systems/lib";

const YELLOW = "#ffe14d";
const WHITE = "#ffffff";
const PHASES = [
  [0.18, 0.4],
  [0.4, 0.6],
  [0.6, 0.84],
];

function layoutFor(wide) {
  if (wide) {
    return {
      W: 1200, H: 720, wide,
      cobol: { x: 40, y: 40, w: 400, h: 410 },
      agents: [510, 600, 690].map((x) => ({ x, y: 84 })),
      mods: [
        { x: 600, y: 210 },
        { x: 520, y: 300 },
        { x: 680, y: 300 },
        { x: 600, y: 390 },
      ],
      py: { x: 760, y: 40, w: 400, h: 410 },
      tests: { x: 40, y: 480, w: 660, h: 210 },
      pr: { x: 730, y: 500, w: 430, h: 170 },
    };
  }
  return {
    W: 600, H: 1160, wide,
    cobol: { x: 20, y: 20, w: 560, h: 300 },
    agents: [150, 300, 450].map((x) => ({ x, y: 370 })),
    mods: [
      { x: 300, y: 450 },
      { x: 175, y: 510 },
      { x: 425, y: 510 },
      { x: 300, y: 570 },
    ],
    py: { x: 20, y: 610, w: 560, h: 260 },
    tests: { x: 20, y: 890, w: 560, h: 150 },
    pr: { x: 20, y: 1056, w: 560, h: 96 },
  };
}

export default function LegacyAgents({ progress, content, reduced, near }) {
  const hostRef = useRef(null);
  const wide = useWide(hostRef, 0.95);
  const L = useMemo(() => layoutFor(wide), [wide]);
  const cobolRefs = useRef([]);
  const agentRefs = useRef([]);
  const modRefs = useRef([]);
  const linkRefs = useRef([]);
  const pyRef = useRef(null);
  const pyRefs = useRef([]);
  const testRefs = useRef([]);
  const meterRef = useRef(null);
  const countRef = useRef(null);
  const prRef = useRef(null);

  useTick(
    near,
    () => {
      const p = follow(progress, reduced);
      // the analyser reads the code line by line
      const read = band(p, 0.2, 0.34) * content.cobol.length;
      cobolRefs.current.forEach((l, i) => l?.toggleAttribute("data-read", read > i + 0.5));
      agentRefs.current.forEach((a, i) => a?.toggleAttribute("data-on", p >= PHASES[i][0] && p < PHASES[i][1]));
      agentRefs.current.forEach((a, i) => a?.toggleAttribute("data-done", p >= PHASES[i][1]));
      modRefs.current.forEach((m, i) => m && (m.style.opacity = String(band(p, 0.24 + i * 0.03, 0.28 + i * 0.03))));
      linkRefs.current.forEach((l, i) => l && (l.style.strokeDashoffset = String(1 - band(p, 0.3 + i * 0.02, 0.36 + i * 0.02))));
      pyRef.current.style.opacity = String(band(p, 0.4, 0.43));
      const typedLines = band(p, 0.42, 0.58) * content.python.length;
      pyRefs.current.forEach((l, i) => l && (l.style.opacity = String(Math.min(1, Math.max(0, typedLines - i)))));
      testRefs.current.forEach((t, i) => {
        if (!t) return;
        t.style.opacity = String(band(p, 0.6, 0.63));
        t.toggleAttribute("data-pass", p > 0.63 + i * 0.03);
      });
      const cmp = band(p, 0.66, 0.8);
      meterRef.current.setAttribute("width", String((L.tests.w - 40) * cmp));
      countRef.current.textContent = `${Math.round(content.total * cmp).toLocaleString(content.compare.includes("identiques") ? "fr-FR" : "en-US")} / ${content.total.toLocaleString(content.compare.includes("identiques") ? "fr-FR" : "en-US")} ${content.compare}`;
      prRef.current.style.opacity = String(band(p, 0.85, 0.89));
      prRef.current.setAttribute("transform", `translate(0 ${(1 - band(p, 0.85, 0.9)) * 18})`);
    },
    [L, content, reduced],
  );

  const { W, H, cobol, agents, mods, py, tests, pr } = L;
  const cl = wide ? 34 : 24;
  const pl = wide ? 40 : 30;
  const links = [
    [0, 1],
    [0, 2],
    [0, 3],
  ];
  return (
    <div ref={hostRef} className={`${s.host} ${s.legacy}`}>
      <svg className={s.svg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        {/* the legacy code */}
        <rect x={cobol.x} y={cobol.y} width={cobol.w} height={cobol.h} fill="#142ba8" />
        <text x={cobol.x + 18} y={cobol.y + 28} className={s.monoText} fontSize="12" fill="rgba(255,255,255,.6)">
          {content.legacyLabel}
        </text>
        {content.cobol.map((l, i) => (
          <g key={i} ref={(el) => (cobolRefs.current[i] = el)} className={s.cobolLine}>
            <rect x={cobol.x + 10} y={cobol.y + 44 + i * cl} width={cobol.w - 20} height={cl - 6} />
            <text x={cobol.x + 4} y={cobol.y + 44 + i * cl + cl * 0.58} className={s.codeText} fontSize={wide ? 13 : 12} fill="rgba(255,255,255,.85)" xmlSpace="preserve">
              {l}
            </text>
          </g>
        ))}

        {/* the three agents */}
        {agents.map((a, i) => (
          <g key={i} ref={(el) => (agentRefs.current[i] = el)} className={s.agentNode}>
            <circle className={s.agentHalo} cx={a.x} cy={a.y} r="40" />
            <circle className={s.agentDisc} cx={a.x} cy={a.y} r="30" />
            <text x={a.x} y={a.y + 5} textAnchor="middle" fontSize="15" fontWeight="700" className={s.agentInitial}>
              {content.agents[i][0]}
            </text>
            <text x={a.x} y={a.y + 58} textAnchor="middle" className={s.monoText} fontSize="11" fill={WHITE}>
              {content.agents[i]}
            </text>
          </g>
        ))}

        {/* module map built by the analyser */}
        {links.map(([a, b], i) => (
          <path
            key={i}
            ref={(el) => (linkRefs.current[i] = el)}
            d={`M${mods[a].x} ${mods[a].y}L${mods[b].x} ${mods[b].y}`}
            pathLength="1"
            stroke={YELLOW}
            strokeWidth="1.6"
            strokeDasharray="1"
            style={{ strokeDashoffset: 1 }}
          />
        ))}
        {content.modules.map((m, i) => (
          <g key={m} ref={(el) => (modRefs.current[i] = el)} style={{ opacity: 0 }}>
            <rect x={mods[i].x - 78} y={mods[i].y - 15} width="156" height="30" fill={i ? "#1f3fd9" : YELLOW} stroke={YELLOW} strokeWidth="1.5" />
            <text x={mods[i].x} y={mods[i].y + 5} textAnchor="middle" className={s.codeText} fontSize="12" fill={i ? WHITE : "#1f3fd9"}>
              {m}
            </text>
          </g>
        ))}

        {/* the modern code */}
        <g ref={pyRef} style={{ opacity: 0 }}>
          <rect x={py.x} y={py.y} width={py.w} height={py.h} fill="#0e1f6e" />
          <text x={py.x + 18} y={py.y + 28} className={s.monoText} fontSize="12" fill={YELLOW}>
            {content.modernLabel}
          </text>
          {content.python.map((l, i) => (
            <text
              key={i}
              ref={(el) => (pyRefs.current[i] = el)}
              x={py.x + 18}
              y={py.y + 66 + i * pl}
              className={s.codeText}
              fontSize={wide ? 11.5 : 12.5}
              fill={WHITE}
              xmlSpace="preserve"
              style={{ opacity: 0 }}
            >
              {l.split(/\b(def|return|if)\b/).map((part, k) =>
                k % 2 ? (
                  <tspan key={k} fill={YELLOW}>
                    {part}
                  </tspan>
                ) : (
                  <tspan key={k} fill={part.trim().startsWith('"""') || part.includes('"""') ? "rgba(255,255,255,.55)" : WHITE}>
                    {part}
                  </tspan>
                ),
              )}
            </text>
          ))}
        </g>

        {/* tests and the old-vs-new comparison */}
        <rect x={tests.x} y={tests.y} width={tests.w} height={tests.h} fill="rgba(255,255,255,0.08)" />
        {content.tests.map((t, i) => (
          <g key={t} ref={(el) => (testRefs.current[i] = el)} className={s.testRow} style={{ opacity: 0 }}>
            <circle cx={tests.x + 30 + (wide ? 0 : (i % 2) * 280)} cy={tests.y + 30 + (wide ? i * 32 : Math.floor(i / 2) * 30)} r="9" />
            <text
              x={tests.x + 48 + (wide ? 0 : (i % 2) * 280)}
              y={tests.y + 35 + (wide ? i * 32 : Math.floor(i / 2) * 30)}
              className={s.codeText}
              fontSize="13"
              fill={WHITE}
            >
              {t}
            </text>
          </g>
        ))}
        <rect x={tests.x + 20} y={tests.y + tests.h - 52} width={tests.w - 40} height="14" fill="rgba(255,255,255,0.15)" />
        <rect ref={meterRef} x={tests.x + 20} y={tests.y + tests.h - 52} width="0" height="14" fill={YELLOW} />
        <text ref={countRef} x={tests.x + 20} y={tests.y + tests.h - 14} className={s.monoText} fontSize="12" fill={WHITE} />

        {/* the pull request */}
        <g ref={prRef} style={{ opacity: 0 }}>
          <rect x={pr.x} y={pr.y} width={pr.w} height={pr.h} fill={WHITE} />
          <circle cx={pr.x + 34} cy={pr.y + 36} r="6" fill="none" stroke="#12a150" strokeWidth="2.4" />
          <circle cx={pr.x + 34} cy={pr.y + 70} r="6" fill="none" stroke="#12a150" strokeWidth="2.4" />
          <path d={`M${pr.x + 34} ${pr.y + 42}V${pr.y + 64}`} stroke="#12a150" strokeWidth="2.4" />
          <text x={pr.x + 58} y={pr.y + 42} fontSize={wide ? 17 : 15} fontWeight="600" fill="#0e1f6e">
            {content.pr}
          </text>
          <text x={pr.x + 58} y={pr.y + 70} className={s.monoText} fontSize="11.5" fill="rgba(14,31,110,.7)">
            {content.prMeta}
          </text>
          {wide ? (
            <g>
              <rect x={pr.x + 24} y={pr.y + pr.h - 50} width="150" height="30" fill="#12a150" />
              <text x={pr.x + 99} y={pr.y + pr.h - 30} textAnchor="middle" className={s.monoText} fontSize="11" fill={WHITE}>
                Merge ✓
              </text>
            </g>
          ) : null}
        </g>
      </svg>
    </div>
  );
}
