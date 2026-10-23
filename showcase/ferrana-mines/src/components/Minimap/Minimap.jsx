"use client";

import styles from "./Minimap.module.css";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Copy from "@/components/Copy";

gsap.registerPlugin(ScrollTrigger);

const IMAGES = Array.from({ length: 12 }, (_, i) => `/images/img${i + 1}.jpg`);

const PREVIEW_RATIO_CYCLE = [
  { ratio: "5 / 7", width: "25%" },
  { ratio: "4 / 5", width: "30%" },
  { ratio: "1 / 1", width: "35%" },
  { ratio: "5 / 7", width: "25%" },
  { ratio: "7 / 5", width: "40%" },
];

const PREVIEW_RATIO_CYCLE_MOBILE = [
  { ratio: "5 / 7", width: "56%" },
  { ratio: "1 / 1", width: "62%" },
  { ratio: "4 / 5", width: "58%" },
  { ratio: "5 / 7", width: "56%" },
  { ratio: "7 / 5", width: "78%" },
];

export default function Minimap() {
  const sectionRef = useRef(null);
  const itemsRef = useRef(null);
  const minimapRef = useRef(null);
  const previewWrapRef = useRef(null);
  const previewRef = useRef(null);
  const indicatorRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = itemsRef.current;
    const minimap = minimapRef.current;
    const previewWrap = previewWrapRef.current;
    const preview = previewRef.current;
    const indicator = indicatorRef.current;
    if (
      !section ||
      !track ||
      !minimap ||
      !previewWrap ||
      !preview ||
      !indicator
    ) {
      return;
    }

    const items = [...track.children];
    let active = -1;
    let scrollTrigger = null;

    const mobile = () => window.matchMedia("(max-width: 1000px)").matches;

    const getPreviewFrame = (index) => {
      const cycle = mobile() ? PREVIEW_RATIO_CYCLE_MOBILE : PREVIEW_RATIO_CYCLE;
      return cycle[index % cycle.length];
    };

    const applyPreviewFrame = (index) => {
      const frame = getPreviewFrame(index);

      previewWrap.style.aspectRatio = frame.ratio;
      gsap.set(previewWrap, {
        width: frame.width,
        height: "auto",
      });
    };

    const metrics = () => {
      const horz = mobile();
      const size = horz ? items[0].offsetWidth : items[0].offsetHeight;
      const total = horz ? track.scrollWidth : track.scrollHeight;
      const frame = horz ? minimap.clientWidth : indicator.offsetHeight;

      if (horz) {
        const centerOffset = (frame - size) / 2;
        const travel = Math.max(0, (items.length - 1) * size);

        return {
          horz,
          size,
          frame,
          centerOffset,
          travel,
          count: items.length,
        };
      }

      return {
        horz,
        size,
        frame,
        max: Math.max(0, total - frame),
        count: items.length,
      };
    };

    const setActive = (i) => {
      if (i === active) return;
      active = i;
      preview.src = IMAGES[i];
      applyPreviewFrame(i);
    };

    const applyTrack = (progress) => {
      const m = metrics();

      if (m.horz) {
        const x = m.centerOffset - progress * m.travel;
        gsap.set(track, { x, y: 0 });
        setActive(
          gsap.utils.clamp(
            0,
            m.count - 1,
            Math.round(progress * (m.count - 1)),
          ),
        );
        return;
      }

      const offset = -m.max * progress;
      gsap.set(track, { x: 0, y: offset });
      setActive(gsap.utils.clamp(0, m.count - 1, Math.round(-offset / m.size)));
    };

    active = 0;
    preview.src = IMAGES[0];
    applyPreviewFrame(0);

    section.style.setProperty("--minimap-scroll", `${IMAGES.length * 50}vh`);

    const ctx = gsap.context(() => {
      scrollTrigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          applyTrack(self.progress);
        },
      });

      applyTrack(scrollTrigger.progress);

      items.forEach((el, i) => {
        el.addEventListener("click", () => {
          const top = section.offsetTop;
          const range = section.offsetHeight - window.innerHeight;
          const p = IMAGES.length <= 1 ? 0 : i / (IMAGES.length - 1);
          window.scrollTo(0, top + range * p);
        });
      });
    }, section);

    const mq = window.matchMedia("(max-width: 1000px)");

    const onResize = () => {
      if (active >= 0) applyPreviewFrame(active);
      ScrollTrigger.refresh();
      if (scrollTrigger) applyTrack(scrollTrigger.progress);
    };

    window.addEventListener("resize", onResize);
    mq.addEventListener("change", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      mq.removeEventListener("change", onResize);
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.viewport}>
        <div className={styles.siteInfo}>
          <Copy>
            <p>Frames logged on site through the life of the works</p>
          </Copy>
        </div>

        <div ref={previewWrapRef} className={styles.imgPreview}>
          <img ref={previewRef} src={IMAGES[0]} alt="" />
        </div>

        <div ref={minimapRef} className={styles.minimap}>
          <div ref={indicatorRef} className={styles.indicator} />
          <div ref={itemsRef} className={styles.items}>
            {IMAGES.map((src) => (
              <div key={src} className={styles.item}>
                <img src={src} alt="" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
