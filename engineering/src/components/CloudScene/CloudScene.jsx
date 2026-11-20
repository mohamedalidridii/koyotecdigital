"use client";

import styles from "./CloudScene.module.css";

import { useEffect, useRef } from "react";

// Lazy WebGL scene: the three.js engine is fetched only when the scene nears the viewport, renders only
// while visible, and draws a single still frame when the visitor prefers reduced motion.
// `labels` is a list of { id, text, accent } placed over the scene at the matching 3D anchor.
export default function CloudScene({ scene, labels = [], getProgress, label }) {
  const rootRef = useRef(null);
  const labelRefs = useRef({});

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    let api = null;
    let cancelled = false;
    let visible = false;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const start = async () => {
      if (api || cancelled) return;
      const { mountScene } = await import("./engine");
      if (cancelled) return;
      api = mountScene(root.querySelector(`.${styles.canvas}`), {
        scene,
        labels: labelRefs.current,
        getProgress,
        still,
      });
      root.classList.add(styles.ready);
      api.setActive(visible);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        api?.setActive(visible);
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(root);

    return () => {
      cancelled = true;
      io.disconnect();
      api?.destroy();
    };
  }, [scene, getProgress]);

  return (
    <div ref={rootRef} className={styles.scene} role="img" aria-label={label}>
      <div className={styles.canvas} />
      {labels.map((l) => (
        <span
          key={l.id}
          ref={(el) => {
            labelRefs.current[l.id] = el;
          }}
          className={`${styles.label}${l.accent ? ` ${styles.accent}` : ""}${l.side === "left" ? ` ${styles.left}` : ""}`}
          data-side={l.side}
          aria-hidden="true"
        >
          <i />
          <span>
            {l.text}
            {l.code ? <em> · {l.code}</em> : null}
          </span>
        </span>
      ))}
    </div>
  );
}
