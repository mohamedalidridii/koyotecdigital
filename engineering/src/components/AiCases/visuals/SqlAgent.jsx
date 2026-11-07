"use client";

// Text-to-SQL — a business question; the agent finds the three useful tables among many, writes
// the query, hits an error, reads it and fixes the line, then returns rows, a chart and one
// sentence.
import s from "./AiVisual.module.css";

import { useMemo, useRef } from "react";

import { band, follow, typed, useTick, useWide } from "@/components/Systems/lib";

const MINT = "#4fe3b5";
const FG = "#e9f6f2";
const RED = "#ff6b6b";

function layoutFor(wide) {
  if (wide) {
    return {
      W: 1200, H: 720, wide,
      q: { x: 40, y: 28, w: 1120, h: 66 },
      schema: { x: 40, y: 120, w: 300, card: 98, gap: 12 },
      sql: { x: 370, y: 120, w: 790, h: 300 },
      table: { x: 370, y: 446, w: 380, h: 250 },
      chart: { x: 780, y: 446, w: 380, h: 170 },
      expl: { x: 780, y: 628, w: 380, h: 68 },
    };
  }
  return {
    W: 600, H: 1110, wide,
    q: { x: 20, y: 20, w: 560, h: 80 },
    schema: { x: 20, y: 120, w: 560, chips: true },
    sql: { x: 20, y: 230, w: 560, h: 290 },
    table: { x: 20, y: 540, w: 560, h: 190 },
    chart: { x: 20, y: 750, w: 560, h: 200 },
    expl: { x: 20, y: 970, w: 560, h: 110 },
  };
}

