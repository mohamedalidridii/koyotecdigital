"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import { BsStarFill } from "react-icons/bs";
import SectionNav from "@/components/SectionNav/SectionNav";
import SectionFooter from "@/components/SectionFooter/SectionFooter";
import Callout from "@/components/Callout/Callout";
import Copy from "@/components/Copy/Copy";
import styles from "./Testimonials.module.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const DESKTOP_MIN = 1000;

const REST = [
  { x: -260, y: 16, r: -8 },
  { x: -90, y: -12, r: 5 },
  { x: 95, y: 10, r: -4 },
  { x: 265, y: -8, r: 9 },
];

const BIAS = [
  { x: 1.05, y: 6, r: -2 },
  { x: 0.9, y: -5, r: 3 },
  { x: 1.1, y: 7, r: -3 },
  { x: 0.95, y: -4, r: 2 },
];

const TESTIMONIALS = [
  {
    quote:
      "Kif-Kif built our look faster than anyone we've worked with. Strange, confident, and completely ours.",
    name: "Ravi Menon",
    role: "Crumb, Founder",
    avatar: "/images/testimonials/testimonial_img_1.jpg",
    tone: "light",
  },
  {
    quote:
      "They gave our product a face and a mood. It feels alive now, and it knows exactly when to hold back.",
    name: "Cleo Baptiste",
    role: "Nettle, Head of Product",
    avatar: "/images/testimonials/testimonial_img_2.jpg",
    tone: "dark",
  },
  {
    quote:
      "We came in with a mess and left with a world. Hard to find people this quick who still make it fun.",
    name: "Otto Lindqvist",
    role: "Sludge, Co-Founder",
    avatar: "/images/testimonials/testimonial_img_3.jpg",
    tone: "light",
  },
  {
    quote:
      "From branding to social, they nailed every piece. Smooth process, loud results, would do it all again.",
    name: "Nadia Karim",
    role: "Bramble, CMO",
    avatar: "/images/testimonials/testimonial_img_4.jpg",
    tone: "dark",
  },
];

function getPoses(activeIndex) {
  if (activeIndex === null) return REST;

  return REST.map((pose, i) => {
    if (i === activeIndex) {
      return { x: pose.x, y: pose.y, r: pose.r * 0.35 };
    }

    const dir = i < activeIndex ? -1 : 1;
    const dist = Math.abs(i - activeIndex);
    const bias = BIAS[i];
    const push = (38 + dist * 28) * bias.x;

    return {
      x: pose.x + dir * push,
      y: pose.y + bias.y * dist * 0.55,
      r: pose.r + bias.r * dist * 1.15,
    };
  });
}

function isDesktop() {
  return window.innerWidth >= DESKTOP_MIN;
}

