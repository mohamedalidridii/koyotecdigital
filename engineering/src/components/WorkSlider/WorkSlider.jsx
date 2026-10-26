"use client";

import styles from "./WorkSlider.module.css";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";

import Copy from "@/components/Copy";
import SectionHeader from "@/components/SectionHeader";
import SectionFooter from "@/components/SectionFooter";
import DitherImage from "@/components/DitherImage/DitherImage";

import { useLang } from "@/lib/useLang";
import { WORK_IMAGES } from "@/content/shared";

gsap.registerPlugin(useGSAP, SplitText);

const CLIP_START = "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)";
const CLIP_END = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";

// one slide per blueprint image; titles and categories come from the dictionary (t.work)
const PROJECTS = WORK_IMAGES.map((image) => ({ image }));

const SCROLL_SPEED = 0.75;
const LERP = 0.05;
const BUFFER = 2;
const MAX_VELOCITY = 150;
const SNAP_MS = 500;
const VELOCITY_DECAY = 0.9;
const SNAP_VELOCITY = 0.8;
const SWIPE_PX = 48;
const IDLE_PX = 0.2;
const MINIMAP_H = 250;
const COPIES = 2;
const OFFSCREEN = 1.4;

const DITHER_A = { darkColor: "#0d0d0d", lightColor: "#f3f1ec" };
const DITHER_B = { darkColor: "#f3f1ec", lightColor: "#0d0d0d" };

function ditherColors(projectId) {
  return projectId % 2 === 0 ? DITHER_A : DITHER_A;
}

const lerp = (a, b, t) => a + (b - a) * t;

function wrapIndex(index) {
  const n = PROJECTS.length;
  return ((index % n) + n) % n;
}

function projectNum(index) {
  return String(wrapIndex(index) + 1).padStart(2, "0");
}

function makePool() {
  const pool = [];
  for (let p = 0; p < PROJECTS.length; p++) {
    for (let c = 0; c < COPIES; c++) {
      pool.push({ id: `${p}-${c}`, projectId: p, index: null });
    }
  }
  return pool;
}

function isOnScreen(index, currentY, projectH) {
  return Math.abs(index * projectH + currentY) < projectH * OFFSCREEN;
}

function assignWindow(pool, min, max, currentY, projectH) {
  const needed = new Set();
  for (let i = min; i <= max; i++) needed.add(i);

  const keep = new Set();
  for (const slot of pool) {
    if (slot.index == null) continue;
    if (
      (slot.index >= min && slot.index <= max) ||
      isOnScreen(slot.index, currentY, projectH)
    ) {
      keep.add(slot.index);
      needed.add(slot.index);
    } else {
      slot.index = null;
    }
  }

  const newly = [];
  for (const index of needed) {
    if (keep.has(index)) continue;
    const projectId = wrapIndex(index);
    const free = pool.find((s) => s.projectId === projectId && s.index == null);
    if (free) {
      free.index = index;
      newly.push(free);
    }
  }
  return newly;
}

