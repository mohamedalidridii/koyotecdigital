"use client";

// Multi-agent onboarding — an HR message is typed, the orchestrator pulls out the facts, then
// dispatches four agents whose tasks tick off lane by lane; one sensitive step waits for a human.
import s from "./AiVisual.module.css";

import { useMemo, useRef } from "react";

import { band, follow, typed, useTick, useWide } from "@/components/Systems/lib";

const TASK_AT = [0.47, 0.5, 0.53, 0.56, 0.62, 0.84, 0.88];
const APPROVE_AT = 0.76;
const GREEN = "#12a150";
const AMBER = "#e8a317";

function layoutFor(wide) {
  if (wide) {
    const lanes = [0, 1, 2, 3].map((i) => ({ x: 640, y: 70 + i * 150, w: 140, h: 56 }));
    return {
      W: 1200, H: 700,
      msg: { x: 30, y: 40, w: 360, h: 150 },
      chips: [0, 1, 2, 3].map((i) => ({ x: 30, y: 212 + i * 46, w: 360, h: 38 })),
      orch: { cx: 515, cy: 330, r: 58 },
      lanes,
      card: (lane, slot) => ({ x: 805 + slot * 196, y: lanes[lane].y, w: 184, h: 56 }),
      wire: (l) => `M573 330C610 330 600 ${l.y + l.h / 2} ${l.x} ${l.y + l.h / 2}`,
      ready: { x: 30, y: 610, w: 360, h: 56 },
    };
  }
  // compact enough to stay legible in the short sticky frame of a phone
  const lanes = [0, 1, 2, 3].map((i) => ({ x: 20, y: 400 + i * 100, w: 130, h: 52 }));
  return {
    W: 600, H: 860,
    msg: { x: 20, y: 20, w: 560, h: 110 },
    chips: [0, 1, 2, 3].map((i) => ({ x: 20 + (i % 2) * 284, y: 145 + Math.floor(i / 2) * 46, w: 276, h: 38 })),
    orch: { cx: 300, cy: 300, r: 40 },
    lanes,
    card: (lane, slot) => ({ x: 162 + slot * 212, y: lanes[lane].y, w: 204, h: 52 }),
    wire: (l) => `M300 340C300 ${l.y - 20} 300 ${l.y + l.h / 2} ${l.x + l.w} ${l.y + l.h / 2}`,
    ready: { x: 20, y: 800, w: 560, h: 50 },
  };
}

