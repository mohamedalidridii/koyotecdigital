"use client";

// Supply chain radar — open orders sail along their routes on a stylised map; the news watch
// spots a port strike, the routes through that port turn red, the affected orders get their
// delay, and procurement receives an alert with an alternative route.
import s from "./AiVisual.module.css";

import { useMemo, useRef } from "react";

import { band, follow, typed, useTick, useWide } from "@/components/Systems/lib";

const SEA = "#0a7aa8";
const INK = "#0b2433";
const RED = "#e5383b";
// ports: Shanghai, Mumbai, Genoa, Marseille, Radès (index matches content.ports)
const PORTS_WIDE = [
  [1120, 170],
  [1000, 360],
  [690, 160],
  [600, 200],
  [680, 400],
];
const PORTS_TALL = [
  [540, 110],
  [450, 300],
  [240, 110],
  [150, 150],
  [230, 330],
];

// routes for each order: list of port indexes, and the one that is shown as the alternative
const ROUTES = [
  [2, 4],
  [0, 2, 4],
  [1, 4],
];

function curve([x1, y1], [x2, y2], bend = 0.25) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  return `M${x1} ${y1}Q${mx - dy * bend} ${my + dx * bend} ${x2} ${y2}`;
}

function layoutFor(wide) {
  if (wide) {
    return {
      W: 1200, H: 720, wide, ports: PORTS_WIDE,
      map: { x: 360, y: 20, w: 820, h: 520 },
      orders: { x: 30, y: 40, w: 300, card: 96, gap: 14 },
      news: { x: 860, y: 430, w: 310, row: 30 },
      alert: { x: 30, y: 566, w: 1140, h: 130 },
    };
  }
  return {
    W: 600, H: 1150, wide, ports: PORTS_TALL,
    map: { x: 0, y: 20, w: 600, h: 420 },
    orders: { x: 20, y: 470, w: 560, card: 78, gap: 10 },
    news: { x: 20, y: 750, w: 560, row: 30 },
    alert: { x: 20, y: 880, w: 560, h: 250 },
  };
}

