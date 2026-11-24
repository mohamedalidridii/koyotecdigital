"use client";

import styles from "./FounderProfile.module.css";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import Copy from "@/components/Copy";
import Button from "@/components/Button";
import SectionHeader from "@/components/SectionHeader";

import { useLang } from "@/lib/useLang";
import { asset } from "@/lib/i18n";

gsap.registerPlugin(useGSAP);

function Head({ header }) {
  return (
    <Copy variant="flicker">
      <SectionHeader bullet left={header[0]} right={header[1]} />
    </Copy>
  );
}

export default function FounderProfile() {
  const { t, lang, href } = useLang();
  const f = t.founderPage;
  const heroRef = useRef(null);
  const storyHref = lang === "en" ? "https://www.koyotec.digital/en/medalydridi" : "https://www.koyotec.digital/medalydridi";

  useGSAP(
    () => {
      gsap.from(`.${styles.kicker}, .${styles.roles} li, .${styles.ctas}`, {
        autoAlpha: 0,
        y: 16,
        duration: 0.8,
        delay: 1.1,
        stagger: 0.08,
        ease: "power3.out",
      });
      gsap.from(`.${styles.stageImg}`, { autoAlpha: 0, scale: 1.03, duration: 1.6, delay: 0.1, ease: "power3.out" });
    },
    { scope: heroRef },
  );

  return (
    <>
      <section ref={heroRef} className={styles.hero}>
        <div className={styles.stage}>
          <img
            src={asset(f.gallery[0].src)}
            alt={f.gallery[0].alt}
            className={styles.stageImg}
            width={f.gallery[0].w}
            height={f.gallery[0].h}
            fetchPriority="high"
          />
          <div className={styles.veil} aria-hidden="true" />
          <p className={`mono sm ${styles.credit}`}>{f.galleryCredit}</p>
        </div>
        <div className={`container ${styles.heroText}`}>
          <p className={`mono ${styles.kicker}`}>
            <i aria-hidden="true" />
            {f.kicker}
          </p>
          <Copy animateOnScroll={false} delay={0.6}>
            <h1 className={styles.name}>{f.name}</h1>
          </Copy>
          <ul className={styles.roles}>
            {f.roles.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <Copy animateOnScroll={false} delay={0.95}>
            <p className={styles.lead}>{f.lead}</p>
          </Copy>
          <div className={styles.ctas}>
            <Button variant="primary" href={href("/contact")} event="founder-cta" eventPlace="engineering-founder">
              {f.ctaWork}
            </Button>
            <Button variant="secondary" href={storyHref} event="founder-story" eventPlace="engineering-founder">
              {f.ctaStory}
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <Head header={f.numbers.header} />
        <div className="container">
          <dl className={styles.numbers}>
            {f.numbers.items.map((n) => (
              <div key={n.label}>
                <dt>{n.label}</dt>
                <dd>{n.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={styles.section}>
        <Head header={f.roles2.header} />
        <div className="container">
          <Copy>
            <h2 className={styles.h2}>{f.roles2.title}</h2>
          </Copy>
          <div className={styles.jobs}>
            {[f.roles2.engineering, f.roles2.strategy].map((job, i) => (
              <article key={job.title} className={i === 0 ? styles.jobDark : styles.jobRed}>
                <span className={styles.jobNo}>{String(i + 1).padStart(2, "0")}</span>
                <h3 className={styles.h3}>{job.title}</h3>
                <p>{job.copy}</p>
                <ul>
                  {job.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <Head header={f.timeline.header} />
        <div className={`container ${styles.split}`}>
          <div>
            <Copy>
              <h2 className={styles.h2}>{f.timeline.title}</h2>
            </Copy>
            <div className={styles.portrait}>
              <img src={asset("/images/founder/portrait.webp")} alt={f.portraitAlt} className={styles.photo} width="1280" height="1280" loading="lazy" />
            </div>
          </div>
          <ol className={styles.timeline}>
            {f.timeline.items.map((item) => (
              <li key={item.year + item.text.slice(0, 12)}>
                <span className={styles.year}>{item.year}</span>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.section}>
        <Head header={f.talks.header} />
        <div className="container">
          <Copy>
            <h2 className={styles.h2}>{f.talks.title}</h2>
          </Copy>
          <ul className={styles.talks}>
            {f.talks.items.map((talk) => (
              <li key={talk.title}>
                <p className={`mono sm ${styles.talkMeta}`}>
                  <span>{talk.date}</span>
                  <span>{talk.event}</span>
                </p>
                <p className={styles.talkTitle}>{talk.title}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <Head header={f.profiles.header} />
        <div className="container">
          <h2 className={`${styles.h2} ${styles.small}`}>{f.profiles.title}</h2>
          <ul className={styles.profiles}>
            {f.profiles.items.map((p, i) => (
              <li key={p.href}>
                <a href={p.href} target="_blank" rel="noreferrer me" data-track="founder-profile" data-track-place={p.label}>
                  <span className={styles.profileNo}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={styles.profileLabel}>{p.label}</span>
                  <span className={styles.profileHandle}>{p.handle}</span>
                  <span className={styles.profileArrow} aria-hidden="true">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
