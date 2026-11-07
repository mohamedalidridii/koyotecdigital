"use client";

// SOC triage — a flood of alerts; the agent picks the critical one, pulls context (IP reputation,
// user behaviour, firewall), maps it to MITRE ATT&CK, drafts the incident report, and the analyst
// approves. The day's count drops from 1,240 to the few that need a human.
import s from "./AiVisual.module.css";

import { useMemo, useRef } from "react";

import { band, follow, typed, useTick, useWide } from "@/components/Systems/lib";

const PINK = "#ff3d81";
const FG = "#f6eef7";
const SEV = { critique: "#ff3d81", critical: "#ff3d81", moyenne: "#ffb020", medium: "#ffb020", faible: "#7d6f80", low: "#7d6f80" };

function layoutFor(wide) {
  if (wide) {
    return {
      W: 1200, H: 720, wide,
      counter: { x: 40, y: 74 },
      queue: { x: 40, y: 110, w: 360, row: 58, n: 6 },
      enrich: { x: 440, y: 110, w: 360, card: 98, gap: 14 },
      verdict: { x: 840, y: 110, w: 320, h: 324 },
      report: { x: 440, y: 466, w: 720, h: 230 },
    };
  }
  return {
    W: 600, H: 1150, wide,
    counter: { x: 20, y: 60 },
    queue: { x: 20, y: 90, w: 560, row: 54, n: 4 },
    enrich: { x: 20, y: 330, w: 560, card: 84, gap: 12 },
    verdict: { x: 20, y: 640, w: 560, h: 150 },
    report: { x: 20, y: 812, w: 560, h: 320 },
  };
}

