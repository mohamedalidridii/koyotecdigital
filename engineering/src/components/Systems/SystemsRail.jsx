"use client";

import styles from "./Systems.module.css";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useLenis } from "lenis/react";

import { useLang } from "@/lib/useLang";

const pad = (n) => String(n).padStart(2, "0");

// fixed progress rail: which field you are in, how far along each one you are
export default function SystemsRail({ store }) {
  const { t } = useLang();
  const chapters = t.systems.chapters;
  const railRef = useRef(null);
  const labelRef = useRef(null);
  const lenis = useLenis();

  useEffect(() => {
    const rail = railRef.current;
    const fills = Array.from(rail.querySelectorAll("[data-fill]"));
    let shown = -2;
    const tick = () => {
      const { active, progress } = store.current;
      fills.forEach((f, i) => f.style.setProperty("--fill", progress[i].toFixed(3)));
      if (active === shown) return;
      shown = active;
      rail.toggleAttribute("data-visible", active >= 0);
      if (active >= 0) {
        const c = chapters[active];
        labelRef.current.textContent = `${pad(active + 1)} / ${pad(chapters.length)} · ${c.discipline} — ${c.code}`;
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [store, chapters]);

  const go = (id) => {
    const el = document.getElementById(id);
    if (el) lenis ? lenis.scrollTo(el, { duration: 1.6 }) : el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav ref={railRef} className={styles.rail} aria-label={t.systems.header.subtitle}>
      <p ref={labelRef} className={`mono sm ${styles.railLabel}`} aria-live="off" />
      <div className={styles.railBars}>
        {chapters.map((c) => (
          <button key={c.id} type="button" className={styles.railBar} onClick={() => go(c.id)} aria-label={c.discipline}>
            <span data-fill />
          </button>
        ))}
      </div>
    </nav>
  );
}
