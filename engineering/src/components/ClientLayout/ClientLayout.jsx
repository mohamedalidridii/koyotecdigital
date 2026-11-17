"use client";

import "lenis/dist/lenis.css";

import { useEffect, useLayoutEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";

import TransitionProvider from "@/components/TransitionProvider";

import { shouldShowPreloader } from "@/lib/preloader";
import { splitPath } from "@/lib/i18n";

gsap.registerPlugin(ScrollTrigger);

const MOBILE_BREAKPOINT = 1000;

const LENIS_EASING = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

const LENIS_SHARED = {
  easing: LENIS_EASING,
  direction: "vertical",
  gestureDirection: "vertical",
  smooth: true,
  infinite: false,
  wheelMultiplier: 1,
  orientation: "vertical",
  smoothWheel: true,
  syncTouch: true,
};

const LENIS_MOBILE = {
  ...LENIS_SHARED,
  duration: 0.8,
  smoothTouch: true,
  touchMultiplier: 1.5,
  lerp: 0.09,
};

const LENIS_DESKTOP = {
  ...LENIS_SHARED,
  duration: 1.2,
  smoothTouch: false,
  touchMultiplier: 2,
  lerp: 0.1,
};

function LenisScrollTriggerBridge() {
  useLenis(() => {
    ScrollTrigger.update();
  });

  return null;
}

function LenisGate() {
  const pathname = usePathname();
  const lenis = useLenis();

  useLayoutEffect(() => {
    if (!lenis) return;

    lenis.stop();
    if (splitPath(pathname).route !== "/" || !shouldShowPreloader()) lenis.start();
  }, [lenis, pathname]);

  return null;
}

// analytics: how far visitors scroll each Engineering page (25 / 50 / 75 / 100%), once per page view.
// Same event as the koyotec.digital articles ("scroll-depth" with page + depth).
function useScrollDepth(pathname) {
  useEffect(() => {
    const marks = [25, 50, 75, 100];
    const sent = new Set();
    const check = () => {
      const doc = document.documentElement;
      const read = (window.scrollY + window.innerHeight) / Math.max(1, doc.scrollHeight);
      for (const m of marks) {
        if (!sent.has(m) && read >= m / 100 - (m === 100 ? 0.02 : 0)) {
          sent.add(m);
          try {
            // full path (with /engineering), like the rest of the site's analytics
            window.umami?.track("scroll-depth", { page: window.location.pathname, depth: `${m}%` });
          } catch {
            /* ignore */
          }
        }
      }
    };
    // wait for the page transition and intro before measuring
    const start = setTimeout(() => {
      window.addEventListener("scroll", check, { passive: true });
    }, 1500);
    return () => {
      clearTimeout(start);
      window.removeEventListener("scroll", check);
    };
  }, [pathname]);
}

export default function ClientLayout({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  useScrollDepth(usePathname());

  useEffect(() => {
    const handleResize = () =>
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const lenisOptions = isMobile ? LENIS_MOBILE : LENIS_DESKTOP;

  return (
    <ReactLenis root options={lenisOptions}>
      <LenisScrollTriggerBridge />
      <LenisGate />
      <TransitionProvider>{children}</TransitionProvider>
    </ReactLenis>
  );
}
