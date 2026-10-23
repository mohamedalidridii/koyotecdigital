"use client";
import "./PieceCard.css";
import Link from "next/link";

import { useSelectionStore } from "@/store/selectionStore";
import { useDict, useHref, useT } from "@/i18n/DictProvider";

export default function PieceCard({ piece, index }) {
  const dict = useDict();
  const href = useHref();
  const t = useT();
  const add = useSelectionStore((s) => s.add);
  const open = useSelectionStore((s) => s.open);
  const selected = useSelectionStore((s) => s.slugs.includes(piece.slug));
  const [first, second] = piece.images;

  return (
    <article className="piece-card">
      <Link href={href(`/piece/${piece.slug}`)} className="pc-media media" data-cursor={dict.common.discover}>
        <img src={first} alt={t(piece.name)} loading="lazy" className="pc-img" />
        {second && <img src={second} alt="" loading="lazy" className="pc-img pc-img-alt" aria-hidden="true" />}
        {index !== undefined && <span className="label pc-index">{String(index).padStart(2, "0")}</span>}
      </Link>
      <div className="pc-info">
        <div>
          <h5>{t(piece.name)}</h5>
          <p className="label pc-meta">{t(piece.colour)}</p>
        </div>
        <button
          className={`pc-add ${selected ? "is-selected" : ""}`}
          onClick={() => (selected ? open() : add(piece.slug))}
          aria-label={selected ? dict.common.added : dict.common.addToSelection}
          title={selected ? dict.common.added : dict.common.addToSelection}
        >
          <span />
          <span />
        </button>
      </div>
    </article>
  );
}
