"use client";
import "./Film.css";
import { useEffect, useRef } from "react";

import Copy from "../Copy/Copy";

// Muted looping film that only plays while on screen. With reduced motion
// it stays on its poster frame.
export default function Film({ src, poster, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? video.play().catch(() => {}) : video.pause()),
      { threshold: 0.25 }
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={`film ${className}`}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
    />
  );
}

// Full-width cinema band: caption above a wide film.
export function FilmBand({ label, title, film, dark = false }) {
  return (
    <section className={`film-band ${dark ? "dark" : ""}`}>
      <div className="container">
        <div className="fb-head">
          <span className="label gold">{label}</span>
          <Copy>
            <h3>{title}</h3>
          </Copy>
        </div>
        <div className="fb-frame media">
          <Film src={film.src} poster={film.poster} />
        </div>
      </div>
    </section>
  );
}
