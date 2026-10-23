"use client";
import "./FabricHero.css";
import { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import FabricImage from "./FabricImage";
import { usePreloaderDone } from "../Preloader/Preloader";
import { useDict } from "@/i18n/DictProvider";
import { img } from "@/data/media";

gsap.registerPlugin(SplitText, ScrollTrigger);

export default function FabricHero() {
  const dict = useDict();
  const ready = usePreloaderDone();
  const sectionRef = useRef(null);
  const fabricRef = useRef(null);
  const splitRef = useRef(null);

  // Scroll choreography is created on mount so its pin is measured before
  // the pinned sections further down the page.
  useGSAP(
    () => {
      const q = gsap.utils.selector(sectionRef);
      const mobile = window.innerWidth < 768;
      const startInset = mobile ? "16% 10% 18% 10%" : "13% 35% 13% 35%";

      splitRef.current = SplitText.create(q(".hero-word"), { type: "chars", mask: "chars" });
      gsap.set(splitRef.current.chars, { yPercent: 115 });
      gsap.set(q(".hero-fade"), { opacity: 0, y: 12 });
      fabricRef.current?.set({ reveal: 0, zoom: 1.25 });

      const zoom = { value: 1.08 };
      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=120%",
            pin: q(".hero-sticky")[0],
            scrub: 1,
          },
        })
        .fromTo(q(".hero-frame"), { clipPath: `inset(${startInset})` }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none" }, 0)
        .fromTo(zoom, { value: 1.08 }, { value: 1, ease: "none", onUpdate: () => fabricRef.current?.set({ zoom: zoom.value }) }, 0)
        .to(q(".hero-word.a"), { xPercent: -35, ease: "none" }, 0)
        .to(q(".hero-word.b"), { xPercent: 35, ease: "none" }, 0)
        .to(q(".hero-title"), { opacity: 0, ease: "power1.in" }, 0.4)
        .to(q(".hero-scrollfade"), { opacity: 0, ease: "none", duration: 0.3 }, 0);

      return () => splitRef.current?.revert();
    },
    { scope: sectionRef, dependencies: [dict] }
  );

  // Intro plays once the preloader curtain lifts
  useGSAP(
    () => {
      if (!ready || !splitRef.current) return;
      const q = gsap.utils.selector(sectionRef);
      const state = { reveal: 0, zoom: 1.25 };
      gsap
        .timeline()
        .to(state, {
          reveal: 1,
          zoom: 1.08,
          duration: 2.2,
          ease: "power3.inOut",
          onUpdate: () => fabricRef.current?.set(state),
        })
        .to(splitRef.current.chars, { yPercent: 0, duration: 1.3, stagger: 0.035, ease: "power4.out" }, 0.35)
        .to(q(".hero-fade"), { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "power3.out" }, 1);
    },
    { scope: sectionRef, dependencies: [ready, dict] }
  );

  return (
    <section className="hero" ref={sectionRef}>
      <div className="hero-sticky">
        <div className="hero-frame" data-cursor="SS27">
          <FabricImage src={img.hero} controlRef={fabricRef} reveal={0} zoom={1.25} priority />
        </div>

        <h1 className="hero-title" aria-label={`${dict.home.heroTitleA} ${dict.home.heroTitleB}`}>
          <span className="hero-word a">{dict.home.heroTitleA}</span>
          <span className="hero-word b">
            <em>{dict.home.heroTitleB}</em>
          </span>
        </h1>

        <div className="hero-top container hero-scrollfade">
          <span className="label hero-fade">{dict.home.heroEyebrow}</span>
          <span className="label hero-fade">Maison Aurèle</span>
        </div>

        <div className="hero-bottom container hero-scrollfade">
          <span className="label hero-fade">{dict.home.heroMetaLeft}</span>
          <span className="label hero-fade hero-scroll">
            <i />
            {dict.common.scroll}
          </span>
          <span className="label hero-fade">{dict.home.heroMetaRight}</span>
        </div>
      </div>
    </section>
  );
}
