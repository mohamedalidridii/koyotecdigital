"use client";

import styles from "./Preloader.module.css";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";

import { useLang } from "@/lib/useLang";

import {
  PRELOADER_BAND_DELAY,
  PRELOADER_BAND_DURATION,
  PRELOADER_COUNT_DELAY,
  PRELOADER_COUNT_DURATION,
  PRELOADER_EASE,
  PRELOADER_OPEN_DELAY,
  PRELOADER_OPEN_DURATION,
  PRELOADER_OVERLAY_HOLD,
  PRELOADER_PROGRESS_FADE,
} from "@/lib/preloader";

gsap.registerPlugin(CustomEase);

if (typeof window !== "undefined") {
  CustomEase.create("preloaderHop", PRELOADER_EASE);
}

const CLIP_START = "polygon(0% 46.5%, 0% 46.5%, 0% 53.5%, 0% 53.5%)";
const CLIP_BAND_25 = "polygon(0% 46.5%, 25% 46.5%, 25% 53.5%, 0% 53.5%)";
const CLIP_BAND_100 = "polygon(0% 46.5%, 100% 46.5%, 100% 53.5%, 0% 53.5%)";
const CLIP_OPEN = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";

export default function Preloader({ active = true, onExpand }) {
  const { t } = useLang();
  const overlayRef = useRef(null);
  const progressRef = useRef(null);
  const counterRef = useRef(null);
  const onExpandRef = useRef(onExpand);

  onExpandRef.current = onExpand;

  useGSAP(
    () => {
      if (!active) return;

      const overlay = overlayRef.current;
      const progressBar = progressRef.current;
      const counter = counterRef.current;
      if (!overlay || !progressBar || !counter) return;

      gsap.set(overlay, { clipPath: CLIP_START, autoAlpha: 1 });
      gsap.set(progressBar, { width: "25vw", opacity: 1 });
      gsap.set(counter, { innerHTML: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "preloaderHop" },
      });

      tl.to(
        overlay,
        { clipPath: CLIP_BAND_25, duration: PRELOADER_BAND_DURATION },
        PRELOADER_BAND_DELAY,
      );

      tl.to(
        overlay,
        { clipPath: CLIP_BAND_100, duration: PRELOADER_COUNT_DURATION },
        PRELOADER_COUNT_DELAY,
      );
      tl.to(
        progressBar,
        { width: "100%", duration: PRELOADER_COUNT_DURATION },
        PRELOADER_COUNT_DELAY,
      );
      tl.to(
        counter,
        {
          innerHTML: 100,
          duration: PRELOADER_COUNT_DURATION,
          snap: { innerHTML: 1 },
        },
        PRELOADER_COUNT_DELAY,
      );

      tl.add(() => {
        const done = onExpandRef.current?.();
        Promise.resolve(done).finally(() => {
          gsap.delayedCall(PRELOADER_OVERLAY_HOLD, () => {
            overlay.style.display = "none";
          });
        });
      }, PRELOADER_OPEN_DELAY);

      tl.to(
        overlay,
        { clipPath: CLIP_OPEN, duration: PRELOADER_OPEN_DURATION },
        PRELOADER_OPEN_DELAY,
      );
      tl.to(
        progressBar,
        { opacity: 0, duration: PRELOADER_PROGRESS_FADE },
        PRELOADER_OPEN_DELAY,
      );

      return () => {
        tl.kill();
      };
    },
    { dependencies: [active] },
  );

  if (!active) return null;

  return (
    <div ref={overlayRef} className={styles.overlay} aria-hidden="true">
      <div ref={progressRef} className={styles.progressBar}>
        <p>{t.preloader}</p>
        <p>
          <span ref={counterRef}>0</span>
        </p>
      </div>
    </div>
  );
}
