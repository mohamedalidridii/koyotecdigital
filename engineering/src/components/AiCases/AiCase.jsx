"use client";

import styles from "./AiCases.module.css";

import { Fragment, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import Copy from "@/components/Copy";
import Stage from "@/components/Systems/Stage";
import Emblem from "./Emblem";

import { useLang } from "@/lib/useLang";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const VISUALS = {
  "graphrag-knowledge-engine": dynamic(() => import("./visuals/GraphScene"), { ssr: false }),
  "onboarding-agents": dynamic(() => import("./visuals/AgentsFlow"), { ssr: false }),
  "compliance-agent": dynamic(() => import("./visuals/ComplianceFlow"), { ssr: false }),
  "shopping-assistant": dynamic(() => import("./visuals/ShopDemo"), { ssr: false }),
  "rag-evaluation": dynamic(() => import("./visuals/EvalDashboard"), { ssr: false }),
  "vlm-document-extraction": dynamic(() => import("./visuals/DocScan"), { ssr: false }),
  "text-to-sql-agent": dynamic(() => import("./visuals/SqlAgent"), { ssr: false }),
  "legacy-modernization": dynamic(() => import("./visuals/LegacyAgents"), { ssr: false }),
  "soc-triage-agent": dynamic(() => import("./visuals/SocTriage"), { ssr: false }),
  "supply-chain-radar": dynamic(() => import("./visuals/SupplyRadar"), { ssr: false }),
};

const pad = (n) => String(n).padStart(2, "0");

export default function AiCase({ slug }) {
  const { t, href } = useLang();
  const a = t.aiCases;
  const L = a.labels;
  const index = a.cases.findIndex((c) => c.slug === slug);
  const c = a.cases[index];
  const next = a.cases[(index + 1) % a.cases.length];
  const rootRef = useRef(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      // the hero lines rise in, then the key figures follow
      gsap.from(root.querySelectorAll("[data-rise]"), {
        yPercent: 110,
        duration: 1.3,
        ease: "power4.out",
        stagger: 0.08,
        delay: 0.35,
      });
      gsap.from(root.querySelectorAll(`.${styles.heroMetric}`), {
        autoAlpha: 0,
        y: 30,
        duration: 1,
        ease: "power3.out",
        stagger: 0.1,
        delay: 0.8,
      });
      root.querySelectorAll(`.${styles.result}`).forEach((el, i) => {
        gsap.from(el, {
          autoAlpha: 0,
          y: 40,
          duration: 1,
          ease: "power3.out",
          delay: (i % 4) * 0.08,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
    },
    { scope: rootRef, dependencies: [slug] },
  );

  if (!c) return null;

  return (
    <article ref={rootRef} className={styles.case} data-theme={c.slug}>
      <header className={`container ${styles.hero}`}>
        <div className={styles.heroTop}>
          <p className="mono sm">
            <Link href={href("/ai")} className={styles.crumb}>
              {L.all}
            </Link>{" "}
            / {L.caseStudy} {pad(index + 1)} / {pad(a.cases.length)}
          </p>
          <p className="mono sm">{c.client}</p>
        </div>
        <div className={styles.heroGrid}>
          <div>
            <p className={`mono sm ${styles.heroKicker}`}>
              <span className={styles.dot} aria-hidden="true" />
              {c.short}
            </p>
            <h1 className={styles.heroTitle}>
              {/* each word rises out of its own mask; the space stays outside the mask so it is kept */}
              {c.title.split(" ").map((w, i) => (
                <Fragment key={i}>
                  <span className={styles.mask}>
                    <span data-rise>{w}</span>
                  </span>{" "}
                </Fragment>
              ))}
            </h1>
          </div>
          <Emblem slug={c.slug} className={styles.heroEmblem} />
        </div>
        <div className={styles.heroFoot}>
          <div className={styles.summary}>
            <p className="mono sm">{L.summary}</p>
            <Copy>
              <p className={styles.summaryText}>{c.summary}</p>
            </Copy>
          </div>
          <dl className={styles.facts}>
            <div>
              <dt className="mono sm">{L.client}</dt>
              <dd>{c.client}</dd>
            </div>
            <div>
              <dt className="mono sm">{L.sector}</dt>
              <dd>{c.sector}</dd>
            </div>
            <div>
              <dt className="mono sm">{L.size}</dt>
              <dd>{c.size}</dd>
            </div>
          </dl>
        </div>
        <ul className={styles.heroMetrics}>
          {c.metrics.map(([v, l]) => (
            <li key={l} className={styles.heroMetric}>
              <span className={styles.heroMetricValue}>{v}</span>
              <span className={styles.heroMetricLabel}>{l}</span>
            </li>
          ))}
        </ul>
      </header>

      <section className={`container ${styles.brief}`}>
        <div>
          <p className={`mono sm ${styles.label}`}>
            <span className={styles.dot} aria-hidden="true" />
            {L.context}
          </p>
          <Copy>
            <p className={styles.lead}>{c.context}</p>
          </Copy>
        </div>
        <div>
          <p className={`mono sm ${styles.label}`}>
            <span className={styles.dot} aria-hidden="true" />
            {L.challenge}
          </p>
          <ol className={styles.challenges}>
            {c.challenges.map((x, i) => (
              <li key={i}>
                <span className="mono sm">{pad(i + 1)}</span>
                <Copy>
                  <p>{x}</p>
                </Copy>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`container ${styles.approach}`}>
        <p className={`mono sm ${styles.label}`}>
          <span className={styles.dot} aria-hidden="true" />
          {L.approach}
        </p>
        <Copy>
          <p className={styles.approachText}>{c.approach}</p>
        </Copy>
      </section>

      <Stage id={c.slug} label={L.solution} steps={c.steps} Visual={VISUALS[c.slug]} content={c.visual} />

      <section className={`container ${styles.outcome}`}>
        <p className={`mono sm ${styles.label}`}>
          <span className={styles.dot} aria-hidden="true" />
          {L.results}
        </p>
        <ul className={styles.results}>
          {c.results.map(([v, l]) => (
            <li key={l} className={styles.result}>
              <span className={styles.resultValue}>{v}</span>
              <span className={styles.resultLabel}>{l}</span>
            </li>
          ))}
        </ul>
        <div className={styles.details}>
          <div>
            <p className={`mono sm ${styles.label}`}>{L.deliverables}</p>
            <ul className={styles.deliverables}>
              {c.deliverables.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
          <div className={styles.side}>
            <div>
              <p className={`mono sm ${styles.label}`}>{L.stack}</p>
              <ul className={styles.chips}>
                {c.stack.map((s) => (
                  <li key={s} className="mono sm">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className={`mono sm ${styles.label}`}>{L.timeline}</p>
              <p className={styles.value}>{c.timeline}</p>
            </div>
            <div>
              <p className={`mono sm ${styles.label}`}>{L.team}</p>
              <p className={styles.value}>{c.team}</p>
            </div>
          </div>
        </div>
        <Link href={href("/contact")} className={styles.cta}>
          <span>{L.cta}</span>
          <span aria-hidden="true">→</span>
        </Link>
      </section>

      <Link href={href(`/ai/${next.slug}`)} className={styles.next} data-theme={next.slug}>
        <span className={`container ${styles.nextInner}`}>
          <span className="mono sm">
            {L.next} · {next.client}
          </span>
          <span className={styles.nextTitle}>{next.title}</span>
          <span className={styles.nextArrow} aria-hidden="true">
            →
          </span>
        </span>
      </Link>
      <p className={`container mono sm ${styles.caseNote}`}>{a.note}</p>
    </article>
  );
}
