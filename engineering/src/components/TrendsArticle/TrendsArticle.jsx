"use client";

import nat from "../NatArticle/NatArticle.module.css";
import styles from "./TrendsArticle.module.css";

import Link from "next/link";

import Copy from "@/components/Copy";
import SectionHeader from "@/components/SectionHeader";
import Button from "@/components/Button";

import { useLang } from "@/lib/useLang";
import { GPU_REVIEW_ROUTE } from "@/lib/offers";

// The DevOps trends 2027–2028 guide, built with LIFT:
// value (lede, byline with the date checked) · clarity (summary table first, then the same five blocks in
// every section, GPU first) · anxiety (a primary source under every section; the one change we deliver is
// marked, the others are not sold) · one offer only (the GPU & Kubernetes cost review), shown inside the GPU
// section and at the end, once the reader has a reason to trust us. Text: content/devopsTrends.{fr,en}.js.

export function Offer({ o, place, article }) {
  const { href } = useLang();
  return (
    <aside className={styles.offer} aria-label={o.kicker}>
      <p className={`mono sm ${styles.offerKicker}`}>{o.kicker}</p>
      <p className={styles.offerTitle}>{o.title}</p>
      <p className={styles.offerText}>{o.text}</p>
      <Button variant="light" href={href(GPU_REVIEW_ROUTE)} event="eng-contact-cta" eventPlace={place} track={{ article }}>
        {o.cta}
      </Button>
      <p className={`mono sm ${styles.offerNote}`}>{o.note}</p>
      {o.links?.length ? (
        <ul className={styles.offerLinks}>
          {o.links.map(([label, to]) => (
            <li key={to}>
              <Link href={href(to)} data-track="article-related" data-track-article={article} data-track-to={to}>
                {label} →
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </aside>
  );
}

export function Byline({ b }) {
  const { href } = useLang();
  return (
    <p className={`mono sm ${styles.byline}`}>
      {b.by}{" "}
      <Link href={href("/medalydridi")} className={styles.bylineName}>
        {b.name}
      </Link>
      , {b.role} · {b.checked}
    </p>
  );
}

export function Sources({ label, keys, all, article }) {
  return (
    <div className={styles.sourcesBlock}>
      <p className={`mono sm ${styles.sourcesLabel}`}>{label}</p>
      <ul className={styles.sources}>
        {keys.map((k) => (
          <li key={k}>
            <a href={all[k][1]} target="_blank" rel="noopener" data-track="article-source" data-track-article={article} data-track-source={k}>
              {all[k][0]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

const ARTICLE = "devops-trends-2027";

export default function TrendsArticle() {
  const { t } = useLang();
  const a = t.devopsTrends;
  const L = a.labels;

  return (
    <article className={nat.article} data-umami-section="devops-trends-article">
      <Copy variant="flicker">
        <SectionHeader bullet left={a.header[0]} right={a.header[1].replace("{n}", Object.keys(a.sources).length)} />
      </Copy>
      <div className={`container ${nat.body}`}>
        <p className={`${nat.lede} ${styles.lede}`}>{a.title}</p>
        <Byline b={a.byline} />
        {a.intro.map((x) => <p key={x.slice(0, 32)} className={nat.para}>{x}</p>)}

        <div id="summary" className={`${nat.block} ${styles.section}`}>
          <Copy>
            <h2 className={nat.h2}>{a.tableTitle}</h2>
          </Copy>
          <div className={nat.tableWrap}>
            <table className={`${nat.table} ${styles.summary}`}>
              <thead>
                <tr>{a.tableCols.map((c) => <th key={c} scope="col">{c}</th>)}</tr>
              </thead>
              <tbody>
                {a.tableRows.map((r, i) => (
                  <tr key={r[0]}>
                    <th scope="row">
                      <a href={`#${a.sections[i].id}`}>{r[0]}</a>
                      {a.sections[i].ours ? <span className={styles.tag}>{L.ours}</span> : null}
                    </th>
                    {r.slice(1).map((cell, j) => (
                      <td key={cell.slice(0, 24)} data-label={a.tableCols[j + 1]}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {a.sections.map((s) => (
          <section key={s.id} id={s.id} className={`${nat.block} ${styles.section}`}>
            <Copy>
              <h2 className={nat.h2}>{s.title}</h2>
            </Copy>
            {s.ours ? <p className={styles.tag}>{L.ours}</p> : null}
            <h3 className={styles.h3}>{L.changes}</h3>
            {s.changes.map((x) => <p key={x.slice(0, 32)} className={nat.para}>{x}</p>)}
            <h3 className={styles.h3}>{L.breaks}</h3>
            {s.breaks.map((x) => <p key={x.slice(0, 32)} className={nat.para}>{x}</p>)}
            <h3 className={styles.h3}>{L.exposed}</h3>
            <p className={nat.para}>{s.exposed}</p>
            <h3 className={styles.h3}>{L.check}</h3>
            <ol className={nat.questions}>{s.check.map((x) => <li key={x.slice(0, 40)}>{x}</li>)}</ol>
            <h3 className={styles.h3}>{L.fix}</h3>
            <p className={nat.para}>{s.fix}</p>
            {s.ours ? <Offer o={a.offer} place="trends-gpu" article={ARTICLE} /> : null}
            <Sources label={L.sources} keys={s.sources} all={a.sources} article={ARTICLE} />
          </section>
        ))}

        <div className={nat.block}>
          <Copy>
            <h2 className={nat.h2}>{a.start.title}</h2>
          </Copy>
          {a.start.paras.map((x) => <p key={x.slice(0, 32)} className={nat.para}>{x}</p>)}
          <Offer o={a.offer} place="trends-end" article={ARTICLE} />
        </div>
      </div>
    </article>
  );
}
