"use client";

import styles from "./TransitionProvider.module.css";

import { memo, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { TransitionRouter, useTransitionState } from "next-transition-router";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

import { markPreloaderSeen, releasePreloaderVisit } from "@/lib/preloader";
import { BASE, DICTS, splitPath } from "@/lib/i18n";

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

if (typeof window !== "undefined") {
  CustomEase.create("hop", "0.9, 0, 0.1, 1");
}


const OPEN = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
const CLOSED = "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)";

function band(percent, span) {
  const top = (50 - percent).toFixed(3);
  const bottom = (50 + percent).toFixed(3);
  return `polygon(0% ${top}%, ${span}% ${top}%, ${span}% ${bottom}%, 0% ${bottom}%)`;
}

const Overlay = memo(function Overlay({ overlayRef, titleRef }) {
  return (
    <div ref={overlayRef} className={styles.overlay} aria-hidden="true">
      <p ref={titleRef} className={styles.title} />
    </div>
  );
});

// stands in for the router's `auto` mode, which hands the rendered href (base path included) to
// router.push, which adds the base path again. Links that leave the app (the main site) load normally.
function LinkTransitions() {
  const { navigate } = useTransitionState();
  const pathname = usePathname();

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

      // capture phase: Next's Link sees defaultPrevented and leaves the navigation to us
      event.preventDefault();
      navigate(path.slice(BASE.length) || "/", pathname);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [navigate, pathname]);

  return null;
}

function pageLabel(to) {
  const { lang, route } = splitPath(to);
  const t = DICTS[lang];
  return t.transition[route] ?? t.transition["/"];
}

export default function TransitionProvider({ children }) {
  const overlayRef = useRef(null);
  const titleRef = useRef(null);
  const splitRef = useRef(null);
  const timelineRef = useRef(null);
  const lenisRef = useRef(null);
  const lenis = useLenis();

  lenisRef.current = lenis;

  const revertSplit = () => {
    splitRef.current?.revert();
    splitRef.current = null;
  };

  useEffect(() => {
    return () => {
      timelineRef.current?.kill();
      revertSplit();
    };
  }, []);

  return (
    <TransitionRouter
      leave={(next, _from, to) => {
        markPreloaderSeen();
        releasePreloaderVisit();

        const overlay = overlayRef.current;
        const title = titleRef.current;

        if (!overlay || !title) {
          next();
          return;
        }

        timelineRef.current?.kill();
        revertSplit();

        title.textContent = pageLabel(to);
        splitRef.current = new SplitText(title, {
          type: "words",
          mask: "words",
          wordsClass: styles.word,
        });

        const overlayHeight =
          overlay.getBoundingClientRect().height || window.innerHeight;
        const percent =
          (title.getBoundingClientRect().height / overlayHeight) * 50;

        gsap.set(overlay, {
          "--clip": band(percent, 0),
          autoAlpha: 1,
          visibility: "visible",
          pointerEvents: "auto",
        });

        lenisRef.current?.stop();

        const tl = gsap.timeline({
          defaults: { duration: 1, ease: "hop" },
        });

        tl.to(overlay, { "--clip": band(percent, 100) });
        tl.to(overlay, {
          "--clip": OPEN,
          onComplete: () => {
            window.dispatchEvent(new Event("transition-cover"));
            next();
          },
        });

        timelineRef.current = tl;
      }}
      enter={(next) => {
        const overlay = overlayRef.current;
        const words = splitRef.current?.words;

        const finish = () => {
          if (overlay) {
            gsap.set(overlay, {
              autoAlpha: 0,
              pointerEvents: "none",
              visibility: "hidden",
            });
          }
          revertSplit();
          ScrollTrigger.refresh();
          lenisRef.current?.start();
          next();
        };

        lenisRef.current?.scrollTo(0, { immediate: true, force: true });
        window.scrollTo(0, 0);

        if (!overlay || !words?.length) {
          finish();
          return;
        }

        const playOut = () => {
          const tl = gsap.timeline({
            defaults: { duration: 1, ease: "hop" },
            onComplete: finish,
          });

          tl.to(
            words,
            {
              yPercent: -120,
              duration: 1,
              ease: "power3.out",
              stagger: { amount: 0.1 },
            },
            0,
          );
          tl.to(overlay, { "--clip": CLOSED, delay: 0.25 }, 0);

          timelineRef.current = tl;
        };

        const cover = timelineRef.current;
        if (cover?.isActive()) cover.eventCallback("onComplete", playOut);
        else playOut();

        return () => timelineRef.current?.kill();
      }}
    >
      <LinkTransitions />
      <Overlay overlayRef={overlayRef} titleRef={titleRef} />
      {children}
    </TransitionRouter>
  );
}
