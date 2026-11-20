"use client";

import styles from "./CloudDiagrams.module.css";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Plain-language diagrams for the cloud pages. Built in HTML and CSS (not one scaled SVG) so the labels
// stay readable on a phone; each is a <figure> with a caption and a text description for screen readers
// and search engines. `d` is t.cloud.diagrams[type].

const Icon = {
  office: (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M8 42V10h20v32M28 18h12v24M4 42h40M14 16h4M14 22h4M14 28h4M20 16h2M20 22h2M20 28h2M33 24h2M33 30h2" />
      <rect x="13" y="34" width="8" height="8" />
    </svg>
  ),
  cloud: (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M14 36h22a8 8 0 0 0 0-16 11 11 0 0 0-21-3 9 9 0 0 0-1 19Z" />
      <path d="M18 28h4M26 28h4" />
    </svg>
  ),
};

function Mark({ ok }) {
  return (
    <svg viewBox="0 0 20 20" className={ok ? styles.ok : styles.ko} aria-hidden="true">
      {ok ? <path d="M4 10.5l4 4 8-9" /> : <path d="M5 5l10 10M15 5L5 15" />}
    </svg>
  );
}

function OnPrem({ d }) {
  return (
    <div className={styles.onprem}>
      <div className={styles.side} data-reveal>
        <div className={styles.sideHead}>
          <span className={styles.icon}>{Icon.office}</span>
          <p className="mono">{d.leftTitle}</p>
        </div>
        <ul>
          {d.left.map((item) => (
            <li key={item}>
              <Mark /> {item}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.bridge} data-reveal aria-hidden="true">
        <span className={styles.bridgeLine}>
          <i />
        </span>
        <span className={styles.bridgeLabel}>{d.arrow}</span>
      </div>
      <div className={`${styles.side} ${styles.sideCloud}`} data-reveal>
        <div className={styles.sideHead}>
          <span className={styles.icon}>{Icon.cloud}</span>
          <p className="mono">{d.rightTitle}</p>
        </div>
        <ul>
          {d.right.map((item) => (
            <li key={item}>
              <Mark ok /> {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// node positions in % of the map box (x, y)
const MAP = {
  you: [36, 64],
  local: [12, 88],
  r0: [20, 16],
  r1: [46, 9],
  r2: [76, 46],
  r3: [88, 70],
};

function DataMap({ d }) {
  const regions = d.regions.map((r, i) => ({ ...r, pos: MAP[`r${i}`] }));
  return (
    <div className={styles.map}>
      <svg className={styles.mapLines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {regions.map((r) => (
          <line key={r.code} x1={MAP.you[0]} y1={MAP.you[1]} x2={r.pos[0]} y2={r.pos[1]} data-line />
        ))}
        <line x1={MAP.you[0]} y1={MAP.you[1]} x2={MAP.local[0]} y2={MAP.local[1]} className={styles.dashed} data-line />
      </svg>
      <div className={`${styles.node} ${styles.nodeYou}`} style={{ left: `${MAP.you[0]}%`, top: `${MAP.you[1]}%` }} data-reveal>
        <i />
        <p className="mono">{d.you}</p>
      </div>
      <div className={`${styles.node} ${styles.nodeLocal}`} style={{ left: `${MAP.local[0]}%`, top: `${MAP.local[1]}%` }} data-reveal>
        <i />
        <p className="mono">{d.local}</p>
        <p className={styles.nodeNote}>{d.localNote}</p>
      </div>
      {regions.map((r) => (
        <div key={r.code} className={styles.node} style={{ left: `${r.pos[0]}%`, top: `${r.pos[1]}%` }} data-reveal>
          <i />
          <p className="mono">AWS {r.name}</p>
          <p className={styles.nodeNote}>{r.code}</p>
        </div>
      ))}
    </div>
  );
}

function Steps({ d }) {
  return (
    <ol className={styles.steps}>
      <span className={styles.stepsTrack} aria-hidden="true">
        <span data-progress />
      </span>
      {d.items.map((s, i) => (
        <li key={s.title} data-reveal>
          <span className={styles.stepNo}>{String(i + 1).padStart(2, "0")}</span>
          <p className={styles.stepTitle}>{s.title}</p>
          <p className={styles.stepCopy}>{s.copy}</p>
        </li>
      ))}
    </ol>
  );
}

// a 24-hour ruler, in Paris time; Tunis office hours shift by one hour in summer (Tunis has no daylight saving)
function Nearshore({ d }) {
  const [summer, setSummer] = useState(false);
  const start = 9;
  const end = 18;
  const shift = summer ? 1 : 0;
  const pct = (h) => `${(h / 24) * 100}%`;
  const overlapFrom = start + shift;
  return (
    <div className={styles.near}>
      <div className={styles.toggle} role="group">
        <button type="button" aria-pressed={!summer} onClick={() => setSummer(false)}>
          {d.winter}
        </button>
        <button type="button" aria-pressed={summer} onClick={() => setSummer(true)}>
          {d.summer}
        </button>
      </div>
      <div className={styles.ruler} data-reveal>
        {[0, 6, 9, 12, 15, 18, 24].map((h) => (
          <span key={h} style={{ left: pct(h) }}>
            {h}h
          </span>
        ))}
      </div>
      <div className={styles.row} data-reveal>
        <p className="mono">{d.paris}</p>
        <div className={styles.track}>
          <span className={styles.block} style={{ left: pct(start), width: pct(end - start) }} />
        </div>
      </div>
      <div className={styles.row} data-reveal>
        <p className="mono">{d.tunis}</p>
        <div className={styles.track}>
          <span className={`${styles.block} ${styles.blockRed}`} style={{ left: pct(start + shift), width: pct(end - start) }} />
        </div>
      </div>
      <div className={styles.row} data-reveal>
        <p className="mono">{d.overlap}</p>
        <div className={styles.track}>
          <span className={styles.overlap} style={{ left: pct(overlapFrom), width: pct(end - overlapFrom) }}>
            {end - overlapFrom} h
          </span>
        </div>
      </div>
    </div>
  );
}

function Layers({ d }) {
  return (
    <ol className={styles.layers}>
      {d.items.map((l, i) => (
        <li key={l.title} data-reveal style={{ "--i": i }}>
          <span className={styles.layerNo}>{String(i + 1).padStart(2, "0")}</span>
          <p className={styles.layerTitle}>{l.title}</p>
          <p className={styles.layerCopy}>{l.copy}</p>
        </li>
      ))}
    </ol>
  );
}

const TYPES = { onprem: OnPrem, data: DataMap, steps: Steps, nearshore: Nearshore, layers: Layers };

export default function CloudDiagram({ type, d }) {
  const rootRef = useRef(null);
  const Diagram = TYPES[type];

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: "top 78%" } });
      tl.from(root.querySelectorAll("[data-reveal]"), { autoAlpha: 0, y: 24, duration: 0.6, stagger: 0.08, ease: "power3.out" });
      const lines = root.querySelectorAll("[data-line]");
      if (lines.length) tl.from(lines, { autoAlpha: 0, duration: 0.6, stagger: 0.06, ease: "power2.out" }, 0.2);
      const progress = root.querySelector("[data-progress]");
      if (progress) tl.from(progress, { scaleX: 0, transformOrigin: "left center", duration: 1.4, ease: "power2.inOut" }, 0);
    },
    { scope: rootRef },
  );

  if (!Diagram) return null;
  return (
    <figure ref={rootRef} className={styles.figure}>
      <figcaption className={styles.caption}>
        <span className={styles.captionDot} aria-hidden="true" />
        <span>{d.title}</span>
      </figcaption>
      <p className="sr-only">{d.desc}</p>
      <Diagram d={d} />
    </figure>
  );
}
