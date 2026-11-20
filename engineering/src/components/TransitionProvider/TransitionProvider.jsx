"use client";

import styles from "./TransitionProvider.module.css";

import { memo, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { TransitionRouter, useTransitionState } from "next-transition-router";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { markPreloaderSeen, releasePreloaderVisit } from "@/lib/preloader";
import { BASE } from "@/lib/i18n";

gsap.registerPlugin(ScrollTrigger, CustomEase);

if (typeof window !== "undefined") {
  CustomEase.create("hop", "0.9, 0, 0.1, 1");
}


const FULL = "inset(0px 0px 0px 0px)";
const LOADER_DELAY = 180; // ms: the logo only shows if the next page takes a moment to arrive

// the navbar's box as a clip-path, so the white layer grows out of it and folds back into it;
// when the bar is scrolled away, the layer starts from the top edge of the screen
function fromNavbar() {
  const bar = document.querySelector("[data-site-menu]");
  const r = bar?.getBoundingClientRect();
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (!r || r.bottom <= 0) return `inset(0px 0px ${h}px 0px)`;
  const px = (n) => `${Math.max(0, Math.round(n))}px`;
  return `inset(${px(r.top)} ${px(w - r.right)} ${px(h - r.bottom)} ${px(r.left)})`;
}

const Overlay = memo(function Overlay({ overlayRef }) {
  return (
    <div ref={overlayRef} className={styles.overlay} aria-hidden="true">
      <div className={styles.loader}>
        <svg viewBox="0 0 250 195" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path className={styles.stroke} pathLength="1" d="M220.5 10C175.75 9.25 132.75 31 92 90.25L19.66 206" />
          <path className={styles.stroke} pathLength="1" d="M79 1.5V72.5M80 112V206" />
          <path className={styles.stroke} pathLength="1" d="M142.1 106L233.1 206" />
          <path className={styles.stroke} pathLength="1" d="M1 104H246" />
          <rect className={styles.dot} x="232" y="2" width="18" height="18" />
        </svg>
      </div>
    </div>
  );
});

// stands in for the router's `auto` mode, which hands the rendered href (base path included) to
// router.push, which adds the base path again. Links that leave the app (the main site) load normally.
function LinkTransitions() {
  const { navigate } = useTransitionState();
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    const onClick = (event) => {
      const link = event.target.closest?.("a[href]");
      if (!link || link.hasAttribute("data-transition-ignore")) return;
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if ((link.target && link.target !== "_self") || link.download) return;
      if (link.origin !== window.location.origin) return;

      const path = link.pathname;
      if (path !== BASE && !path.startsWith(`${BASE}/`)) return;

      // same page: the route won't change, so the curtain would cover the screen and never
      // lift. In-page anchors (#devops…) are left to the page's own scroll handlers; a link to
      // the current page just glides back to the top.
      const trim = (p) => p.replace(/\/+$/, "");
      if (trim(path) === trim(window.location.pathname)) {
        if (link.hash) return;
        event.preventDefault();
        if (lenis) lenis.scrollTo(0, { duration: 1.2 });
        else window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // capture phase: Next's Link sees defaultPrevented and leaves the navigation to us
      event.preventDefault();
      navigate(path.slice(BASE.length) || "/", pathname);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [navigate, pathname, lenis]);

  return null;
}

export default function TransitionProvider({ children }) {
  const overlayRef = useRef(null);
  const timelineRef = useRef(null);
  const lenisRef = useRef(null);
  const stuckRef = useRef(null);
  const loaderRef = useRef(null);
  const lenis = useLenis();

  lenisRef.current = lenis;

  const showLoader = (on) => {
    clearTimeout(loaderRef.current);
    const overlay = overlayRef.current;
    if (!overlay) return;
    if (on) loaderRef.current = setTimeout(() => overlay.classList.add(styles.loading), LOADER_DELAY);
    else overlay.classList.remove(styles.loading);
  };

  const hide = () => {
    const overlay = overlayRef.current;
    if (overlay) gsap.set(overlay, { autoAlpha: 0, pointerEvents: "none", visibility: "hidden" });
  };

  // safety net: if a navigation never reaches `enter` (route unchanged, failed load…), fold the
  // layer back anyway so the site can't stay covered and scroll-locked
  const uncover = () => {
    const overlay = overlayRef.current;
    timelineRef.current?.kill();
    showLoader(false);
    if (overlay) gsap.to(overlay, { "--clip": fromNavbar(), duration: 0.7, ease: "hop", onComplete: hide });
    lenisRef.current?.start();
  };

  useEffect(() => {
    return () => {
      timelineRef.current?.kill();
      clearTimeout(stuckRef.current);
      clearTimeout(loaderRef.current);
    };
  }, []);

  return (
    <TransitionRouter
      leave={(next) => {
        markPreloaderSeen();
        releasePreloaderVisit();

        const overlay = overlayRef.current;
        if (!overlay) {
          next();
          return;
        }

        timelineRef.current?.kill();
        showLoader(false);
        gsap.set(overlay, { "--clip": fromNavbar(), autoAlpha: 1, visibility: "visible", pointerEvents: "auto" });
        lenisRef.current?.stop();

        // the white layer drops out of the navbar until it covers the screen
        const tl = gsap.timeline({
          onComplete: () => {
            window.dispatchEvent(new Event("transition-cover"));
            showLoader(true);
            clearTimeout(stuckRef.current);
            stuckRef.current = setTimeout(uncover, 6000);
            next();
          },
        });
        tl.to(overlay, { "--clip": FULL, duration: 0.75, ease: "hop" }, 0);
        timelineRef.current = tl;
      }}
      enter={(next) => {
        clearTimeout(stuckRef.current);
        const overlay = overlayRef.current;

        const finish = () => {
          hide();
          ScrollTrigger.refresh();
          lenisRef.current?.start();
          next();
        };

        lenisRef.current?.scrollTo(0, { immediate: true, force: true });
        window.scrollTo(0, 0);

        if (!overlay) {
          finish();
          return;
        }

        const playOut = () => {
          showLoader(false);
          // the new page is ready: the layer folds back up into the navbar
          timelineRef.current = gsap.to(overlay, {
            "--clip": fromNavbar(),
            duration: 0.75,
            delay: 0.1,
            ease: "hop",
            onComplete: finish,
          });
        };

        const cover = timelineRef.current;
        if (cover?.isActive()) cover.eventCallback("onComplete", () => {
          window.dispatchEvent(new Event("transition-cover"));
          playOut();
        });
        else playOut();

        return () => timelineRef.current?.kill();
      }}
    >
      <LinkTransitions />
      <Overlay overlayRef={overlayRef} />
      {children}
    </TransitionRouter>
  );
}
