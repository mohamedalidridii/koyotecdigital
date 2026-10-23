"use client";
import "./Palette.css";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

// Colour story as fabric swatches that rise like curtains and widen on hover.
export default function Palette({ label, swatches }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      gsap.from(".pa-swatch", {
        scaleY: 0,
        duration: 1.4,
        stagger: 0.1,
        ease: "power4.inOut",
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
      });
      gsap.from(".pa-swatch span", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.1,
        delay: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
      });
    },
    { scope: ref }
  );

  return (
    <section className="palette" ref={ref}>
      <div className="container">
        <span className="label gold">{label}</span>
        <div className="pa-row">
          {swatches.map((swatch) => {
            const light = ["#F3ECE0", "#E6DAC6"].includes(swatch.hex);
            return (
              <div
                className={`pa-swatch ${light ? "light" : ""}`}
                key={swatch.hex}
                style={{ background: swatch.hex }}
              >
                <span className="pa-name">{swatch.name}</span>
                <span className="label">{swatch.hex}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
