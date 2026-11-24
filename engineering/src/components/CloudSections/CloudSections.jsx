"use client";

import styles from "./CloudSections.module.css";

import Link from "next/link";

import Copy from "@/components/Copy";
import SectionHeader from "@/components/SectionHeader";
import CloudDiagram from "@/components/CloudDiagrams";

import { useLang } from "@/lib/useLang";
import { asset } from "@/lib/i18n";
import { CLOUD_PAGES } from "@/lib/cloudPages";

// The body of a cloud page, section by section. Every block is plain, readable text first; the diagrams
// and dithered images support it. Copy comes from content/cloud.{fr,en}.js.

function Head({ header }) {
  return (
    <Copy variant="flicker">
      <SectionHeader bullet left={header[0]} right={header[1]} />
    </Copy>
  );
}

// explanation (01) and market (03) share the same shape: a title, short paragraphs, an optional diagram
export function Explainer({ block, diagrams, flip = false }) {
  return (
    <section className={styles.section}>
      <Head header={block.header} />
      <div className={`container ${styles.explainer}${flip ? ` ${styles.flip}` : ""}${block.diagram ? "" : ` ${styles.solo}`}`}>
        <div className={styles.prose}>
          <Copy>
            <h2 className={styles.h2}>{block.title}</h2>
          </Copy>
          {block.paras.map((p) => (
            <p key={p.slice(0, 32)} className={styles.para}>
              {p}
            </p>
          ))}
        </div>
        {block.diagram ? (
          <div className={styles.diagram}>
            <CloudDiagram type={block.diagram} d={diagrams[block.diagram]} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function Services({ block }) {
  return (
    <section className={`${styles.section} ${styles.dark}`}>
      <Head header={block.header} />
      <div className="container">
        <Copy>
          <h2 className={`${styles.h2} ${styles.wide}`}>{block.title}</h2>
        </Copy>
        <ol className={styles.services}>
          {block.items.map((item, i) => (
            <li key={item.title}>
              <span className={styles.index}>{String(i + 1).padStart(2, "0")}</span>
              <h3 className={styles.h3}>{item.title}</h3>
              <p>{item.copy}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Process() {
  const { t } = useLang();
  const c = t.cloud.common;
  return (
    <section className={styles.section}>
      <Head header={c.processHeader} />
      <div className="container">
        <div className={styles.processIntro}>
          <Copy>
            <h2 className={styles.h2}>{c.processTitle}</h2>
          </Copy>
          <p className={styles.para}>{c.processCopy}</p>
        </div>
        <ol className={styles.process}>
          {c.process.map((step, i) => (
            <li key={step.title}>
              <span className={styles.bigNo}>{i + 1}</span>
              <h3 className={styles.h3}>{step.title}</h3>
              <p>{step.copy}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Proof() {
  const { t, href } = useLang();
  const c = t.cloud.common;
  return (
    <section className={styles.section}>
      <Head header={c.proofHeader} />
      <div className="container">
        <Copy>
          <h2 className={`${styles.h2} ${styles.wide}`}>{c.proofTitle}</h2>
        </Copy>
        <dl className={styles.stats}>
          {c.proofStats.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
        <p className={`mono ${styles.linksTitle}`}>{c.proofLinksTitle}</p>
        <div className={styles.links}>
          {c.proofLinks.map((l) => (
            <Link key={l.route} href={href(l.route)} className={styles.linkCard}>
              <span className={styles.linkTitle}>{l.label}</span>
              <span className={styles.linkCopy}>{l.copy}</span>
              <span className={styles.linkArrow} aria-hidden="true">
                ↗
              </span>
            </Link>
          ))}
        </div>
        <p className={`mono sm ${styles.partner}`}>{c.partner}</p>
      </div>
    </section>
  );
}

// a short, simple introduction of the founder: one photo, who he is, four facts, a link to his page
export function Founder() {
  const { t, href } = useLang();
  const f = t.cloud.common.founder;
  return (
    <section className={`${styles.section} ${styles.founder}`}>
      <Head header={f.header} />
      <div className={`container ${styles.founderCard}`}>
        <div className={styles.founderPhoto}>
          <img src={asset("/images/founder/pyfac-stage.webp")} alt={f.portraitAlt} className={`${styles.photo} ${styles.photoStage}`} width="1439" height="838" loading="lazy" />
        </div>
        <div className={styles.founderText}>
          <p className={`mono ${styles.kicker}`}>
            <i aria-hidden="true" />
            {f.role}
          </p>
          <h2 className={styles.founderName}>{f.name}</h2>
          <p className={styles.para}>{f.bio}</p>
          <ul className={styles.facts}>
            {f.facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
          <Link href={href("/medalydridi")} className={styles.founderLink} data-track="cloud-founder" data-track-place="engineering">
            {f.link} <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Related({ pageKey }) {
  const { t, href } = useLang();
  const c = t.cloud.common;
  const others = CLOUD_PAGES.filter((p) => p.key !== pageKey);
  return (
    <section className={styles.section}>
      <Head header={c.relatedHeader} />
      <div className="container">
        <h2 className={`${styles.h2} ${styles.small}`}>{c.relatedTitle}</h2>
        <div className={styles.related}>
          {others.map((p) => {
            const page = t.cloud.pages[p.key];
            return (
              <Link key={p.key} href={href(p.route)} className={styles.relatedCard}>
                <span className="mono">{page.kicker}</span>
                <span className={styles.relatedTitle}>{page.title}</span>
                <span className={styles.relatedSub}>{page.subtitle}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
