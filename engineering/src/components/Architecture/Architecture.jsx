"use client";

// /architecture: a reference cloud platform as an explorable, dithered 3D stack.
// The section is tall and its stage sticky: scrolling assembles, explodes and visits each layer
// (scene.js reads the progress every frame), while this component keeps the overlay in step:
// the title, the layer rail, the layer panel, the hovered block's tooltip and the closing CTA.
import styles from "./Architecture.module.css";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";

import Button from "@/components/Button";
import { useLang } from "@/lib/useLang";
import { band, clamp, useNear, useReducedMotion } from "@/components/Systems/lib";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const pad = (n) => String(n).padStart(2, "0");
// the same split of the scroll as scene.js
const LAYER_START = 0.2;
const LAYER_SPAN = 0.68;
function layerAt(p, count) {
  const k = clamp((p - LAYER_START) / LAYER_SPAN, 0, 0.9999) * count;
  const i = Math.floor(k);
  return Math.round(clamp(i + band(k - i, 0.72, 1), 0, count - 1));
}
const phaseAt = (p) => (p < 0.14 ? "intro" : p >= 0.9 ? "outro" : "layers");

export default function Architecture() {
  const { t, href } = useLang();
  const c = t.architecture;
  const layers = c.layers;
  const blocks = useMemo(() => layers.flatMap((l, li) => l.blocks.map((b) => ({ ...b, layer: li }))), [layers]);

  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const tipRef = useRef(null);
  const store = useRef({ p: { target: 0, value: 0 }, selected: -1 });
  const [phase, setPhase] = useState("intro");
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(-1);
  const [picked, setPicked] = useState(-1);
  const [noGl, setNoGl] = useState(false);
  const [touch, setTouch] = useState(false);
  const reduced = useReducedMotion();
  const near = useNear(sectionRef, "30% 0px");
  const lenis = useLenis();

  useEffect(() => setTouch(!window.matchMedia("(hover: hover) and (pointer: fine)").matches), []);

  // scroll -> progress (read by the scene) and the overlay state
  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (st) => {
          store.current.p.target = st.progress;
          sectionRef.current?.style.setProperty("--p", st.progress.toFixed(4));
          setPhase(phaseAt(st.progress));
          setActive(layerAt(st.progress, layers.length));
        },
      });
    },
    { scope: sectionRef, dependencies: [layers.length] },
  );

  // the WebGL stage lives only while the section is near the viewport
  useEffect(() => {
    if (!near || !stageRef.current) return;
    const ok = (() => {
      try {
        const cv = document.createElement("canvas");
        return Boolean(cv.getContext("webgl2"));
      } catch {
        return false;
      }
    })();
    if (!ok) {
      setNoGl(true);
      return;
    }
    let dispose = null;
    let cancelled = false;
    import("./scene")
      .then(({ createArchitectureScene }) =>
        createArchitectureScene(stageRef.current, {
          store: store.current,
          blocksPerLayer: layers.map((l) => l.blocks.length),
          mobile: window.innerWidth < 700,
          reduced,
          tip: tipRef,
          onHover: setHovered,
          onPick: (i) => {
            store.current.selected = i;
            setPicked(i);
          },
        }),
      )
      .then((d) => {
        if (cancelled) d();
        else dispose = d;
      })
      .catch(() => setNoGl(true));
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [near, reduced, layers]);

  // a picked block belongs to one layer: forget it when the camera moves on
  useEffect(() => {
    if (picked >= 0 && blocks[picked].layer !== active) {
      store.current.selected = -1;
      setPicked(-1);
    }
  }, [active, picked, blocks]);

  // jump to a layer from the rail
  const goTo = (i) => {
    const el = sectionRef.current;
    if (!el) return;
    const travel = el.offsetHeight - window.innerHeight;
    const p = LAYER_START + ((i + 0.4) / layers.length) * LAYER_SPAN;
    const y = el.getBoundingClientRect().top + window.scrollY + travel * p;
    if (lenis) lenis.scrollTo(y, { duration: 1.4 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  const layer = layers[active];
  const tipBlock = hovered >= 0 ? blocks[hovered] : null;
  const pickedBlock = picked >= 0 ? blocks[picked] : null;

  return (
    <section ref={sectionRef} className={`${styles.section} ${noGl ? styles.noGl : ""}`} data-phase={phase}>
      <div className={styles.sticky}>
        <div ref={stageRef} className={styles.stage} aria-hidden="true" />

        {/* intro: the page title */}
        <div className={styles.intro}>
          <p className="mono sm">
            <span className={styles.dot} /> {c.kicker}
          </p>
          <h1 className={styles.title}>{c.title}</h1>
          <p className={styles.lead}>{c.lead}</p>
          <p className={`mono sm ${styles.hint}`}>{touch ? c.hintTouch : c.hint}</p>
        </div>

        {/* rail: the five layers, top of the stack first */}
        <nav className={styles.rail} aria-label={c.layerLabel}>
          <ol>
            {layers
              .map((l, i) => ({ l, i }))
              .reverse()
              .map(({ l, i }) => (
                <li key={l.id}>
                  <button type="button" className={i === active ? styles.railOn : ""} onClick={() => goTo(i)}>
                    <span className="mono sm">{pad(i + 1)}</span>
                    <span>{l.name}</span>
                  </button>
                </li>
              ))}
          </ol>
        </nav>

        {/* panel: the layer in focus, and the block picked on it */}
        <aside className={styles.panel} aria-live="polite">
          <div key={layer.id} className={styles.panelIn}>
            <p className="mono sm">
              {c.layerLabel} {pad(active + 1)} / {pad(layers.length)} · {layer.kicker}
            </p>
            <h2 className={styles.layerName}>{layer.name}</h2>
            <dl className={styles.facts}>
              <dt className="mono sm">{c.whatLabel}</dt>
              <dd>{layer.what}</dd>
              <dt className="mono sm">{c.howLabel}</dt>
              <dd>{layer.how}</dd>
            </dl>
            <p className={`mono sm ${styles.toolsLabel}`}>{c.toolsLabel}</p>
            <ul className={styles.tools}>
              {layer.tools.map((tool) => (
                <li key={tool}>{tool}</li>
              ))}
            </ul>
            <div className={styles.picked}>
              {pickedBlock ? (
                <div key={pickedBlock.id} className={styles.pickedIn}>
                  <p className="mono sm">
                    <span className={styles.dot} /> {c.blockLabel}
                  </p>
                  <h3>{pickedBlock.name}</h3>
                  <p>{pickedBlock.line}</p>
                </div>
              ) : (
                <p className={`mono sm ${styles.pickHint}`}>{c.pickHint}</p>
              )}
            </div>
          </div>
        </aside>

        {/* tooltip on the hovered block (positioned by the scene) */}
        <div ref={tipRef} className={`${styles.tip} ${tipBlock ? styles.tipOn : ""}`} aria-hidden="true">
          {tipBlock ? (
            <span className={styles.tipIn}>
              <b>{tipBlock.name}</b>
              <span>{tipBlock.line}</span>
            </span>
          ) : null}
        </div>

        {/* outro: the stack closes, the offer appears */}
        <div className={styles.outro}>
          <p className="mono sm">
            <span className={styles.dot} /> {c.outroKicker}
          </p>
          <h2 className={styles.outroTitle}>{c.outroTitle}</h2>
          <p className={styles.outroCopy}>{c.outroCopy}</p>
          <div className={styles.ctas}>
            <Button variant="primary" href={href("/nearshore")}>
              {c.ctaAudit}
            </Button>
            <Button variant="secondary" href={href("/contact")}>
              {c.ctaContact}
            </Button>
          </div>
          <p className={`mono sm ${styles.note}`}>{c.note}</p>
        </div>

        <div className={styles.progress} aria-hidden="true">
          <span />
        </div>
      </div>

      {/* the whole platform as text: screen readers, crawlers, and browsers without WebGL */}
      <div className={styles.list}>
        <p className={styles.noGlNote}>{c.noGl}</p>
        <ol>
          {layers.map((l, i) => (
            <li key={l.id}>
              <h2>
                {pad(i + 1)} · {l.name}
              </h2>
              <p>{l.what}</p>
              <p>{l.how}</p>
              <ul>
                {l.blocks.map((b) => (
                  <li key={b.id}>
                    <b>{b.name}</b> — {b.line}
                  </li>
                ))}
              </ul>
              <p>
                {c.toolsLabel} — {l.tools.join(", ")}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
