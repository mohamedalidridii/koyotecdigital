"use client";

import styles from "./Footer.module.css";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { usePathname } from "next/navigation";

import Copy from "@/components/Copy";
import Logo from "@/components/Logo";
import TransitionLink from "@/components/TransitionLink";

import ReturnToTopBtn from "./ReturnToTopBtn";

gsap.registerPlugin(ScrollTrigger);

const FOOTER_START = "top 85%";
const FOOTER_TRIGGER = "#site-footer";

const navRows = [
  [
    { label: "Home", href: "/" },
    { label: "Initiatives", href: "/initiatives" },
    { label: "Mission", href: "/mission" },
  ],
  [
    { label: "Impact", href: "/impact" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/" },
  ],
  [
    { label: "Press", href: "mailto:media@ferrana.tn" },
    { label: "Partners", href: "mailto:partners@ferrana.tn" },
    { label: "Hello", href: "mailto:hello@ferrana.tn" },
  ],
];

export default function Footer() {
  const pathname = usePathname();
  const footerLogoRef = useRef(null);
  const showFooter = pathname !== "/" && pathname !== "/initiatives";

  useGSAP(() => {
    if (!showFooter) return;

    const trigger = document.getElementById("site-footer");
    if (!trigger || !footerLogoRef.current) return;

    gsap.set(footerLogoRef.current, {
      scale: 0,
      transformOrigin: "left center",
    });

    const tween = gsap.to(footerLogoRef.current, {
      scale: 1,
      duration: 0.8,
      ease: "power4.out",
      scrollTrigger: {
        trigger,
        start: FOOTER_START,
        once: true,
      },
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [pathname, showFooter]);

  useEffect(() => {
    if (!showFooter) return;

    const refresh = () => ScrollTrigger.refresh();
    requestAnimationFrame(refresh);
    const timeout = window.setTimeout(refresh, 150);

    return () => window.clearTimeout(timeout);
  }, [pathname, showFooter]);

  if (!showFooter) return null;

  return (
    <footer id="site-footer" key={pathname} className={styles.navSection}>
      <div className={`container ${styles.navInner}`}>
        <div className={styles.navTop}>
          <div className={styles.navBrand}>
            <span ref={footerLogoRef} className={styles.navLogoWrap}>
              <Logo className={styles.navLogo} />
            </span>
            <Copy triggerPoint={FOOTER_TRIGGER} start={FOOTER_START}>
              <h2 className={styles.navBrandName}>Ferrana</h2>
            </Copy>
          </div>

          <div className={styles.navLinks}>
            {navRows.map((row, i) => (
              <Copy
                key={i}
                triggerPoint={FOOTER_TRIGGER}
                start={FOOTER_START}
                delay={0.1 + i * 0.1}
              >
                <h2 className={styles.navRow}>
                  {row.map((item, j) => (
                    <span key={item.label}>
                      {item.href.startsWith("mailto:") ? (
                        <a href={item.href}>{item.label}</a>
                      ) : (
                        <TransitionLink href={item.href}>
                          {item.label}
                        </TransitionLink>
                      )}
                      {j < row.length - 1 || i < navRows.length - 1 ? (
                        <span className={styles.navSlash}>, </span>
                      ) : null}
                    </span>
                  ))}
                </h2>
              </Copy>
            ))}
          </div>
        </div>

        <div className={styles.navFooter}>
          <ReturnToTopBtn
            className={styles.navBack}
            reveal
            triggerPoint={FOOTER_TRIGGER}
            start={FOOTER_START}
            delay={0.55}
          />

          <div className={styles.navFooterTrail}>
            <Copy
              triggerPoint={FOOTER_TRIGGER}
              start={FOOTER_START}
              delay={0.65}
            >
              <p className={styles.navCopy}>
                © {new Date().getFullYear()} Ferrana
              </p>
            </Copy>
            <Copy
              triggerPoint={FOOTER_TRIGGER}
              start={FOOTER_START}
              delay={0.75}
            >
              <p className={styles.navMeta}>
                Developed by&nbsp;
                <a href="https://www.koyotec.digital" target="_blank" rel="noreferrer">
                  KOYOTEC
                </a>
              </p>
            </Copy>
          </div>
        </div>
      </div>
    </footer>
  );
}
