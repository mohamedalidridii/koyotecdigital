"use client";

import styles from "./Preloader.module.css";

import { useRef } from "react";
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

import {
  PRELOADER_CLIP_DELAY,
  PRELOADER_CLIP_DURATION,
  PRELOADER_EXIT_DURATION,
  PRELOADER_INITIAL_DELAY,
  PRELOADER_LOGO_INTRO_DURATION,
  PRELOADER_START_DELAY,
  PRELOADER_STEP_COUNT,
  PRELOADER_STEP_DURATION,
} from "@/lib/preloader";

gsap.registerPlugin(CustomEase);

if (!CustomEase.get("pageHop")) {
  CustomEase.create("pageHop", "0.9, 0, 0.1, 1");
}

export default function Preloader({ active = true }) {
  const overlayRef = useRef(null);
  const progressRef = useRef(null);
  const logoRef = useRef(null);

  useGSAP(() => {
    if (!active) return;

    const overlay = overlayRef.current;
    const progressBar = progressRef.current;
    const logo = logoRef.current;
    if (!overlay || !progressBar || !logo) return;

    gsap.set(progressBar, { scaleX: 0, transformOrigin: "left center" });
    gsap.set(logo, {
      rotation: 0,
      scale: 0,
      transformOrigin: "center center",
    });
    gsap.set(overlay, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    });

    const tl = gsap.timeline({
      delay: PRELOADER_INITIAL_DELAY + PRELOADER_START_DELAY,
      defaults: { ease: "pageHop" },
    });

    tl.to(logo, {
      scale: 1,
      duration: PRELOADER_LOGO_INTRO_DURATION,
    });

    for (let i = 0; i < PRELOADER_STEP_COUNT; i += 1) {
      const at =
        PRELOADER_LOGO_INTRO_DURATION + i * PRELOADER_STEP_DURATION;

      tl.to(
        progressBar,
        {
          scaleX: (i + 1) / PRELOADER_STEP_COUNT,
          duration: PRELOADER_STEP_DURATION,
        },
        at,
      );

      tl.to(
        logo,
        {
          rotation: (i + 1) * 90,
          duration: PRELOADER_STEP_DURATION,
        },
        at,
      );
    }

    tl.set(progressBar, { transformOrigin: "right center" })
      .addLabel("exit")
      .to(
        progressBar,
        {
          scaleX: 0,
          duration: PRELOADER_EXIT_DURATION,
        },
        "exit",
      )
      .to(
        logo,
        {
          scale: 0,
          duration: PRELOADER_EXIT_DURATION,
        },
        "exit",
      )
      .to(
        overlay,
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          duration: PRELOADER_CLIP_DURATION,
          ease: "pageHop",
          onComplete: () => {
            overlay.style.display = "none";
          },
        },
        `exit+=${PRELOADER_CLIP_DELAY}`,
      );

    return () => {
      tl.kill();
    };
  }, [active]);

  if (!active) return null;

  return (
    <div ref={overlayRef} className={styles.overlay} aria-hidden="true">
      <div ref={progressRef} className={styles.progressBar} />
      <img ref={logoRef} src="/logo.png" alt="" className={styles.logo} />
    </div>
  );
}