export default function Testimonials() {
  const sectionRef = useRef(null);
  const cardElsRef = useRef([]);

  useLenis(() => {
    ScrollTrigger.update();
  });

  useGSAP(
    () => {
      const section = sectionRef.current;
      const cards = cardElsRef.current.filter(Boolean);
      if (!section || cards.length === 0) return;

      let activeIndex = null;
      let desktopBound = false;
      let introDone = false;
      const onEnter = [];
      let onCardLeave = null;
      let introTrigger = null;

      const clearHover = () => {
        cards.forEach((el, i) => {
          if (onEnter[i]) el.removeEventListener("mouseenter", onEnter[i]);
          if (onCardLeave) el.removeEventListener("mouseleave", onCardLeave);
        });
        onEnter.length = 0;
        onCardLeave = null;
        activeIndex = null;
        desktopBound = false;
      };

      const moveTo = (poses) => {
        if (!introDone) return;

        cards.forEach((el, i) => {
          gsap.to(el, {
            x: poses[i].x,
            y: poses[i].y,
            rotation: poses[i].r,
            duration: 0.4,
            ease: "power3.out",
            overwrite: "auto",
            force3D: true,
          });
        });
      };

      const scatter = (index) => {
        if (!desktopBound || !introDone) return;
        if (index === activeIndex) return;
        activeIndex = index;
        moveTo(getPoses(index));
      };

      const bindDesktopHover = () => {
        if (desktopBound || !introDone || !isDesktop()) return;

        const isOverCard = (node) => {
          if (!node || !(node instanceof Element)) return false;
          return cards.some((card) => card === node || card.contains(node));
        };

        onCardLeave = (e) => {
          if (isOverCard(e.relatedTarget)) return;
          scatter(null);
        };

        cards.forEach((el, i) => {
          onEnter[i] = () => scatter(i);
          el.addEventListener("mouseenter", onEnter[i]);
          el.addEventListener("mouseleave", onCardLeave);
        });

        desktopBound = true;
      };

      const setRestPose = (el, i, extras = {}) => {
        if (isDesktop()) {
          gsap.set(el, {
            x: REST[i].x,
            y: REST[i].y,
            rotation: REST[i].r,
            zIndex: i + 1,
            xPercent: -50,
            yPercent: -50,
            force3D: true,
            ...extras,
          });
        } else {
          gsap.set(el, {
            x: 0,
            y: 0,
            rotation: 0,
            xPercent: 0,
            yPercent: 0,
            clearProps: "zIndex",
            ...extras,
          });
        }
      };

      const INTRO_Y = Math.max(window.innerHeight * 0.75, 600);

      cards.forEach((el, i) => {
        if (isDesktop()) {
          gsap.set(el, {
            x: REST[i].x,
            y: REST[i].y + INTRO_Y,
            rotation: REST[i].r,
            zIndex: i + 1,
            xPercent: -50,
            yPercent: -50,
            force3D: true,
          });
        } else {
          gsap.set(el, {
            x: 0,
            y: INTRO_Y,
            rotation: 0,
            xPercent: 0,
            yPercent: 0,
          });
        }
      });

      const playIntro = () => {
        const tl = gsap.timeline({
          onComplete: () => {
            introDone = true;
            bindDesktopHover();
          },
        });

        cards.forEach((el, i) => {
          tl.to(
            el,
            {
              y: isDesktop() ? REST[i].y : 0,
              duration: 0.9,
              ease: "power3.out",
              overwrite: "auto",
            },
            i * 0.1,
          );
        });

        return tl;
      };

      introTrigger = ScrollTrigger.create({
        trigger: section,
        start: "top 75%",
        once: true,
        onEnter: () => playIntro(),
      });

      const syncMode = () => {
        clearHover();

        if (!introDone) {
          cards.forEach((el, i) => {
            if (isDesktop()) {
              gsap.set(el, {
                x: REST[i].x,
                y: REST[i].y + INTRO_Y,
                rotation: REST[i].r,
                zIndex: i + 1,
                xPercent: -50,
                yPercent: -50,
                force3D: true,
              });
            } else {
              gsap.set(el, {
                x: 0,
                y: INTRO_Y,
                rotation: 0,
                xPercent: 0,
                yPercent: 0,
              });
            }
          });
          return;
        }

        cards.forEach((el, i) => {
          gsap.killTweensOf(el);
          setRestPose(el, i);
        });

        if (isDesktop()) bindDesktopHover();
      };

      window.addEventListener("resize", syncMode);

      return () => {
        window.removeEventListener("resize", syncMode);
        clearHover();
        introTrigger?.kill();
        cards.forEach((el) => gsap.killTweensOf(el));
      };
    },
    { scope: sectionRef },
  );

  return (
    <section className={styles.testimonials} ref={sectionRef}>
      <div className={styles.sectionNav}>
        <SectionNav left="The Verdict" right="Five Stars, Mostly" />
      </div>

      <Copy splitType="words">
        <h2 className={styles.heading}>
          Proof We Play Well With Others
          <Callout
            className={styles.callout}
            label="No edits"
            variant={3}
            rotation={-15}
            top="-0.1em"
            left="-0.35em"
          />
        </h2>
      </Copy>

      <div className={styles.cards}>
        {TESTIMONIALS.map((item, i) => (
          <article
            key={item.name}
            className={`${styles.card} ${styles[item.tone]}`}
            ref={(el) => {
              cardElsRef.current[i] = el;
            }}
          >
            <div className={styles.stars} aria-hidden="true">
              {Array.from({ length: 5 }).map((_, s) => (
                <BsStarFill key={s} />
              ))}
            </div>

            <p className={styles.quote}>{item.quote}</p>

            <div className={styles.author}>
              <div className={styles.avatar}>
                <img src={item.avatar} alt="" />
              </div>
              <div className={styles.meta}>
                <h6 className={styles.name}>{item.name}</h6>
                <p className={`mono ${styles.role} sm`}>{item.role}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.sectionFooter}>
        <SectionFooter left="Unfiltered Praise" right="Proof In Ink" />
      </div>
    </section>
  );
}
