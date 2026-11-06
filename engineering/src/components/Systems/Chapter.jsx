"use client";

import styles from "./Systems.module.css";

import { useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import Copy from "@/components/Copy";

import { useLang } from "@/lib/useLang";
import { clamp, useNear, useReducedMotion } from "./lib";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// one visual per field, loaded on demand (three.js stays out of the first bundle)
const VISUALS = {
  ia: dynamic(() => import("./visuals/RagScene"), { ssr: false }),
  devops: dynamic(() => import("./visuals/PipelineSketch"), { ssr: false }),
  cloud: dynamic(() => import("./visuals/CloudScene"), { ssr: false }),
  security: dynamic(() => import("./visuals/RadarScene"), { ssr: false }),
  data: dynamic(() => import("./visuals/DataSketch"), { ssr: false }),
};

const pad = (n) => String(n).padStart(2, "0");

export default function Chapter({ chapter, index, total, store }) {
  const { t, href } = useLang();
  const L = t.systems.labels;
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const stepsRef = useRef(null);
  const progress = useRef({ target: 0, value: 0 });
  const reduced = useReducedMotion();
  const near = useNear(sectionRef, "80% 0px");
  const Visual = VISUALS[chapter.id];
  const n = chapter.steps.length;

  useGSAP(
    () => {
      const items = Array.from(stepsRef.current.children);
      const update = (p) => {
        progress.current.target = p;
        store.current.progress[index] = p;
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
      // the rail follows whichever chapter holds the middle of the screen
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 50%",
        end: "bottom 50%",
        onToggle: (st) => {
          if (st.isActive) store.current.active = index;
          else if (store.current.active === index) store.current.active = -1;
        },
      });
      // the field's name rises letter by letter
      const word = sectionRef.current.querySelector(`.${styles.disciplineWord}`);
      gsap.from(word, {
        yPercent: 110,
        duration: 1.3,
        ease: "power4.out",
        scrollTrigger: { trigger: word, start: "top 92%", once: true },
      });
    },
    { scope: sectionRef, dependencies: [] },
  );

  return (
    <section ref={sectionRef} id={chapter.id} className={styles.chapter} data-theme={chapter.id}>
      <header className={`container ${styles.opening}`}>
        <div className={styles.openingTop}>
          <p className="mono sm">
            {L.project} {pad(index + 1)} / {pad(total)}
          </p>
          <p className="mono sm">« {chapter.code} »</p>
        </div>
        <h2 className={styles.discipline}>
          <span className={styles.disciplineWord}>{chapter.discipline}</span>
        </h2>
        <div className={styles.openingGrid}>
          <Copy>
            <h3 className={styles.chapterTitle}>{chapter.title}</h3>
          </Copy>
          <dl className={styles.brief}>
            <div>
              <dt className="mono sm">{L.forWho}</dt>
              <Copy>
                <dd>{chapter.forWho}</dd>
              </Copy>
            </div>
            <div>
              <dt className="mono sm">{L.problem}</dt>
              <Copy>
                <dd>{chapter.problem}</dd>
              </Copy>
            </div>
          </dl>
        </div>
      </header>

      <div ref={stageRef} className={styles.stage} style={{ "--steps": n }}>
        <div className={styles.stageInner}>
          <div className={styles.side}>
            <p className={`mono sm ${styles.sideLabel}`}>
              <span className={styles.dot} aria-hidden="true" />
              {L.build}
            </p>
            <ol ref={stepsRef} className={styles.steps}>
              {chapter.steps.map(([title, text], i) => (
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
          <div className={styles.visual} data-visual={chapter.id}>
            <Visual progress={progress} content={chapter.visual} reduced={reduced} near={near} />
          </div>
        </div>
      </div>

      <footer className={`container ${styles.outro}`}>
        <p className={`mono sm ${styles.outroLabel}`}>
          <span className={styles.dot} aria-hidden="true" />
          {L.outcomes}
        </p>
        <ul className={styles.outcomes}>
          {chapter.outcomes.map(([big, small]) => (
            <li key={big}>
              <Copy>
                <p className={styles.outcomeBig}>{big}</p>
              </Copy>
              <p className={styles.outcomeSmall}>{small}</p>
            </li>
          ))}
        </ul>
        <div className={styles.outroFoot}>
          <div className={styles.meta}>
            <p className="mono sm">{L.stack}</p>
            <ul className={styles.chips}>
              {chapter.stack.map((s) => (
                <li key={s} className="mono sm">
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.meta}>
            <p className="mono sm">{L.timeline}</p>
            <p className={styles.timeline}>{chapter.timeline}</p>
          </div>
          <Link href={href("/contact")} className={styles.cta}>
            <span>{L.cta}</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </footer>
    </section>
  );
}
