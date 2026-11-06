"use client";

// Shopping assistant — a storefront in miniature. The need is typed, turned into filter chips,
// the catalogue dims what doesn't fit, re-orders itself (GSAP Flip) and the adviser explains.
import s from "./AiVisual.module.css";

import { useRef } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";

import { band, follow, typed, useTick, useWide } from "@/components/Systems/lib";

gsap.registerPlugin(Flip);

const COLORS = ["#ff5a1f", "#2b4cff", "#12a150", "#0d0d0d", "#e8a317", "#8a8a8a"];

function Tent({ color }) {
  return (
    <svg viewBox="0 0 120 70" aria-hidden="true">
      <path d="M8 62 L60 10 L112 62 Z" fill={color} opacity="0.14" />
      <path d="M8 62 L60 10 L112 62 M60 10 L60 62 M44 62 L60 34 L76 62" fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M2 62 H118" stroke="#0d0d0d" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

export default function ShopDemo({ progress, content, reduced, near }) {
  const hostRef = useRef(null);
  const wide = useWide(hostRef, 1.05);
  const queryRef = useRef(null);
  const chipRefs = useRef([]);
  const gridRef = useRef(null);
  const cardRefs = useRef([]);
  const answerRef = useRef(null);
  const aRef = useRef(null);
  const state = useRef({ ranked: null, filtered: null });

  useTick(
    near,
    () => {
      const p = follow(progress, reduced);
      queryRef.current.textContent = typed(content.query, band(p, 0.02, 0.16));
      chipRefs.current.forEach((c, i) => {
        if (!c) return;
        const k = band(p, 0.22 + i * 0.025, 0.26 + i * 0.025);
        c.style.opacity = String(k);
        c.style.transform = `scale(${0.7 + k * 0.3})`;
      });

      // filtering: what doesn't match fades back
      const filtered = p >= 0.46;
      if (filtered !== state.current.filtered) {
        state.current.filtered = filtered;
        cardRefs.current.forEach((card, i) => card?.toggleAttribute("data-out", filtered && !content.products[i].rank));
      }
      // ranking: the matches move to the front, in order (and back when scrolling up)
      const ranked = p >= 0.62;
      if (ranked !== state.current.ranked) {
        const first = state.current.ranked === null;
        state.current.ranked = ranked;
        const cards = cardRefs.current.filter(Boolean);
        const flip = Flip.getState(cards);
        cards.forEach((card, i) => {
          const r = content.products[i].rank;
          card.style.order = ranked ? String(r ? r : 10 + i) : String(i);
          card.toggleAttribute("data-ranked", ranked && r > 0);
        });
        if (!first && !reduced) Flip.from(flip, { duration: 0.9, ease: "power3.inOut", stagger: 0.03 });
      }

      answerRef.current.style.opacity = String(band(p, 0.8, 0.84));
      answerRef.current.style.transform = `translateY(${(1 - band(p, 0.8, 0.86)) * 14}px)`;
      aRef.current.textContent = typed(content.answer, band(p, 0.83, 0.96));
    },
    [content, reduced],
  );

  return (
    <div ref={hostRef} className={`${s.host} ${s.shop}`} data-wide={wide ? "" : undefined}>
      <div className={s.window}>
        <div className={s.bar}>
          <i />
          <i />
          <i />
          <span>{content.shop}</span>
        </div>
        <div className={s.shopBody}>
          <div className={s.chat}>
            <div className={s.userMsg}>
              <span className={s.who}>{content.you}</span>
              <span ref={queryRef} className={s.caret} />
            </div>
            <div className={s.filters}>
              {content.filters.map((f, i) => (
                <span key={f} ref={(el) => (chipRefs.current[i] = el)} style={{ opacity: 0 }}>
                  {f}
                </span>
              ))}
            </div>
            <div ref={answerRef} className={s.botMsg} style={{ opacity: 0 }}>
              <span className={s.who}>{content.assistant}</span>
              <span ref={aRef} />
            </div>
          </div>
          <div ref={gridRef} className={s.grid}>
            {content.products.map((prod, i) => (
              <div key={prod.name} ref={(el) => (cardRefs.current[i] = el)} className={s.product}>
                <span className={s.rank}>{prod.rank || ""}</span>
                {prod.rank === 1 ? <span className={s.best}>{content.best}</span> : null}
                <Tent color={COLORS[i % COLORS.length]} />
                <span className={s.pname}>{prod.name}</span>
                <span className={s.pmeta}>
                  <b>{prod.price}</b> ★ {prod.rating}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
