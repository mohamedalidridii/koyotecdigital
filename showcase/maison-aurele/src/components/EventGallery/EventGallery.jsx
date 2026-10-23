"use client";
import "./EventGallery.css";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import Copy from "../Copy/Copy";

gsap.registerPlugin(ScrollTrigger);

// Three image columns drifting at different speeds around a sticky caption.
export function ParallaxColumns({ label, copy, images }) {
  const ref = useRef(null);
  const columns = [0, 1, 2].map((c) => images.filter((_, i) => i % 3 === c));

  useGSAP(
    () => {
      const speeds = [-10, 8, -16];
      gsap.utils.toArray(".eg-col", ref.current).forEach((col, i) => {
        gsap.fromTo(
          col,
          { yPercent: -speeds[i] / 2 },
          {
            yPercent: speeds[i],
            ease: "none",
            scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      });
    },
    { scope: ref }
  );

  return (
    <section className="eg-columns" ref={ref}>
      <div className="container eg-columns-grid">
        {columns.map((col, c) => (
          <div className="eg-col" key={c}>
            {col.map((src) => (
              <figure className="eg-img media" key={src}>
                <img src={src} alt="" loading="lazy" />
              </figure>
            ))}
          </div>
        ))}
      </div>
      <div className="eg-caption">
        <span className="label gold">{label}</span>
        <Copy>
          <h3>{copy}</h3>
        </Copy>
      </div>
    </section>
  );
}

// Endless ribbon of portraits, slowed when hovered.
export function Ribbon({ label, images }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      const track = ref.current.querySelector(".eg-ribbon-track");
      const loop = gsap.to(track, { xPercent: -50, duration: 60, ease: "none", repeat: -1 });
      const slow = () => gsap.to(loop, { timeScale: 0.2, duration: 0.6 });
      const resume = () => gsap.to(loop, { timeScale: 1, duration: 0.6 });
      track.addEventListener("pointerenter", slow);
      track.addEventListener("pointerleave", resume);
      return () => {
        track.removeEventListener("pointerenter", slow);
        track.removeEventListener("pointerleave", resume);
      };
    },
    { scope: ref }
  );

  return (
    <section className="eg-ribbon" ref={ref}>
      <div className="container">
        <span className="label gold">{label}</span>
      </div>
      <div className="eg-ribbon-track">
        {[...images, ...images].map((src, i) => (
          <figure className="eg-ribbon-img media" key={`${src}-${i}`}>
            <img src={src} alt="" loading="lazy" />
          </figure>
        ))}
      </div>
    </section>
  );
}

// Key figures counting up as they appear.
export function Stats({ items }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      gsap.from(".eg-stat", {
        y: 50,
        opacity: 0,
        stagger: 0.12,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: { trigger: ref.current, start: "top 80%" },
      });
    },
    { scope: ref }
  );

  return (
    <div className="eg-stats container" ref={ref}>
      {items.map((item) => (
        <div className="eg-stat" key={item.label}>
          <span className="eg-stat-value">{item.value}</span>
          <span className="label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
