"use client";

import styles from "./ImpactSlider.module.css";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

import ParallaxImage from "@/components/ParallaxImage";

gsap.registerPlugin(ScrollTrigger, SplitText);

const slides = [
  {
    title:
      "Every site opens with its return already funded, the ground measured before the first cut so extraction never outruns the promise to restore.",
    image: "/images/img1.jpg",
  },
  {
    title:
      "From survey stakes to verified close, crews hold the baseline so water is retained, soils are staged, and habitat corridors stay open while remnant ore moves.",
    image: "/images/img2.jpg",
  },
  {
    title:
      "Progress is read in ground given back, not simply ground taken. New expansion waits until reclamation is underway, audited, and moving on schedule.",
    image: "/images/img3.jpg",
  },
  {
    title:
      "Independent assessors confirm every figure we publish, tracking soil, water, and habitat against day one metrics and signing off from outside Ferrana.",
    image: "/images/img4.jpg",
  },
  {
    title:
      "Remediation moves with the operation rather than trailing behind it. Contours, cover, and clear water paths are rebuilt as the work crosses the field.",
    image: "/images/img5.jpg",
  },
  {
    title:
      "Closure is earned only when the land can stand without us, resting on stable ground, lasting habitat, and a future that no longer depends on our presence.",
    image: "/images/img6.jpg",
  },
  {
    title:
      "A site is never judged by the ore it surrenders. It is judged by the condition of the ground left standing once the crews have gone.",
    image: "/images/img7.jpg",
  },
];

export default function ImpactSlider() {
  const sliderRef = useRef(null);
  const imagesRef = useRef(null);
  const titleRef = useRef(null);
  const indicesRef = useRef(null);
  const progressRef = useRef(null);
  const firstParallaxActiveRef = useRef(true);

  useEffect(() => {
    const root = sliderRef.current;
    const imagesEl = imagesRef.current;
    const titleEl = titleRef.current;
    const indicesEl = indicesRef.current;
    const progressEl = progressRef.current;
    if (!root || !imagesEl || !titleEl || !indicesEl || !progressEl) return;

    let activeSlide = 0;
    let currentSplit = null;

    const ctx = gsap.context(() => {
      indicesEl.innerHTML = "";
      slides.forEach((_, index) => {
        const p = document.createElement("p");
        p.dataset.index = String(index);
        p.innerHTML = `<span class="${styles.marker}"></span><span class="mono-sm ${styles.index}">${String(index + 1).padStart(2, "0")}</span>`;
        indicesEl.appendChild(p);

        const indexEl = p.querySelector(`.${styles.index}`);
        const markerEl = p.querySelector(`.${styles.marker}`);
        gsap.set(indexEl, { opacity: index === 0 ? 1 : 0.35 });
        gsap.set(markerEl, { scaleX: index === 0 ? 1 : 0 });
      });

      function animateIndicators(index) {
        indicesEl.querySelectorAll("p").forEach((indicator, i) => {
          const markerEl = indicator.querySelector(`.${styles.marker}`);
          const indexEl = indicator.querySelector(`.${styles.index}`);
          const on = i === index;
          gsap.to(indexEl, {
            opacity: on ? 1 : 0.35,
            duration: 0.3,
            ease: "power2.out",
          });
          gsap.to(markerEl, {
            scaleX: on ? 1 : 0,
            duration: 0.3,
            ease: "power2.out",
          });
        });
      }

      function animateTitle(index) {
        if (currentSplit) currentSplit.revert();
        titleEl.innerHTML = `<h2>${slides[index].title}</h2>`;
        currentSplit = SplitText.create(titleEl.querySelector("h2"), {
          type: "lines",
          linesClass: styles.line,
          mask: "lines",
        });
        gsap.set(currentSplit.lines, { yPercent: 100, opacity: 0 });
        gsap.to(currentSplit.lines, {
          yPercent: 0,
          opacity: 1,
          duration: 0.75,
          stagger: 0.1,
          ease: "power3.out",
        });
      }

      function animateSlide(index) {
        const img = document.createElement("img");
        img.className = styles.dynamicSlide;
        img.src = slides[index].image;
        img.alt = "";
        gsap.set(img, { opacity: 0, scale: 1.1 });
        imagesEl.appendChild(img);

        gsap.to(img, { opacity: 1, duration: 0.5, ease: "power2.out" });
        gsap.to(img, { scale: 1, duration: 1, ease: "power2.out" });

        const all = imagesEl.querySelectorAll(`.${styles.dynamicSlide}`);
        if (all.length > 3) {
          for (let i = 0; i < all.length - 3; i++) all[i].remove();
        }

        animateTitle(index);
        animateIndicators(index);
      }

      animateTitle(0);

      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          gsap.set(progressEl, { scaleY: self.progress });
          firstParallaxActiveRef.current = root.getBoundingClientRect().top > 0;

          const next = Math.min(
            slides.length - 1,
            Math.floor(self.progress * slides.length),
          );
          if (next !== activeSlide) {
            activeSlide = next;
            animateSlide(activeSlide);
          }
        },
      });
    }, root);

    return () => {
      if (currentSplit) currentSplit.revert();
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sliderRef}
      className={styles.slider}
      style={{ "--slide-count": slides.length }}
    >
      <div className={styles.sticky}>
        <div className={styles.images} ref={imagesRef}>
          <div className={styles.parallaxSlide}>
            <ParallaxImage
              src={slides[0].image}
              alt=""
              activeRef={firstParallaxActiveRef}
            />
          </div>
        </div>

        <div className={styles.title} ref={titleRef}>
          <h2>{slides[0].title}</h2>
        </div>

        <div className={styles.indicator}>
          <div className={styles.indices} ref={indicesRef} />
          <div className={styles.progressBar}>
            <div className={styles.progress} ref={progressRef} />
          </div>
        </div>
      </div>
    </section>
  );
}
