"use client";

// VLM extraction — a messy bill of lading (skewed scan, table, handwriting, stamp). Classic OCR
// garbles it; the vision-language model frames each region, writes clean JSON, checks it, stores
// it, and answers a question pointing back at the handwritten note.
import s from "./AiVisual.module.css";

import { useMemo, useRef } from "react";

import { band, follow, typed, useTick, useWide } from "@/components/Systems/lib";

const VIOLET = "#6b3df0";
const INK = "#1a1612";
const DOC = { w: 420, h: 600 };
// regions inside the document (header, table, handwritten note, stamp), in document coordinates
const REGIONS = [
  { x: 24, y: 24, w: 372, h: 100 },
  { x: 24, y: 146, w: 372, h: 226 },
  { x: 30, y: 400, w: 220, h: 84 },
  { x: 268, y: 390, w: 128, h: 128 },
];

function layoutFor(wide) {
  if (wide) {
    return {
      W: 1200, H: 720,
      doc: { x: 50, y: 50 },
      ocr: { x: 530, y: 50, w: 630, h: 96 },
      json: { x: 530, y: 50, w: 630, h: 400 },
      check: { x: 530, y: 470 },
      ask: { x: 530, y: 540, w: 630, h: 64 },
      answer: { x: 530, y: 614, w: 630, h: 86 },
    };
  }
  return {
    W: 600, H: 1120,
    doc: { x: 90, y: 20 },
    ocr: { x: 20, y: 640, w: 560, h: 96 },
    json: { x: 20, y: 640, w: 560, h: 270 },
    check: { x: 20, y: 924 },
    ask: { x: 20, y: 976, w: 560, h: 54 },
    answer: { x: 20, y: 1036, w: 560, h: 76 },
  };
}

