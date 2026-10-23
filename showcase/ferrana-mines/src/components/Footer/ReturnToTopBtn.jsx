"use client";

import { useLenis } from "lenis/react";

import Btn from "@/components/Btn";

export default function ReturnToTopBtn({
  className = "",
  reveal = false,
  triggerPoint = null,
  start = null,
  delay = 0,
}) {
  const lenis = useLenis();

  return (
    <Btn
      href="#top"
      label="Return to top"
      className={className}
      reveal={reveal}
      triggerPoint={triggerPoint}
      start={start}
      delay={delay}
      onClick={(e) => {
        e.preventDefault();
        lenis?.scrollTo(0);
      }}
    />
  );
}
