"use client";
import "./CollectionGallery.css";
import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import Copy from "../Copy/Copy";
import { useDict, useHref } from "@/i18n/DictProvider";

gsap.registerPlugin(ScrollTrigger);

const FRAMES = [
  { src: "/aurele/pieces/robe-or-brodee.jpg", slug: "robe-or-brodee", size: "tall" },
  { src: "/aurele/details/broderie-or.jpg", slug: "robe-or-brodee", size: "short" },
  { src: "/aurele/pieces/fourreau-fleurs-or.jpg", slug: "fourreau-fleurs-or", size: "mid" },
  { src: "/aurele/pieces/robe-bustier-pourpre-1.jpg", slug: "robe-bustier-pourpre", size: "tall" },
  { src: "/aurele/details/perlage.jpg", slug: "sirene-sequins-or", size: "short" },
  { src: "/aurele/pieces/robe-manches-cloche.jpg", slug: "robe-manches-cloche", size: "mid" },
];

// Horizontal run through the collection: vertical scroll drives the track,
// scroll velocity leans the frames, images drift inside their masks.
export default function CollectionGallery() {
  const dict = useDict();
  const href = useHref();
  const ref = useRef(null);
  const trackRef = useRef(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(ref);
      const track = trackRef.current;
      const distance = () => track.scrollWidth - window.innerWidth;

      const skew = gsap.quickTo(q(".dg-frame"), "skewX", { duration: 0.6, ease: "power3" });

      const run = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            skew(gsap.utils.clamp(-6, 6, self.getVelocity() / -400));
            gsap.set(q(".dg-progress i"), { scaleX: self.progress });
          },
          onToggle: (self) => !self.isActive && skew(0),
        },
      });

      q(".dg-frame img").forEach((image) => {
        gsap.fromTo(
          image,
          { xPercent: -9 },
          {
            xPercent: 9,
            ease: "none",
            scrollTrigger: {
              trigger: image.parentElement,
              containerAnimation: run,
              start: "left right",
              end: "right left",
              scrub: true,
            },
          }
        );
      });
    },
    { scope: ref }
  );

  return (
    <section className="collection-gallery" ref={ref}>
      <div className="dg-track" ref={trackRef}>
        <div className="dg-intro">
          <span className="label gold">{dict.home.galleryLabel}</span>
          <Copy>
            <h2>{dict.home.galleryTitle}</h2>
          </Copy>
          <Copy>
            <p className="lead">{dict.home.galleryCopy}</p>
          </Copy>
        </div>

        {FRAMES.map((frame, i) => (
          <Link
            href={href(`/piece/${frame.slug}`)}
            className={`dg-item ${frame.size}`}
            key={frame.src}
            data-cursor={dict.common.discover}
          >
            <div className="dg-frame media">
              <img src={frame.src} alt="" loading="lazy" />
            </div>
            <div className="dg-caption">
              <span className="label gold">{String(i + 1).padStart(2, "0")}</span>
              <span className="dg-caption-word">{dict.home.galleryCaptions[i]}</span>
            </div>
          </Link>
        ))}

        <div className="dg-outro">
          <Link href={href("/collections")} className="pill">
            {dict.common.viewAll}
          </Link>
        </div>
      </div>

      <div className="dg-progress container" aria-hidden="true">
        <i />
      </div>
    </section>
  );
}
