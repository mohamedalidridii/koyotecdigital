"use client";
import "./Chapters.css";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const THEMES = [
  { bg: "#f3ece0", fg: "#1b1815" },
  { bg: "#e6dac6", fg: "#1b1815" },
  { bg: "#1b1815", fg: "#f3ece0" },
  { bg: "#4a121c", fg: "#f3ece0" },
];

// One pinned stage, four chapters: text cross-fades, images rise over each
// other, and the stage changes colour from ivory to velvet.
export default function Chapters({ chapters, images }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(ref);
      const texts = q(".ch-text");
      const frames = q(".ch-frame");
      const stage = q(".ch-stage")[0];

      gsap.set(texts.slice(1), { opacity: 0, y: 60 });
      gsap.set(frames.slice(1), { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(stage, { backgroundColor: THEMES[0].bg, color: THEMES[0].fg });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: () => `+=${window.innerHeight * (chapters.length - 0.5)}`,
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            const index = Math.min(chapters.length - 1, Math.floor(self.progress * chapters.length));
            q(".ch-dot").forEach((dot, i) => dot.classList.toggle("is-active", i === index));
          },
        },
      });

      for (let i = 1; i < chapters.length; i++) {
        const theme = THEMES[i % THEMES.length];
        tl.to(texts[i - 1], { opacity: 0, y: -60, duration: 0.4 }, i)
          .to(frames[i], { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "power2.inOut" }, i)
          .fromTo(frames[i].querySelector("img"), { scale: 1.4 }, { scale: 1, duration: 1, ease: "none" }, i)
          .to(frames[i - 1].querySelector("img"), { scale: 0.9, opacity: 0.4, duration: 0.9 }, i)
          .to(stage, { backgroundColor: theme.bg, color: theme.fg, duration: 0.6 }, i)
          .to(texts[i], { opacity: 1, y: 0, duration: 0.5 }, i + 0.35);
      }
      tl.to({}, { duration: 0.5 });
    },
    { scope: ref, dependencies: [chapters] }
  );

  return (
    <section className="chapters" ref={ref}>
      <div className="ch-stage">
        <div className="container ch-grid">
          <div className="ch-texts">
            {chapters.map((chapter) => (
              <div className="ch-text" key={chapter.index}>
                <span className="ch-index">{chapter.index}</span>
                <h2>{chapter.title}</h2>
                <p className="lead">{chapter.copy}</p>
              </div>
            ))}
          </div>

          <div className="ch-frames">
            {chapters.map((chapter, i) => (
              <div className="ch-frame media" key={chapter.index}>
                <img src={images[i]} alt="" loading={i ? "lazy" : undefined} />
              </div>
            ))}
          </div>
        </div>

        <div className="ch-dots" aria-hidden="true">
          {chapters.map((chapter, i) => (
            <span className={`ch-dot label ${i === 0 ? "is-active" : ""}`} key={chapter.index}>
              {chapter.index}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
