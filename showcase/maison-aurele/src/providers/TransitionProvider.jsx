"use client";
import { useRef } from "react";

import { TransitionRouter } from "next-transition-router";
import gsap from "gsap";

import { Emblem } from "@/components/BrandIcon/BrandIcon";

// Theatre curtain: two velvet-black panels close on a gold seam, the emblem
// glints, then the panels draw back on the new page.
export default function TransitionProvider({ children }) {
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const seamRef = useRef(null);
  const emblemRef = useRef(null);

  return (
    <TransitionRouter
      auto
      leave={(next) => {
        const tl = gsap
          .timeline({ onComplete: next })
          .set([leftRef.current, rightRef.current], { scaleX: 0 })
          .to([leftRef.current, rightRef.current], {
            scaleX: 1,
            duration: 0.8,
            ease: "power4.inOut",
          })
          .to(seamRef.current, { scaleY: 1, opacity: 1, duration: 0.5, ease: "power3.out" }, "-=0.25")
          .fromTo(
            emblemRef.current,
            { opacity: 0, scale: 0.85, filter: "blur(6px)" },
            { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.5, ease: "power3.out" },
            "<"
          );
        return () => tl.kill();
      }}
      enter={(next) => {
        const tl = gsap
          .timeline({ onComplete: next, delay: 0.15 })
          .to(emblemRef.current, { opacity: 0, scale: 1.1, duration: 0.4, ease: "power2.in" })
          .to(seamRef.current, { opacity: 0, duration: 0.3 }, "<")
          .to(
            [leftRef.current, rightRef.current],
            { scaleX: 0, duration: 0.9, ease: "power4.inOut" },
            "-=0.1"
          )
          .set(seamRef.current, { scaleY: 0 });
        return () => tl.kill();
      }}
    >
      <div className="curtain" aria-hidden="true">
        <div className="curtain-panel left" ref={leftRef} />
        <div className="curtain-panel right" ref={rightRef} />
        <div className="curtain-seam" ref={seamRef} />
        <div className="curtain-emblem" ref={emblemRef}>
          <Emblem />
        </div>
      </div>
      {children}
    </TransitionRouter>
  );
}