export default function DocScan({ progress, content, reduced, near }) {
  const hostRef = useRef(null);
  const wide = useWide(hostRef, 0.95);
  const L = useMemo(() => layoutFor(wide), [wide]);
  const ocrRef = useRef(null);
  const scanRef = useRef(null);
  const boxRefs = useRef([]);
  const jsonRef = useRef(null);
  const lineRefs = useRef([]);
  const checkRef = useRef(null);
  const storeRefs = useRef([]);
  const askRef = useRef(null);
  const askTextRef = useRef(null);
  const answerRef = useRef(null);
  const answerTextRef = useRef(null);

  useTick(
    near,
    () => {
      const p = follow(progress, reduced);
      ocrRef.current.style.opacity = String(band(p, 0.03, 0.07) * (1 - band(p, 0.36, 0.4)));
      const scan = band(p, 0.2, 0.34);
      scanRef.current.style.opacity = scan > 0 && scan < 1 ? "1" : "0";
      scanRef.current.setAttribute("transform", `translate(0 ${scan * DOC.h})`);
      boxRefs.current.forEach((b, i) => {
        if (!b) return;
        b.style.opacity = String(band(p, 0.24 + i * 0.03, 0.28 + i * 0.03));
        b.toggleAttribute("data-hit", i === 2 && p > 0.9);
      });
      jsonRef.current.style.opacity = String(band(p, 0.4, 0.44));
      const lines = band(p, 0.43, 0.58) * content.json.length;
      lineRefs.current.forEach((l, i) => l && (l.style.opacity = String(Math.min(1, Math.max(0, lines - i)))));
      checkRef.current.style.opacity = String(band(p, 0.62, 0.66));
      storeRefs.current.forEach((st, i) => st && (st.style.opacity = String(band(p, 0.66 + i * 0.03, 0.7 + i * 0.03))));
      askRef.current.style.opacity = String(band(p, 0.8, 0.83));
      askTextRef.current.textContent = typed(content.question, band(p, 0.81, 0.88));
      answerRef.current.style.opacity = String(band(p, 0.88, 0.91));
      answerTextRef.current.textContent = typed(content.answer, band(p, 0.89, 0.98));
    },
    [L, content, reduced],
  );

  const { W, H, doc, ocr, json, check, ask, answer } = L;
  // table rows and columns as grey bars, like a real printed document
  const rows = [0, 1, 2, 3, 4];
  const cols = [0, 1, 2, 3];
  return (
    <div ref={hostRef} className={`${s.host} ${s.docscan}`}>
      <svg className={s.svg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        {/* the scanned document, slightly skewed */}
        <g transform={`translate(${doc.x} ${doc.y}) rotate(-2 ${DOC.w / 2} ${DOC.h / 2})`}>
          <rect width={DOC.w} height={DOC.h} fill="#fbf8f1" stroke="rgba(26,22,18,0.25)" />
          <rect width={DOC.w} height={DOC.h} fill="url(#grain)" opacity="0.5" />
          <text x="36" y="66" fontSize="22" fontWeight="700" fill={INK} letterSpacing="2">
            {content.docTitle}
          </text>
          <text x="36" y="92" className={s.monoText} fontSize="12" fill="rgba(26,22,18,.6)">
            {content.docNo}
          </text>
          <rect x="330" y="40" width="54" height="54" fill="none" stroke={INK} strokeWidth="2" />
          <path d="M340 80l14-26 14 26z" fill={INK} opacity="0.75" />
          {rows.map((r) =>
            cols.map((c) => (
              <rect
                key={`${r}-${c}`}
                x={36 + c * 90}
                y={164 + r * 42}
                width={c === 0 ? 70 : 50 + ((r * 7 + c * 13) % 25)}
                height="7"
                fill={r === 0 ? INK : "rgba(26,22,18,0.35)"}
              />
            )),
          )}
          {rows.map((r) => (
            <line key={r} x1="30" x2="390" y1={184 + r * 42} y2={184 + r * 42} stroke="rgba(26,22,18,0.15)" />
          ))}
          {/* handwritten remark */}
          <path d="M44 452c14-18 22 10 34-6s20 8 30-4 22 6 34-6 20 6 30-2" fill="none" stroke="#2d4bd8" strokeWidth="2" strokeLinecap="round" />
          <text x="44" y="438" fontSize="20" fill="#2d4bd8" fontStyle="italic" fontFamily="'Segoe Script','Bradley Hand',cursive">
            {content.note}
          </text>
          {/* customs stamp */}
          <g transform="translate(332 454) rotate(-14)" opacity="0.7">
            <circle r="52" fill="none" stroke="#b3261e" strokeWidth="3" />
            <circle r="40" fill="none" stroke="#b3261e" strokeWidth="1.5" />
            <text textAnchor="middle" y="6" fontSize="16" fontWeight="700" fill="#b3261e" letterSpacing="2">
              DOUANE
            </text>
          </g>
          {[540, 556, 572].map((y, i) => (
            <rect key={y} x="36" y={y} width={[300, 240, 180][i]} height="6" fill="rgba(26,22,18,0.25)" />
          ))}
          {/* what the model sees */}
          {REGIONS.map((r, i) => (
            <g key={i} ref={(el) => (boxRefs.current[i] = el)} className={s.region} style={{ opacity: 0 }}>
              <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="rgba(107,61,240,0.06)" stroke={VIOLET} strokeWidth="2" />
              <rect x={r.x} y={r.y - 22} width={content.regions[i].length * 8.4 + 16} height="22" fill={VIOLET} />
              <text x={r.x + 8} y={r.y - 6} className={s.monoText} fontSize="12" fill="#fff">
                {content.regions[i]}
              </text>
            </g>
          ))}
          <rect ref={scanRef} x="-10" y="0" width={DOC.w + 20} height="3" fill={VIOLET} style={{ opacity: 0 }} />
        </g>
        <defs>
          <pattern id="grain" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.6" fill="rgba(26,22,18,0.25)" />
          </pattern>
        </defs>

        {/* classic OCR: letters without structure */}
        <g ref={ocrRef} style={{ opacity: 0 }}>
          <rect x={ocr.x} y={ocr.y} width={ocr.w} height={ocr.h} fill="#fff" stroke="#b3261e" strokeDasharray="6 5" />
          <foreignObject x={ocr.x} y={ocr.y} width={ocr.w} height={ocr.h}>
            <div className={s.fo}>
              <span className={s.foLabel} style={{ color: "#b3261e", opacity: 1 }}>
                {content.ocrLabel} ✗
              </span>
              <span className={s.ocrText}>{content.ocrText}</span>
            </div>
          </foreignObject>
        </g>

        {/* the model's structured output */}
        <g ref={jsonRef} style={{ opacity: 0 }}>
          <rect x={json.x} y={json.y} width={json.w} height={json.h} fill={INK} />
          <text x={json.x + 20} y={json.y + 30} className={s.monoText} fontSize="12" fill="#b9a6ff">
            {content.vlmLabel} → JSON
          </text>
          {content.json.map((l, i) => (
            <text
              key={i}
              ref={(el) => (lineRefs.current[i] = el)}
              x={json.x + 20}
              y={json.y + 62 + i * (wide ? 30 : 19)}
              className={s.codeText}
              fontSize={wide ? 16 : 13}
              fill="#efe9dc"
              style={{ opacity: 0 }}
            >
              {l.split(/("[^"]*":)/).map((part, k) =>
                /^"[^"]*":$/.test(part) ? (
                  <tspan key={k} fill="#b9a6ff">
                    {part}
                  </tspan>
                ) : (
                  <tspan key={k}>{part}</tspan>
                ),
              )}
            </text>
          ))}
        </g>

        {/* checks and storage */}
        <g ref={checkRef} style={{ opacity: 0 }}>
          <rect x={check.x} y={check.y} width={wide ? 330 : 300} height="40" fill="rgba(18,161,80,0.12)" stroke="#12a150" />
          <text x={check.x + 14} y={check.y + 26} fontSize="15" fontWeight="500" fill={INK}>
            {content.check}
          </text>
        </g>
        {content.stores.map((st, i) => (
          <g key={st} ref={(el) => (storeRefs.current[i] = el)} style={{ opacity: 0 }}>
            <rect x={check.x + (wide ? 350 : 320) + i * 130} y={check.y} width="118" height="40" fill={VIOLET} />
            <text x={check.x + (wide ? 350 : 320) + i * 130 + 59} y={check.y + 26} textAnchor="middle" className={s.monoText} fontSize="13" fill="#fff">
              {st}
            </text>
          </g>
        ))}

        {/* plain-language question and answer */}
        <g ref={askRef} style={{ opacity: 0 }}>
          <rect x={ask.x} y={ask.y} width={ask.w} height={ask.h} fill="#fff" stroke="rgba(26,22,18,0.25)" />
          <foreignObject x={ask.x} y={ask.y} width={ask.w} height={ask.h}>
            <div className={s.foRow}>
              <span className={s.foLabel}>{content.you}</span>
              <span ref={askTextRef} className={s.caret} />
            </div>
          </foreignObject>
        </g>
        <g ref={answerRef} style={{ opacity: 0 }}>
          <rect x={answer.x} y={answer.y} width={answer.w} height={answer.h} fill={VIOLET} />
          <foreignObject x={answer.x} y={answer.y} width={answer.w} height={answer.h}>
            <div className={`${s.foRow} ${s.foLight}`}>
              <span className={s.foLabel}>{content.assistant}</span>
              <span ref={answerTextRef} />
            </div>
          </foreignObject>
        </g>
      </svg>
    </div>
  );
}
