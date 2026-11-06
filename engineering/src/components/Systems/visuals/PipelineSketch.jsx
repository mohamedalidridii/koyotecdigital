"use client";

// DevOps — "Relay", a CI/CD pipeline drawn like an engineer's sketch. A commit travels from A to Z:
// each stage inks itself in as the packet reaches it, production swaps its pods one by one, and a
// terminal prints the run.
import v from "./Visual.module.css";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

import { band, clamp, follow } from "../lib";

// scroll progress at which the packet reaches each of the nine stages
const REACH = [0.05, 0.22, 0.29, 0.36, 0.46, 0.54, 0.65, 0.75, 0.88];
// scroll progress at which each terminal line prints
const LOG_AT = [0.02, 0.05, 0.22, 0.29, 0.36, 0.46, 0.54, 0.65, 0.8, 0.88];
const OK = "#10a35a";
const INK = "#0d0d0d";

// icons on a 24-unit grid, drawn with strokes only
const ICONS = [
  "M12 4v16M12 9a3 3 0 1 0 0-.01M12 15a3 3 0 1 0 0-.01M12 9c4 0 6 2 6 6", // commit (branch)
  "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 1 0 0-7M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1", // build (gear)
  "M5 6h3M5 12h3M5 18h3M11 6h8M11 12h8M11 18h8M4 6l1 1 2-2", // tests (checklist)
  "M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6zM9 12l2 2 4-4", // security (shield)
  "M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9", // image (container)
  "M4 5h16v4H4zM4 10h16v4H4zM4 15h16v4H4zM7 7h.01M7 12h.01M7 17h.01", // registry (rack)
  "M3 5h18v11H3zM8 20h8M12 16v4M7 12l3-3 2 2 4-4", // staging (screen)
  "M12 3l8 4v10l-8 4-8-4V7zM12 8a4 4 0 1 0 0 8 4 4 0 1 0 0-8M12 3v5M12 16v5M4 7l4.5 3M15.5 14L20 17M20 7l-4.5 3M8.5 14L4 17", // production (cluster)
  "M3 4h18v14H3zM6 14l3-4 3 2 3-5 3 3M3 21h18", // monitoring (chart)
];

function layoutFor(wide) {
  if (wide) {
    const W = 1200;
    const H = 640;
    const xs = [150, 375, 600, 825, 1050];
    const top = 175;
    const bot = 455;
    // the second row stops short of the left edge: the terminal sits there
    const pts = [...xs.map((x) => [x, top]), [1050, bot], [870, bot], [690, bot], [510, bot]];
    return { W, H, pts, r: 44, turn: 120, label: 72 };
  }
  const W = 600;
  const H = 820;
  const xs = [105, 300, 495];
  const ys = [140, 400, 660];
  const pts = [
    [xs[0], ys[0]], [xs[1], ys[0]], [xs[2], ys[0]],
    [xs[2], ys[1]], [xs[1], ys[1]], [xs[0], ys[1]],
    [xs[0], ys[2]], [xs[1], ys[2]], [xs[2], ys[2]],
  ];
  return { W, H, pts, r: 42, turn: 95, label: 66 };
}

// path segments between consecutive stages; row changes bend outward like a hand-drawn loop
function segments({ pts, turn, W }) {
  return pts.slice(1).map(([x, y], i) => {
    const [px, py] = pts[i];
    if (py === y) return `M${px} ${py}L${x} ${y}`;
    const dx = px > W / 2 ? turn : -turn;
    return `M${px} ${py}C${px + dx} ${py} ${x + dx} ${y} ${x} ${y}`;
  });
}

