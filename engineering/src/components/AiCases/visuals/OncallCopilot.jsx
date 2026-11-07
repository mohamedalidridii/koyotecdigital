"use client";

// On-call copilot — 03:12, an alert; the orchestrator sends three agents (metrics, changes,
// memory), their findings come back, a Slack summary assembles with the fix command, the
// engineer applies it and the latency falls back.
import s from "./AiVisual.module.css";

import { useMemo, useRef } from "react";

import { band, follow, typed, useTick, useWide } from "@/components/Systems/lib";

const AMBER = "#ffb547";
const FG = "#eef2f8";
const GREEN = "#3ddc84";

// latency over time: calm, the spike, and (after the fix) back down
const LAT = [0.18, 0.2, 0.17, 0.19, 0.22, 0.45, 0.78, 0.92, 0.95, 0.93, 0.96, 0.94];
const AFTER = [0.94, 0.7, 0.35, 0.2, 0.18, 0.19];

function layoutFor(wide) {
  if (wide) {
    const agents = [40, 172, 304].map((y) => ({ x: 760, y, w: 400, h: 112 }));
    return {
      W: 1200, H: 720,
      alert: { x: 40, y: 40, w: 520, h: 104 },
      chart: { x: 40, y: 170, w: 520, h: 150 },
      orch: { cx: 650, cy: 200, r: 42 },
      agents,
      wire: (a) => `M692 200C725 200 725 ${a.y + a.h / 2} ${a.x} ${a.y + a.h / 2}`,
      slack: { x: 40, y: 446, w: 1120, h: 250 },
    };
  }
  const agents = [430, 538, 646].map((y) => ({ x: 20, y, w: 560, h: 96 }));
  return {
    W: 600, H: 1150,
    alert: { x: 20, y: 20, w: 560, h: 104 },
    chart: { x: 20, y: 146, w: 560, h: 150 },
    orch: { cx: 300, cy: 360, r: 38 },
    agents,
    wire: (a) => `M300 398V${a.y}`,
    slack: { x: 20, y: 770, w: 560, h: 360 },
  };
}

