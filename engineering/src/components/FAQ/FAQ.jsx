"use client";

import styles from "./FAQ.module.css";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import Copy from "@/components/Copy";
import SectionHeader from "@/components/SectionHeader";

import { useLang } from "@/lib/useLang";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function FAQ() {
  const { faq: c } = useLang().t;
  const rootRef = useRef(null);

  useGSAP(
    () => {
      const messages = rootRef.current.querySelectorAll(`.${styles.message}`);

      messages.forEach((message) => {
        const row = message.parentElement;
        const typingIndicator = message.querySelector(`.${styles.typing}`);
        const messageCopy = message.querySelectorAll(`.${styles.content} p`);

        const expandedWidth = message.offsetWidth;
        message.style.width = `${expandedWidth}px`;
        const expandedHeight = message.offsetHeight;
        row.style.minHeight = `${expandedHeight}px`;

        gsap.set(message, {
          width: 64,
          height: 64,
          borderRadius: 0,
          padding: 0,
          scale: 0,
        });

        let collapseWhenDone = false;

        const enterTimeline = gsap.timeline({ paused: true });
        enterTimeline.to(message, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        });

        const expandTimeline = gsap.timeline({
          paused: true,
          onReverseComplete: () => {
            if (collapseWhenDone) {
              collapseWhenDone = false;
              enterTimeline.reverse();
            }
          },
        });

        expandTimeline
          .to(typingIndicator, {
            autoAlpha: 0,
            duration: 0.2,
          })
          .to(message, {
            width: expandedWidth,
            paddingLeft: "2rem",
            paddingRight: "2rem",
            duration: 0.4,
            ease: "power3.inOut",
          })
          .to(
            message,
            {
              height: expandedHeight,
              paddingTop: "1.5rem",
              paddingBottom: "1.5rem",
              duration: 0.4,
              ease: "power3.inOut",
            },
            "-=0.2",
          )
          .to(
            messageCopy,
            {
              opacity: 1,
              duration: 0.3,
              stagger: 0.05,
            },
            "-=0.25",
          );

        ScrollTrigger.create({
          trigger: message,
          start: "top 85%",
          onEnter: () => {
            collapseWhenDone = false;
            enterTimeline.play();
          },
          onLeaveBack: () => {
            if (expandTimeline.progress() > 0) {
              collapseWhenDone = true;
            } else {
              enterTimeline.reverse();
            }
          },
        });

        ScrollTrigger.create({
          trigger: message,
          start: "top 75%",
          onEnter: () => expandTimeline.play(),
          onLeaveBack: () => expandTimeline.reverse(),
        });
      });
    },
    { scope: rootRef },
  );

  return (
    <section className={styles.faq} ref={rootRef}>
      <Copy variant="flicker">
        <SectionHeader bullet left={c.header[0]} right={c.header[1]} />
      </Copy>

      <div className={`container ${styles.inner}`}>
        <div className={styles.header}>
          <Copy>
            <h2>{c.title}</h2>
          </Copy>
        </div>

        <div className={styles.list}>
          {c.items.map((item) => (
            <div key={item.question} className={styles.item}>
              <div className={`${styles.row} ${styles.questionSlot}`}>
                <div className={`${styles.message} ${styles.question}`}>
                  <div className={styles.typing} aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className={styles.content}>
                    <p>{item.question}</p>
                  </div>
                </div>
              </div>
              <div className={`${styles.row} ${styles.answerSlot}`}>
                <div className={`${styles.message} ${styles.answer}`}>
                  <div className={styles.typing} aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className={styles.content}>
                    {item.answer.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
