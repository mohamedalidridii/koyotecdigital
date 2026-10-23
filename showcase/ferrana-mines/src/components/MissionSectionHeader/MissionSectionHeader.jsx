"use client";

import styles from "./MissionSectionHeader.module.css";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import Copy from "@/components/Copy";

gsap.registerPlugin(ScrollTrigger);

export default function MissionSectionHeader({
  children,
  className = "",
  labelId,
}) {
  const iconRef = useRef(null);

  useGSAP(
    () => {
      if (!labelId || !iconRef.current) return;

      const trigger = document.getElementById(labelId);
      if (!trigger) return;

      gsap.set(iconRef.current, { scale: 0, transformOrigin: "left center" });
      gsap.to(iconRef.current, {
        scale: 1,
        duration: 0.8,
        ease: "power4.out",
        scrollTrigger: {
          trigger,
          start: "top 80%",
          once: true,
        },
      });
    },
    { dependencies: [labelId] },
  );

  const label = labelId ? (
    <Copy>
      <span id={labelId}>{children}</span>
    </Copy>
  ) : (
    children
  );

  return (
    <div className={`${styles.header}${className ? ` ${className}` : ""}`}>
      <svg
        ref={iconRef}
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M4 4V5.4C4 8.76031 4 10.4405 4.65396 11.7239C5.2292 12.8529 6.14708 13.7708 7.27606 14.346C8.55953 15 10.2397 15 13.6 15H20M20 15L15 10M20 15L15 20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <h4>{label}</h4>
    </div>
  );
}
