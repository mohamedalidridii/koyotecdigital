"use client";
import "./PageHero.css";
import { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { usePreloaderDone } from "../Preloader/Preloader";

gsap.registerPlugin(SplitText, ScrollTrigger);

// Inner-page opener: eyebrow, large serif title rising letter by letter,
// and a wide image unveiled from its centre then drifting on scroll.
export default function PageHero({ eyebrow, title, intro, image, meta, dark = false, children }) {
  const ref = useRef(null);
  const ready = usePreloaderDone();

  useGSAP(
    () => {
      const q = gsap.utils.selector(ref);
      const split = SplitText.create(q(".ph-title"), { type: "words,chars", mask: "words" });
      gsap.set(split.chars, { yPercent: 110 });
      gsap.set(q(".ph-fade"), { opacity: 0, y: 16 });
      gsap.set(q(".ph-media"), { clipPath: "inset(18% 30% 18% 30%)" });

      if (q(".ph-media img")[0]) {
        gsap.fromTo(
          q(".ph-media img"),
          { yPercent: -6 },
          {
            yPercent: 10,
            ease: "none",
            scrollTrigger: { trigger: q(".ph-media")[0], start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      }

      if (!ready) return () => split.revert();

      gsap
        .timeline({ delay: 0.2 })
        .to(split.chars, { yPercent: 0, duration: 1.2, stagger: 0.022, ease: "power4.out" })
        .to(q(".ph-fade"), { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "power3.out" }, 0.4)
        .to(q(".ph-media"), { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "power4.inOut" }, 0.3)
        .fromTo(q(".ph-media img"), { scale: 1.35 }, { scale: 1, duration: 2.2, ease: "power3.out" }, 0.3);

      return () => split.revert();
    },
    { scope: ref, dependencies: [ready, title] }
  );

  return (
    <section className={`page-hero ${dark ? "dark" : ""}`} ref={ref}>
      <div className="container ph-head">
        <div className="ph-top">
          <span className="label gold ph-fade">{eyebrow}</span>
          {meta && <span className="label ph-fade">{meta}</span>}
        </div>
        <h1 className="ph-title">{title}</h1>
        {intro && <p className="lead ph-intro ph-fade">{intro}</p>}
        {children}
      </div>
      {image && (
        <div className="ph-media media">
          <img src={image} alt="" fetchPriority="high" />
        </div>
      )}
    </section>
  );
}
