"use client";
import "./Preloader.css";
import { useEffect, useState, useRef } from "react";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";

import { CARTOUCHE, LETTER, NEEDLE, THREAD, EMBLEM_BOX, LETTERS, WORDMARK_BOX } from "../BrandIcon/paths";
import { LILY, LILY_STAMENS } from "../Botanical/flowers";
import { useDict } from "@/i18n/DictProvider";

gsap.registerPlugin(DrawSVGPlugin);

// Shared status so pages can hold their intro until the curtain lifts
let status = "idle";
const listeners = new Set();

const finish = () => {
  status = "done";
  listeners.forEach((fn) => fn());
  listeners.clear();
};

export function usePreloaderDone() {
  const [done, setDone] = useState(status === "done");
  useEffect(() => {
    if (status === "done") {
      setDone(true);
      return;
    }
    const fn = () => setDone(true);
    listeners.add(fn);
    return () => listeners.delete(fn);
  }, []);
  return done;
}

export default function Preloader() {
  const dict = useDict();
  const [visible, setVisible] = useState(status !== "done");
  const rootRef = useRef(null);
  const counterRef = useRef(null);
  const lenis = useLenis();

  useEffect(() => {
    if (!visible) return;
    lenis?.stop();
    return () => lenis?.start();
  }, [lenis, visible]);

  useGSAP(
    () => {
      if (!visible || status !== "idle") return;
      status = "running";

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        finish();
        setVisible(false);
        return;
      }

      const root = rootRef.current;
      const q = gsap.utils.selector(root);
      const counter = { value: 0 };

      gsap.set(q(".pl-botanical path"), { drawSVG: "0%" });
      gsap.set(q(".pl-emblem path"), { drawSVG: "0%", fillOpacity: 0 });
      gsap.set(q(".pl-wordmark"), { clipPath: "inset(0% 100% 0% 0%)" });

      const tl = gsap.timeline({
        delay: 0.3,
        onComplete: () => setVisible(false),
      });

      tl.to(counter, {
        value: 100,
        duration: 3.6,
        ease: "power2.inOut",
        onUpdate: () => {
          if (counterRef.current) {
            counterRef.current.textContent = String(Math.round(counter.value)).padStart(3, "0");
          }
        },
      })
        .to(q(".pl-lily path"), { drawSVG: "100%", duration: 2.4, stagger: 0.15, ease: "power2.inOut" }, 0)
        .to(q(".pl-botanical"), { rotate: 12, duration: 4, ease: "none" }, 0)
        .to(q(".pl-emblem path"), { drawSVG: "100%", duration: 1.8, stagger: 0.2, ease: "power3.inOut" }, 0.9)
        .to(q(".pl-emblem path"), { fillOpacity: 1, duration: 0.8, ease: "power2.out" }, 2.6)
        .to(q(".pl-emblem"), { "--shine": "120%", duration: 1.2, ease: "power2.inOut" }, 2.8)
        .to(q(".pl-wordmark"), { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power4.inOut" }, 2.7)
        .to(q(".pl-botanical"), { opacity: 0, scale: 1.15, duration: 0.9, ease: "power2.in" }, 3.6)
        .to(q(".pl-meta"), { opacity: 0, duration: 0.4 }, 3.7)
        .to(q(".pl-mark"), { scale: 0.9, opacity: 0, filter: "blur(8px)", duration: 0.7, ease: "power3.in" }, 4.1)
        .add(finish, 4.45)
        .to(q(".pl-panel.top"), { yPercent: -100, duration: 1.2, ease: "power4.inOut" }, 4.4)
        .to(q(".pl-panel.bottom"), { yPercent: 100, duration: 1.2, ease: "power4.inOut" }, 4.4)
        .to(q(".pl-seam"), { scaleX: 1, duration: 0.6, ease: "power3.out" }, 4.1)
        .to(q(".pl-seam"), { opacity: 0, duration: 0.4 }, 4.6);

      // StrictMode re-runs effects: let the second run start over
      return () => {
        if (status === "running") status = "idle";
      };
    },
    { scope: rootRef, dependencies: [visible] }
  );

  if (!visible) return null;

  return (
    <div className="preloader" ref={rootRef} aria-hidden="true">
      <div className="pl-panel top" />
      <div className="pl-panel bottom" />
      <div className="pl-seam" />

      <svg className="pl-botanical" viewBox="0 0 600 600" fill="none">
        <g className="pl-lily">
          <path d={LILY} />
          <path d={LILY_STAMENS} />
        </g>
      </svg>

      <div className="pl-mark">
        <svg className="pl-emblem" viewBox={EMBLEM_BOX}>
          <defs>
            <linearGradient id="pl-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8a6a3b" />
              <stop offset="45%" stopColor="#dcc08a" />
              <stop offset="55%" stopColor="#f6e7c4" />
              <stop offset="100%" stopColor="#b89159" />
            </linearGradient>
          </defs>
          <path d={CARTOUCHE} fillRule="evenodd" />
          <path d={LETTER} />
          <path d={THREAD} fill="none" />
          <path d={NEEDLE} fillRule="evenodd" />
        </svg>
        <svg className="pl-wordmark" viewBox={WORDMARK_BOX}>
          <path d={LETTERS} />
        </svg>
      </div>

      <div className="pl-meta pl-tagline label">{dict.preloader.tagline}</div>
      <div className="pl-meta pl-counter label" ref={counterRef}>
        000
      </div>
    </div>
  );
}
