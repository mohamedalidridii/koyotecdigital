"use client";
import "./MarqueeBanner.css";
import { Fragment, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { Emblem } from "../BrandIcon/BrandIcon";

gsap.registerPlugin(ScrollTrigger);

// Endless ribbon of words; scrolling speeds it up and flips its direction.
export default function MarqueeBanner({ words = [], dark = false }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      const tracks = gsap.utils.toArray(".mq-track", ref.current);
      // Each track holds two copies of the words, so -50% is one seamless period
      const loops = tracks.map((track) => {
        const loop = gsap.to(track, { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
        loop.totalTime(loop.duration() * 1000); // headroom to run backwards
        return loop;
      });
      const base = [1, -1]; // second row runs the other way
      loops.forEach((loop, i) => loop.timeScale(base[i]));

      let direction = 1;
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const v = self.getVelocity();
          if (Math.abs(v) > 10) direction = v > 0 ? 1 : -1;
          const boost = 1 + Math.min(Math.abs(v) / 400, 6);
          loops.forEach((loop, i) => {
            const speed = base[i] * direction;
            gsap.to(loop, { timeScale: speed * boost, duration: 0.2, overwrite: true });
            gsap.to(loop, { timeScale: speed, duration: 1.2, delay: 0.2, ease: "power2.out" });
          });
        },
      });
    },
    { scope: ref, dependencies: [words.join("|")] }
  );

  const row = (
    <>
      {[0, 1].map((copy) => (
        <Fragment key={copy}>
          {words.map((word, i) => (
            <Fragment key={`${copy}-${i}`}>
              <span className={`mq-word ${i % 2 ? "italic" : ""}`}>{word}</span>
              <span className="mq-emblem">
                <Emblem />
              </span>
            </Fragment>
          ))}
        </Fragment>
      ))}
    </>
  );

  return (
    <section className={`marquee ${dark ? "dark" : ""}`} ref={ref} aria-label={words.join(" — ")}>
      <div className="mq-row">
        <div className="mq-track" aria-hidden="true">
          {row}
        </div>
      </div>
      <div className="mq-row">
        <div className="mq-track" aria-hidden="true">
          {row}
        </div>
      </div>
    </section>
  );
}
