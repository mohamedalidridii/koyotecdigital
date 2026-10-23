"use client";

import styles from "./Navbar.module.css";

import { useEffect, useRef } from "react";
import gsap from "gsap";

import Logo from "@/components/Logo";
import { useMenu } from "@/components/Menu";
import { easeOut } from "@/components/Menu/eases";
import TransitionLink from "@/components/TransitionLink";

export default function Navbar() {
  const { isOpen, toggle } = useMenu();
  const menuLabelRef = useRef(null);
  const closeLabelRef = useRef(null);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    gsap.set(closeLabelRef.current, { yPercent: 100 });
    gsap.set(menuLabelRef.current, { yPercent: 0 });
  }, []);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const menuLabel = menuLabelRef.current;
    const closeLabel = closeLabelRef.current;
    gsap.killTweensOf([menuLabel, closeLabel]);

    if (isOpen) {
      // Menu exits up; Close enters from bottom
      gsap.set(menuLabel, { yPercent: 0 });
      gsap.set(closeLabel, { yPercent: 100 });
      gsap.to(menuLabel, {
        yPercent: -100,
        duration: 1.25,
        delay: 0.3,
        ease: easeOut,
      });
      gsap.to(closeLabel, {
        yPercent: 0,
        duration: 1.25,
        delay: 0.5,
        ease: easeOut,
      });
      return;
    }

    // Close exits up; Menu enters from bottom
    gsap.set(closeLabel, { yPercent: 0 });
    gsap.set(menuLabel, { yPercent: 100 });
    gsap.to(closeLabel, {
      yPercent: -100,
      duration: 1.25,
      delay: 0.3,
      ease: easeOut,
    });
    gsap.to(menuLabel, {
      yPercent: 0,
      duration: 1.25,
      delay: 0.5,
      ease: easeOut,
    });
  }, [isOpen]);

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.inner}`}>
        <TransitionLink href="/" className={styles.brand} aria-label="Ferrana home">
          <Logo />
        </TransitionLink>

        <button
          type="button"
          className={styles.toggle}
          onClick={toggle}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          <span className={styles.toggleClip}>
            <span ref={menuLabelRef} className={`mono-sm ${styles.toggleLabel}`}>
              Menu
            </span>
          </span>
          <span className={styles.toggleClip}>
            <span ref={closeLabelRef} className={`mono-sm ${styles.toggleLabel}`}>
              Close
            </span>
          </span>
        </button>
      </div>
    </nav>
  );
}
