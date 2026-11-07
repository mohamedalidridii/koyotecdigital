"use client";

// Self-healing CI — a pipeline goes red; 10,000 log lines scroll by until the agent frames the two
// that matter, recognises a transient network error and retries the job to green. A second run
// fails on a real bug: the suggested fix goes to the developer in Slack.
import s from "./AiVisual.module.css";

import { useMemo, useRef } from "react";

import { band, follow, rng, typed, useTick, useWide } from "@/components/Systems/lib";

const ORANGE = "#ff7a1a";
const GREEN = "#3ddc84";
const RED = "#ff5a5f";
const FG = "#f2f0ea";
const NOISE = 14;

function layoutFor(wide) {
  if (wide) {
    return {
      W: 1200, H: 720, wide,
      a: { x: 40, y: 30, w: 560 },
      logs: { x: 40, y: 150, w: 560, h: 380 },
      verdict: { x: 40, y: 548 },
      b: { x: 640, y: 30, w: 520 },
      bugLog: { x: 640, y: 150, w: 520, h: 130 },
      slack: { x: 640, y: 330, w: 520, h: 250 },
    };
  }
  return {
    W: 600, H: 1220, wide,
    a: { x: 20, y: 20, w: 560 },
    logs: { x: 20, y: 140, w: 560, h: 330 },
    verdict: { x: 20, y: 488 },
    b: { x: 20, y: 640, w: 560 },
    bugLog: { x: 20, y: 760, w: 560, h: 130 },
    slack: { x: 20, y: 910, w: 560, h: 280 },
  };
}