export default function OncallCopilot({ progress, content, reduced, near }) {
  const hostRef = useRef(null);
  const wide = useWide(hostRef, 0.95);
  const L = useMemo(() => layoutFor(wide), [wide]);
  const alertRef = useRef(null);
  const lineRef = useRef(null);
  const fixRef = useRef(null);
  const resolvedRef = useRef(null);
  const orchRef = useRef(null);
  const wireRefs = useRef([]);
  const agentRefs = useRef([]);
  const findRefs = useRef([]);
  const slackRef = useRef(null);
  const titleRef = useRef(null);
  const bulletRefs = useRef([]);
  const cmdRef = useRef(null);
  const copyRef = useRef(null);
  const ackRef = useRef(null);

  const { chart } = L;
  const pts = (arr, from = 0, total = LAT.length + AFTER.length - 1) =>
    arr.map((v, i) => [chart.x + 20 + ((from + i) / total) * (chart.w - 40), chart.y + chart.h - 16 - v * (chart.h - 44)]);
  const dLine = (p) => p.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
  const spike = dLine(pts(LAT));
  const after = dLine(pts(AFTER, LAT.length - 1));

  useTick(
    near,
    () => {
      const p = follow(progress, reduced);
      alertRef.current.style.opacity = String(band(p, 0.01, 0.05));
      alertRef.current.toggleAttribute("data-live", p < 0.9);
      lineRef.current.style.strokeDashoffset = String(1 - band(p, 0.03, 0.18));
      orchRef.current.style.opacity = String(0.3 + band(p, 0.2, 0.24) * 0.7);
      orchRef.current.toggleAttribute("data-on", p > 0.22 && p < 0.62);
      wireRefs.current.forEach((w, i) => w && (w.style.strokeDashoffset = String(1 - band(p, 0.22 + i * 0.02, 0.28 + i * 0.02))));
      agentRefs.current.forEach((a, i) => a && (a.style.opacity = String(band(p, 0.26 + i * 0.03, 0.3 + i * 0.03))));
      findRefs.current.forEach((f, i) => {
        if (!f) return;
        f.textContent = typed(content.findings[i], band(p, 0.4 + i * 0.06, 0.48 + i * 0.06));
      });
      slackRef.current.style.opacity = String(band(p, 0.62, 0.66));
      slackRef.current.setAttribute("transform", `translate(0 ${(1 - band(p, 0.62, 0.68)) * 16})`);
      titleRef.current.textContent = typed(content.title, band(p, 0.66, 0.73));
      bulletRefs.current.forEach((b, i) => b && (b.style.opacity = String(band(p, 0.72 + i * 0.02, 0.75 + i * 0.02))));
      cmdRef.current.style.opacity = String(band(p, 0.78, 0.81));
      copyRef.current.toggleAttribute("data-done", p > 0.86);
      ackRef.current.style.opacity = String(band(p, 0.87, 0.9));
      fixRef.current.style.strokeDashoffset = String(1 - band(p, 0.88, 0.96));
      resolvedRef.current.style.opacity = String(band(p, 0.94, 0.97));
    },
    [L, content, reduced],
  );

  const { W, H, alert, orch, agents, slack } = L;
  const sl = wide;
  return (
    <div ref={hostRef} className={`${s.host} ${s.oncall}`}>
      <svg className={s.svg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        {/* the page */}
        <g ref={alertRef} className={s.pager} style={{ opacity: 0 }}>
          <rect x={alert.x} y={alert.y} width={alert.w} height={alert.h} fill="rgba(255,181,71,0.1)" stroke={AMBER} strokeWidth="1.5" />
          <circle className={s.pagerPulse} cx={alert.x + 44} cy={alert.y + alert.h / 2} r="16" fill="none" stroke={AMBER} strokeWidth="2" />
          <circle cx={alert.x + 44} cy={alert.y + alert.h / 2} r="9" fill={AMBER} />
          <text x={alert.x + 78} y={alert.y + 44} fontSize="34" fontWeight="700" fill={FG} className={s.codeText}>
            {content.time}
          </text>
          <text x={alert.x + 78} y={alert.y + 76} fontSize="15" fill={AMBER}>
            {content.alert}
          </text>
        </g>

        {/* latency */}
        <text x={chart.x} y={chart.y + 4} className={s.monoText} fontSize="11" fill="rgba(238,242,248,.55)">
          {content.latency}
        </text>
        <line x1={chart.x} x2={chart.x + chart.w} y1={chart.y + chart.h - 16} y2={chart.y + chart.h - 16} stroke="rgba(238,242,248,.15)" />
        <path ref={lineRef} d={spike} pathLength="1" fill="none" stroke={AMBER} strokeWidth="2.5" strokeDasharray="1" style={{ strokeDashoffset: 1 }} />
        <path ref={fixRef} d={after} pathLength="1" fill="none" stroke={GREEN} strokeWidth="2.5" strokeDasharray="1" style={{ strokeDashoffset: 1 }} />
        <text ref={resolvedRef} x={chart.x + chart.w - 10} y={chart.y + chart.h - 26} textAnchor="end" fontSize="13" fill={GREEN} style={{ opacity: 0 }}>
          ✓ {content.resolved}
        </text>

        {/* the orchestrator and its three agents */}
        {agents.map((a, i) => (
          <path key={i} ref={(el) => (wireRefs.current[i] = el)} d={L.wire(a)} pathLength="1" fill="none" stroke="rgba(255,181,71,.6)" strokeWidth="1.5" strokeDasharray="1" style={{ strokeDashoffset: 1 }} />
        ))}
        <g ref={orchRef} className={s.orch} style={{ opacity: 0.3 }}>
          <circle className={s.orchPulse} cx={orch.cx} cy={orch.cy} r={orch.r} fill="none" stroke={AMBER} strokeWidth="2" />
          <circle cx={orch.cx} cy={orch.cy} r={orch.r} fill={AMBER} />
          <path d={`M${orch.cx - 14} ${orch.cy - 7}h28M${orch.cx - 14} ${orch.cy}h28M${orch.cx - 14} ${orch.cy + 7}h18`} stroke="#0c1424" strokeWidth="2.4" strokeLinecap="round" />
          <text
            x={wide ? orch.cx : orch.cx + orch.r + 14}
            y={wide ? orch.cy + orch.r + 22 : orch.cy + 5}
            textAnchor={wide ? "middle" : "start"}
            className={s.monoText}
            fontSize="12"
            fill={FG}
          >
            {content.orchestrator}
          </text>
        </g>
        {agents.map((a, i) => (
          <g key={i} ref={(el) => (agentRefs.current[i] = el)} style={{ opacity: 0 }}>
            <rect x={a.x} y={a.y} width={a.w} height={a.h} fill="#151d2e" stroke="rgba(238,242,248,0.2)" />
            <text x={a.x + 18} y={a.y + 28} fontSize="16" fontWeight="600" fill={FG}>
              {content.agents[i][0]}
            </text>
            <text x={a.x + a.w - 18} y={a.y + 28} textAnchor="end" className={s.monoText} fontSize="11" fill={AMBER}>
              {content.agents[i][1]}
            </text>
            <foreignObject x={a.x + 18} y={a.y + 40} width={a.w - 36} height={a.h - 46}>
              <div className={s.findText}>
                <span ref={(el) => (findRefs.current[i] = el)} />
              </div>
            </foreignObject>
          </g>
        ))}

        {/* the Slack summary */}
        <g ref={slackRef} style={{ opacity: 0 }}>
          <rect x={slack.x} y={slack.y} width={slack.w} height={slack.h} fill="#f8f8fa" rx="6" />
          <rect x={slack.x + 20} y={slack.y + 20} width="40" height="40" rx="8" fill={AMBER} />
          <text x={slack.x + 40} y={slack.y + 46} textAnchor="middle" fontSize="18" fontWeight="700" fill="#0c1424">
            K
          </text>
          <text x={slack.x + 74} y={slack.y + 36} fontSize="15" fontWeight="700" fill="#1d1c1d">
            {content.bot}
          </text>
          <text x={slack.x + 74} y={slack.y + 56} className={s.monoText} fontSize="11" fill="#616061">
            {content.channel} · 03:14
          </text>
          <foreignObject x={slack.x + 74} y={slack.y + 66} width={slack.w - 94} height={sl ? 34 : 64}>
            <div className={s.slackTitle}>
              <span ref={titleRef} />
            </div>
          </foreignObject>
          {content.findings.map((f, i) => (
            <text
              key={i}
              ref={(el) => (bulletRefs.current[i] = el)}
              x={slack.x + 74}
              y={slack.y + (sl ? 120 : 154) + i * 22}
              fontSize={sl ? 14 : 12.5}
              fill="#1d1c1d"
              style={{ opacity: 0 }}
            >
              • {f}
            </text>
          ))}
          <g ref={cmdRef} style={{ opacity: 0 }}>
            <rect x={slack.x + 74} y={slack.y + (sl ? 190 : 236)} width={slack.w - 94} height="40" rx="4" fill="#1d1c1d" />
            <text x={slack.x + 90} y={slack.y + (sl ? 215 : 261)} className={s.codeText} fontSize={sl ? 14 : 11.5} fill={GREEN}>
              $ {content.command}
            </text>
            <g ref={copyRef} className={s.copyBtn}>
              <rect x={slack.x + slack.w - (sl ? 110 : 96)} y={slack.y + (sl ? 196 : 242)} width={sl ? 82 : 70} height="28" rx="4" />
              <text x={slack.x + slack.w - (sl ? 69 : 61)} y={slack.y + (sl ? 215 : 261)} textAnchor="middle" fontSize="12" fontWeight="600">
                {content.copy}
              </text>
            </g>
          </g>
          <text ref={ackRef} x={slack.x + 74} y={slack.y + slack.h - (sl ? 4 : 20)} fontSize="13" fill="#007a5a" style={{ opacity: 0 }}>
            ✓ {content.ack}
          </text>
        </g>
      </svg>
    </div>
  );
}
