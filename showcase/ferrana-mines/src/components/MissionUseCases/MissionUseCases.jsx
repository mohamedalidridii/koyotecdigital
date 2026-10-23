"use client";

import styles from "./MissionUseCases.module.css";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { RiAddLine } from "react-icons/ri";

import Copy from "@/components/Copy";
import MissionSectionHeader from "@/components/MissionSectionHeader";

gsap.registerPlugin(SplitText);

const principles = [
  {
    title: "Refuse the sites we can't finish",
    body: "Not every deposit is worth reaching. Before anything is signed, we walk away from ground we could not return to a stable state, however rich it looks on paper. The first decision on any site is whether we have any business being there at all, and we say no more often than we say yes.",
  },
  {
    title: "Hire the people who stay",
    body: "Restoration is measured in decades, so we build a workforce that thinks in decades. Crews are trained to know a single landscape deeply rather than pass through many, and the same hands that opened a site are the ones accountable for how it recovers. Continuity of people is what makes continuity of care possible.",
  },
  {
    title: "Share the ground, don't seal it",
    body: "A closed site is not a fenced one. Wherever it is safe, restored land is opened back to the communities and ecosystems that held it before us, with access, data, and decisions handed over rather than kept. The aim is not a monument to our work but a place that no longer needs us in the frame.",
  },
  {
    title: "Bank against our own failure",
    body: "We plan for the version of events where we are gone. A portion of every site's return is set aside in trust that outlives the company, so that if Ferrana falters, the money to finish the ground does not falter with it. The land's recovery should never depend on our survival.",
  },
];

export default function MissionUseCases() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const questions = root.querySelectorAll(`.${styles.question}`);
    const splits = [];
    const cleanups = [];

    const setup = () => {
      questions.forEach((question) => {
        const item = question.closest(`.${styles.item}`);
        const answer = item.querySelector(`.${styles.answer}`);
        const body = item.querySelector(`.${styles.body}`);
        const icon = question.querySelector(`.${styles.icon} svg`);

        const split = SplitText.create(body, {
          type: "lines",
          linesClass: "line",
          mask: "lines",
        });

        splits.push(split);
        gsap.set(split.lines, { yPercent: 100 });

        let isOpen = false;
        let tween;

        const onClick = () => {
          tween?.kill();

          if (isOpen) {
            isOpen = false;
            question.setAttribute("aria-expanded", "false");
            item.classList.remove(styles.open);

            gsap.to(icon, {
              rotation: 0,
              duration: 0.3,
              ease: "power2.out",
            });

            tween = gsap
              .timeline()
              .to(
                split.lines,
                {
                  yPercent: 100,
                  duration: 0.35,
                  stagger: -0.05,
                  ease: "power2.in",
                },
                0,
              )
              .to(
                answer,
                {
                  height: 0,
                  duration: 0.4,
                  ease: "power2.out",
                },
                0.1,
              );

            return;
          }

          isOpen = true;
          question.setAttribute("aria-expanded", "true");
          item.classList.add(styles.open);

          gsap.to(icon, {
            rotation: 45,
            duration: 0.3,
            ease: "power2.out",
          });

          answer.style.height = "auto";
          const contentHeight = answer.scrollHeight;
          answer.style.height = "0px";

          gsap.set(split.lines, { yPercent: 100 });

          tween = gsap
            .timeline()
            .to(answer, {
              height: contentHeight,
              duration: 0.5,
              ease: "power2.out",
            })
            .to(
              split.lines,
              {
                yPercent: 0,
                duration: 0.55,
                stagger: 0.08,
                ease: "power2.out",
              },
              0.12,
            );
        };

        question.addEventListener("click", onClick);
        cleanups.push(() => question.removeEventListener("click", onClick));
      });
    };

    let cancelled = false;

    // Split after fonts so line breaks are stable
    document.fonts.ready
      .then(() => {
        if (!cancelled) setup();
      })
      .catch(() => {
        if (!cancelled) setup();
      });

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
      splits.forEach((split) => split.revert());
      gsap.killTweensOf(
        root.querySelectorAll(`.${styles.answer}, .${styles.icon} svg, .line`),
      );
    };
  }, []);

  return (
    <section ref={rootRef} className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.row}>
          <MissionSectionHeader className={styles.label} labelId="mission-rules-label">
            Our Working Rules
          </MissionSectionHeader>

          <div className={styles.list}>
            {principles.map(({ title, body }) => {
              const titleId = `mission-rule-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

              return (
                <div key={title} className={styles.item}>
                  <button
                    type="button"
                    className={styles.question}
                    aria-expanded="false"
                  >
                    <Copy>
                      <h3 id={titleId} className={styles.title}>
                        {title}
                      </h3>
                    </Copy>
                    <span className={styles.icon} aria-hidden="true">
                      <RiAddLine />
                    </span>
                  </button>

                  <div className={styles.answer}>
                    <h4 className={styles.body}>{body}</h4>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