export default function SelfHealingCi({ progress, content, reduced, near }) {
  const hostRef = useRef(null);
  const wide = useWide(hostRef, 0.95);
  const L = useMemo(() => layoutFor(wide), [wide]);
  const stageRefs = useRef([]);
  const scrollRef = useRef(null);
  const hitRef = useRef(null);
  const countRef = useRef(null);
  const seenRef = useRef(null);
  const verdictRef = useRef(null);
  const greenRef = useRef(null);
  const bRef = useRef(null);
  const bugRef = useRef(null);
  const slackRef = useRef(null);
  const fixRef = useRef(null);
  const noise = useMemo(() => {
    const R = rng(8);
    return Array.from({ length: NOISE * 3 }, () => 0.25 + R() * 0.7);
  }, []);
  const fr = content.logs.includes("lignes");

  useTick(
    near,
    (time) => {
      const p = follow(progress, reduced);
      // stages: install ✓, build ✓, test ✗ → retried ✓, deploy ✓
      const state = (i) => {
        if (p < 0.04 + i * 0.03) return "idle";
        if (i < 2) return "ok";
        if (i === 2) return p < 0.52 ? "fail" : p < 0.56 ? "run" : "ok";
        return p < 0.58 ? "idle" : "ok";
      };
      stageRefs.current.forEach((g, i) => g?.setAttribute("data-state", state(i)));
      // the log scrolls while the agent reads, then stops on the culprit
      const reading = p > 0.12 && p < 0.3 && !reduced;
      scrollRef.current.setAttribute("transform", `translate(0 ${reading ? -((time * 260) % (NOISE * 22)) : 0})`);
      scrollRef.current.style.opacity = String(band(p, 0.1, 0.13) * (1 - band(p, 0.3, 0.34) * 0.75));
      countRef.current.textContent = `${Math.round(10000 * band(p, 0.12, 0.3)).toLocaleString(fr ? "fr-FR" : "en-US")} / ${content.logs}`;
      hitRef.current.style.opacity = String(band(p, 0.31, 0.35));
      seenRef.current.style.opacity = String(band(p, 0.4, 0.44));
      verdictRef.current.style.opacity = String(band(p, 0.44, 0.48));
      greenRef.current.style.opacity = String(band(p, 0.58, 0.62));
      bRef.current.style.opacity = String(band(p, 0.64, 0.68));
      bugRef.current.style.opacity = String(band(p, 0.68, 0.72));
      slackRef.current.style.opacity = String(band(p, 0.76, 0.8));
      slackRef.current.setAttribute("transform", `translate(0 ${(1 - band(p, 0.76, 0.82)) * 14})`);
      fixRef.current.textContent = typed(content.fix, band(p, 0.82, 0.94));
    },
    [L, content, reduced],
  );

  const { W, H, a, logs, verdict, b, bugLog, slack } = L;
  const stages = (box, ref) => {
    const stageW = (box.w - 3 * 10) / 4;
    return content.stages.map((st, i) => (
      <g key={st} ref={ref ? (el) => (ref.current[i] = el) : undefined} className={s.ciStage} data-state={ref ? "idle" : i === 2 ? "fail" : "ok"}>
        <rect x={box.x + i * (stageW + 10)} y={box.y + 50} width={stageW} height="44" rx="6" />
        <text x={box.x + i * (stageW + 10) + 14} y={box.y + 77} className={s.codeText} fontSize="13">
          {st}
        </text>
        {["ciOk", "ciFail", "ciRun"].map((k, n) => (
          <text key={k} className={s[k]} x={box.x + i * (stageW + 10) + stageW - 14} y={box.y + 78} textAnchor="end" fontSize="15" fontWeight="700">
            {["✓", "✗", "●"][n]}
          </text>
        ))}
      </g>
    ));
  };
  const pillW = content.verdict.length * 7.4 + 32;
  return (
    <div ref={hostRef} className={`${s.host} ${s.ci}`}>
      <svg className={s.svg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <clipPath id="ci-logs">
            <rect x={logs.x} y={logs.y} width={logs.w} height={logs.h} />
          </clipPath>
        </defs>

        {/* run A: the transient failure */}
        <text x={a.x} y={a.y + 26} className={s.codeText} fontSize="15" fill={FG}>
          {content.run}
        </text>
        {stages(a, stageRefs)}
        <rect x={logs.x} y={logs.y} width={logs.w} height={logs.h} fill="#000" stroke="rgba(242,240,234,.15)" />
        <g clipPath="url(#ci-logs)">
          <g ref={scrollRef} style={{ opacity: 0 }}>
            {noise.map((w, i) => (
              <rect key={i} x={logs.x + 16} y={logs.y + 16 + i * 22} width={(logs.w - 32) * w} height="8" fill="rgba(242,240,234,.18)" />
            ))}
          </g>
        </g>
        <text ref={countRef} x={logs.x + logs.w - 14} y={logs.y + logs.h - 12} textAnchor="end" className={s.monoText} fontSize="11" fill="rgba(242,240,234,.5)" />
        <g ref={hitRef} style={{ opacity: 0 }}>
          <rect x={logs.x + 10} y={logs.y + logs.h / 2 - 40} width={logs.w - 20} height="64" fill="rgba(255,122,26,.12)" stroke={ORANGE} strokeWidth="1.5" />
          {content.hit.map((l, i) => (
            <text key={i} x={logs.x + 22} y={logs.y + logs.h / 2 - 14 + i * 24} className={s.codeText} fontSize={wide ? 13 : 12} fill={i ? "rgba(242,240,234,.7)" : ORANGE} xmlSpace="preserve">
              {l}
            </text>
          ))}
        </g>
        <g ref={seenRef} style={{ opacity: 0 }}>
          <rect x={verdict.x} y={verdict.y} width="190" height="34" rx="17" fill="rgba(242,240,234,.08)" stroke="rgba(242,240,234,.25)" />
          <text x={verdict.x + 95} y={verdict.y + 22} textAnchor="middle" fontSize="13" fill={FG}>
            ↺ {content.seen}
          </text>
        </g>
        <g ref={verdictRef} style={{ opacity: 0 }}>
          <rect x={verdict.x + 202} y={verdict.y} width={pillW} height="34" rx="17" fill={ORANGE} />
          <text x={verdict.x + 202 + pillW / 2} y={verdict.y + 22} textAnchor="middle" fontSize="13" fontWeight="600" fill="#111">
            {content.verdict}
          </text>
        </g>
        <g ref={greenRef} style={{ opacity: 0 }}>
          <rect x={verdict.x} y={verdict.y + 48} width={a.w} height="40" rx="6" fill="rgba(61,220,132,.14)" stroke={GREEN} />
          <text x={verdict.x + 16} y={verdict.y + 74} fontSize="15" fontWeight="600" fill={GREEN}>
            ↻ {content.retry} · ✓ {content.passed}
          </text>
        </g>

        {/* run B: a real bug, routed to the developer */}
        <g ref={bRef} style={{ opacity: 0 }}>
          <text x={b.x} y={b.y + 26} className={s.codeText} fontSize="15" fill={FG}>
            {content.bugRun}
          </text>
          {stages(b)}
        </g>
        <g ref={bugRef} style={{ opacity: 0 }}>
          <rect x={bugLog.x} y={bugLog.y} width={bugLog.w} height={bugLog.h} fill="#000" stroke={RED} />
          {content.bug.map((l, i) => (
            <text key={i} x={bugLog.x + 16} y={bugLog.y + 40 + i * 26} className={s.codeText} fontSize={wide ? 12.5 : 11.5} fill={i ? "rgba(242,240,234,.7)" : RED} xmlSpace="preserve">
              {l}
            </text>
          ))}
          <rect x={bugLog.x + 16} y={bugLog.y + bugLog.h - 40} width="170" height="28" rx="14" fill={RED} />
          <text x={bugLog.x + 101} y={bugLog.y + bugLog.h - 21} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#111">
            {content.bugVerdict}
          </text>
        </g>
        <g ref={slackRef} style={{ opacity: 0 }}>
          <rect x={slack.x} y={slack.y} width={slack.w} height={slack.h} rx="6" fill="#f8f8fa" />
          <rect x={slack.x + 18} y={slack.y + 18} width="36" height="36" rx="8" fill={ORANGE} />
          <text x={slack.x + 36} y={slack.y + 42} textAnchor="middle" fontSize="16" fontWeight="700" fill="#111">
            K
          </text>
          <text x={slack.x + 66} y={slack.y + 34} fontSize="14" fontWeight="700" fill="#1d1c1d">
            CI Doctor
          </text>
          <text x={slack.x + 66} y={slack.y + 52} className={s.monoText} fontSize="10.5" fill="#616061">
            {content.slackTo}
          </text>
          <foreignObject x={slack.x + 66} y={slack.y + 62} width={slack.w - 86} height="60">
            <div className={s.slackText}>{content.suggestion}</div>
          </foreignObject>
          <rect x={slack.x + 66} y={slack.y + 128} width={slack.w - 86} height="44" rx="4" fill="#1d1c1d" />
          <text ref={fixRef} x={slack.x + 80} y={slack.y + 155} className={s.codeText} fontSize={wide ? 13 : 12} fill={GREEN} />
          <text x={slack.x + 66} y={slack.y + 200} fontSize="12.5" fill="#616061">
            src/invoice.ts:88
          </text>
        </g>
      </svg>
    </div>
  );
}
