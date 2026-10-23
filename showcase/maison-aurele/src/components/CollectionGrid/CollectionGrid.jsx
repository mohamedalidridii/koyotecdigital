"use client";
import "./CollectionGrid.css";
import { useRef, useState, useLayoutEffect } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import PieceCard from "../PieceCard/PieceCard";
import "../PieceCard/PieceCard.css";
import { pieces, categories } from "@/data/pieces";
import { useDict } from "@/i18n/DictProvider";

gsap.registerPlugin(Flip, ScrollTrigger);

// Filterable wardrobe. Cards re-flow with Flip; leaving cards fold away.
export default function CollectionGrid() {
  const dict = useDict();
  const [filter, setFilter] = useState("all");
  const gridRef = useRef(null);
  const flipState = useRef(null);

  const select = (next) => {
    if (next === filter) return;
    flipState.current = Flip.getState(gridRef.current.querySelectorAll(".cg-cell"));
    setFilter(next);
  };

  useLayoutEffect(() => {
    if (!flipState.current) return;
    Flip.from(flipState.current, {
      duration: 0.9,
      ease: "power3.inOut",
      stagger: 0.03,
      absolute: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.3 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.9, duration: 0.4 }),
      onComplete: () => ScrollTrigger.refresh(),
    });
    flipState.current = null;
  }, [filter]);

  const visible = (piece) => filter === "all" || piece.category === filter;

  return (
    <section className="collection-grid">
      <div className="container">
        <div className="cg-filters" role="tablist">
          {categories.map((cat) => {
            const count = cat === "all" ? pieces.length : pieces.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                role="tab"
                aria-selected={filter === cat}
                className={`cg-filter ${filter === cat ? "is-active" : ""}`}
                onClick={() => select(cat)}
              >
                {dict.collections.filters[cat]}
                <sup className="label">{String(count).padStart(2, "0")}</sup>
              </button>
            );
          })}
        </div>

        <div className="cg-list" ref={gridRef}>
          {(() => {
            let shown = 0;
            return pieces.map((piece, i) => {
              const isVisible = visible(piece);
              // Every 5th visible card spans two columns (editorial rhythm)
              const wide = isVisible && shown++ % 5 === 0;
              return (
                <div
                  className={`cg-cell ${wide ? "wide" : ""}`}
                  key={piece.slug}
                  data-flip-id={piece.slug}
                  style={{ display: isVisible ? "" : "none" }}
                >
                  <PieceCard piece={piece} index={i + 1} />
                </div>
              );
            });
          })()}
        </div>
      </div>
    </section>
  );
}
