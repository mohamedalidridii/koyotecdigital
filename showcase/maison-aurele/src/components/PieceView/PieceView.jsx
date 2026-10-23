"use client";
import "./PieceView.css";
import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { usePreloaderDone } from "../Preloader/Preloader";
import { useSelectionStore } from "@/store/selectionStore";
import { useDict, useHref, useT } from "@/i18n/DictProvider";

gsap.registerPlugin(SplitText, ScrollTrigger);

// Product page: sticky details beside a column of images. A minimap tracks
// which image is in view; each image unveils as it arrives.
export default function PieceView({ piece, index, total }) {
  const dict = useDict();
  const href = useHref();
  const t = useT();
  const ready = usePreloaderDone();
  const ref = useRef(null);

  const add = useSelectionStore((s) => s.add);
  const open = useSelectionStore((s) => s.open);
  const selected = useSelectionStore((s) => s.slugs.includes(piece.slug));

  useGSAP(
    () => {
      const q = gsap.utils.selector(ref);
      const split = SplitText.create(q(".pv-title"), { type: "words,chars", mask: "words" });
      gsap.set(split.chars, { yPercent: 110 });
      gsap.set(q(".pv-fade"), { opacity: 0, y: 20 });

      q(".pv-image").forEach((frame, i) => {
        if (i === 0) return;
        gsap.fromTo(
          frame,
          { clipPath: "inset(12% 12% 12% 12%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: { trigger: frame, start: "top bottom", end: "top 30%", scrub: true },
          }
        );
        gsap.fromTo(
          frame.querySelector("img"),
          { scale: 1.25 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: frame, start: "top bottom", end: "top 30%", scrub: true },
          }
        );
      });

      q(".pv-image").forEach((frame, i) => {
        ScrollTrigger.create({
          trigger: frame,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) =>
            self.isActive && q(".pv-mini").forEach((m, j) => m.classList.toggle("is-active", i === j)),
        });
      });

      if (!ready) return () => split.revert();

      gsap
        .timeline({ delay: 0.15 })
        .fromTo(q(".pv-image")[0], { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power4.inOut" })
        .fromTo(q(".pv-image img")[0], { scale: 1.4 }, { scale: 1, duration: 2, ease: "power3.out" }, 0)
        .to(split.chars, { yPercent: 0, duration: 1.1, stagger: 0.02, ease: "power4.out" }, 0.3)
        .to(q(".pv-fade"), { opacity: 1, y: 0, stagger: 0.06, duration: 0.7, ease: "power3.out" }, 0.6);

      return () => split.revert();
    },
    { scope: ref, dependencies: [ready, piece.slug] }
  );

  const scrollToImage = (i) => {
    const target = ref.current.querySelectorAll(".pv-image")[i];
    if (target) window.scrollTo({ top: target.offsetTop - 80, behavior: "smooth" });
  };

  return (
    <section className="piece-view" ref={ref}>
      <div className="container pv-grid">
        <aside className="pv-info">
          <div className="pv-info-inner">
            <Link href={href("/collections")} className="label link-line pv-fade">
              ← {dict.common.back}
            </Link>
            <span className="label gold pv-fade">
              SS27 — {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            <h1 className="pv-title">{t(piece.name)}</h1>
            <span className="label pv-fade pv-price">{dict.common.priceOnRequest}</span>
            <p className="lead pv-fade">{t(piece.description)}</p>

            <dl className="pv-specs pv-fade">
              <div>
                <dt className="label">{dict.piece.material}</dt>
                <dd>{t(piece.material)}</dd>
              </div>
              <div>
                <dt className="label">{dict.piece.colour}</dt>
                <dd>{t(piece.colour)}</dd>
              </div>
            </dl>

            <div className="pv-actions pv-fade">
              <button className={`pill ${selected ? "" : "solid"}`} onClick={() => (selected ? open() : add(piece.slug))}>
                {selected ? `✓ ${dict.common.added}` : dict.common.addToSelection}
              </button>
              <Link href={href("/contact")} className="pill">
                {dict.piece.appointment}
              </Link>
            </div>

            <div className="pv-service pv-fade">
              <span className="label gold">{dict.piece.service}</span>
              <p>{dict.piece.serviceCopy}</p>
            </div>
          </div>
        </aside>

        <div className="pv-images">
          {piece.images.map((src, i) => (
            <figure className="pv-image media" key={src}>
              <img src={src} alt={i === 0 ? t(piece.name) : ""} loading={i ? "lazy" : undefined} />
            </figure>
          ))}
        </div>

        {piece.images.length > 1 && (
          <nav className="pv-minimap" aria-label="Images">
            {piece.images.map((src, i) => (
              <button
                key={src}
                className={`pv-mini media ${i === 0 ? "is-active" : ""}`}
                onClick={() => scrollToImage(i)}
                aria-label={`${i + 1}`}
              >
                <img src={src} alt="" loading="lazy" />
              </button>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}
