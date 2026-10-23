"use client";

import styles from "./Menu.module.css";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
import gsap from "gsap";

import TransitionLink from "@/components/TransitionLink";

import { triggerPageTransition } from "@/lib/pageTransition";

import { useMenu } from "./MenuContext";
import { easeOut, hop } from "./eases";

const links = [
  { href: "/", label: "Home" },
  { href: "/initiatives", label: "Initiatives" },
  { href: "/mission", label: "Mission" },
  { href: "/impact", label: "Impact" },
  { href: "/contact", label: "Contact" },
];

const metaLeft = [
  "Connect",
  "Explore",
  null,
  "Contact",
  null,
  "Ferrana",
  "Remnant Ore",
  "Lasting Impact",
];

const metaRight = [
  "Instagram",
  "LinkedIn",
  null,
  "Email",
  null,
  "hello@ferrana.tn",
];

const pageDuration = 1.25;
const DESKTOP_HOVER_QUERY = "(min-width: 1001px)";

function MenuNavLink({ href, label, onNavigate, resetKey }) {
  const underlineRef = useRef(null);
  const underlineLockedRef = useRef(false);

  useEffect(() => {
    underlineLockedRef.current = false;
    const underline = underlineRef.current;
    if (!underline) return;

    gsap.killTweensOf(underline);
    gsap.set(underline, { scaleX: 0, transformOrigin: "left center" });
  }, [resetKey]);

  function showUnderline() {
    if (underlineLockedRef.current) return;

    const underline = underlineRef.current;
    if (!underline || !window.matchMedia(DESKTOP_HOVER_QUERY).matches) return;

    gsap.killTweensOf(underline);
    gsap.to(underline, {
      scaleX: 1,
      transformOrigin: "left center",
      duration: 0.4,
      ease: easeOut,
    });
  }

  function hideUnderline() {
    if (underlineLockedRef.current) return;

    const underline = underlineRef.current;
    if (!underline || !window.matchMedia(DESKTOP_HOVER_QUERY).matches) return;

    gsap.killTweensOf(underline);
    gsap.to(underline, {
      scaleX: 0,
      transformOrigin: "right center",
      duration: 0.4,
      ease: easeOut,
    });
  }

  function handleClick(event) {
    const underline = underlineRef.current;
    if (underline && window.matchMedia(DESKTOP_HOVER_QUERY).matches) {
      underlineLockedRef.current = true;
      gsap.killTweensOf(underline);
      gsap.set(underline, { scaleX: 1, transformOrigin: "left center" });
    }

    onNavigate?.(event);
  }

  return (
    <TransitionLink
      href={href}
      className={styles.menuLink}
      onClick={handleClick}
      onMouseEnter={showUnderline}
      onMouseLeave={hideUnderline}
    >
      {label}
      <span ref={underlineRef} className={styles.linkUnderline} aria-hidden="true" />
    </TransitionLink>
  );
}

function getPageShell() {
  return document.querySelector("[data-page-shell]");
}