export default function AgentsFlow({ progress, content, reduced, near }) {
  const hostRef = useRef(null);
  const wide = useWide(hostRef, 0.95);
  const L = useMemo(() => layoutFor(wide), [wide]);
  const msgRef = useRef(null);
  const chipRefs = useRef([]);
  const orchRef = useRef(null);
  const wireRefs = useRef([]);
  const laneRefs = useRef([]);
  const cardRefs = useRef([]);
  const readyRef = useRef(null);

  // place each task in its agent's lane, in order
  const placed = useMemo(() => {
    const used = [0, 0, 0, 0];
    return content.tasks.map(([lane, text], i) => ({ lane, text, i, slot: used[lane]++ }));
  }, [content.tasks]);

  useTick(
    near,
    (time) => {
      const p = follow(progress, reduced);
      msgRef.current.textContent = typed(content.request, band(p, 0.02, 0.16));
      chipRefs.current.forEach((el, i) => el && (el.style.opacity = String(band(p, 0.22 + i * 0.03, 0.27 + i * 0.03))));
      const on = band(p, 0.3, 0.35);
      orchRef.current.style.opacity = String(0.25 + on * 0.75);
      orchRef.current.toggleAttribute("data-on", on > 0.5 && p < 0.92);
      wireRefs.current.forEach((w, i) => {
        if (!w) return;
        const d = band(p, 0.38 + i * 0.02, 0.46 + i * 0.02);
        w.style.strokeDashoffset = String(1 - d);
        laneRefs.current[i].style.opacity = String(d);
      });
      // a flow of dashes along the wires while the agents are working
      const working = p > 0.46 && p < 0.92 && !reduced;
      wireRefs.current.forEach((w) => w?.nextSibling?.style.setProperty("stroke-dashoffset", working ? String(-time * 0.25) : "0"));
      wireRefs.current.forEach((w) => w?.nextSibling && (w.nextSibling.style.opacity = working ? "1" : "0"));

      cardRefs.current.forEach((g, i) => {
        if (!g) return;
        const show = band(p, TASK_AT[i], TASK_AT[i] + 0.03);
        g.style.opacity = String(show);
        g.setAttribute("transform", `translate(${(1 - show) * 16} 0)`);
        if (i === content.approvalAt) g.toggleAttribute("data-pending", p < APPROVE_AT);
      });
      const r = band(p, 0.92, 0.96);
      readyRef.current.style.opacity = String(r);
      readyRef.current.setAttribute("transform", `translate(0 ${(1 - r) * 12})`);
    },
    [L, content, reduced],
  );

  const { W, H, msg, orch, ready } = L;
  return (
    <div ref={hostRef} className={`${s.host} ${s.agents}`}>
      <svg className={s.svg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <pattern id="agrid" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(13,13,13,0.13)" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#agrid)" />

        {/* the HR message */}
        <rect x={msg.x} y={msg.y} width={msg.w} height={msg.h} fill="#fff" stroke="#0d0d0d" strokeWidth="1.5" />
        <foreignObject x={msg.x} y={msg.y} width={msg.w} height={msg.h}>
          <div className={s.fo}>
            <span className={s.foLabel}>{content.from}</span>
            <span ref={msgRef} className={s.foText} />
          </div>
        </foreignObject>

        {/* what the orchestrator understood */}
        {L.chips.map((c, i) => (
          <g key={i} ref={(el) => (chipRefs.current[i] = el)} style={{ opacity: 0 }}>
            <rect x={c.x} y={c.y} width={c.w} height={c.h} fill="rgba(18,161,80,0.1)" stroke={GREEN} strokeWidth="1.2" />
            <text x={c.x + 12} y={c.y + c.h / 2 + 5} className={s.monoText} fontSize="13" fill="rgba(13,13,13,.6)">
              {content.extracted[i][0]}
            </text>
            <text x={c.x + c.w - 12} y={c.y + c.h / 2 + 6} textAnchor="end" fontSize="16" fontWeight="500" fill="#0d0d0d">
              {content.extracted[i][1]}
            </text>
          </g>
        ))}

        {/* wires to the four agents */}
        {L.lanes.map((l, i) => (
          <g key={i}>
            <path ref={(el) => (wireRefs.current[i] = el)} d={L.wire(l)} pathLength="1" fill="none" stroke="#0d0d0d" strokeWidth="1.6" strokeDasharray="1" style={{ strokeDashoffset: 1 }} />
            <path d={L.wire(l)} fill="none" stroke={GREEN} strokeWidth="2.4" strokeDasharray="6 22" style={{ opacity: 0 }} />
          </g>
        ))}

        {/* the orchestrator */}
        <g ref={orchRef} className={s.orch} style={{ opacity: 0.25 }}>
          <circle className={s.orchPulse} cx={orch.cx} cy={orch.cy} r={orch.r} fill="none" stroke={GREEN} strokeWidth="2" />
          <circle cx={orch.cx} cy={orch.cy} r={orch.r} fill="#0d0d0d" />
          <path
            d={`M${orch.cx - 16} ${orch.cy - 8}h32M${orch.cx - 16} ${orch.cy}h32M${orch.cx - 16} ${orch.cy + 8}h20`}
            stroke="#f3f1ec"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <text x={orch.cx} y={orch.cy + orch.r + 26} textAnchor="middle" className={s.monoText} fontSize="14" fill="#0d0d0d">
            {content.orchestrator}
          </text>
        </g>

        {/* agent lanes */}
        {L.lanes.map((l, i) => (
          <g key={i} ref={(el) => (laneRefs.current[i] = el)} style={{ opacity: 0 }}>
            <rect x={l.x} y={l.y} width={l.w} height={l.h} fill="#0d0d0d" />
            <circle cx={l.x + 14} cy={l.y + l.h / 2} r="5" fill={GREEN} />
            <text x={l.x + 26} y={l.y + l.h / 2 + 4} className={s.monoText} fontSize="12" fill="#f3f1ec">
              {content.agents[i]}
            </text>
          </g>
        ))}

        {/* tasks */}
        {placed.map(({ lane, text, i, slot }) => {
          const c = L.card(lane, slot);
          const isApproval = i === content.approvalAt;
          return (
            <g key={i} ref={(el) => (cardRefs.current[i] = el)} className={s.task} style={{ opacity: 0 }}>
              <rect className={s.taskBox} x={c.x} y={c.y} width={c.w} height={c.h} />
              <g className={s.taskOk}>
                <circle cx={c.x + 18} cy={c.y + 18} r="9" fill={GREEN} />
                <path d={`M${c.x + 13} ${c.y + 18}l3.5 3.5 6-6.5`} stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>
              <g className={s.taskWait}>
                <circle cx={c.x + 18} cy={c.y + 18} r="9" fill={AMBER} />
                <path d={`M${c.x + 18} ${c.y + 13}v5.5l3.5 2`} stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>
              <foreignObject x={c.x + 32} y={c.y + 4} width={c.w - 38} height={c.h - 8}>
                <div className={s.taskText}>
                  <span>{text}</span>
                  {isApproval ? (
                    <>
                      <em className={s.taskPending}>{content.approval}</em>
                      <em className={s.taskApproved}>{content.approved}</em>
                    </>
                  ) : null}
                </div>
              </foreignObject>
            </g>
          );
        })}

        {/* ready */}
        <g ref={readyRef} style={{ opacity: 0 }}>
          <rect x={ready.x} y={ready.y} width={ready.w} height={ready.h} fill={GREEN} />
          <path d={`M${ready.x + 22} ${ready.y + 28}l7 7 13-14`} stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
          <text x={ready.x + 56} y={ready.y + 35} fontSize="19" fontWeight="500" fill="#fff">
            {content.ready}
          </text>
        </g>
      </svg>
    </div>
  );
}
