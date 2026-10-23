"use client";
import "./CollectionsIndex.css";
import { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import Copy from "../Copy/Copy";
import { lines } from "@/data/lines";
import { useHref, useT } from "@/i18n/DictProvider";

gsap.registerPlugin(ScrollTrigger);

// Line index: a floating preview trails the pointer and the section takes
// on each line's tint (Blue Celeste, Pearl Aqua, Riviera…).
export default function CollectionsIndex({ label, title, copy }) {
  const href = useHref();
  const t = useT();
  const ref = useRef(null);
  const previewRef = useRef(null);
  const [active, setActive] = useState(-1);
  const movers = useRef(null);

  useGSAP(
    () => {
      const preview = previewRef.current;
      movers.current = {
        x: gsap.quickTo(preview, "x", { duration: 0.7, ease: "power3" }),
        y: gsap.quickTo(preview, "y", { duration: 0.7, ease: "power3" }),
        r: gsap.quickTo(preview, "rotate", { duration: 0.9, ease: "power3" }),
      };
      gsap.from(".ci-row", {
        y: 60,
        opacity: 0,
        stagger: 0.08,
        duration: 1.1,
        ease: "power4.out",
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
      });
    },
    { scope: ref }
  );

  const onMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const m = movers.current;
    if (!m) return;
    m.r(gsap.utils.clamp(-8, 8, (x - (m.lastX ?? x)) * 0.4));
    m.lastX = x;
    m.x(x);
    m.y(e.clientY - rect.top);
  };

  const line = lines[active];
  const style = line ? { "--ci-bg": line.tint, "--ci-fg": line.ink } : undefined;

  return (
    <section
      className={`collections-index ${active >= 0 ? "is-active" : ""}`}
      ref={ref}
      style={style}
      onPointerMove={onMove}
      onPointerLeave={() => setActive(-1)}
    >
      <div className="container">
        <div className="ci-head">
          <span className="label gold">{label}</span>
          <Copy>
            <h2>{title}</h2>
          </Copy>
          {copy && <p className="lead ci-copy">{copy}</p>}
        </div>

        <ul className="ci-list">
          {lines.map((item, i) => (
            <li key={item.id} className="ci-row">
              <Link
                href={href(item.href)}
                className={`ci-link ${active === i ? "is-hover" : ""}`}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
              >
                <span className="label ci-index">{String(i + 1).padStart(2, "0")}</span>
                <span className="ci-name">{item.name}</span>
                <span className="label ci-season">{t(item.season)}</span>
                <span className="ci-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="ci-preview" ref={previewRef} aria-hidden="true">
        {lines.map((item, i) => (
          <img key={item.id} src={item.image} alt="" className={active === i ? "is-active" : ""} />
        ))}
      </div>
    </section>
  );
}
