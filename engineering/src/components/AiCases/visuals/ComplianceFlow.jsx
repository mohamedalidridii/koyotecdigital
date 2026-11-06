"use client";

// Compliance agent — the question goes to the internal base first; a confidence gauge stops
// below the threshold, so the agent searches approved official sources, then answers citing both.
import s from "./AiVisual.module.css";

import { useMemo, useRef } from "react";

import { band, follow, typed, useTick, useWide } from "@/components/Systems/lib";

const AMBER = "#f2b544";
const INK = "#eef2f8";
const CONFIDENCE = 0.42;
const THRESHOLD = 0.7;

function layoutFor(wide) {
  if (wide) {
    return {
      W: 1200, H: 720,
      q: { x: 40, y: 30, w: 660, h: 110 },
      base: { x: 40, y: 200, w: 330, h: 210 },
      gauge: { cx: 590, cy: 390, r: 120 },
      web: { x: 810, y: 170, w: 350, h: 240 },
      answer: { x: 40, y: 500, w: 1120, h: 190 },
      wires: [
        "M205 140V200",
        "M370 305C420 305 430 390 470 390",
        "M710 390C760 390 760 290 810 290",
        "M985 410V500",
        "M205 410V500",
      ],
    };
  }
  return {
    W: 600, H: 990,
    q: { x: 20, y: 20, w: 560, h: 100 },
    base: { x: 20, y: 150, w: 560, h: 170 },
    gauge: { cx: 300, cy: 452, r: 90 },
    web: { x: 20, y: 560, w: 560, h: 160 },
    answer: { x: 20, y: 750, w: 560, h: 220 },
    // the internal base also feeds the answer: drawn along the left edge, clear of the cards
    wires: ["M300 120V150", "M300 320V362", "M300 530V560", "M300 720V750", "M12 320V750"],
  };
}

// a half-circle arc from angle a0 to a1 (0 = left, 1 = right)
const arc = (cx, cy, r, a0, a1) => {
  const pt = (a) => [cx - Math.cos(a * Math.PI) * r, cy - Math.sin(a * Math.PI) * r];
  const [x0, y0] = pt(a0);
  const [x1, y1] = pt(a1);
  return `M${x0} ${y0}A${r} ${r} 0 0 1 ${x1} ${y1}`;
};

