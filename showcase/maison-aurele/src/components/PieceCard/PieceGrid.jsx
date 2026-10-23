"use client";
import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import "./PieceCard.css";
import PieceCard from "./PieceCard";
import Copy from "../Copy/Copy";
import { pieces as allPieces } from "@/data/pieces";
import { useDict, useHref } from "@/i18n/DictProvider";

gsap.registerPlugin(ScrollTrigger);

export default function PieceGrid({ label, title, slugs, showLink = true }) {
  const dict = useDict();
  const href = useHref();
  const ref = useRef(null);
  const list = slugs ? slugs.map((s) => allPieces.find((p) => p.slug === s)).filter(Boolean) : allPieces;

  useGSAP(
    () => {
      gsap.from(".piece-card", {
        y: 80,
        opacity: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: "power4.out",
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
      });
    },
    { scope: ref, dependencies: [slugs?.join("|")] }
  );

  return (
    <section className="piece-grid" ref={ref}>
      <div className="container">
        <div className="pg-head">
          <div>
            <span className="label gold">{label}</span>
            <Copy>
              <h2>{title}</h2>
            </Copy>
          </div>
          {showLink && (
            <Link href={href("/collections")} className="label link-line">
              {dict.common.viewAll}
            </Link>
          )}
        </div>
        <div className="pg-list">
          {list.map((piece) => (
            <PieceCard key={piece.slug} piece={piece} index={allPieces.indexOf(piece) + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