export default function SocTriage({ progress, content, reduced, near }) {
  const hostRef = useRef(null);
  const wide = useWide(hostRef, 0.95);
  const L = useMemo(() => layoutFor(wide), [wide]);
  const countRef = useRef(null);
  const countLabelRef = useRef(null);
  const rowRefs = useRef([]);
  const wireRefs = useRef([]);
  const cardRefs = useRef([]);
  const verdictRef = useRef(null);
  const segRefs = useRef([]);
  const reportRef = useRef(null);
  const reportTextRef = useRef(null);
  const btnRef = useRef(null);
  const btnTextRef = useRef(null);
  const fr = content.queueLabel.startsWith("Alertes");
  const fmt = (n) => n.toLocaleString(fr ? "fr-FR" : "en-US");

  useTick(
    near,
    () => {
      const p = follow(progress, reduced);
      const drop = band(p, 0.9, 0.97);
      countRef.current.textContent = fmt(Math.round(content.total - (content.total - content.remaining) * drop));
      countLabelRef.current.textContent = drop > 0.5 ? content.remainingLabel : content.queueLabel;
      rowRefs.current.forEach((r, i) => {
        if (!r) return;
        r.style.opacity = String(band(p, 0.02 + i * 0.02, 0.06 + i * 0.02) * (i === 0 ? 1 : 1 - band(p, 0.2, 0.24) * 0.55));
        if (i === 0) r.toggleAttribute("data-picked", p > 0.2);
      });
      wireRefs.current.forEach((w, i) => w && (w.style.strokeDashoffset = String(1 - band(p, 0.22 + i * 0.02, 0.27 + i * 0.02))));
      cardRefs.current.forEach((c, i) => {
        if (!c) return;
        const k = band(p, 0.25 + i * 0.03, 0.3 + i * 0.03);
        c.style.opacity = String(k);
        c.setAttribute("transform", `translate(${(1 - k) * 16} 0)`);
      });
      verdictRef.current.style.opacity = String(band(p, 0.42, 0.46));
      const sev = band(p, 0.46, 0.56) * 5;
      segRefs.current.forEach((sg, i) => sg && (sg.style.opacity = String(Math.min(1, Math.max(0.12, sev - i)))));
      reportRef.current.style.opacity = String(band(p, 0.6, 0.63));
      reportTextRef.current.textContent = typed(content.report, band(p, 0.62, 0.78));
      const approved = p >= 0.84;
      btnRef.current.style.opacity = String(band(p, 0.78, 0.81));
      btnRef.current.toggleAttribute("data-done", approved);
      btnTextRef.current.textContent = approved ? `✓ ${content.approved}` : content.approve;
    },
    [L, content, reduced],
  );

  const { W, H, counter, queue, enrich, verdict, report } = L;
  const alerts = content.alerts.slice(0, queue.n);
  const sevColor = (lvl) => SEV[lvl.toLowerCase()] || "#7d6f80";
  return (
    <div ref={hostRef} className={`${s.host} ${s.soc}`}>
      <svg className={s.svg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        {/* the day's alert count */}
        <text x={counter.x} y={counter.y} fontSize="40" fontWeight="700" fill={FG} letterSpacing="-1">
          <tspan ref={countRef}>{fmt(content.total)}</tspan>
          <tspan ref={countLabelRef} dx="12" fontSize="14" fontWeight="400" fill="rgba(246,238,247,.6)" className={s.monoText}>
            {content.queueLabel}
          </tspan>
        </text>

        {/* the queue */}
        {alerts.map(([lvl, text], i) => {
          const y = queue.y + i * queue.row;
          return (
            <g key={i} ref={(el) => (rowRefs.current[i] = el)} className={s.alertRow} style={{ opacity: 0 }}>
              <rect className={s.alertBox} x={queue.x} y={y} width={queue.w} height={queue.row - 8} />
              <rect x={queue.x} y={y} width="5" height={queue.row - 8} fill={sevColor(lvl)} />
              <text x={queue.x + 18} y={y + 20} className={s.monoText} fontSize="10.5" fill={sevColor(lvl)}>
                {lvl}
              </text>
              <foreignObject x={queue.x + 18} y={y + 24} width={queue.w - 28} height={queue.row - 34}>
                <div className={s.alertText}>{text}</div>
              </foreignObject>
            </g>
          );
        })}

        {/* context gathered for the picked alert */}
        {content.enrich.map(([label, value], i) => {
          const y = enrich.y + i * (enrich.card + enrich.gap);
          const from = wide ? `M${queue.x + queue.w} ${queue.y + 25}` : `M${queue.x + queue.w / 2} ${queue.y + queue.row - 8}`;
          const to = wide ? `${enrich.x} ${y + enrich.card / 2}` : `${enrich.x + 30} ${y}`;
          const mid = wide ? `C${queue.x + queue.w + 24} ${queue.y + 25} ${enrich.x - 24} ${y + enrich.card / 2}` : `C${queue.x + queue.w / 2} ${y - 40} ${enrich.x + 30} ${y - 30}`;
          return (
            <g key={label}>
              {wide || i === 0 ? (
                <path ref={(el) => (wireRefs.current[i] = el)} d={`${from}${mid} ${to}`} pathLength="1" fill="none" stroke={PINK} strokeWidth="1.5" strokeDasharray="1" style={{ strokeDashoffset: 1 }} />
              ) : null}
              <g ref={(el) => (cardRefs.current[i] = el)} style={{ opacity: 0 }}>
                <rect x={enrich.x} y={y} width={enrich.w} height={enrich.card} fill="rgba(246,238,247,0.06)" stroke="rgba(246,238,247,0.22)" />
                <circle cx={enrich.x + 22} cy={y + 26} r="9" fill={PINK} />
                <path d={`M${enrich.x + 17} ${y + 26}l3.5 3.5 6-6.5`} stroke="#170d1a" strokeWidth="2" fill="none" strokeLinecap="round" />
                <text x={enrich.x + 42} y={y + 31} className={s.monoText} fontSize="12" fill="rgba(246,238,247,.65)">
                  {label}
                </text>
                <text x={enrich.x + 20} y={y + (wide ? 70 : 64)} fontSize={wide ? 17 : 16} fontWeight="500" fill={FG}>
                  {value}
                </text>
              </g>
            </g>
          );
        })}

        {/* verdict: MITRE technique and severity */}
        <g ref={verdictRef} style={{ opacity: 0 }}>
          <rect x={verdict.x} y={verdict.y} width={verdict.w} height={verdict.h} fill="rgba(255,61,129,0.08)" stroke={PINK} />
          <text x={verdict.x + 20} y={verdict.y + 34} className={s.monoText} fontSize="12" fill="rgba(246,238,247,.65)">
            MITRE ATT&amp;CK
          </text>
          <rect x={verdict.x + 20} y={verdict.y + 48} width={verdict.w - 40} height="44" fill={PINK} />
          <text x={verdict.x + 36} y={verdict.y + 77} fontSize="18" fontWeight="700" fill="#170d1a">
            {content.mitre}
          </text>
          <text x={verdict.x + 20} y={verdict.y + (wide ? 140 : 120)} className={s.monoText} fontSize="12" fill="rgba(246,238,247,.65)">
            {content.severityLabel}
          </text>
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              ref={(el) => (segRefs.current[i] = el)}
              x={wide ? verdict.x + 20 + i * 56 : verdict.x + 180 + i * 56}
              y={verdict.y + (wide ? 154 : 104)}
              width="48"
              height="26"
              fill={PINK}
              style={{ opacity: 0.12 }}
            />
          ))}
          <text x={verdict.x + 20} y={verdict.y + (wide ? 230 : 142)} fontSize={wide ? 34 : 22} fontWeight="700" fill={PINK}>
            {content.severity}
          </text>
        </g>

        {/* the incident report and the analyst's decision */}
        <g ref={reportRef} style={{ opacity: 0 }}>
          <rect x={report.x} y={report.y} width={report.w} height={report.h} fill={FG} />
          <foreignObject x={report.x} y={report.y} width={report.w} height={report.h - 62}>
            <div className={s.fo} style={{ color: "#170d1a" }}>
              <span className={s.foLabel}>{content.reportLabel}</span>
              <span ref={reportTextRef} className={s.reportText} />
            </div>
          </foreignObject>
          <g ref={btnRef} className={s.approveBtn} style={{ opacity: 0 }}>
            <rect x={report.x + 18} y={report.y + report.h - 56} width={wide ? 300 : report.w - 36} height="40" />
            <text ref={btnTextRef} x={report.x + 34} y={report.y + report.h - 30} className={s.monoText} fontSize="12.5">
              {content.approve}
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
