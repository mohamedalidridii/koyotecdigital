"use client";

// Maintenance AI assistant — manuals and SOPs get indexed, the CMMS history syncs in, a technician
// scans the press and asks by voice; the matching manual page and the past work order on this exact
// asset light up, a cited troubleshooting guide is written, then the work order is drafted and created.
import s from "./AiVisual.module.css";

import { useMemo, useRef } from "react";

import { band, follow, typed, useTick, useWide } from "@/components/Systems/lib";

const ACCENT = "#ff7a1a";
const FG = "#eef0ec";
const BG = "#121417";
const GREEN = "#12a150";

function layoutFor(wide) {
  if (wide) {
    return {
      W: 1200, H: 720, wide,
      docs: { x: 40, y: 70, w: 340, row: 50, gap: 8 },
      hist: { x: 40, y: 340, w: 340, row: 64, gap: 8 },
      chip: { x: 430, y: 70, w: 330, h: 40 },
      ask: { x: 430, y: 124, w: 330, h: 96 },
      answer: { x: 430, y: 240, w: 330, h: 330 },
      wo: { x: 800, y: 70, w: 360, h: 290 },
      metric: { x: 800, y: 420 },
    };
  }
  return {
    W: 600, H: 1150, wide,
    docs: { x: 20, y: 52, w: 560, row: 44, gap: 6 },
    hist: { x: 20, y: 296, w: 560, row: 56, gap: 6 },
    chip: { x: 20, y: 500, w: 560, h: 36 },
    ask: { x: 20, y: 546, w: 560, h: 78 },
    answer: { x: 20, y: 640, w: 560, h: 290 },
    wo: { x: 20, y: 946, w: 560, h: 190 },
    metric: null,
  };
}

