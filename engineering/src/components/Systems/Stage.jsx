"use client";

// The pinned stage shared by the Systems chapters and the AI case studies: the steps on the left
// light up one by one while the visual on the right builds itself from the same scroll progress.
// Colours come from the --bg/--fg/--dim/--line/--accent variables of the surrounding theme.
import styles from "./Systems.module.css";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { clamp, useNear, useReducedMotion } from "./lib";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const pad = (n) => String(n).padStart(2, "0");

export default function Stage({ id, label, steps, Visual, content, onProgress }) {
  const stageRef = useRef(null);
  const stepsRef = useRef(null);
  const progress = useRef({ target: 0, value: 0 });
  const reduced = useReducedMotion();
  const near = useNear(stageRef, "80% 0px");
  const n = steps.length;

  useGSAP(
    () => {
      const items = Array.from(stepsRef.current.children);
      const update = (p) => {
        progress.current.target = p;
        onProgress?.(p);
        const active = Math.min(n - 1, Math.floor(p * n));
        items.forEach((li, i) => {
          li.toggleAttribute("data-active", i === active);
          li.toggleAttribute("data-done", i < active);
          li.style.setProperty("--fill", clamp(p * n - i).toFixed(3));
        });
      };
      update(0);
      ScrollTrigger.create({
        trigger: stageRef.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (st) => update(st.progress),
        onRefresh: (st) => update(st.progress),
      });
    },
    { scope: stageRef, dependencies: [] },
  );

  return (
    <div ref={stageRef} className={styles.stage} style={{ "--steps": n }}>
      <div className={styles.stageInner}>
        <div className={styles.side}>
          <p className={`mono sm ${styles.sideLabel}`}>
            <span className={styles.dot} aria-hidden="true" />
            {label}
          </p>
          <ol ref={stepsRef} className={styles.steps}>
            {steps.map(([title, text], i) => (
              <li key={title} className={styles.step}>
                <span className={`mono sm ${styles.stepNum}`}>{pad(i + 1)}</span>
                <div>
                  <p className={styles.stepTitle}>{title}</p>
                  <p className={styles.stepText}>{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className={styles.visual} data-visual={id}>
          <Visual progress={progress} content={content} reduced={reduced} near={near} />
        </div>
      </div>
    </div>
  );
}
