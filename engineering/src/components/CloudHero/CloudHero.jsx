"use client";

import styles from "./CloudHero.module.css";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import Copy from "@/components/Copy";
import Button from "@/components/Button";
import CloudScene from "@/components/CloudScene";

import { useLang } from "@/lib/useLang";
import { asset } from "@/lib/i18n";
import { CONTACT } from "@/content/shared";

gsap.registerPlugin(useGSAP);

const HEADING_DELAY = 0.6;

// typed terminal over the founder portrait (consultant page); the lines are an illustration, labelled as such
function Terminal({ lines, note }) {
  const [shown, setShown] = useState(0);
  const [chars, setChars] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(lines.length);
      return undefined;
    }
    let line = 0;
    let c = 0;
    let timer;
    const tick = () => {
      const text = lines[line];
      if (!text) {
        timer = setTimeout(() => {
          line = 0;
          c = 0;
          setShown(0);
          setChars(0);
          tick();
        }, 4200);
        return;
      }
      if (c < text.length) {
        c += text.startsWith("$") ? 1 : 3;
        setShown(line);
        setChars(c);
        timer = setTimeout(tick, text.startsWith("$") ? 55 : 18);
      } else {
        line += 1;
        c = 0;
        setShown(line);
        setChars(0);
        timer = setTimeout(tick, text.startsWith("$") ? 420 : 140);
      }
    };
    timer = setTimeout(tick, 1400);
    return () => clearTimeout(timer);
  }, [lines]);

  return (
    <div className={styles.terminal} aria-hidden="true">
      <div className={styles.termBar}>
        <i />
        <i />
        <i />
        <span>~/koyotec/infra</span>
      </div>
      <pre>
        {lines.slice(0, shown).map((l) => (
          <span key={l} className={l.startsWith("$") ? styles.cmd : l.startsWith("~") ? styles.change : undefined}>
            {l}
            {"\n"}
          </span>
        ))}
        {shown < lines.length ? (
          <span className={lines[shown].startsWith("$") ? styles.cmd : undefined}>
            {lines[shown].slice(0, chars)}
            <b className={styles.caret} />
          </span>
        ) : (
          <b className={styles.caret} />
        )}
      </pre>
      <p className={styles.termNote}>{note}</p>
    </div>
  );
}

// live time in Paris and Tunis: the whole argument of the nearshore page in two numbers
function Clocks({ c, lang }) {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const fmt = (tz) =>
    now
      ? new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: tz }).format(now)
      : "--:--";
  return (
    <div className={styles.clocks}>
      <div>
        <p className="mono sm">{c.paris}</p>
        <p className={styles.time}>{fmt("Europe/Paris")}</p>
      </div>
      <span className={styles.clockLink} aria-hidden="true" />
      <div>
        <p className="mono sm">{c.tunis}</p>
        <p className={`${styles.time} ${styles.timeRed}`}>{fmt("Africa/Tunis")}</p>
      </div>
      <p className={`mono sm ${styles.clockNote}`}>
        <i aria-hidden="true" />
        {c.note}
      </p>
    </div>
  );
}

export default function CloudHero({ pageKey }) {
  const { t, lang, href } = useLang();
  const page = t.cloud.pages[pageKey];
  const common = t.cloud.common;
  const regions = t.cloud.diagrams.data.regions;
  const sectionRef = useRef(null);
  const visualRef = useRef(null);
  const isMigration = page.scene === "migration";

  // scroll progress through the (taller) migration hero, read by the WebGL scene each frame
  const getProgress = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const span = r.height - window.innerHeight;
    return span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
  }, []);

  useGSAP(
    () => {
      gsap.from(visualRef.current, { autoAlpha: 0, scale: 0.96, duration: 1.4, delay: 0.3, ease: "power3.out" });
      gsap.from(`.${styles.kicker}, .${styles.subtitle}, .${styles.ctas}, .${styles.bar}`, {
        autoAlpha: 0,
        y: 16,
        duration: 0.8,
        delay: HEADING_DELAY + 0.6,
        stagger: 0.1,
        ease: "power3.out",
      });
    },
    { scope: sectionRef },
  );

  const sceneLabels =
    page.scene === "globe"
      ? [
          { id: "tunis", text: "Tunis", accent: true },
          { id: "paris", text: regions[0].name, code: regions[0].code, side: "left" },
          { id: "frankfurt", text: regions[1].name, code: regions[1].code },
          { id: "bahrain", text: regions[2].name, code: regions[2].code, side: "left" },
          { id: "uae", text: regions[3].name, code: regions[3].code },
        ]
      : page.scene === "bridge"
        ? [
            { id: "paris", text: "Paris" },
            { id: "tunis", text: "Tunis", accent: true },
          ]
        : [];

  const whatsapp = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(common.whatsappText)}`;

  return (
    <section ref={sectionRef} className={`${styles.hero}${isMigration ? ` ${styles.tall}` : ""}`} data-scene={page.scene}>
      <div className={styles.sticky}>
        <div className={`container ${styles.grid}`}>
          <div className={styles.text}>
            <p className={`mono ${styles.kicker}`}>
              <i aria-hidden="true" />
              {page.kicker}
            </p>
            <Copy animateOnScroll={false} delay={HEADING_DELAY}>
              <h1 className={styles.title}>{page.title}</h1>
            </Copy>
            <p className={styles.subtitle}>{page.subtitle}</p>
            <Copy animateOnScroll={false} delay={HEADING_DELAY + 0.35}>
              <p className={styles.lead}>{page.lead}</p>
            </Copy>
            <div className={styles.ctas}>
              <Button variant="primary" href={href("/contact")} event="cloud-cta" eventPlace={`${pageKey}-hero-audit`}>
                {common.ctaAudit}
              </Button>
              <Button variant="secondary" href={whatsapp} event="whatsapp" eventPlace={`${pageKey}-hero`}>
                {common.ctaWhatsapp}
              </Button>
            </div>
          </div>

          <div ref={visualRef} className={styles.visual}>
            {page.scene === "terminal" ? (
              <div className={styles.portrait}>
                <img src={asset("/images/founder/portrait.webp")} alt={common.founder.portraitAlt} className={styles.photo} width="1280" height="1280" fetchPriority="high" />
                <Terminal lines={page.terminal} note={page.terminalNote} />
              </div>
            ) : (
              <CloudScene scene={page.scene} labels={sceneLabels} getProgress={isMigration ? getProgress : undefined} label={common.sceneLabel} />
            )}
            {page.clocks ? <Clocks c={page.clocks} lang={lang} /> : null}
          </div>
        </div>

        <div className={`container ${styles.bar}`}>
          <p className="mono sm">36.8065° N · 10.1815° E</p>
          <p className="mono sm">{isMigration ? page.scrollHint : "Koyotec Engineering · Cloud"}</p>
          <p className="mono sm">{common.scroll} ↓</p>
        </div>
      </div>
    </section>
  );
}
