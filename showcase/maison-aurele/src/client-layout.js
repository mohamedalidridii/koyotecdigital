"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { ReactLenis } from "lenis/react";

export default function ClientLayout({ children, footer }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1000);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Every page starts on ivory; sections may tint the body while scrolling
    document.body.style.removeProperty("--bg");
    document.body.style.removeProperty("--fg");
  }, [pathname]);

  const scrollSettings = isMobile
    ? { lerp: 0.09, touchMultiplier: 1.5, smoothWheel: true, syncTouch: true }
    : { lerp: 0.085, wheelMultiplier: 1, smoothWheel: true };

  const hideFooter = pathname?.endsWith("/lookbook");

  return (
    <ReactLenis root options={scrollSettings}>
      <div className="page">
        {children}
        {!hideFooter && footer}
      </div>
    </ReactLenis>
  );
}
