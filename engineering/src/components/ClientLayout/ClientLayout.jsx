"use client";

import "lenis/dist/lenis.css";

import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";

import TransitionProvider from "@/components/TransitionProvider";

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
  syncTouch: false,
};

// phones keep their own native scrolling (momentum, overscroll, accessibility settings): Lenis only
// smooths the mouse wheel
const LENIS_MOBILE = {
  ...LENIS_SHARED,
  syncTouch: false,
  smoothTouch: false,
  lerp: 0.1,
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

const umamiTrack = (name, data) => {
  try {
    window.umami?.track(name, data);
  } catch {
    /* analytics must never break the page */
  }
};

// analytics: clicks on elements with data-track="event" (+ data-track-place="…" and other data-track-* fields)
// send that event and leave the click alone, so page transitions keep working. Umami's own data-umami-event is
// avoided on purpose: its tracker cancels the click and sets location.href once its request is answered (a full
// page load, held while the analytics server is slow). umami.track() sends with fetch keepalive.

// funnel-click: every click that leads toward a conversation, whatever the link and whether or not it
// carries its own data-track: contact page, WhatsApp, e-mail, phone, the audit offer. One event name, so
// "how many people wanted to talk" is one number, with where it happened (nav, menu, footer, sticky bar,
// or the section) and where it goes. It only sends the event: the click itself is left alone.
function funnelTarget(a) {
  const href = a.getAttribute("href") || "";
  if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)/i.test(href)) return "whatsapp";
  if (/^mailto:/i.test(href)) return "email";
  if (/^tel:/i.test(href)) return "phone";
  let u;
  try {
    u = new URL(href, window.location.href);
  } catch {
    return null;
  }
  if (u.origin !== window.location.origin) return null;
  if (/[?&]need=/.test(u.search) || /\/nearshore\/?$/.test(u.pathname)) return "audit";
  if (/\/contact(\.html)?\/?$/.test(u.pathname)) return "contact";
  return null;
}

// CSS module classes look like "Menu-module__hash__deskLink": the component name says where the link is
function funnelPlace(a) {
  const inside = (name) => a.closest(`[class*="${name}-module__"]`);
  if (inside("Menu")) return "menu";
  if (a.closest("footer") || inside("Footer")) return "footer";
  if (a.closest("nav")) return "nav";
  const sec = a.closest("section, article, header");
  if (sec) {
    if (sec.dataset.umamiSection) return sec.dataset.umamiSection;
    const mod = String(sec.className || "").match(/([A-Za-z0-9]+)-module__[^_\s]+__([A-Za-z0-9]+)/);
    return mod ? `${mod[1]}.${mod[2]}` : sec.tagName.toLowerCase();
  }
  return "page";
}

function useTrackedClicks() {
  useEffect(() => {
    const onClick = (e) => {
      const target = e.target instanceof Element ? e.target : null;
      const a = target?.closest("a[href]");
      const to = a ? funnelTarget(a) : null;
      if (to) umamiTrack("funnel-click", { to, place: funnelPlace(a), page: window.location.pathname, own: a.closest("[data-track]") ? "yes" : "no" });
      const el = target?.closest("[data-track]");
      if (!el) return;
      const data = {};
      for (const { name, value } of el.attributes) if (name.startsWith("data-track-")) data[name.slice(11)] = value;
      umamiTrack(el.getAttribute("data-track"), Object.keys(data).length ? data : undefined);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
}

// analytics: real reading time per page view (30 s, 2 min), counted only while the tab is visible
function useEngagedTime(pathname) {
  useEffect(() => {
    const page = window.location.pathname;
    let seconds = 0;
    const tick = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      seconds += 1;
      if (seconds === 30) umamiTrack("engaged", { page, time: "30s" });
      if (seconds === 120) {
        umamiTrack("engaged", { page, time: "2min" });
        clearInterval(tick);
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [pathname]);
}

// analytics: which sections of a page are actually seen, once per section per page view
function sectionName(el) {
  if (el.dataset.umamiSection) return el.dataset.umamiSection;
  const mod = String(el.className || "").match(/__([A-Za-z0-9]+)(?:\s|$)/); // CSS module: "home-module__hash__hero"
  if (mod) return mod[1];
  const h = el.querySelector("h1, h2, h3, h6");
  return h ? h.textContent.trim().slice(0, 40) : null;
}
function useSectionViews(pathname) {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const page = window.location.pathname;
    const seen = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const name = sectionName(e.target);
          io.unobserve(e.target);
          if (!name || seen.has(name)) continue;
          seen.add(name);
          umamiTrack("section-view", { page, section: name });
        }
      },
      // a section counts as seen when it crosses the middle band of the screen (works for tall sections too)
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    // after the page transition and intro, so sections hidden behind them are not counted
    const start = setTimeout(() => document.querySelectorAll("section").forEach((s) => io.observe(s)), 1500);
    return () => {
      clearTimeout(start);
      io.disconnect();
    };
  }, [pathname]);
}

// analytics: email or phone copied instead of clicked
const COPY_EMAIL = /[\w.+-]+@[\w-]+\.[\w.]{2,}/;
const COPY_PHONE = /(\+?216)?[\s.]?\d{2}[\s.]?\d{3}[\s.]?\d{3}/;
function useContactCopy() {
  useEffect(() => {
    const onCopy = () => {
      const text = String(window.getSelection?.() || "").trim();
      if (!text || text.length > 120) return;
      const type = COPY_EMAIL.test(text) ? "email" : COPY_PHONE.test(text) ? "phone" : null;
      if (type) umamiTrack("contact-copy", { type, page: window.location.pathname });
    };
    document.addEventListener("copy", onCopy);
    return () => document.removeEventListener("copy", onCopy);
  }, []);
}

export default function ClientLayout({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  const currentPath = usePathname();
  useScrollDepth(currentPath);
  useEngagedTime(currentPath);
  useSectionViews(currentPath);
  useContactCopy();
  useTrackedClicks();

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
      <TransitionProvider>{children}</TransitionProvider>
    </ReactLenis>
  );
}
