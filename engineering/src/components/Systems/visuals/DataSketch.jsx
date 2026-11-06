"use client";

// Data & BI — "Prism", an editorial diagram. Four messy sources line up, pipes draw themselves and
// data flows into one warehouse that fills layer by layer; then a dashboard assembles (counters,
// a sales curve, bars per region) and a low-stock alert slides in.
import v from "./Visual.module.css";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

import { band, follow } from "../lib";
import { useLang } from "@/lib/useLang";

const BLUE = "#2b4cff";
const RED = "#ff0000";
const INK = "#0d0d0d";
const SALES = [0.32, 0.38, 0.35, 0.46, 0.44, 0.52, 0.58, 0.55, 0.66, 0.71, 0.69, 0.82];
const BARS = [0.92, 0.4, 0.66, 0.52];
const MESS = [
  [-9, -14, 10],
  [7, 18, -6],
  [-5, -8, 8],
  [11, 12, -9],
];

function layoutFor(wide) {
  if (wide) {
    const sources = [130, 250, 370, 490].map((y) => ({ x: 40, y: y - 37, w: 170, h: 74, out: [210, y] }));
    return {
      W: 1200, H: 640, wide,
      sources,
      pipes: sources.map(({ out: [x, y] }) => `M${x} ${y}C${x + 140} ${y} ${470 - 120} 320 470 320`),
      wh: { cx: 560, top: 225, layer: 60, rx: 92, ry: 22 },
      out: "M652 320L700 320",
      dash: { x: 700, y: 60, w: 480, h: 530 },
    };
  }
  const sources = [0, 1, 2, 3].map((i) => ({ x: 14 + i * 145, y: 30, w: 132, h: 62, out: [80 + i * 145, 92] }));
  return {
    W: 600, H: 1000, wide,
    sources,
    pipes: sources.map(({ out: [x, y] }) => `M${x} ${y}C${x} ${y + 90} 300 ${200 - 70} 300 200`),
    wh: { cx: 300, top: 205, layer: 52, rx: 82, ry: 20 },
    out: "M300 382L300 440",
    dash: { x: 24, y: 440, w: 552, h: 530 },
  };
}