export default function MaintenanceAssistant({ progress, content, reduced, near }) {
  const hostRef = useRef(null);
  const wide = useWide(hostRef, 0.95);
  const L = useMemo(() => layoutFor(wide), [wide]);
  const docRefs = useRef([]);
  const tickRefs = useRef([]);
  const histRefs = useRef([]);
  const chipRef = useRef(null);
  const askRef = useRef(null);
  const askTextRef = useRef(null);
  const wireRefs = useRef([]);
  const answerRef = useRef(null);
  const answerTextRef = useRef(null);
  const citeRefs = useRef([]);
  const woRef = useRef(null);
  const fieldRefs = useRef([]);
  const btnRef = useRef(null);
  const btnTextRef = useRef(null);
  const metricRef = useRef(null);
  const metricValRef = useRef(null);

  useTick(
    near,
    () => {
      const p = follow(progress, reduced);
      // 1. manuals appear, then each gets its "indexed" tick
      docRefs.current.forEach((r, i) => {
        if (!r) return;
        r.style.opacity = String(band(p, 0.02 + i * 0.025, 0.07 + i * 0.025) * (i === 0 ? 1 : 1 - band(p, 0.5, 0.55) * 0.5));
        r.toggleAttribute("data-picked", i === 0 && p > 0.52);
      });
      tickRefs.current.forEach((t, i) => t && (t.style.opacity = String(band(p, 0.12 + i * 0.02, 0.15 + i * 0.02))));
      // 2. CMMS history syncs in
      histRefs.current.forEach((r, i) => {
        if (!r) return;
        r.style.opacity = String(band(p, 0.21 + i * 0.03, 0.26 + i * 0.03) * (i === 0 ? 1 : 1 - band(p, 0.5, 0.55) * 0.5));
        r.toggleAttribute("data-picked", i === 0 && p > 0.54);
      });
      // 3. the technician scans the machine and asks
      chipRef.current.style.opacity = String(band(p, 0.38, 0.41));
      askRef.current.style.opacity = String(band(p, 0.41, 0.43));
      askTextRef.current.textContent = typed(content.question, band(p, 0.42, 0.5));
      // 4. both sources are matched on the exact asset
      wireRefs.current.forEach((w, i) => w && (w.style.strokeDashoffset = String(1 - band(p, 0.52 + i * 0.02, 0.58 + i * 0.02))));
      // 5. the cited guide is written
      answerRef.current.style.opacity = String(band(p, 0.6, 0.63));
      answerTextRef.current.textContent = typed(content.answer, band(p, 0.62, 0.76));
      citeRefs.current.forEach((c, i) => c && (c.style.opacity = String(band(p, 0.76 + i * 0.02, 0.79 + i * 0.02))));
      // 6. the work order is drafted, then created
      woRef.current.style.opacity = String(band(p, 0.8, 0.83));
      fieldRefs.current.forEach((f, i) => f && (f.style.opacity = String(band(p, 0.82 + i * 0.02, 0.85 + i * 0.02))));
      const done = p >= 0.92;
      btnRef.current.style.opacity = String(band(p, 0.87, 0.9));
      btnRef.current.toggleAttribute("data-done", done);
      btnTextRef.current.textContent = done ? `✓ ${content.created}` : content.create;
      if (metricRef.current) {
        const k = band(p, 0.92, 0.98);
        metricRef.current.style.opacity = String(k);
        metricValRef.current.textContent = `−${Math.round(38 * k)}%`;
      }
    },
    [L, content, reduced],
  );

  const { W, H, docs, hist, chip, ask, answer, wo, metric } = L;
  const docY = (i) => docs.y + i * (docs.row + docs.gap);
  const histY = (i) => hist.y + i * (hist.row + hist.gap);
  const wires = wide
    ? [
        `M${docs.x + docs.w} ${docY(0) + docs.row / 2} C${docs.x + docs.w + 30} ${docY(0) + docs.row / 2} ${answer.x - 30} ${answer.y + 60} ${answer.x} ${answer.y + 60}`,
        `M${hist.x + hist.w} ${histY(0) + hist.row / 2} C${hist.x + hist.w + 30} ${histY(0) + hist.row / 2} ${answer.x - 30} ${answer.y + 140} ${answer.x} ${answer.y + 140}`,
      ]
    : [];

  return (
    <div ref={hostRef} className={`${s.host} ${s.maint}`}>
      <svg className={s.svg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        {/* manuals, SOPs, drawings, warranties */}
        <text x={docs.x} y={docs.y - 14} className={s.monoText} fontSize="12" fill="rgba(238,240,236,.6)">
          {content.docsLabel}
        </text>
        {content.docs.map((name, i) => {
          const y = docY(i);
          return (
            <g key={name} ref={(el) => (docRefs.current[i] = el)} className={s.mRow} style={{ opacity: 0 }}>
              <rect className={s.mBox} x={docs.x} y={y} width={docs.w} height={docs.row} />
              <path d={`M${docs.x + 14} ${y + 12}h12l5 5v17h-17z`} fill="none" stroke={ACCENT} strokeWidth="1.5" />
              <foreignObject x={docs.x + 42} y={y + 4} width={docs.w - 130} height={docs.row - 8}>
                <div className={s.mText}>{name}</div>
              </foreignObject>
              <g ref={(el) => (tickRefs.current[i] = el)} style={{ opacity: 0 }}>
                <text x={docs.x + docs.w - 14} y={y + docs.row / 2 + 4} textAnchor="end" className={s.monoText} fontSize="10.5" fill={ACCENT}>
                  ✓ {content.indexed}
                </text>
              </g>
            </g>
          );
        })}

        {/* CMMS history: past work orders */}
        <text x={hist.x} y={hist.y - 14} className={s.monoText} fontSize="12" fill="rgba(238,240,236,.6)">
          {content.historyLabel}
        </text>
        {content.orders.map(([id, asset, text], i) => {
          const y = histY(i);
          return (
            <g key={id} ref={(el) => (histRefs.current[i] = el)} className={s.mRow} style={{ opacity: 0 }}>
              <rect className={s.mBox} x={hist.x} y={y} width={hist.w} height={hist.row} />
              <rect x={hist.x} y={y} width="5" height={hist.row} fill={i === 0 ? ACCENT : "rgba(238,240,236,.3)"} />
              <text x={hist.x + 18} y={y + 22} className={s.monoText} fontSize="11" fill={ACCENT}>
                {id} · {asset}
              </text>
              <foreignObject x={hist.x + 18} y={y + 28} width={hist.w - 30} height={hist.row - 32}>
                <div className={s.mText}>{text}</div>
              </foreignObject>
            </g>
          );
        })}

        {/* wires: both sources matched on the exact asset */}
        {wires.map((d, i) => (
          <path key={i} ref={(el) => (wireRefs.current[i] = el)} d={d} pathLength="1" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeDasharray="1" style={{ strokeDashoffset: 1 }} />
        ))}

        {/* the machine, scanned, and the spoken question */}
        <g ref={chipRef} style={{ opacity: 0 }}>
          <rect x={chip.x} y={chip.y} width={chip.w} height={chip.h} fill="rgba(255,122,26,0.12)" stroke={ACCENT} />
          {/* QR mark */}
          <path d={`M${chip.x + 12} ${chip.y + 10}h8v8h-8z M${chip.x + 24} ${chip.y + 10}h4v4h-4z M${chip.x + 12} ${chip.y + 22}h4v4h-4z M${chip.x + 20} ${chip.y + 22}h8v8h-8z`} fill={ACCENT} />
          <text x={chip.x + 40} y={chip.y + chip.h / 2 + 5} className={s.monoText} fontSize="12" fill={FG}>
            {content.asset}
          </text>
        </g>
        <g ref={askRef} style={{ opacity: 0 }}>
          <rect x={ask.x} y={ask.y} width={ask.w} height={ask.h} fill="rgba(238,240,236,0.06)" stroke="rgba(238,240,236,0.22)" />
          <circle cx={ask.x + 24} cy={ask.y + 26} r="12" fill={ACCENT} />
          <path d={`M${ask.x + 24} ${ask.y + 19}v8 M${ask.x + 19} ${ask.y + 26}a5 5 0 0 0 10 0 M${ask.x + 24} ${ask.y + 31}v3`} stroke={BG} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <text x={ask.x + 46} y={ask.y + 31} className={s.monoText} fontSize="11" fill="rgba(238,240,236,.6)">
            {content.you}
          </text>
          <foreignObject x={ask.x + 14} y={ask.y + 40} width={ask.w - 28} height={ask.h - 44}>
            <div className={s.mAsk}>
              <span ref={askTextRef} />
            </div>
          </foreignObject>
        </g>

        {/* the grounded troubleshooting guide */}
        <g ref={answerRef} style={{ opacity: 0 }}>
          <rect x={answer.x} y={answer.y} width={answer.w} height={answer.h} fill={FG} />
          <foreignObject x={answer.x} y={answer.y} width={answer.w} height={answer.h - 50}>
            <div className={s.fo} style={{ color: BG }}>
              <span className={s.foLabel}>
                {content.assistant} · {content.answerLabel}
              </span>
              <span ref={answerTextRef} className={s.mAnswer} />
            </div>
          </foreignObject>
          {content.sources.map((src, i) => (
            <g key={src} ref={(el) => (citeRefs.current[i] = el)} style={{ opacity: 0 }}>
              <rect x={answer.x + 16 + i * ((answer.w - 40) / 2 + 8)} y={answer.y + answer.h - 42} width={(answer.w - 40) / 2} height="28" fill={ACCENT} />
              <text x={answer.x + 26 + i * ((answer.w - 40) / 2 + 8)} y={answer.y + answer.h - 24} className={s.monoText} fontSize="10" fill={BG}>
                {src}
              </text>
            </g>
          ))}
        </g>

        {/* the work order, drafted then created */}
        <g ref={woRef} style={{ opacity: 0 }}>
          <rect x={wo.x} y={wo.y} width={wo.w} height={wo.h} fill="rgba(238,240,236,0.06)" stroke="rgba(238,240,236,0.22)" />
          <text x={wo.x + 20} y={wo.y + 30} className={s.monoText} fontSize="12" fill="rgba(238,240,236,.65)">
            {content.woLabel}
          </text>
          {content.woFields.map(([k, v], i) => {
            const rowH = wide ? 54 : 34;
            const y = wo.y + (wide ? 52 : 44) + i * rowH;
            return (
              <g key={k} ref={(el) => (fieldRefs.current[i] = el)} style={{ opacity: 0 }}>
                <line x1={wo.x + 20} x2={wo.x + wo.w - 20} y1={y + rowH - 6} y2={y + rowH - 6} stroke="rgba(238,240,236,0.14)" />
                <text x={wo.x + 20} y={y + (wide ? 20 : 18)} className={s.monoText} fontSize="10.5" fill="rgba(238,240,236,.55)">
                  {k}
                </text>
                <text x={wide ? wo.x + 20 : wo.x + 170} y={y + (wide ? 42 : 18)} fontSize={wide ? 17 : 15} fontWeight="500" fill={FG}>
                  {v}
                </text>
              </g>
            );
          })}
          <g ref={btnRef} className={s.mBtn} style={{ opacity: 0 }}>
            <rect x={wo.x + 20} y={wo.y + wo.h - 56} width={wo.w - 40} height="40" />
            <text ref={btnTextRef} x={wo.x + 36} y={wo.y + wo.h - 30} className={s.monoText} fontSize="12.5">
              {content.create}
            </text>
          </g>
        </g>

        {/* the outcome */}
        {metric ? (
          <g ref={metricRef} style={{ opacity: 0 }}>
            <text x={metric.x} y={metric.y} className={s.monoText} fontSize="12" fill="rgba(238,240,236,.6)">
              MTTR
            </text>
            <text ref={metricValRef} x={metric.x} y={metric.y + 92} fontSize="96" fontWeight="700" fill={ACCENT} letterSpacing="-3">
              −0%
            </text>
          </g>
        ) : null}
      </svg>
    </div>
  );
}
