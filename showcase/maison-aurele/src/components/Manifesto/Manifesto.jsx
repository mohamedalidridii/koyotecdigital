"use client";
import "./Manifesto.css";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { Emblem } from "../BrandIcon/BrandIcon";

gsap.registerPlugin(ScrollTrigger);

// Large statement whose words light up as you scroll; small image "jewels"
// open inline between words at the given positions.
export default function Manifesto({ label, text, images = [], at = [] }) {
  const ref = useRef(null);
  const words = text.split(" ");

  useGSAP(
    () => {
      const q = gsap.utils.selector(ref);
      const tl = gsap.timeline({
        scrollTrigger: { trigger: q(".manifesto-text")[0], start: "top 75%", end: "bottom 45%", scrub: 0.6 },
      });
      tl.fromTo(q(".mf-word"), { opacity: 0.12 }, { opacity: 1, stagger: 0.1, ease: "none" }, 0).fromTo(
        q(".mf-img"),
        { width: 0 },
        { width: "1.9em", stagger: 0.6, ease: "power2.out", duration: 1.2 },
        0.4
      );

      gsap.fromTo(
        q(".manifesto-emblem"),
        { rotate: -25, scale: 0.6, opacity: 0 },
        {
          rotate: 0,
          scale: 1,
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top 80%", end: "top 30%", scrub: 1 },
        }
      );
    },
    { scope: ref, dependencies: [text] }
  );

  return (
    <section className="manifesto" ref={ref}>
      <div className="container">
        <div className="manifesto-head">
          <span className="label gold">{label}</span>
          <span className="manifesto-emblem">
            <Emblem />
          </span>
        </div>
        <h3 className="manifesto-text">
          {words.map((word, i) => {
            const imgIndex = at.indexOf(i);
            return (
              <span key={i}>
                {imgIndex >= 0 && images[imgIndex] && (
                  <span className="mf-img media" aria-hidden="true">
                    <img src={images[imgIndex]} alt="" />
                  </span>
                )}
                <span className="mf-word">{word}</span>{" "}
              </span>
            );
          })}
        </h3>
      </div>
    </section>
  );
}
