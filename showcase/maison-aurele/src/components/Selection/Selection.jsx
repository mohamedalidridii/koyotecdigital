"use client";
import "./Selection.css";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { useLenis } from "lenis/react";
import gsap from "gsap";

import { useSelectionStore } from "@/store/selectionStore";
import { getPiece } from "@/data/pieces";
import { site } from "@/data/site";
import { useDict, useHref, useT } from "@/i18n/DictProvider";

export default function Selection() {
  const dict = useDict();
  const href = useHref();
  const t = useT();
  const lenis = useLenis();

  const slugs = useSelectionStore((s) => s.slugs);
  const isOpen = useSelectionStore((s) => s.isOpen);
  const close = useSelectionStore((s) => s.close);
  const remove = useSelectionStore((s) => s.remove);

  const rootRef = useRef(null);
  const items = slugs.map(getPiece).filter(Boolean);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const panel = root.querySelector(".selection-panel");
    const veil = root.querySelector(".selection-veil");
    const rows = root.querySelectorAll(".selection-reveal");

    if (isOpen) {
      lenis?.stop();
      root.style.pointerEvents = "auto";
      gsap
        .timeline()
        .to(veil, { opacity: 1, duration: 0.5, ease: "power2.out" })
        .fromTo(panel, { x: "100%" }, { x: "0%", duration: 0.9, ease: "power4.out" }, "<")
        .fromTo(
          rows,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.06, duration: 0.7, ease: "power3.out" },
          "-=0.55"
        );
    } else {
      lenis?.start();
      gsap
        .timeline({ onComplete: () => (root.style.pointerEvents = "none") })
        .to(panel, { x: "100%", duration: 0.6, ease: "power3.in" })
        .to(veil, { opacity: 0, duration: 0.4 }, "-=0.3");
    }
  }, [isOpen, lenis]);

  useEffect(() => {
    useSelectionStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const mailto = () => {
    const lines = items.map((piece) => `— ${t(piece.name)}`).join("\n");
    const body = `${dict.selection.note}\n\n${lines}\n`;
    return `mailto:${site.email}?subject=${encodeURIComponent(dict.selection.subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="selection" ref={rootRef} style={{ pointerEvents: "none" }} aria-hidden={!isOpen}>
      <div className="selection-veil" onClick={close} />
      <aside className="selection-panel" data-lenis-prevent>
        <header className="selection-header selection-reveal">
          <h3>{dict.selection.title}</h3>
          <button className="label link-line" onClick={close}>
            {dict.nav.close}
          </button>
        </header>

        <div className="selection-items">
          {items.length === 0 ? (
            <div className="selection-empty selection-reveal">
              <p className="lead">{dict.selection.empty}</p>
              <Link href={href("/collections")} className="pill" onClick={close}>
                {dict.selection.emptyCta}
              </Link>
            </div>
          ) : (
            items.map((piece, i) => (
              <div className="selection-item selection-reveal" key={piece.slug}>
                <Link href={href(`/piece/${piece.slug}`)} className="selection-item-img media" onClick={close}>
                  <img src={piece.images[0]} alt={t(piece.name)} />
                </Link>
                <div className="selection-item-info">
                  <span className="label gold">{String(i + 1).padStart(2, "0")}</span>
                  <h5>{t(piece.name)}</h5>
                  <p className="label">{t(piece.colour)}</p>
                  <button className="label link-line" onClick={() => remove(piece.slug)}>
                    {dict.selection.remove}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <footer className="selection-footer selection-reveal">
            <p>{dict.selection.note}</p>
            <a href={mailto()} className="pill solid">
              {dict.selection.request}
            </a>
          </footer>
        )}
      </aside>
    </div>
  );
}
