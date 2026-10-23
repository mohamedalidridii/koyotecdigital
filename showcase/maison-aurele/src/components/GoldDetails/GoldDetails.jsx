"use client";
import "./GoldDetails.css";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import Copy from "../Copy/Copy";
import { useDict } from "@/i18n/DictProvider";
import { img } from "@/data/media";

gsap.registerPlugin(ScrollTrigger);

const DETAILS = [img.embroidery, img.beading, img.button, img.hand];

export default function GoldDetails() {
  const dict = useDict();
  const ref = useRef(null);
  const canvasRef = useRef(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(ref);

      // A light streak crosses each detail as it scrolls through the viewport
      q(".gd-item").forEach((item, i) => {
        gsap.fromTo(
          item.querySelector(".gd-sheen"),
          { xPercent: -160 },
          {
            xPercent: 160,
            ease: "none",
            scrollTrigger: { trigger: item, start: "top 85%", end: "bottom 15%", scrub: 0.8 },
          }
        );
        gsap.fromTo(
          item.querySelector("img"),
          { yPercent: -8, scale: 1.15 },
          {
            yPercent: 8,
            scale: 1.05,
            ease: "none",
            scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
        gsap.from(item, {
          clipPath: "inset(100% 0% 0% 0%)",
          duration: 1.4,
          delay: (i % 2) * 0.15,
          ease: "power4.out",
          scrollTrigger: { trigger: item, start: "top 85%" },
        });
      });
    },
    { scope: ref }
  );

  // Gold dust trailing the pointer inside the section
  useEffect(() => {
    const canvas = canvasRef.current;
    const section = ref.current;
    if (!canvas || !section) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio, 2);
    let particles = [];
    let raf = 0;
    let running = false;

    const resize = () => {
      canvas.width = section.offsetWidth * dpr;
      canvas.height = section.offsetHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter((p) => p.life > 0);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.012;
        p.life -= 0.012;
        ctx.globalAlpha = Math.max(p.life, 0) * 0.9;
        ctx.fillStyle = p.hue;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
      if (particles.length) raf = requestAnimationFrame(loop);
      else running = false;
    };

    const onMove = (e) => {
      const rect = section.getBoundingClientRect();
      const x = (e.clientX - rect.left) * dpr;
      const y = (e.clientY - rect.top) * dpr;
      for (let i = 0; i < 2; i++) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.8) * 0.8,
          r: Math.random() * 1.6 + 0.4,
          life: 1,
          hue: Math.random() > 0.5 ? "#dcc08a" : "#f4e2b8",
        });
      }
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    section.addEventListener("pointermove", onMove);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      section.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <section className="gold-details" ref={ref}>
      <canvas className="gd-dust" ref={canvasRef} aria-hidden="true" />
      <div className="container gd-inner">
        <div className="gd-text">
          <span className="label gold">{dict.home.goldLabel}</span>
          <Copy>
            <h2>{dict.home.goldTitle}</h2>
          </Copy>
          <Copy>
            <p className="lead">{dict.home.goldCopy}</p>
          </Copy>
        </div>

        <div className="gd-grid">
          {DETAILS.map((src, i) => (
            <figure className="gd-item media" key={src}>
              <img src={src} alt="" loading="lazy" />
              <span className="gd-sheen" aria-hidden="true" />
              <figcaption className="label">
                <span className="gold">{String(i + 1).padStart(2, "0")}</span> {dict.home.goldItems[i]}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
