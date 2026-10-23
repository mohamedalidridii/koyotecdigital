"use client";
import "./StageCurtain.css";
import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import Feathers from "../Feathers/Feathers";
import { img } from "@/data/media";

gsap.registerPlugin(ScrollTrigger);

// Velvet stage curtains part on scroll to reveal the show.
// Wide `image` for landscape screens, portrait `imageMobile` for phones.
// `focus` keeps the subject of the wide image in frame while it zooms.
export default function StageCurtain({
  label,
  title,
  copy,
  cta,
  ctaHref,
  image = img.stage,
  imageMobile = img.stageMobile,
  focus = "50% 50%",
}) {
  const ref = useRef(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(ref);
      gsap
        .timeline({
          scrollTrigger: { trigger: ref.current, start: "top top", end: "+=160%", pin: true, scrub: 1 },
        })
        .to(q(".cc-title"), { scale: 0.85, opacity: 0, filter: "blur(10px)", duration: 0.5 }, 0.15)
        .to(q(".cc-curtain.left"), { xPercent: -92, skewY: -3, scaleX: 0.55, duration: 1.2, ease: "power2.inOut" }, 0.2)
        .to(q(".cc-curtain.right"), { xPercent: 92, skewY: 3, scaleX: 0.55, duration: 1.2, ease: "power2.inOut" }, 0.2)
        .to(q(".cc-valance"), { yPercent: -60, duration: 1, ease: "power2.inOut" }, 0.4)
        .fromTo(q(".cc-stage img"), { scale: 1.3 }, { scale: 1, duration: 1.6, ease: "none" }, 0)
        .fromTo(q(".cc-spot"), { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.8)
        .fromTo(q(".cc-reveal"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.5 }, 1.1);
    },
    { scope: ref }
  );

  return (
    <section className="stage-curtain" ref={ref}>
      <div className="cc-stage">
        <picture>
          <source media="(max-width: 767px) and (orientation: portrait)" srcSet={imageMobile} />
          <img src={image} alt="" loading="lazy" style={{ objectPosition: focus, transformOrigin: focus }} />
        </picture>
        <div className="cc-spot" />
        <Feathers className="cc-feathers" />
      </div>

      <div className="cc-curtain left" aria-hidden="true" />
      <div className="cc-curtain right" aria-hidden="true" />
      <div className="cc-valance" aria-hidden="true" />

      <h2 className="cc-title">{title}</h2>

      <div className="cc-content container">
        <span className="label cc-reveal">{label}</span>
        <p className="lead cc-reveal">{copy}</p>
        {cta && (
          <Link href={ctaHref} className="pill cc-reveal">
            {cta}
          </Link>
        )}
      </div>
    </section>
  );
}
