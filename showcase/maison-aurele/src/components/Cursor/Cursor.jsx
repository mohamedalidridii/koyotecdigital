"use client";
import "./Cursor.css";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

// Gold "jewel" cursor: a dot that follows tightly and a halo that trails.
// Elements with [data-cursor="Label"] expand the halo and show the label.
export default function Cursor() {
  const dotRef = useRef(null);
  const haloRef = useRef(null);
  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    setEnabled(true);
    document.documentElement.classList.add("has-cursor");

    const dotX = gsap.quickTo(dotRef.current, "x", { duration: 0.12, ease: "power3" });
    const dotY = gsap.quickTo(dotRef.current, "y", { duration: 0.12, ease: "power3" });
    const haloX = gsap.quickTo(haloRef.current, "x", { duration: 0.55, ease: "power3" });
    const haloY = gsap.quickTo(haloRef.current, "y", { duration: 0.55, ease: "power3" });

    const onMove = (e) => {
      if (!dotRef.current) return;
      dotX(e.clientX);
      dotY(e.clientY);
      haloX(e.clientX);
      haloY(e.clientY);
    };

    // Refs are detached before passive cleanups run when the layout remounts
    const onOver = (e) => {
      if (!haloRef.current) return;
      const target = e.target.closest("[data-cursor], a, button, input, textarea, select");
      haloRef.current.classList.toggle("is-hover", !!target);
      const text = target?.getAttribute("data-cursor") || "";
      haloRef.current.classList.toggle("has-label", !!text);
      setLabel(text);
    };

    const fade = (opacity) => {
      const els = [dotRef.current, haloRef.current].filter(Boolean);
      if (els.length) gsap.to(els, { opacity, duration: 0.3 });
    };
    const onLeave = () => fade(0);
    const onEnter = () => fade(1);
    const onDown = () => haloRef.current?.classList.add("is-down");
    const onUp = () => haloRef.current?.classList.remove("is-down");

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerover", onOver);
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  // Reset hover state when the route changes under a hovered link
  useEffect(() => {
    haloRef.current?.classList.remove("is-hover", "has-label");
    setLabel("");
  }, [pathname]);

  return (
    <div className={`cursor ${enabled ? "" : "is-disabled"}`} aria-hidden="true">
      <div className="cursor-halo" ref={haloRef}>
        <span className="cursor-label">{label}</span>
      </div>
      <div className="cursor-dot" ref={dotRef} />
    </div>
  );
}
