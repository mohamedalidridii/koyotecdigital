"use client";
import "./Pillars.css";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

// Sticky cards that stack: each new card slides over the previous one,
// which recedes and dims like a page turned in a lookbook.
export default function Pillars({ label, items, images }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray(".pl-card", ref.current);
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        gsap.to(card.querySelector(".pl-card-inner"), {
          scale: 0.9,
          filter: "brightness(0.55)",
          rotate: i % 2 ? 1.5 : -1.5,
          ease: "none",
          scrollTrigger: { trigger: next, start: "top bottom", end: "top 12%", scrub: true },
        });
      });
    },
    { scope: ref }
  );

  return (
    <section className="pillars" ref={ref}>
      <div className="container">
        <span className="label gold pl-label">{label}</span>
        {items.map((item, i) => (
          <article className="pl-card" key={item.title} style={{ "--i": i }}>
            <div className="pl-card-inner">
              <div className="pl-card-text">
                <span className="pl-num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <p className="lead">{item.copy}</p>
              </div>
              <div className="pl-card-media media">
                <img src={images[i % images.length]} alt="" loading="lazy" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