export default function SupplyRadar({ progress, content, reduced, near }) {
  const hostRef = useRef(null);
  const wide = useWide(hostRef, 0.95);
  const L = useMemo(() => layoutFor(wide), [wide]);
  const laneRefs = useRef([]);
  const shipRefs = useRef([]);
  const orderRefs = useRef([]);
  const delayRefs = useRef([]);
  const newsRefs = useRef([]);
  const eventRef = useRef(null);
  const altRef = useRef(null);
  const altLabelRef = useRef(null);
  const alertRef = useRef(null);
  const alertTextRef = useRef(null);

  // lanes are drawn per leg; a leg through Genoa (port 2) is "hit" by the strike
  const legs = useMemo(() => {
    const out = [];
    const seen = new Set();
    ROUTES.forEach((r) =>
      r.slice(1).forEach((to, i) => {
        const from = r[i];
        const key = `${from}-${to}`;
        if (seen.has(key)) return;
        seen.add(key);
        out.push({ key, from, to, hit: from === 2 || to === 2, d: curve(L.ports[from], L.ports[to], from === 0 ? -0.18 : 0.2) });
      }),
    );
    return out;
  }, [L]);

  useTick(
    near,
    (time) => {
      const p = follow(progress, reduced);
      const t = reduced ? 0 : time;
      const hit = band(p, 0.5, 0.56);
      laneRefs.current.forEach((l, i) => {
        if (!l) return;
        l.style.strokeDashoffset = String(1 - band(p, 0.04 + i * 0.02, 0.12 + i * 0.02));
        l.style.stroke = legs[i].hit && hit > 0.5 ? RED : SEA;
      });
      // ships sail while the routes are open; the ones bound for Genoa stop at the strike
      shipRefs.current.forEach((sh, i) => {
        if (!sh) return;
        const lane = laneRefs.current[i];
        if (!lane) return;
        const len = lane.getTotalLength();
        const stopped = legs[i].hit && hit > 0.5;
        const k = stopped ? 0.55 : (t * 0.06 + i * 0.27) % 1;
        const pt = lane.getPointAtLength(len * k);
        sh.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
        sh.style.opacity = String(band(p, 0.12, 0.16));
        sh.querySelector("circle").setAttribute("fill", stopped ? RED : INK);
      });
      orderRefs.current.forEach((o, i) => {
        if (!o) return;
        o.style.opacity = String(band(p, 0.02 + i * 0.03, 0.06 + i * 0.03));
        const affected = ROUTES[content.orders[i][2]].includes(2);
        o.toggleAttribute("data-hit", affected && p > 0.66);
      });
      delayRefs.current.forEach((d, i) => {
        if (!d) return;
        const affected = ROUTES[content.orders[i][2]].includes(2);
        d.style.opacity = affected ? String(band(p, 0.68, 0.72)) : "0";
      });
      newsRefs.current.forEach((n, i) => {
        if (!n) return;
        n.style.opacity = String(band(p, 0.22 + i * 0.04, 0.26 + i * 0.04));
        n.toggleAttribute("data-hit", i === 1 && p > 0.44);
      });
      eventRef.current.style.opacity = String(band(p, 0.44, 0.48));
      altRef.current.style.strokeDashoffset = String(1 - band(p, 0.82, 0.88));
      altLabelRef.current.style.opacity = String(band(p, 0.86, 0.89));
      alertRef.current.style.opacity = String(band(p, 0.84, 0.87));
      alertTextRef.current.textContent = typed(content.alert, band(p, 0.86, 0.97));
    },
    [L, legs, content, reduced],
  );

  const { W, H, ports, map, orders, news, alert } = L;
  const [gx, gy] = ports[2];
  const [rx, ry] = ports[4];
  const [mx, my] = ports[3];
  return (
    <div ref={hostRef} className={`${s.host} ${s.supply}`}>
      <svg className={s.svg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <pattern id="sdots" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.3" fill="rgba(11,36,51,0.16)" />
          </pattern>
        </defs>
        <rect x={map.x} y={map.y} width={map.w} height={map.h} fill="url(#sdots)" />

        {/* shipping lanes and ships */}
        {legs.map((leg, i) => (
          <path
            key={leg.key}
            ref={(el) => (laneRefs.current[i] = el)}
            d={leg.d}
            pathLength="1"
            fill="none"
            stroke={SEA}
            strokeWidth="2.2"
            strokeDasharray="1"
            style={{ strokeDashoffset: 1, transition: "stroke .5s" }}
          />
        ))}
        <path
          ref={altRef}
          d={curve([mx, my], [rx, ry], 0.22)}
          pathLength="1"
          fill="none"
          stroke="#12a150"
          strokeWidth="3"
          strokeDasharray="1"
          style={{ strokeDashoffset: 1 }}
        />
        <g ref={altLabelRef} style={{ opacity: 0 }}>
          <rect x={mx - 118} y={(my + ry) / 2 - 14} width="110" height="26" fill="#12a150" />
          <text x={mx - 63} y={(my + ry) / 2 + 4} textAnchor="middle" className={s.monoText} fontSize="11" fill="#fff">
            {content.alt}
          </text>
        </g>
        {legs.map((leg, i) => (
          <g key={`s${leg.key}`} ref={(el) => (shipRefs.current[i] = el)} style={{ opacity: 0 }}>
            <circle r="6" fill={INK} />
            <circle r="11" fill="none" stroke={INK} strokeOpacity="0.25" />
          </g>
        ))}

        {/* ports */}
        {ports.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={i === 4 ? 9 : 7} fill={i === 4 ? INK : "#fff"} stroke={INK} strokeWidth="2" />
            <text x={x + (i === 3 ? -14 : 14)} y={y + (i === 4 ? 26 : -12)} textAnchor={i === 3 ? "end" : "start"} fontSize="15" fontWeight="600" fill={INK}>
              {content.ports[i]}
            </text>
          </g>
        ))}

        {/* the strike at Genoa */}
        <g ref={eventRef} style={{ opacity: 0 }}>
          <circle className={s.pulseRed} cx={gx} cy={gy} r="18" fill="none" stroke={RED} strokeWidth="2.5" />
          <circle cx={gx} cy={gy} r="9" fill={RED} />
          <rect x={gx + 16} y={gy - 50} width={content.event.length * 8.2 + 24} height="28" fill={RED} />
          <text x={gx + 28} y={gy - 31} className={s.monoText} fontSize="12" fill="#fff">
            {content.event}
          </text>
        </g>

        {/* open orders */}
        <text x={orders.x} y={orders.y - 12} className={s.monoText} fontSize="12" fill="rgba(11,36,51,.6)">
          {content.ordersLabel}
        </text>
        {content.orders.map(([id, what, route], i) => {
          const y = orders.y + i * (orders.card + orders.gap);
          const path = ROUTES[route].map((k) => content.ports[k]).join(" → ");
          return (
            <g key={id} ref={(el) => (orderRefs.current[i] = el)} className={s.order} style={{ opacity: 0 }}>
              <rect className={s.orderBox} x={orders.x} y={y} width={orders.w} height={orders.card} />
              <text x={orders.x + 16} y={y + 28} className={s.codeText} fontSize="14" fontWeight="600" fill={INK}>
                {id}
              </text>
              <text x={orders.x + 16} y={y + 52} fontSize="15" fill={INK}>
                {what}
              </text>
              <text x={orders.x + 16} y={y + (wide ? 76 : 70)} className={s.monoText} fontSize="10.5" fill="rgba(11,36,51,.6)">
                {path}
              </text>
              <g ref={(el) => (delayRefs.current[i] = el)} style={{ opacity: 0 }}>
                <rect x={orders.x + orders.w - 104} y={y + 12} width="90" height="26" fill={RED} />
                <text x={orders.x + orders.w - 59} y={y + 30} textAnchor="middle" className={s.monoText} fontSize="12" fill="#fff">
                  {content.delay}
                </text>
              </g>
            </g>
          );
        })}

        {/* the news watch */}
        <text x={news.x} y={news.y - 10} className={s.monoText} fontSize="12" fill="rgba(11,36,51,.6)">
          {content.newsLabel}
        </text>
        {content.news.map((n, i) => (
          <g key={n} ref={(el) => (newsRefs.current[i] = el)} className={s.newsRow} style={{ opacity: 0 }}>
            <rect x={news.x} y={news.y + i * (news.row + 4)} width={news.w} height={news.row} />
            <foreignObject x={news.x + 10} y={news.y + i * (news.row + 4)} width={news.w - 14} height={news.row}>
              <div className={s.newsText}>{n}</div>
            </foreignObject>
          </g>
        ))}

        {/* the procurement alert */}
        <g ref={alertRef} style={{ opacity: 0 }}>
          <rect x={alert.x} y={alert.y} width={alert.w} height={alert.h} fill={INK} />
          <rect x={alert.x} y={alert.y} width="8" height={alert.h} fill={RED} />
          <foreignObject x={alert.x + 8} y={alert.y} width={alert.w - 8} height={alert.h}>
            <div className={`${s.fo} ${s.foLight}`}>
              <span className={s.foLabel}>{content.alertTitle}</span>
              <span ref={alertTextRef} className={s.foText} />
            </div>
          </foreignObject>
        </g>
      </svg>
    </div>
  );
}
