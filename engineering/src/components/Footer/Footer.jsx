"use client";

import styles from "./Footer.module.css";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

import DitherImage from "../DitherImage/DitherImage";

import { useLang } from "@/lib/useLang";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);


const HANDS = [
  { src: "/images/footer/hand-left.png", side: "left" },
  { src: "/images/footer/hand-right.png", side: "right" },
];

const PARALLAX_STRENGTH = 30;
const PARALLAX_EASE = 0.05;
const PARALLAX_SCALE = 1 + (PARALLAX_STRENGTH * 2) / 200;

export default function Footer() {
  const pathname = usePathname();
  const rootRef = useRef(null);
  const { t, lang, route, href } = useLang();
  const onWork = route === "/work";
  const LINKS = [
    ...t.nav.map((link) => ({ href: href(link.route), label: link.label })),
    { href: href("/contact"), label: t.navContact.title },
  ];

  useGSAP(
    () => {
      if (onWork) return;
      const footer = rootRef.current;
      if (!footer) return;
      const hands = gsap.utils.toArray(`.${styles.footerHand}`);

      const headingSplits = gsap.utils
        .toArray(`.${styles.footerWord}`)
        .map((heading) => new SplitText(heading, { type: "chars" }));
      const headingChars = headingSplits.flatMap((split) => split.chars);

      const lineSplits = gsap.utils
        .toArray(`.${styles.footerLink} h6, .${styles.footerCopy}`)
        .map(
          (element) => new SplitText(element, { type: "lines", mask: "lines" }),
        );
      const contentLines = lineSplits.flatMap((split) => split.lines);
      const splits = [...headingSplits, ...lineSplits];

      const reveal = { left: -125, right: 125 };
      gsap.set(headingChars, {
        position: "relative",
        yPercent: 125,
      });
      gsap.set(contentLines, { yPercent: 100 });

      const pointer = { x: 0, y: 0 };
      const drift = { x: 0, y: 0 };
      const mouse = { x: 0, y: 0, active: false };

      const updatePointer = () => {
        const rect = footer.getBoundingClientRect();
        const overFooter =
          mouse.active &&
          mouse.x >= rect.left &&
          mouse.x <= rect.right &&
          mouse.y >= rect.top &&
          mouse.y <= rect.bottom;

        if (!overFooter) {
          pointer.x = 0;
          pointer.y = 0;
          return;
        }

        pointer.x =
          ((mouse.x - rect.left) / rect.width - 0.5) * PARALLAX_STRENGTH * 2;
        pointer.y =
          ((mouse.y - rect.top) / rect.height - 0.5) * PARALLAX_STRENGTH * 2;
      };

      const onMove = (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
        mouse.active = true;
        updatePointer();
      };

      const onLeave = () => {
        mouse.active = false;
        updatePointer();
      };

      const tick = () => {
        updatePointer();
        drift.x += (pointer.x - drift.x) * PARALLAX_EASE;
        drift.y += (pointer.y - drift.y) * PARALLAX_EASE;

        hands.forEach((hand, index) => {
          const direction = index === 0 ? 1 : -1;
          const revealX = index === 0 ? reveal.left : reveal.right;
          const x = drift.x * direction;
          const y = -drift.y;
          hand.style.transform = `translate(calc(${x}px + ${revealX}%), ${y}px) scale(${PARALLAX_SCALE})`;
        });
      };

      const animateIn = () => {
        gsap.to(reveal, {
          left: 0,
          right: 0,
          duration: 1,
          ease: "power3.out",
          overwrite: true,
        });
        gsap.to(headingChars, {
          yPercent: 0,
          duration: 1,
          ease: "power3.out",
          stagger: { each: 0.04, from: "center" },
          overwrite: true,
        });
        gsap.to(contentLines, {
          yPercent: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.08,
          overwrite: true,
        });
      };

      const animateOut = () => {
        gsap.to(reveal, {
          left: -125,
          right: 125,
          duration: 0.4,
          ease: "power2.in",
          overwrite: true,
        });
        gsap.to(headingChars, {
          yPercent: 125,
          duration: 0.4,
          ease: "power2.in",
          stagger: { each: 0.01, from: "center" },
          overwrite: true,
        });
        gsap.to(contentLines, {
          yPercent: 100,
          duration: 0.4,
          ease: "power2.in",
          stagger: 0.02,
          overwrite: true,
        });
      };

      tick();

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseleave", onLeave);
      gsap.ticker.add(tick);
      ScrollTrigger.create({
        trigger: footer,
        start: "top 50%",
        onEnter: animateIn,
      });
      ScrollTrigger.create({
        trigger: footer,
        start: "top 85%",
        onLeaveBack: animateOut,
      });

      return () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseleave", onLeave);
        gsap.ticker.remove(tick);
        splits.forEach((split) => split.revert());
      };
    },
    { scope: rootRef, dependencies: [pathname] },
  );

  return (
    <footer
      key={lang}
      className={`${styles.footer}${onWork ? ` ${styles.hidden}` : ""}`}
      ref={rootRef}
      aria-hidden={onWork}
    >
      <div className={styles.footerHands} aria-hidden="true">
        {HANDS.map(({ src, side }) => (
          <div
            key={side}
            className={`${styles.footerHand} ${
              side === "left" ? styles.footerHandLeft : styles.footerHandRight
            }`}
          >
            <DitherImage
              src={src}
              alt=""
              darkColor={"#f3f1ec"}
              lightColor={"#ff0000"}
            />
          </div>
        ))}
      </div>
      <div className={`container ${styles.footerInner}`}>
        <div className={styles.footerContent}>
          <nav className={styles.footerLinks} aria-label="Footer">
            {LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className={styles.footerLink}>
                <h6>{label}</h6>
              </Link>
            ))}
          </nav>
          <p className={styles.footerCopy}>{t.footer.copy}</p>
        </div>
        <div className={styles.footerHeader}>
          {t.footer.words.map((word) => (
            <h1 key={word} className={styles.footerWord}>
              {word}
            </h1>
          ))}
        </div>
      </div>
    </footer>
  );
}