export default function Menu() {
  const { register, close, setIsOpen } = useMenu();
  const pathname = usePathname();
  const router = useTransitionRouter();
  const rootRef = useRef(null);
  const itemsRef = useRef(null);
  const isOpenRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const timelineRef = useRef(null);
  const [linkResetKey, setLinkResetKey] = useState(0);

  useEffect(() => {
    gsap.set(`.${styles.link} h1`, { yPercent: 100 });
    gsap.set(`.${styles.subItem} p`, { yPercent: 100 });
  }, []);

  useEffect(() => {
    function resetMenuVisuals() {
      gsap.set(rootRef.current, {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        pointerEvents: "none",
      });
      gsap.set(`.${styles.link} h1`, { yPercent: 100 });
      gsap.set(`.${styles.subItem} p`, { yPercent: 100 });
      gsap.set(itemsRef.current, { opacity: 1, top: "0px" });
      isAnimatingRef.current = false;
      isOpenRef.current = false;
      timelineRef.current = null;
    }

    function openMenu() {
      if (isAnimatingRef.current || isOpenRef.current) return;
      isAnimatingRef.current = true;
      isOpenRef.current = true;
      setIsOpen(true);
      setLinkResetKey((key) => key + 1);

      const page = getPageShell();

      const linkRevealStart = 1;
      const subRevealStart = 1.3;
      const linkReveal = {
        yPercent: 0,
        duration: 1,
        stagger: 0.075,
        ease: easeOut,
      };
      const subReveal = {
        yPercent: 0,
        duration: 0.75,
        stagger: 0.05,
        ease: easeOut,
      };

      timelineRef.current = gsap
        .timeline({
          onComplete: () => {
            isAnimatingRef.current = false;
            timelineRef.current = null;
          },
        })
        .to(rootRef.current, {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
          pointerEvents: "all",
          duration: 1.25,
          ease: hop,
        })
        .to(
          page,
          {
            y: -250,
            opacity: 0,
            duration: pageDuration,
            ease: hop,
          },
          0,
        )
        .to(`.${styles.link} h1`, linkReveal, linkRevealStart)
        .to(`.${styles.subItem} p`, subReveal, subRevealStart);
    }

    function closeMenu() {
      if (isAnimatingRef.current || !isOpenRef.current) return;
      isAnimatingRef.current = true;
      setIsOpen(false);

      const page = getPageShell();
      timelineRef.current?.kill();
      gsap.killTweensOf(page);
      gsap.set(page, { y: 250, opacity: 0 });

      timelineRef.current = gsap
        .timeline({
          onComplete: () => {
            resetMenuVisuals();
          },
        })
        .to(rootRef.current, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          pointerEvents: "none",
          duration: 1.25,
          ease: hop,
        })
        .to(
          itemsRef.current,
          {
            top: "-250px",
            opacity: 0,
            duration: 1.25,
            ease: hop,
          },
          0,
        )
        .to(
          page,
          {
            y: 0,
            opacity: 1,
            duration: pageDuration,
            ease: hop,
          },
          0,
        );
    }

    register({
      open: openMenu,
      close: closeMenu,
      isAnimating: () => isAnimatingRef.current,
    });
  }, [register, setIsOpen]);

  function snapCloseForTransition() {
    timelineRef.current?.kill();
    const page = getPageShell();
    gsap.killTweensOf(page);
    gsap.set(page, { y: 0, opacity: 1 });
    gsap.set(rootRef.current, {
      clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
      pointerEvents: "none",
    });
    gsap.set(`.${styles.link} h1`, { yPercent: 100 });
    gsap.set(`.${styles.subItem} p`, { yPercent: 100 });
    gsap.set(itemsRef.current, { opacity: 1, top: "0px" });
    isAnimatingRef.current = false;
    isOpenRef.current = false;
    timelineRef.current = null;
    setIsOpen(false);
  }

  function handleLinkClick(href, event) {
    event.preventDefault();

    if (pathname === href) {
      close();
      return;
    }

    // Keep menu open through snapshot capture, then wipe + snap-reset live DOM
    router.push(href, {
      onTransitionReady: () => {
        triggerPageTransition();
        snapCloseForTransition();
      },
    });
  }

  return (
    <div ref={rootRef} className={styles.menu}>
      <div ref={itemsRef} className={styles.body}>
        <div className={styles.col}>
          <div className={styles.links}>
            {links.map((link) => (
              <div key={link.href} className={styles.link}>
                <h1>
                  <MenuNavLink
                    href={link.href}
                    label={link.label}
                    resetKey={linkResetKey}
                    onNavigate={(event) => handleLinkClick(link.href, event)}
                  />
                </h1>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.subCol}>
            {metaLeft.map((item, i) =>
              item === null ? (
                <br key={`l-br-${i}`} />
              ) : (
                <div key={`l-${item}-${i}`} className={styles.subItem}>
                  <p className="mono-sm">{item}</p>
                </div>
              ),
            )}
          </div>
          <div className={styles.subCol}>
            {metaRight.map((item, i) =>
              item === null ? (
                <br key={`r-br-${i}`} />
              ) : (
                <div key={`r-${item}-${i}`} className={styles.subItem}>
                  <p className="mono-sm">{item}</p>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
