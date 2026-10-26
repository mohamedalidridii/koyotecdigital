"use client";

import styles from "./home.module.css";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
import { useLenis } from "lenis/react";

import { useLang } from "@/lib/useLang";

import Preloader from "@/components/Preloader";
import DitherImage from "@/components/DitherImage/DitherImage";
import Copy from "@/components/Copy";
import SectionHeader from "@/components/SectionHeader";
import Button from "@/components/Button";
import FocusAreas from "@/components/FocusAreas";
import Marquee from "@/components/Marquee";
import ProcessSteps from "@/components/ProcessSteps";
import StatementBanner from "@/components/StatementBanner";

import {
  HOME_COPY_BASE_DELAY,
  PRELOADER_COPY_BASE_DELAY,
  PRELOADER_EASE,
  PRELOADER_HERO_SCALE_DURATION,
  markPreloaderSeen,
  shouldShowPreloader,
} from "@/lib/preloader";

gsap.registerPlugin(useGSAP, CustomEase);

if (typeof window !== "undefined") {
  CustomEase.create("preloaderHop", PRELOADER_EASE);
}

export default function Home() {
  const heroRef = useRef(null);
  const ctasRef = useRef(null);
  const lenis = useLenis();
  const { t, href } = useLang();
  const showPreloader = shouldShowPreloader();
  const wait = showPreloader
    ? PRELOADER_COPY_BASE_DELAY - HOME_COPY_BASE_DELAY
    : 0;

  useEffect(() => {
    return () => {
      markPreloaderSeen();
    };
  }, []);

  const expandHero = () => {
    const hero = heroRef.current;
    if (!hero) return Promise.resolve();

    hero.removeAttribute("data-hero-intro");

    return new Promise((resolve) => {
      gsap.fromTo(
        hero,
        {
          scale: 0,
          rotation: -20,
          autoAlpha: 1,
          transformOrigin: "center center",
          force3D: true,
        },
        {
          scale: 1,
          rotation: 0,
          duration: PRELOADER_HERO_SCALE_DURATION,
          ease: "preloaderHop",
          force3D: true,
          overwrite: true,
          onComplete: () => {
            gsap.delayedCall(0.35, () => {
              lenis?.start();
            });
            resolve();
          },
        },
      );
    });
  };

  useGSAP(
    () => {
      const btns = gsap.utils.toArray(ctasRef.current?.children);
      if (!btns.length) return;

      gsap.set(btns, { y: 300 });

      gsap.to(btns, {
        y: 0,
        duration: 0.75,
        delay: wait + 0.75,
        stagger: 0.25,
        ease: "power3.out",
      });
    },
    { scope: ctasRef, dependencies: [wait] },
  );

  return (
    <>
      {showPreloader ? <Preloader onExpand={expandHero} /> : null}

      <section
        ref={heroRef}
        className={styles.hero}
        data-hero-intro={showPreloader ? "" : undefined}
      >
        <div className={styles.heroBg}>
          <DitherImage src="/images/home/hero.jpg" alt="" />
        </div>
        <div className={styles.heroHeader}>
          <Copy variant="flicker" animateOnScroll={false} delay={wait + 1}>
            <SectionHeader
              variant="v2"
              bullet
              left={t.home.header[0]}
              right={t.home.header[1]}
            />
          </Copy>
        </div>
        <div className={`container ${styles.heroContent}`}>
          <Copy animateOnScroll={false} delay={wait + 0.75}>
            <h1 className={styles.heroTitle}>{t.home.title}</h1>
          </Copy>
          <div ref={ctasRef} className={styles.heroCtas}>
            <Button
              variant="primary"
              href={href("/contact")}
              className={styles.ctaPrimary}
            >
              {t.home.ctaPrimary}
            </Button>
            <Button
              variant="secondary"
              href={href("/expertise")}
              className={styles.ctaSecondary}
            >
              {t.home.ctaSecondary}
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.about}>
        <Copy variant="flicker">
          <SectionHeader
            bullet
            left={t.home.aboutHeader[0]}
            right={t.home.aboutHeader[1]}
          />
        </Copy>
        <div className={`container ${styles.aboutCols}`}>
          <div className={styles.aboutCol} />
          <div className={styles.aboutCopy}>
            <Copy>
              <h4>{t.home.about}</h4>
            </Copy>
          </div>
        </div>
      </section>

      <FocusAreas />

      <Marquee />

      <ProcessSteps />

      <StatementBanner />
    </>
  );
}