export default function PipelineSketch({ progress, content, reduced, near }) {
  const hostRef = useRef(null);
  const [wide, setWide] = useState(true);
  const L = useMemo(() => layoutFor(wide), [wide]);
  const segs = useMemo(() => segments(L), [L]);
  const segRefs = useRef([]);
  const trailRef = useRef(null);
  const packetRef = useRef(null);
  const nodeRefs = useRef([]);
  const podRefs = useRef([]);
  const logRefs = useRef([]);
  const statusRef = useRef(null);

  useLayoutEffect(() => {
    const host = hostRef.current;
    const ro = new ResizeObserver(() => setWide(host.clientWidth / Math.max(1, host.clientHeight) > 0.95));
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!near) return;
    const lengths = segRefs.current.map((s) => s.getTotalLength());
    const total = lengths.reduce((a, b) => a + b, 0);
    const trail = trailRef.current;
    trail.style.strokeDasharray = `${total}`;
    let lastStatus = "";

    const tick = () => {
      const p = follow(progress, reduced);
      // which segment the packet is on, and how far along it
      let k = REACH.findIndex((r) => p < r);
      if (k === -1) k = REACH.length;
      let seg = 0;
      let t = 0;
      if (k === 0) {
        seg = 0;
        t = 0;
      } else if (k >= REACH.length) {
        seg = segs.length - 1;
        t = 1;
      } else {
        seg = k - 1;
        t = clamp((p - REACH[k - 1]) / (REACH[k] - REACH[k - 1]));
        t = t * t * (3 - 2 * t);
      }
      const done = lengths.slice(0, seg).reduce((a, b) => a + b, 0) + lengths[seg] * t;
      trail.style.strokeDashoffset = `${total - done}`;
      const pt = segRefs.current[seg].getPointAtLength(lengths[seg] * t);
      const appear = band(p, 0.0, 0.05);
      packetRef.current.setAttribute("transform", `translate(${pt.x} ${pt.y - L.r - 22}) scale(${appear})`);

      nodeRefs.current.forEach((g, i) => {
        if (!g) return;
        const on = p >= REACH[i];
        if (on !== g.hasAttribute("data-on")) g.toggleAttribute("data-on", on);
      });

      // production: three old pods replaced one by one by three new ones
      const swap = band(p, REACH[7] - 0.02, REACH[7] + 0.07);
      podRefs.current.forEach((pod, i) => {
        if (!pod) return;
        const isNew = i >= 3;
        const j = i % 3;
        const local = clamp(swap * 3 - j);
        pod.style.opacity = String(isNew ? local : 1 - local);
        pod.setAttribute("transform", `translate(0 ${isNew ? (1 - local) * 10 : -local * 10})`);
      });

      // the latest printed line, whether or not the full terminal is on screen
      const printed = LOG_AT.filter((at) => p >= at).length;
      const last = printed ? content.logs[printed - 1] : "";
      logRefs.current.forEach((line, i) => {
        if (!line) return;
        const on = i < printed;
        if (on !== line.hasAttribute("data-on")) line.toggleAttribute("data-on", on);
      });
      if (statusRef.current && last !== lastStatus) {
        lastStatus = last;
        statusRef.current.textContent = last;
      }
    };
    gsap.ticker.add(tick);
    tick();
    return () => gsap.ticker.remove(tick);
  }, [near, progress, reduced, segs, L, content.logs]);

  const { W, H, pts, r } = L;
  const podY = (y) => y + r + 54;

  return (
    <div ref={hostRef} className={`${v.host} ${v.devops}`}>
      <svg className={v.svg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          {/* the wobble that makes clean vectors look drawn by hand */}
          <filter id="sketch" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="3.2" />
          </filter>
          <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(13,13,13,0.12)" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#dots)" />

        <g filter="url(#sketch)" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {segs.map((d, i) => (
            <path key={`b${i}`} ref={(el) => (segRefs.current[i] = el)} d={d} stroke="rgba(13,13,13,0.3)" strokeWidth="2" strokeDasharray="2 9" />
          ))}
          <path ref={trailRef} d={segs.join(" ")} stroke={INK} strokeWidth="3.2" />
        </g>

        {pts.map(([x, y], i) => (
          <g key={i} ref={(el) => (nodeRefs.current[i] = el)} className="pnode" transform={`translate(${x} ${y})`}>
            <circle className="pring" r={r + 12} fill="none" stroke={OK} strokeWidth="2" />
            <g filter="url(#sketch)">
              <circle className="pdisc" r={r} strokeWidth="2.4" />
              <path
                className="picon"
                d={ICONS[i]}
                transform="translate(-19 -19) scale(1.58)"
                fill="none"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <text className="plabel" y={r + 30} textAnchor="middle">
              {String(i + 1).padStart(2, "0")} {content.nodes[i]}
            </text>
            <g className="pcheck" transform={`translate(${r * 0.72} ${-r * 0.72})`}>
              <circle r="11" fill={OK} />
              <path d="M-5 0l3.5 3.5L5-4" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            </g>
          </g>
        ))}

        {/* pods under the production node */}
        <g transform={`translate(${pts[7][0]} ${podY(pts[7][1])})`}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i} ref={(el) => (podRefs.current[i] = el)} style={{ opacity: i < 3 ? 1 : 0 }}>
              <rect
                x={(i % 3) * 30 - 41}
                y="-9"
                width="22"
                height="18"
                rx="4"
                fill={i < 3 ? "none" : OK}
                stroke={i < 3 ? "rgba(13,13,13,0.55)" : OK}
                strokeWidth="1.6"
                strokeDasharray={i < 3 ? "3 3" : "none"}
              />
            </g>
          ))}
          <text className="plabel" x="56" y="5">
            {content.pods}
          </text>
        </g>

        {/* the commit packet */}
        <g ref={packetRef}>
          <rect x="-42" y="-15" width="84" height="30" rx="15" fill={INK} />
          <text className="ppacket" textAnchor="middle" y="5">
            a3f9c2
          </text>
        </g>

        <style>{`
          .pnode .pdisc { fill: #f3f1ec; stroke: ${INK}; transition: fill .45s; }
          .pnode .picon { stroke: rgba(13,13,13,.45); transition: stroke .45s; }
          .pnode .pring { opacity: 0; transform-box: fill-box; transform-origin: center; }
          .pnode .pcheck { opacity: 0; transform-box: fill-box; transform-origin: center; transform: scale(.4); transition: opacity .35s, transform .5s cubic-bezier(.34,1.56,.64,1); }
          .pnode[data-on] .pdisc { fill: ${INK}; }
          .pnode[data-on] .picon { stroke: #f3f1ec; }
          .pnode[data-on] .pcheck { opacity: 1; transform: scale(1); }
          .pnode[data-on] .pring { animation: pping 1s cubic-bezier(.16,1,.3,1) 1; }
          @keyframes pping { 0% { opacity: .9; transform: scale(.85); } 100% { opacity: 0; transform: scale(1.5); } }
          .plabel { font-family: var(--font-google-sans-code), monospace; font-size: 15px; text-transform: uppercase; fill: ${INK}; letter-spacing: .02em; }
          .ppacket { font-family: var(--font-google-sans-code), monospace; font-size: 14px; fill: #4be08f; }
          @media (prefers-reduced-motion: reduce) { .pnode[data-on] .pring { animation: none; } }
        `}</style>
      </svg>

      <div className={v.layer} aria-hidden="true">
        {wide ? (
          <div className={`${v.card} ${v.terminal}`}>
            <div className={v.terminalBar}>
              <i />
              <i />
              <i />
              <span>{content.terminal} #1284</span>
            </div>
            <div className={v.terminalBody}>
              {content.logs.map((line, i) => (
                <p key={i} ref={(el) => (logRefs.current[i] = el)} {...(line.includes("✓") ? { "data-ok": "" } : {})}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        ) : (
          <div ref={statusRef} className={`${v.card} ${v.statusLine}`} />
        )}
      </div>
    </div>
  );
}
