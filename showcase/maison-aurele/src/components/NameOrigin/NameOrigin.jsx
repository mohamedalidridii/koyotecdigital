"use client";
import "./NameOrigin.css";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";

import { LILY, LILY_STAMENS } from "../Botanical/flowers";
import { useDict } from "@/i18n/DictProvider";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

// Which letter of each source word travels to which letter of "Aurèle"
const WORDS = [
  { key: "aurum", text: "Aurum", keep: { 0: 0, 1: 1, 2: 2 }, caption: "captionAurum" },
  { key: "fidele", text: "fidèle", keep: { 3: 3, 4: 4, 5: 5 }, caption: "captionFidele" },
];
const RESULT = "Aurèle";

export default function NameOrigin() {
  const dict = useDict();
  const ref = useRef(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(ref);
      const targets = q(".no-target .no-letter");

      // Distance from a kept letter to its slot in the hidden "Aurèle" word
      const delta = (el, axis) => {
        const to = targets[Number(el.dataset.to)].getBoundingClientRect();
        const from = el.getBoundingClientRect();
        const current = gsap.getProperty(el, axis);
        return axis === "x" ? to.left - from.left + current : to.top - from.top + current;
      };

      gsap.set(q(".no-flower path"), { drawSVG: "0%" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: "+=220%",
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(q(".no-flower path"), { drawSVG: "100%", duration: 1.4, stagger: 0.1, ease: "none" }, 0)
        .to(q(".no-letter.drop"), { opacity: 0, yPercent: 40, filter: "blur(6px)", stagger: 0.02, duration: 0.6 }, 0.6)
        .to(q(".no-caption"), { opacity: 0, y: -10, duration: 0.4 }, 0.6)
        .to(
          q(".no-letter.keep"),
          {
            x: (i, el) => delta(el, "x"),
            y: (i, el) => delta(el, "y"),
            duration: 1.2,
            ease: "power3.inOut",
          },
          1
        )
        .to(q(".no-flower"), { opacity: 0.18, scale: 1.25, duration: 1 }, 1.2)
        .to(q(".no-letter.keep"), { color: "var(--gold-light)", duration: 0.4 }, 2)
        .fromTo(q(".no-copy"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, 2.1)
        .to({}, { duration: 0.4 });
    },
    { scope: ref, dependencies: [dict] }
  );

  return (
    <section className="name-origin" ref={ref}>
      <div className="no-inner container">
        <span className="label gold no-label">{dict.origin.label}</span>

        <svg className="no-flower lily" viewBox="0 0 600 600" fill="none" aria-hidden="true">
          <path d={LILY} />
          <path d={LILY_STAMENS} />
        </svg>

        <div className="no-words" aria-label={`${WORDS.map((w) => w.text).join(" + ")} = ${RESULT}`}>
          {WORDS.map((word) => (
            <div className={`no-word ${word.key}`} key={word.key}>
              <span className="label no-caption">{dict.origin[word.caption]}</span>
              <span className="no-text" aria-hidden="true">
                {word.text.split("").map((ch, i) => {
                  const to = word.keep[i];
                  return (
                    <span
                      key={i}
                      className={`no-letter ${to !== undefined ? "keep" : "drop"}`}
                      data-to={to}
                    >
                      {ch}
                    </span>
                  );
                })}
              </span>
            </div>
          ))}
        </div>

        <div className="no-target" aria-hidden="true">
          {RESULT.split("").map((ch, i) => (
            <span className="no-letter" key={i}>
              {ch}
            </span>
          ))}
        </div>

        <p className="lead no-copy">{dict.origin.copy}</p>
      </div>
    </section>
  );
}