// "1,24 M DT" -> animate the number inside, keep its prefix, suffix and decimals
function counter(str, k, lang) {
  const m = str.match(/[\d][\d\s .,]*/);
  if (!m) return str;
  const raw = m[0].trim();
  const fr = lang === "fr";
  const norm = fr ? raw.replace(/[\s ]/g, "").replace(",", ".") : raw.replace(/,/g, "");
  const value = parseFloat(norm);
  const decimals = (norm.split(".")[1] || "").length;
  const fmt = new Intl.NumberFormat(fr ? "fr-FR" : "en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return str.replace(m[0].trim(), fmt.format(value * k));
}

export default function DataSketch({ progress, content, reduced, near }) {
  const { lang } = useLang();
  const hostRef = useRef(null);
  const [wide, setWide] = useState(true);
  const L = useMemo(() => layoutFor(wide), [wide]);
  const srcRefs = useRef([]);
  const pipeRefs = useRef([]);
  const dotRefs = useRef([]);
  const layerRefs = useRef([]);
  const outRef = useRef(null);
  const dashRef = useRef(null);
  const kpiRefs = useRef([]);
  const lineRef = useRef(null);
  const areaRef = useRef(null);
  const barRefs = useRef([]);
  const alertRef = useRef(null);
  const whLabelRef = useRef(null);

  useLayoutEffect(() => {
    const host = hostRef.current;
    const ro = new ResizeObserver(() => setWide(host.clientWidth / Math.max(1, host.clientHeight) > 0.95));
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  const { dash } = L;
  const pad = 28;
  const chart = { x: dash.x + pad, y: dash.y + (L.wide ? 200 : 175), w: dash.w - pad * 2, h: L.wide ? 120 : 95 };
  const bars = { x: dash.x + pad + 76, y: chart.y + chart.h + 40, w: dash.w - pad * 2 - 76, row: L.wide ? 30 : 28 };
  const linePts = SALES.map((s, i) => [chart.x + (i / (SALES.length - 1)) * chart.w, chart.y + chart.h - s * chart.h]);
  const lineD = linePts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
  const areaD = `${lineD}L${chart.x + chart.w} ${chart.y + chart.h}L${chart.x} ${chart.y + chart.h}Z`;

  useEffect(() => {
    if (!near) return;
    const lengths = pipeRefs.current.map((el) => el?.getTotalLength() || 1);
    pipeRefs.current.forEach((el, i) => el && (el.style.strokeDasharray = `${lengths[i]}`));
    const lineLen = lineRef.current.getTotalLength();
    lineRef.current.style.strokeDasharray = `${lineLen}`;
    const outLen = outRef.current.getTotalLength();
    outRef.current.style.strokeDasharray = `${outLen}`;

    const tick = (time) => {
      const p = follow(progress, reduced);
      const t = reduced ? 0 : time;
      const mess = 1 - band(p, 0.15, 0.3);
      srcRefs.current.forEach((g, i) => {
        if (!g) return;
        const [r, dx, dy] = MESS[i];
        const s = L.sources[i];
        g.setAttribute(
          "transform",
          `translate(${dx * mess} ${dy * mess}) rotate(${r * mess} ${s.x + s.w / 2} ${s.y + s.h / 2})`,
        );
        g.querySelector(".dq").style.opacity = String(mess);
      });
      const pipe = band(p, 0.22, 0.36);
      pipeRefs.current.forEach((el, i) => el && (el.style.strokeDashoffset = `${lengths[i] * (1 - pipe)}`));
      const flow = band(p, 0.3, 0.34);
      dotRefs.current.forEach((dot, n) => {
        if (!dot) return;
        const i = Math.floor(n / 3);
        const k = ((t * 0.32 + (n % 3) / 3 + i * 0.11) % 1 + 1) % 1;
        const pt = pipeRefs.current[i].getPointAtLength(lengths[i] * k);
        dot.setAttribute("cx", pt.x);
        dot.setAttribute("cy", pt.y);
        dot.style.opacity = String(flow * Math.sin(k * Math.PI));
      });
      layerRefs.current.forEach((g, i) => {
        if (!g) return;
        const f = band(p, 0.42 + (2 - i) * 0.04, 0.5 + (2 - i) * 0.04);
        g.style.opacity = String(f);
        g.setAttribute("transform", `translate(0 ${(1 - f) * -26})`);
      });
      whLabelRef.current.style.opacity = String(band(p, 0.44, 0.5));
      outRef.current.style.strokeDashoffset = `${outLen * (1 - band(p, 0.56, 0.6))}`;

      const d = band(p, 0.59, 0.64);
      dashRef.current.style.opacity = String(d);
      dashRef.current.setAttribute("transform", `translate(0 ${(1 - d) * 24})`);
      const k = band(p, 0.62, 0.74);
      kpiRefs.current.forEach((el, i) => el && (el.textContent = counter(content.kpis[i][1], k, lang)));
      const line = band(p, 0.65, 0.78);
      lineRef.current.style.strokeDashoffset = `${lineLen * (1 - line)}`;
      areaRef.current.style.opacity = String(line * 0.12);
      const alert = band(p, 0.84, 0.9);
      barRefs.current.forEach((el, i) => {
        if (!el) return;
        el.setAttribute("width", String(bars.w * BARS[i] * band(p, 0.68 + i * 0.025, 0.78 + i * 0.025)));
        if (i === 1) el.setAttribute("fill", alert > 0.5 ? RED : BLUE);
      });
      alertRef.current.style.opacity = String(alert);
      alertRef.current.setAttribute("transform", `translate(${(1 - alert) * 40} 0)`);
    };
    gsap.ticker.add(tick);
    tick(0);
    return () => gsap.ticker.remove(tick);
  }, [near, progress, reduced, L, bars.w, content.kpis, lang]);

  const { wh } = L;
  // the first figure (revenue) is the longest: it gets more room
  const KPI_WEIGHTS = [1.4, 1, 1];
  const kpiUnit = (dash.w - pad * 2 - 24) / KPI_WEIGHTS.reduce((a, b) => a + b, 0);
  const kpiX = KPI_WEIGHTS.map((_, i) => dash.x + pad + KPI_WEIGHTS.slice(0, i).reduce((a, b) => a + b * kpiUnit + 12, 0));
  const alertBox = { x: dash.x + (L.wide ? 40 : 20), y: dash.y + dash.h - (L.wide ? 6 : 64), w: L.wide ? dash.w : dash.w - 40 };

  return (
    <div ref={hostRef} className={`${v.host} ${v.data}`}>
      <svg className={v.svg} viewBox={`0 0 ${L.W} ${L.H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        {/* sources */}
        {L.sources.map((s, i) => (
          <g key={i} ref={(el) => (srcRefs.current[i] = el)}>
            <rect x={s.x} y={s.y} width={s.w} height={s.h} fill="#fff" stroke={INK} strokeWidth="1.5" />
            <rect x={s.x + 14} y={s.y + s.h / 2 - 12} width="24" height="24" fill="none" stroke={BLUE} strokeWidth="1.5" />
            <path d={`M${s.x + 18} ${s.y + s.h / 2 - 4}h16M${s.x + 18} ${s.y + s.h / 2 + 2}h16M${s.x + 18} ${s.y + s.h / 2 + 8}h10`} stroke={BLUE} strokeWidth="1.5" />
            <text x={s.x + 50} y={s.y + s.h / 2 + 6} fontSize={L.wide ? 19 : 17} fontWeight="500" fill={INK}>
              {content.sources[i]}
            </text>
            <text className="dq" x={s.x + s.w - 20} y={s.y + s.h / 2 + 8} fontSize="22" fontWeight="700" fill={RED} textAnchor="middle">
              ?
            </text>
          </g>
        ))}

        {/* pipes and the data flowing through them */}
        {L.pipes.map((d, i) => (
          <path key={i} ref={(el) => (pipeRefs.current[i] = el)} d={d} fill="none" stroke={INK} strokeWidth="1.5" />
        ))}
        {Array.from({ length: L.pipes.length * 3 }, (_, n) => (
          <circle key={n} ref={(el) => (dotRefs.current[n] = el)} r="5" fill={BLUE} style={{ opacity: 0 }} />
        ))}

        {/* the warehouse: three layers stacked from the bottom */}
        <g>
          {[0, 1, 2].map((i) => {
            const y = wh.top + i * wh.layer;
            return (
              <g key={i} ref={(el) => (layerRefs.current[i] = el)} style={{ opacity: 0 }}>
                <path
                  d={`M${wh.cx - wh.rx} ${y}v${wh.layer - 10}a${wh.rx} ${wh.ry} 0 0 0 ${wh.rx * 2} 0v${-(wh.layer - 10)}`}
                  fill={i === 0 ? BLUE : i === 1 ? "#5a74ff" : "#8d9dff"}
                  stroke={INK}
                  strokeWidth="1.5"
                />
                <ellipse cx={wh.cx} cy={y} rx={wh.rx} ry={wh.ry} fill="#fff" stroke={INK} strokeWidth="1.5" />
              </g>
            );
          })}
          <text ref={whLabelRef} x={wh.cx} y={wh.top + wh.layer * 3 + 26} textAnchor="middle" className={v.monoText} fontSize="15" fill={INK} style={{ opacity: 0 }}>
            {content.warehouse}
          </text>
        </g>
        <path ref={outRef} d={L.out} fill="none" stroke={INK} strokeWidth="1.5" />

        {/* the dashboard */}
        <g ref={dashRef} style={{ opacity: 0 }}>
          <rect x={dash.x} y={dash.y} width={dash.w} height={dash.h} fill="#fff" stroke={INK} strokeWidth="1.5" />
          <rect x={dash.x} y={dash.y} width={dash.w} height="44" fill={INK} />
          <text x={dash.x + pad} y={dash.y + 28} className={v.monoText} fontSize="14" fill="#fff">
            {content.dashboard}
          </text>
          <circle cx={dash.x + dash.w - 30} cy={dash.y + 22} r="5" fill="#4be08f" />
          {content.kpis.map(([label], i) => {
            const x = kpiX[i];
            return (
              <g key={label}>
                <text x={x} y={dash.y + 82} className={v.monoText} fontSize="11" fill="rgba(13,13,13,.6)">
                  {label}
                </text>
                <text ref={(el) => (kpiRefs.current[i] = el)} x={x} y={dash.y + 122} fontSize={L.wide ? 27 : 28} fontWeight="700" letterSpacing="-1" fill={INK}>
                  0
                </text>
              </g>
            );
          })}
          <text x={chart.x} y={chart.y - 14} className={v.monoText} fontSize="12" fill="rgba(13,13,13,.6)">
            {content.chart}
          </text>
          {[0, 0.5, 1].map((g) => (
            <line key={g} x1={chart.x} x2={chart.x + chart.w} y1={chart.y + chart.h * g} y2={chart.y + chart.h * g} stroke="rgba(13,13,13,.1)" />
          ))}
          <path ref={areaRef} d={areaD} fill={BLUE} style={{ opacity: 0 }} />
          <path ref={lineRef} d={lineD} fill="none" stroke={BLUE} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          {content.regions.map((r, i) => (
            <g key={r}>
              <text x={dash.x + pad} y={bars.y + i * bars.row + 15} fontSize="15" fill={INK}>
                {r}
              </text>
              <rect x={bars.x} y={bars.y + i * bars.row + 2} width={bars.w} height="16" fill="rgba(43,76,255,.07)" />
              <rect ref={(el) => (barRefs.current[i] = el)} x={bars.x} y={bars.y + i * bars.row + 2} width="0" height="16" fill={BLUE} />
            </g>
          ))}
        </g>

        {/* the alert */}
        <g ref={alertRef} style={{ opacity: 0 }}>
          <rect x={alertBox.x} y={alertBox.y} width={alertBox.w - 40} height="52" fill={INK} />
          <circle cx={alertBox.x + 26} cy={alertBox.y + 26} r="7" fill={RED}>
            {!reduced && <animate attributeName="r" values="6;9;6" dur="1.2s" repeatCount="indefinite" />}
          </circle>
          <text x={alertBox.x + 46} y={alertBox.y + 32} fontSize={L.wide ? 17 : 16} fontWeight="500" fill="#fff">
            {content.alert}
          </text>
        </g>
      </svg>
    </div>
  );
}