export default function ComplianceFlow({ progress, content, reduced, near }) {
  const hostRef = useRef(null);
  const wide = useWide(hostRef, 0.95);
  const L = useMemo(() => layoutFor(wide), [wide]);
  const qRef = useRef(null);
  const wireRefs = useRef([]);
  const baseRef = useRef(null);
  const docRefs = useRef([]);
  const gaugeRef = useRef(null);
  const needleRef = useRef(null);
  const fillRef = useRef(null);
  const pctRef = useRef(null);
  const decisionRef = useRef(null);
  const webRef = useRef(null);
  const scanRef = useRef(null);
  const resultRef = useRef(null);
  const answerRef = useRef(null);
  const aRef = useRef(null);
  const citeRefs = useRef([]);

  useTick(
    near,
    (time) => {
      const p = follow(progress, reduced);
      qRef.current.textContent = typed(content.question, band(p, 0.02, 0.14));
      const wire = [band(p, 0.2, 0.26), band(p, 0.4, 0.44), band(p, 0.6, 0.66), band(p, 0.78, 0.82), band(p, 0.78, 0.82)];
      wireRefs.current.forEach((w, i) => w && (w.style.strokeDashoffset = String(1 - wire[i])));
      baseRef.current.style.opacity = String(band(p, 0.22, 0.26));
      docRefs.current.forEach((d, i) => d && (d.style.opacity = String(band(p, 0.26 + i * 0.05, 0.31 + i * 0.05))));

      const g = band(p, 0.42, 0.46);
      gaugeRef.current.style.opacity = String(g);
      const level = CONFIDENCE * band(p, 0.44, 0.56);
      const { cx, cy, r } = L.gauge;
      fillRef.current.setAttribute("d", level > 0.001 ? arc(cx, cy, r, 0, level) : "");
      const ang = level * Math.PI;
      needleRef.current.setAttribute("x2", String(cx - Math.cos(ang) * (r - 18)));
      needleRef.current.setAttribute("y2", String(cy - Math.sin(ang) * (r - 18)));
      pctRef.current.textContent = `${Math.round(level * 100)} %`;
      decisionRef.current.style.opacity = String(band(p, 0.54, 0.58));

      webRef.current.style.opacity = String(band(p, 0.64, 0.68));
      const scanning = p > 0.66 && p < 0.74;
      scanRef.current.style.opacity = scanning ? "1" : "0";
      if (!reduced) scanRef.current.setAttribute("transform", `translate(0 ${((time * 90) % 60) - 0})`);
      resultRef.current.style.opacity = String(band(p, 0.7, 0.75));

      answerRef.current.style.opacity = String(band(p, 0.8, 0.84));
      aRef.current.textContent = typed(content.answer, band(p, 0.84, 0.95));
      citeRefs.current.forEach((c, i) => c && (c.style.opacity = String(band(p, 0.94 + i * 0.02, 0.97 + i * 0.02))));
    },
    [L, content, reduced],
  );

  const { W, H, q, base, gauge, web, answer } = L;
  return (
    <div ref={hostRef} className={`${s.host} ${s.compliance}`}>
      <svg className={s.svg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <pattern id="cgrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="rgba(238,242,248,0.06)" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#cgrid)" />

        {L.wires.map((d, i) => (
          <path
            key={i}
            ref={(el) => (wireRefs.current[i] = el)}
            d={d}
            pathLength="1"
            fill="none"
            stroke={i === 2 ? AMBER : "rgba(238,242,248,0.55)"}
            strokeWidth="1.6"
            strokeDasharray="1"
            style={{ strokeDashoffset: 1 }}
          />
        ))}

        {/* the question */}
        <rect x={q.x} y={q.y} width={q.w} height={q.h} fill="rgba(238,242,248,0.06)" stroke="rgba(238,242,248,0.4)" />
        <foreignObject x={q.x} y={q.y} width={q.w} height={q.h}>
          <div className={s.fo}>
            <span className={s.foLabel}>?</span>
            <span ref={qRef} className={`${s.foText} ${s.caret}`} />
          </div>
        </foreignObject>

        {/* internal base */}
        <g ref={baseRef} style={{ opacity: 0 }}>
          <rect x={base.x} y={base.y} width={base.w} height={base.h} fill="#0f1b2d" stroke="rgba(238,242,248,0.4)" />
          <text x={base.x + 18} y={base.y + 32} className={s.monoText} fontSize="13" fill="rgba(238,242,248,.6)">
            {content.localLabel}
          </text>
          {content.local.map((d, i) => (
            <g key={d} ref={(el) => (docRefs.current[i] = el)} style={{ opacity: 0 }}>
              <rect x={base.x + 18} y={base.y + 52 + i * 62} width={base.w - 36} height="50" fill="rgba(238,242,248,0.07)" />
              <path
                d={`M${base.x + 32} ${base.y + 64 + i * 62}h16l6 6v20h-22z`}
                fill="none"
                stroke={INK}
                strokeWidth="1.4"
              />
              <text x={base.x + 66} y={base.y + 82 + i * 62} fontSize="15" fill={INK}>
                {d}
              </text>
            </g>
          ))}
        </g>

        {/* confidence gauge */}
        <g ref={gaugeRef} style={{ opacity: 0 }}>
          <path d={arc(gauge.cx, gauge.cy, gauge.r, 0, 1)} fill="none" stroke="rgba(238,242,248,0.16)" strokeWidth="16" />
          <path ref={fillRef} fill="none" stroke={AMBER} strokeWidth="16" />
          {(() => {
            const a = THRESHOLD * Math.PI;
            const x1 = gauge.cx - Math.cos(a) * (gauge.r - 14);
            const y1 = gauge.cy - Math.sin(a) * (gauge.r - 14);
            const x2 = gauge.cx - Math.cos(a) * (gauge.r + 18);
            const y2 = gauge.cy - Math.sin(a) * (gauge.r + 18);
            return (
              <g>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth="2.5" />
                <text x={x2 + 6} y={y2 - 6} className={s.monoText} fontSize="12" fill={INK}>
                  {content.threshold} {Math.round(THRESHOLD * 100)} %
                </text>
              </g>
            );
          })()}
          <line ref={needleRef} x1={gauge.cx} y1={gauge.cy} x2={gauge.cx - gauge.r + 18} y2={gauge.cy} stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <circle cx={gauge.cx} cy={gauge.cy} r="7" fill={INK} />
          <text x={gauge.cx} y={gauge.cy + 34} textAnchor="middle" className={s.monoText} fontSize="12" fill="rgba(238,242,248,.6)">
            {content.confidence}
          </text>
          <text ref={pctRef} x={gauge.cx} y={gauge.cy - 34} textAnchor="middle" fontSize="30" fontWeight="600" fill={INK}>
            0 %
          </text>
          <g ref={decisionRef} style={{ opacity: 0 }}>
            <rect x={gauge.cx - 120} y={gauge.cy + 46} width="240" height="32" fill={AMBER} />
            <text x={gauge.cx} y={gauge.cy + 67} textAnchor="middle" fontSize="14" fontWeight="500" fill="#0f1b2d">
              {content.decision}
            </text>
          </g>
        </g>

        {/* official sources */}
        <g ref={webRef} style={{ opacity: 0 }}>
          <rect x={web.x} y={web.y} width={web.w} height={web.h} fill="#0f1b2d" stroke={AMBER} />
          <path
            d={`M${web.x + 30} ${web.y + 20}l12 5v9c0 8-5 13-12 16-7-3-12-8-12-16v-9z`}
            fill="none"
            stroke={AMBER}
            strokeWidth="1.6"
          />
          <text x={web.x + 56} y={web.y + 38} className={s.monoText} fontSize="13" fill={AMBER}>
            {content.webLabel}
          </text>
          <rect ref={scanRef} x={web.x + 18} y={web.y + 76} width={web.w - 36} height="3" fill={AMBER} style={{ opacity: 0 }} />
          <g ref={resultRef} style={{ opacity: 0 }}>
            <rect x={web.x + 18} y={web.y + 80} width={web.w - 36} height="64" fill="rgba(242,181,68,0.14)" />
            <path d={`M${web.x + 34} ${web.y + 94}h18l6 6v24h-24z`} fill="none" stroke={AMBER} strokeWidth="1.5" />
            <text x={web.x + 74} y={web.y + 118} fontSize="16" fontWeight="500" fill={INK}>
              {content.web}
            </text>
          </g>
        </g>

        {/* the answer */}
        <g ref={answerRef} style={{ opacity: 0 }}>
          <rect x={answer.x} y={answer.y} width={answer.w} height={answer.h} fill="rgba(238,242,248,0.96)" />
          <foreignObject x={answer.x} y={answer.y} width={answer.w} height={answer.h}>
            <div className={`${s.fo} ${s.foDark}`}>
              <span className={s.foLabel}>{content.assistant}</span>
              <span ref={aRef} className={s.foText} />
              <span className={s.cites}>
                {content.cites.map((c, i) => (
                  <i key={c} ref={(el) => (citeRefs.current[i] = el)} data-kind={i ? "web" : "local"} style={{ opacity: 0 }}>
                    {c}
                  </i>
                ))}
              </span>
            </div>
          </foreignObject>
        </g>
      </svg>
    </div>
  );
}