export default function WorkSlider() {
  const { t } = useLang();
  const project = (id) => ({ ...PROJECTS[id], ...t.work[id], year: t.workYear });
  const poolRef = useRef(null);
  if (!poolRef.current) {
    poolRef.current = makePool();
    assignWindow(poolRef.current, -BUFFER, BUFFER, 0, 800);
  }
  const [revealed, setRevealed] = useState(false);
  const readyCount = useRef(0);

  const slideRefs = useRef([]);
  const miniRefs = useRef([]);
  const infoRefs = useRef([]);
  const mediaRefs = useRef([]);
  const miniMediaRefs = useRef([]);
  const ditherRefs = useRef([]);
  const miniDitherRefs = useRef([]);
  const parallax = useRef([]);
  const state = useRef({
    currentY: 0,
    targetY: 0,
    velocity: 0,
    projectH: 800,
    isDragging: false,
    isSnapping: false,
    snap: { time: 0, y: 0, target: 0 },
    drag: { y: 0, scrollY: 0 },
    swipe: { y: 0, used: false },
  });
  const lenis = useLenis();
  const minimapRef = useRef(null);

  useGSAP(
    () => {
      const minimap = minimapRef.current;
      if (!minimap) return;

      const texts = gsap.utils.toArray(
        minimap.querySelectorAll(`.${styles.info} p`),
      );
      const splits = texts.map((element) =>
        SplitText.create(element, {
          type: "lines",
          mask: "lines",
          linesClass: styles.line,
        }),
      );
      const lines = splits.flatMap((split) => split.lines ?? []);

      gsap.set(minimap, { clipPath: CLIP_START });
      if (lines.length) gsap.set(lines, { yPercent: 110 });

      const tl = gsap.timeline({ delay: 1, defaults: { ease: "power3.out" } });
      tl.to(minimap, { clipPath: CLIP_END, duration: 1 });
      if (lines.length) {
        tl.to(lines, { yPercent: 0, duration: 0.75, stagger: 0.1 }, 0.5);
      }

      return () => splits.forEach((split) => split.revert());
    },
    { scope: minimapRef, dependencies: [] },
  );

  useEffect(() => {
    lenis?.stop();
    document.body.style.overflow = "hidden";
    return () => {
      lenis?.start();
      document.body.style.overflow = "";
    };
  }, [lenis]);

  const markReady = () => {
    readyCount.current += 1;
    if (readyCount.current >= 2) setRevealed(true);
  };

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 2000);
    return () => clearTimeout(t);
  }, []);

  useLayoutEffect(() => {
    const s = state.current;
    s.projectH = window.innerHeight;
    const miniY = (s.currentY * MINIMAP_H) / s.projectH;
    poolRef.current.forEach((slot, i) => {
      const slide = slideRefs.current[i];
      const mini = miniRefs.current[i];
      const info = infoRefs.current[i];
      if (slot.index == null) {
        if (slide) {
          slide.style.transform = "translateY(-200vh)";
          slide.style.visibility = "hidden";
        }
        if (mini) {
          mini.style.transform = "translateY(-200vh)";
          mini.style.visibility = "hidden";
        }
        if (info) {
          info.style.transform = "translateY(-200vh)";
          info.style.visibility = "hidden";
        }
        return;
      }
      if (slide) {
        slide.style.visibility = "visible";
        slide.style.transform = `translateY(${slot.index * s.projectH + s.currentY}px)`;
      }
      if (mini) {
        mini.style.visibility = "visible";
        mini.style.transform = `translateY(${slot.index * MINIMAP_H + miniY}px)`;
      }
      if (info) {
        info.style.visibility = "visible";
        info.style.transform = `translateY(${slot.index * MINIMAP_H + miniY}px)`;
      }
    });
  }, []);

  useEffect(() => {
    const s = state.current;
    const pool = poolRef.current;
    const parked = "translateY(-200vh)";
    let raf = 0;

    const snapPoint = () => -Math.round(-s.targetY / s.projectH) * s.projectH;

    const startSnap = () => {
      s.isSnapping = true;
      s.snap.time = performance.now();
      s.snap.y = s.targetY;
      s.snap.target = snapPoint();
    };

    const updateSnap = (now) => {
      const t = Math.min((now - s.snap.time) / SNAP_MS, 1);
      const eased = 1 - (1 - t) ** 3;
      s.targetY = s.snap.y + (s.snap.target - s.snap.y) * eased;
      if (t >= 1) s.isSnapping = false;
    };

    const park = (el) => {
      if (!el || el.dataset.parked === "1") return;
      el.dataset.parked = "1";
      el.style.visibility = "hidden";
      el.style.pointerEvents = "none";
      el.style.transform = parked;
    };

    const place = (el, transform) => {
      if (!el) return;
      if (el.dataset.parked === "1") {
        el.dataset.parked = "0";
        el.style.visibility = "visible";
        el.style.pointerEvents = "";
      }
      if (el.dataset.y !== transform) {
        el.dataset.y = transform;
        el.style.transform = transform;
      }
    };

    const applyTransforms = () => {
      const miniY = (s.currentY * MINIMAP_H) / s.projectH;
      const slides = slideRefs.current;
      const minis = miniRefs.current;
      const infos = infoRefs.current;
      const medias = mediaRefs.current;
      const miniMedias = miniMediaRefs.current;
      const px = parallax.current;

      for (let i = 0; i < pool.length; i++) {
        const slot = pool[i];
        if (slot.index == null) {
          park(slides[i]);
          park(minis[i]);
          park(infos[i]);
          continue;
        }

        const index = slot.index;
        place(slides[i], `translateY(${index * s.projectH + s.currentY}px)`);
        place(minis[i], `translateY(${index * MINIMAP_H + miniY}px)`);
        place(infos[i], `translateY(${index * MINIMAP_H + miniY}px)`);

        let p = px[i];
        if (!p) {
          p = { main: 0, mini: 0 };
          px[i] = p;
        }
        p.main = lerp(p.main, (-s.currentY - index * s.projectH) * 0.2, 0.1);
        p.mini = lerp(p.mini, (-miniY - index * MINIMAP_H) * 0.2, 0.1);
        const media = medias[i];
        if (media) media.style.transform = `translateY(${p.main}px) scale(1.5)`;
        const miniMedia = miniMedias[i];
        if (miniMedia)
          miniMedia.style.transform = `translateY(${p.mini}px) scale(1.5)`;
      }
    };

    const isIdle = () =>
      !s.isDragging &&
      !s.isSnapping &&
      Math.abs(s.velocity) < SNAP_VELOCITY &&
      Math.abs(s.targetY - snapPoint()) <= 1 &&
      Math.abs(s.targetY - s.currentY) < IDLE_PX;

    const tick = () => {
      s.velocity *= VELOCITY_DECAY;
      if (
        !s.isSnapping &&
        !s.isDragging &&
        Math.abs(s.velocity) < SNAP_VELOCITY &&
        Math.abs(s.targetY - snapPoint()) > 1
      ) {
        startSnap();
      }
      if (s.isSnapping) updateSnap(performance.now());
      if (s.isDragging) s.currentY = s.targetY;
      else s.currentY += (s.targetY - s.currentY) * LERP;

      const from = Math.round(-s.currentY / s.projectH);
      const to = Math.round(-s.targetY / s.projectH);
      const newly = assignWindow(
        pool,
        Math.min(from, to) - BUFFER,
        Math.max(from, to) + BUFFER,
        s.currentY,
        s.projectH,
      );
      for (let n = 0; n < newly.length; n++) {
        const i = pool.indexOf(newly[n]);
        ditherRefs.current[i]?.redraw();
        miniDitherRefs.current[i]?.redraw();
      }

      applyTransforms();

      if (isIdle()) {
        s.currentY = s.targetY;
        s.velocity = 0;
        applyTransforms();
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const kick = () => {
      if (raf) return;
      raf = requestAnimationFrame(tick);
    };

    const onWheel = (e) => {
      e.preventDefault();
      s.isSnapping = false;
      const delta = Math.max(
        Math.min(e.deltaY * SCROLL_SPEED, MAX_VELOCITY),
        -MAX_VELOCITY,
      );
      s.targetY -= delta;
      s.velocity = Math.max(
        Math.min(s.velocity + delta, MAX_VELOCITY),
        -MAX_VELOCITY,
      );
      kick();
    };

    const goBySlide = (dir) => {
      if (s.isSnapping) return;
      const from = Math.round(-s.currentY / s.projectH);
      s.velocity = 0;
      s.isDragging = false;
      s.isSnapping = true;
      s.snap.time = performance.now();
      s.snap.y = s.currentY;
      s.snap.target = -(from + dir) * s.projectH;
      s.targetY = s.snap.y;
      kick();
    };

    const onTouchStart = (e) => {
      if (s.isSnapping) return;
      s.swipe = { y: e.touches[0].clientY, used: false };
    };

    const onTouchMove = (e) => {
      if (s.swipe.used || s.isSnapping) return;
      const dy = e.touches[0].clientY - s.swipe.y;
      if (Math.abs(dy) < SWIPE_PX) return;
      e.preventDefault();
      s.swipe.used = true;
      goBySlide(dy < 0 ? 1 : -1);
    };

    const onTouchEnd = () => {
      s.swipe.used = true;
      s.isDragging = false;
      kick();
    };

    const onResize = () => {
      s.projectH = window.innerHeight;
      kick();
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
        return;
      }
      kick();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    kick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const pool = poolRef.current;

  return (
    <div className={`${styles.page}${revealed ? ` ${styles.revealed}` : ""}`}>
      <div className={styles.chrome}>
        <Copy variant="flicker" animateOnScroll={false} delay="1">
          <SectionHeader variant="v2" bullet left="" right={t.workLabels.header} />
        </Copy>
        <Copy variant="flicker" animateOnScroll={false} delay="1">
          <SectionFooter
            bullet
            left={t.workLabels.footer[0]}
            right={t.workLabels.footer[1]}
          />
        </Copy>
      </div>
      <div className={styles.list}>
        {pool.map((slot, i) => {
          const item = project(slot.projectId);
          const colors = ditherColors(slot.projectId);
          return (
            <article
              key={`slide-${slot.id}`}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              className={styles.slide}
            >
              <div
                ref={(el) => {
                  mediaRefs.current[i] = el;
                }}
                className={styles.media}
              >
                <DitherImage
                  ref={(el) => {
                    ditherRefs.current[i] = el;
                  }}
                  src={item.image}
                  alt={item.title}
                  darkColor={colors.darkColor}
                  lightColor={colors.lightColor}
                  pixelSize={1.25}
                  onReady={slot.index === 0 ? markReady : undefined}
                />
              </div>
            </article>
          );
        })}
      </div>

      <div ref={minimapRef} className={styles.minimap}>
        <div className={styles.minimapInner}>
          <div className={styles.preview}>
            {pool.map((slot, i) => {
              const item = project(slot.projectId);
              const colors = ditherColors(slot.projectId);
              return (
                <div
                  key={`mini-${slot.id}`}
                  ref={(el) => {
                    miniRefs.current[i] = el;
                  }}
                  className={styles.previewItem}
                >
                  <div
                    ref={(el) => {
                      miniMediaRefs.current[i] = el;
                    }}
                    className={styles.media}
                  >
                    <DitherImage
                      ref={(el) => {
                        miniDitherRefs.current[i] = el;
                      }}
                      src={item.image}
                      alt=""
                      darkColor={colors.darkColor}
                      lightColor={colors.lightColor}
                      pixelSize={1.25}
                      onReady={slot.index === 0 ? markReady : undefined}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className={styles.infoList}>
            {pool.map((slot, i) => {
              const item = project(slot.projectId);
              return (
                <div
                  key={`info-${slot.id}`}
                  ref={(el) => {
                    infoRefs.current[i] = el;
                  }}
                  className={styles.info}
                >
                  <div className={styles.infoRow}>
                    <p>{projectNum(slot.projectId)}</p>
                    <p>{item.title}</p>
                  </div>
                  <div className={styles.infoRow}>
                    <p>{item.category}</p>
                    <p>{item.year}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