export default function SqlAgent({ progress, content, reduced, near }) {
  const hostRef = useRef(null);
  const wide = useWide(hostRef, 0.95);
  const L = useMemo(() => layoutFor(wide), [wide]);
  const qRef = useRef(null);
  const tableRefs = useRef([]);
  const sqlRef = useRef(null);
  const lineRefs = useRef([]);
  const errRef = useRef(null);
  const badRef = useRef(null);
  const fixRef = useRef(null);
  const tailRef = useRef(null);
  const fixedRef = useRef(null);
  const resRef = useRef(null);
  const rowRefs = useRef([]);
  const barRefs = useRef([]);
  const explRef = useRef(null);
  const explTextRef = useRef(null);

  const max = Math.max(...content.rows.map((r) => parseFloat(r[2].replace(/[^\d]/g, ""))));
  const values = content.rows.map((r) => parseFloat(r[2].replace(/[^\d]/g, "")) / max);

  useTick(
    near,
    () => {
      const p = follow(progress, reduced);
      qRef.current.textContent = typed(content.question, band(p, 0.02, 0.15));
      tableRefs.current.forEach((t, i) => {
        if (!t) return;
        const on = content.relevant.includes(i);
        t.style.opacity = String(band(p, 0.18, 0.22) * (on ? 1 : 1 - band(p, 0.26, 0.34) * 0.7));
        t.toggleAttribute("data-on", on && p > 0.24 + content.relevant.indexOf(i) * 0.03);
      });
      sqlRef.current.style.opacity = String(band(p, 0.4, 0.43));
      const lines = band(p, 0.42, 0.56) * content.sql1.length;
      lineRefs.current.forEach((l, i) => l && (l.style.opacity = String(Math.min(1, Math.max(0, lines - i)))));
      const err = band(p, 0.6, 0.63) * (1 - band(p, 0.7, 0.73));
      errRef.current.style.opacity = String(err);
      badRef.current.toggleAttribute("data-bad", p > 0.6);
      // the faulty line fades out once the agent has rewritten it (before that, typing drives it)
      if (p > 0.68) badRef.current.style.opacity = String(1 - band(p, 0.68, 0.71));
      fixRef.current.style.opacity = String(band(p, 0.68, 0.72));
      tailRef.current.style.opacity = String(band(p, 0.71, 0.74));
      fixedRef.current.style.opacity = String(band(p, 0.72, 0.75));
      resRef.current.style.opacity = String(band(p, 0.78, 0.81));
      rowRefs.current.forEach((r, i) => r && (r.style.opacity = String(band(p, 0.8 + i * 0.02, 0.83 + i * 0.02))));
      barRefs.current.forEach((b, i) => {
        if (!b) return;
        const w = (L.chart.w - 150) * values[i] * band(p, 0.82 + i * 0.02, 0.88 + i * 0.02);
        b.setAttribute("width", String(w));
      });
      explRef.current.style.opacity = String(band(p, 0.88, 0.91));
      explTextRef.current.textContent = typed(content.explanation, band(p, 0.89, 0.98));
    },
    [L, content, reduced],
  );

  const { W, H, q, schema, sql, table, chart, expl } = L;
  const lh = wide ? 30 : 26;
  const fs = wide ? 16 : 14;
  return (
    <div ref={hostRef} className={`${s.host} ${s.sqlv}`}>
      <svg className={s.svg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        {/* the question */}
        <rect x={q.x} y={q.y} width={q.w} height={q.h} fill="rgba(233,246,242,0.06)" stroke="rgba(233,246,242,0.3)" />
        <foreignObject x={q.x} y={q.y} width={q.w} height={q.h}>
          <div className={`${s.foRow} ${s.foLight}`}>
            <span className={s.foLabel}>?</span>
            <span ref={qRef} className={s.caret} />
          </div>
        </foreignObject>

        {/* the schema: three useful tables among many */}
        {schema.chips ? (
          <g>
            <text x={schema.x} y={schema.y + 4} className={s.monoText} fontSize="12" fill="rgba(233,246,242,.55)">
              {content.schemaLabel}
            </text>
            {content.tables.map(([name], i) => (
              <g key={name} ref={(el) => (tableRefs.current[i] = el)} className={s.sqlTable} style={{ opacity: 0 }}>
                <rect x={schema.x + (i % 3) * 190} y={schema.y + 16 + Math.floor(i / 3) * 44} width="178" height="36" />
                <text x={schema.x + (i % 3) * 190 + 14} y={schema.y + 40 + Math.floor(i / 3) * 44} className={s.codeText} fontSize="15">
                  {name}
                </text>
              </g>
            ))}
          </g>
        ) : (
          <g>
            <text x={schema.x} y={schema.y - 8} className={s.monoText} fontSize="12" fill="rgba(233,246,242,.55)">
              {content.schemaLabel}
            </text>
            {content.tables.map(([name, cols], i) => {
              const y = schema.y + i * (schema.card + schema.gap);
              return (
                <g key={name} ref={(el) => (tableRefs.current[i] = el)} className={s.sqlTable} style={{ opacity: 0 }}>
                  <rect x={schema.x} y={y} width={schema.w} height={schema.card} />
                  <text x={schema.x + 16} y={y + 32} className={s.codeText} fontSize="17" fontWeight="600">
                    {name}
                  </text>
                  <foreignObject x={schema.x + 16} y={y + 42} width={schema.w - 32} height={schema.card - 48}>
                    <div className={s.sqlCols}>{cols}</div>
                  </foreignObject>
                </g>
              );
            })}
          </g>
        )}

        {/* the SQL editor */}
        <g ref={sqlRef} style={{ opacity: 0 }}>
          <rect x={sql.x} y={sql.y} width={sql.w} height={sql.h} fill="#071a1b" stroke="rgba(79,227,181,0.35)" />
          <text x={sql.x + 18} y={sql.y + 28} className={s.monoText} fontSize="12" fill={MINT}>
            SQL · {content.readonly}
          </text>
          {content.sql1.map((l, i) => (
            <text
              key={i}
              ref={(el) => {
                lineRefs.current[i] = el;
                if (i === content.sql1.length - 1) badRef.current = el;
              }}
              x={sql.x + 18}
              y={sql.y + 64 + i * lh}
              className={`${s.codeText} ${i === content.sql1.length - 1 ? s.sqlBad : ""}`}
              fontSize={fs}
              fill={FG}
              style={{ opacity: 0 }}
            >
              <tspan fill="rgba(233,246,242,.35)">{String(i + 1).padStart(2, " ")} </tspan>
              {l.split(/\b(SELECT|FROM|JOIN|ON|WHERE|SUM|EXTRACT|GROUP BY|ORDER BY|DESC|LIMIT)\b/).map((part, k) =>
                k % 2 ? (
                  <tspan key={k} fill={MINT}>
                    {part}
                  </tspan>
                ) : (
                  <tspan key={k}>{part}</tspan>
                ),
              )}
            </text>
          ))}
          <text ref={fixRef} x={sql.x + 18} y={sql.y + 64 + (content.sql1.length - 1) * lh} className={s.codeText} fontSize={fs} fill={MINT} style={{ opacity: 0 }}>
            <tspan fill="rgba(233,246,242,.35)">{String(content.sql1.length).padStart(2, " ")} </tspan>
            {content.fix}
          </text>
          <text ref={tailRef} x={sql.x + 18} y={sql.y + 64 + content.sql1.length * lh} className={s.codeText} fontSize={fs} fill={FG} style={{ opacity: 0 }}>
            <tspan fill="rgba(233,246,242,.35)">{String(content.sql1.length + 1).padStart(2, " ")} </tspan>
            {content.tail[0]}
          </text>
          <g ref={errRef} style={{ opacity: 0 }}>
            <rect x={sql.x} y={sql.y + sql.h - 46} width={sql.w} height="46" fill={RED} />
            <text x={sql.x + 18} y={sql.y + sql.h - 18} className={s.codeText} fontSize={wide ? 15 : 12} fill="#1a0505">
              {content.error}
            </text>
          </g>
          <g ref={fixedRef} style={{ opacity: 0 }}>
            <rect x={sql.x + sql.w - 260} y={sql.y + 12} width="244" height="28" fill={MINT} />
            <text x={sql.x + sql.w - 138} y={sql.y + 31} textAnchor="middle" className={s.monoText} fontSize="11" fill="#071a1b">
              ✓ {content.fixed}
            </text>
          </g>
        </g>

        {/* results */}
        <g ref={resRef} style={{ opacity: 0 }}>
          <rect x={table.x} y={table.y} width={table.w} height={table.h} fill="rgba(233,246,242,0.05)" stroke="rgba(233,246,242,0.2)" />
          {content.rows.map((r, i) => (
            <g key={r[0]} ref={(el) => (rowRefs.current[i] = el)} style={{ opacity: 0 }}>
              <line x1={table.x} x2={table.x + table.w} y1={table.y + 20 + (i + 1) * (table.h / 4)} y2={table.y + 20 + (i + 1) * (table.h / 4)} stroke="rgba(233,246,242,0.12)" />
              <text x={table.x + 16} y={table.y + 6 + (i + 1) * (table.h / 4)} fontSize="16" fontWeight="500" fill={FG}>
                {r[0]}
              </text>
              <text x={table.x + 16} y={table.y + 26 + (i + 1) * (table.h / 4) - 4} className={s.monoText} fontSize="11" fill="rgba(233,246,242,.55)">
                {r[1]}
              </text>
              <text x={table.x + table.w - 16} y={table.y + 6 + (i + 1) * (table.h / 4)} textAnchor="end" className={s.codeText} fontSize="16" fill={MINT}>
                {r[2]} {content.unit}
              </text>
            </g>
          ))}
          {content.rows.map((r, i) => (
            <g key={`b${r[0]}`}>
              <text x={chart.x} y={chart.y + 26 + i * (chart.h / 3)} fontSize="13" fill="rgba(233,246,242,.75)">
                {r[0]}
              </text>
              <rect x={chart.x + 140} y={chart.y + 12 + i * (chart.h / 3)} width={chart.w - 150} height="20" fill="rgba(233,246,242,0.06)" />
              <rect ref={(el) => (barRefs.current[i] = el)} x={chart.x + 140} y={chart.y + 12 + i * (chart.h / 3)} width="0" height="20" fill={i ? "rgba(79,227,181,0.55)" : MINT} />
            </g>
          ))}
        </g>
        <g ref={explRef} style={{ opacity: 0 }}>
          <rect x={expl.x} y={expl.y} width={expl.w} height={expl.h} fill={MINT} />
          <foreignObject x={expl.x} y={expl.y} width={expl.w} height={expl.h}>
            <div className={s.foRow} style={{ color: "#071a1b" }}>
              <span ref={explTextRef} />
            </div>
          </foreignObject>
        </g>
      </svg>
    </div>
  );
}
