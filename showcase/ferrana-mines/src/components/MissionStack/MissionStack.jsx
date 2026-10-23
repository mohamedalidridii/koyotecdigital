"use client";

import styles from "./MissionStack.module.css";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BsAmd } from "react-icons/bs";
import { CgCrowdfire } from "react-icons/cg";
import { RiArrowRightLine } from "react-icons/ri";

import Btn from "@/components/Btn";
import Copy from "@/components/Copy";
import MissionSectionHeader from "@/components/MissionSectionHeader";
import ParallaxImage from "@/components/ParallaxImage";

gsap.registerPlugin(ScrollTrigger);

const CARD_OFFSETS = [50, 200];

const cards = [
  {
    id: "record",
    tone: "accent",
    Icon: BsAmd,
    title: "Nothing Concealed",
    descriptor:
      "The figures behind every site are open by default. What we publish is what we logged, and anyone can verify it.",
    features: [
      "Raw field data on request",
      "Figures verified before release",
      "No selective reporting",
      "Methods open to inspection",
      "Findings published in full",
    ],
  },
  {
    id: "duration",
    tone: "grey",
    image: "/images/img2.jpg",
    Icon: CgCrowdfire,
    title: "Nothing Abandoned",
    descriptor:
      "Our responsibility does not end at closure. Restored ground is watched for years, until it stays settled alone.",
    features: [
      "Long-term monitoring built in",
      "Recovery tracked after closure",
      "Answerable for what lasts",
      "Site revisited on schedule",
      "Handover only when stable",
    ],
  },
];

export default function MissionStack() {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cardsEls = cardRefs.current.filter(Boolean);
    if (cardsEls.length !== CARD_OFFSETS.length) return;

    const mq = window.matchMedia("(min-width: 1001px)");

    const ctx = gsap.context(() => {
      cardsEls.forEach((card, index) => {
        const symbol = card.querySelector(`.${styles.symbol}`);
        const title = card.querySelector("[id^='mission-card-']");

        if (symbol && title) {
          gsap.set(symbol, { scale: 0, transformOrigin: "left top" });
          gsap.to(symbol, {
            scale: 1,
            duration: 0.8,
            ease: "power4.out",
            scrollTrigger: {
              trigger: title,
              start: "top 80%",
              once: true,
            },
          });
        }

        if (!mq.matches) {
          gsap.set(card, { y: 0 });
          return;
        }

        gsap.fromTo(
          card,
          { y: CARD_OFFSETS[index] },
          {
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 75%",
              end: "bottom 25%",
              scrub: true,
            },
          },
        );
      });
    }, section);

    const handleMqChange = () => {
      ctx.revert();
      cardsEls.forEach((card, index) => {
        gsap.set(card, { y: mq.matches ? CARD_OFFSETS[index] : 0 });
      });
    };

    mq.addEventListener("change", handleMqChange);

    return () => {
      mq.removeEventListener("change", handleMqChange);
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <MissionSectionHeader
          className={styles.missionStackHeader}
          labelId="mission-first-principles"
        >
          First Principles
        </MissionSectionHeader>

        <div className={styles.grid}>
          {cards.map(
            ({ id, tone, image, Icon, title, descriptor, features }, index) => {
              const titleId = `mission-card-${id}-title`;

              return (
                <article
                  key={id}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  className={`${styles.card} ${styles[tone]} ${styles.cardParallax}`}
                >
                  {image ? (
                    <div className={styles.cardBg} aria-hidden="true">
                      <ParallaxImage src={image} alt="" />
                    </div>
                  ) : null}

                  <div className={styles.top}>
                    <div className={styles.symbol} aria-hidden="true">
                      <Icon />
                    </div>

                    <div className={styles.intro}>
                      <Copy>
                        <h2 id={titleId} className={styles.title}>
                          {title}
                        </h2>
                        <p className={styles.descriptor}>{descriptor}</p>
                      </Copy>
                    </div>

                    <div className={styles.featuresRow}>
                      <Copy triggerPoint={`#${titleId}`} delay={0.15}>
                        <h4 className={styles.featuresLabel}>Features</h4>
                      </Copy>
                      <ul className={styles.features}>
                        {features.map((item, featureIndex) => (
                          <li key={item}>
                            <Copy
                              triggerPoint={`#${titleId}`}
                              delay={0.2 + featureIndex * 0.05}
                            >
                              <p className={styles.featureItem}>
                                <RiArrowRightLine aria-hidden="true" />
                                {item}
                              </p>
                            </Copy>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p className={styles.readMore}>
                    <Btn
                      href="/impact"
                      label="Read more"
                      reveal
                      triggerPoint={`#${titleId}`}
                      delay={0.35}
                    />
                  </p>
                </article>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
}
