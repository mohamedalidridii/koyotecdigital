"use client";
import "./LookbookView.css";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";

import LookbookHelix from "../LookbookHelix/LookbookHelix";
import Copy from "../Copy/Copy";
import { usePreloaderDone } from "../Preloader/Preloader";
import { aurele } from "@/data/media";
import { pieces } from "@/data/pieces";
import { useDict, useHref, useT } from "@/i18n/DictProvider";

const LOOKS = aurele.looks;
const pieceFor = (src) => pieces.find((p) => p.images.includes(src));
const pad = (n) => String(n).padStart(2, "0");

// Spiral carousel of the SS27 looks. The look facing the viewer names the
// stage in giant outlined letters; clicking it opens a lightbox.
export default function LookbookView() {
  const dict = useDict();
  const href = useHref();
  const t = useT();
  const [selected, setSelected] = useState(null);
  const [active, setActive] = useState(0);
  // Texture decoding would stutter the preloader: build the scene once its
  // panels have fully cleared (they finish ~1.2s after the done signal)
  const ready = usePreloaderDone();
  const [showHelix, setShowHelix] = useState(false);
  const boxRef = useRef(null);
  const jumpRef = useRef(null);
  const stripRef = useRef(null);
  const boxTl = useRef(null);

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => setShowHelix(true), 1300);
    return () => clearTimeout(timer);
  }, [ready]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    // Opening and closing must never run at the same time
    boxTl.current?.kill();
    if (selected !== null) {
      boxTl.current = gsap
        .timeline()
        .set(box, { pointerEvents: "auto" })
        .to(box.querySelector(".lb-veil"), { opacity: 1, duration: 0.4 })
        .fromTo(
          box.querySelector(".lb-frame"),
          { clipPath: "inset(50% 50% 50% 50%)", scale: 0.8 },
          { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 0.9, ease: "power4.out" },
          "<"
        )
        .fromTo(box.querySelectorAll(".lb-reveal"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.06 }, "-=0.5");
    } else {
      boxTl.current = gsap
        .timeline()
        .to(box.querySelector(".lb-frame"), { clipPath: "inset(50% 50% 50% 50%)", duration: 0.5, ease: "power3.in" })
        .to(box.querySelector(".lb-veil"), { opacity: 0, duration: 0.3 })
        .set(box, { pointerEvents: "none" });
    }
  }, [selected]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Keep the active thumbnail centred in the strip
  useEffect(() => {
    const strip = stripRef.current;
    const thumb = strip?.children[active];
    if (!thumb) return;
    gsap.to(strip, {
      scrollLeft: thumb.offsetLeft - strip.clientWidth / 2 + thumb.clientWidth / 2,
      duration: 0.6,
      ease: "power3.out",
    });
  }, [active]);

  const captionFor = (index) => {
    const piece = pieceFor(LOOKS[index]);
    return piece ? t(piece.name) : dict.lookbook.evening;
  };

  const src = selected !== null ? LOOKS[selected] : null;
  const piece = src ? pieceFor(src) : null;
  const activePiece = pieceFor(LOOKS[active]);

  return (
    <section className="lookbook" data-lenis-prevent>
      <div className="lb-bigtext" aria-hidden="true">
        <span key={active}>
          {activePiece ? t(activePiece.name) : `${dict.lookbook.look} ${pad(active + 1)}`}
        </span>
      </div>

      {showHelix && (
        <LookbookHelix
          images={LOOKS}
          onSelect={setSelected}
          onChange={setActive}
          jumpRef={jumpRef}
          paused={selected !== null}
        />
      )}

      <div className="lb-ui container">
        <div className="lb-head">
          <Copy animateOnScroll={false} delay={0.4}>
            <h1 className="lb-title">
              Lookbook <em>SS27</em>
            </h1>
          </Copy>
          <span className="label lb-hint">{dict.lookbook.hint}</span>
        </div>

        <div className="lb-foot">
          <div className="lb-now">
            <div className="lb-counter">
              <span key={active} className="lb-counter-current">
                {pad(active + 1)}
              </span>
              <span className="lb-counter-total">/ {pad(LOOKS.length)}</span>
            </div>
            <p key={`c-${active}`} className="lb-caption">
              {captionFor(active)}
            </p>
            {activePiece && (
              <Link href={href(`/piece/${activePiece.slug}`)} className="label link-line lb-link">
                {dict.lookbook.open}
              </Link>
            )}
          </div>

          <div className="lb-strip" ref={stripRef}>
            {LOOKS.map((look, i) => (
              <button
                key={look}
                className={`lb-thumb media ${i === active ? "is-active" : ""}`}
                onClick={() => jumpRef.current?.(i)}
                aria-label={`${dict.lookbook.look} ${pad(i + 1)}`}
              >
                <img src={look} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lb-box" ref={boxRef} style={{ pointerEvents: "none" }} aria-hidden={selected === null}>
        <div className="lb-veil" onClick={() => setSelected(null)} />
        <div className="lb-content">
          <div className="lb-frame media">{src && <img key={src} src={src} alt={selected !== null ? captionFor(selected) : ""} decoding="async" />}</div>
          <div className="lb-side">
            <span className="label gold lb-reveal">
              {dict.lookbook.look} {selected !== null ? pad(selected + 1) : ""}
            </span>
            <h3 className="lb-reveal">{selected !== null ? captionFor(selected) : ""}</h3>
            {piece && (
              <Link href={href(`/piece/${piece.slug}`)} className="pill lb-reveal">
                {dict.lookbook.open}
              </Link>
            )}
            <button className="label link-line lb-reveal" onClick={() => setSelected(null)}>
              {dict.nav.close}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
