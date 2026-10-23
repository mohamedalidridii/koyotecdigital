"use client";
import "./Feature.css";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import Copy from "../Copy/Copy";
import Film from "../Film/Film";

gsap.registerPlugin(ScrollTrigger);

// Image + text pair. The image opens like a door (clip from one side) and
// a smaller inset image floats against the scroll. `film` ({ src, poster })
// replaces the image with a looping video.
export default function Feature({ label, title, copy, image, film, inset, reverse = false, dark = false, children }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(ref);
      gsap.fromTo(
        q(".fe-media"),
        { clipPath: reverse ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.6,
          ease: "power4.inOut",
          scrollTrigger: { trigger: ref.current, start: "top 70%" },
        }
      );
      gsap.fromTo(
        q(".fe-media :is(img, video)"),
        { scale: 1.3 },
        { scale: 1, duration: 2, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: "top 70%" } }
      );
      if (q(".fe-inset")[0]) {
        gsap.fromTo(
          q(".fe-inset"),
          { yPercent: 40 },
          {
            yPercent: -40,
            ease: "none",
            scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      }
    },
    { scope: ref }
  );

  return (
    <section className={`feature ${reverse ? "reverse" : ""} ${dark ? "dark" : ""}`} ref={ref}>
      <div className="container fe-grid">
        <div className="fe-media-wrap">
          <div className="fe-media media">
            {film ? <Film src={film.src} poster={film.poster} /> : <img src={image} alt="" loading="lazy" />}
          </div>
          {inset && (
            <div className="fe-inset media">
              <img src={inset} alt="" loading="lazy" />
            </div>
          )}
        </div>
        <div className="fe-text">
          <span className="label gold">{label}</span>
          <Copy>
            <h3>{title}</h3>
          </Copy>
          <Copy>
            <p className="lead">{copy}</p>
          </Copy>
          {children}
        </div>
      </div>
    </section>
  );
}
