"use client";

import nat from "../NatArticle/NatArticle.module.css";
import tr from "../TrendsArticle/TrendsArticle.module.css";
import cc from "../CloudCosts/CloudCosts.module.css";
import styles from "./GpuArticle.module.css";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

import Copy from "@/components/Copy";
import SectionHeader from "@/components/SectionHeader";
import { Offer, Byline, Sources } from "@/components/TrendsArticle/TrendsArticle";

import { useLang } from "@/lib/useLang";
import { GPU_REVIEW_ROUTE } from "@/lib/offers";

// The Kubernetes GPU costs guide (evergreen, built with LIFT): why bills grow, what to measure (with an
// idle-cost calculator that only does arithmetic on the reader's own figures), the four ways to share a
// GPU, DRA vs the device plugin, scaling GPU nodes down, then the one offer. Text: content/gpuCosts.*.js.

const ARTICLE = "kubernetes-gpu";
const DAYS_PER_MONTH = 365 / 12;
const DEFAULTS = { gpus: 16, price: 2.5, hours: 24, activity: 25, target: 60 };
const LIMITS = { gpus: [1, 10000], price: [0, 1000], hours: [1, 24], activity: [0, 100], target: [10, 100] };

function Table({ cols, rows }) {
  return (
    <div className={nat.tableWrap}>
      <table className={`${nat.table} ${styles.table}`}>
        <thead>
          <tr>{cols.map((c) => <th key={c} scope="col">{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]}>
              <th scope="row">{r[0]}</th>
              {r.slice(1).map((cell, j) => (
                <td key={cell.slice(0, 24)} data-label={cols[j + 1]}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Calculator({ c }) {
  const { lang, href } = useLang();
  const [v, setV] = useState(DEFAULTS);
  const tracked = useRef(false);
  const money = useMemo(
    () => new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
    [lang],
  );

  const onField = (k) => (e) => {
    const raw = e.target.value;
    setV((s) => ({ ...s, [k]: raw === "" ? "" : Number(raw) }));
    if (!tracked.current) {
      tracked.current = true;
      try {
        window.umami?.track("gpu-calc", { lang });
      } catch {
        /* analytics must never break the calculator */
      }
    }
  };

  // arithmetic on the reader's inputs only; empty or out-of-range fields fall back inside their limits
  const n = (k) => {
    const x = Number(v[k]);
    const [lo, hi] = LIMITS[k];
    return Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : DEFAULTS[k];
  };
  const gpus = Math.round(n("gpus"));
  const hoursMonth = n("hours") * DAYS_PER_MONTH;
  const spend = gpus * n("price") * hoursMonth;
  const activity = n("activity") / 100;
  const target = n("target") / 100;
  const idle = spend * (1 - activity);
  const needed = Math.max(1, Math.min(gpus, Math.ceil((gpus * activity) / target)));
  const saving = (gpus - needed) * n("price") * hoursMonth;

  return (
    <div id="calculator" className={`${tr.section} ${styles.calcWrap}`}>
      <Copy>
        <h3 className={styles.calcTitle}>{c.title}</h3>
      </Copy>
      <div className={cc.calc}>
        <div className={cc.fields}>
          <p className="mono sm">{c.inputs}</p>
          {Object.entries(c.fields).map(([k, label]) => (
            <label key={k} className={cc.field}>
              <span>{label}</span>
              <input
                type="number"
                inputMode="decimal"
                min={LIMITS[k][0]}
                max={LIMITS[k][1]}
                step={k === "price" ? "0.01" : "1"}
                value={v[k]}
                onChange={onField(k)}
              />
            </label>
          ))}
          <p className={cc.price}>{c.priceNote}</p>
        </div>
        <div className={cc.result} aria-live="polite">
          <p className="mono sm">{c.spend}</p>
          <p className={cc.big}>
            {money.format(spend)} <span>{c.perMonth}</span>
          </p>
          <p className={cc.year}>
            {money.format(idle)} {c.idle}
          </p>
          <p className={cc.shards}>
            {c.needed}: <strong>{needed}</strong> / {gpus}
          </p>
          <p className={cc.shards}>
            {c.saving}: <strong>{money.format(saving)}</strong> {c.perMonth} · {money.format(saving * 12)} {c.perYear}
          </p>
          <Link className={cc.resultCta} href={href(GPU_REVIEW_ROUTE)} data-track="eng-contact-cta" data-track-place="gpu-calc">
            <span>{c.cta}</span>
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
      <p className={styles.calcNote}>{c.note}</p>
    </div>
  );
}

function Block({ title, children, id }) {
  return (
    <section id={id} className={`${nat.block} ${tr.section}`}>
      <Copy>
        <h2 className={nat.h2}>{title}</h2>
      </Copy>
      {children}
    </section>
  );
}

export default function GpuArticle() {
  const { t } = useLang();
  const a = t.gpuCosts;
  const src = (keys) => (keys?.length ? <Sources label={a.labels.sources} keys={keys} all={a.sources} article={ARTICLE} /> : null);

  return (
    <article className={nat.article} data-umami-section="gpu-costs-article">
      <Copy variant="flicker">
        <SectionHeader bullet left={a.header[0]} right={a.header[1].replace("{n}", Object.keys(a.sources).length)} />
      </Copy>
      <div className={`container ${nat.body}`}>
        <p className={`${nat.lede} ${tr.lede}`}>{a.title}</p>
        <Byline b={a.byline} />
        {a.intro.map((x) => <p key={x.slice(0, 32)} className={nat.para}>{x}</p>)}

        <Block title={a.why.title} id="why">
          <ul className={nat.list}>{a.why.items.map((x) => <li key={x.slice(0, 40)}>{x}</li>)}</ul>
          {src(a.why.sources)}
        </Block>

        <Block title={a.measure.title} id="measure">
          <Table cols={a.measure.cols} rows={a.measure.rows} />
          {a.measure.paras.map((x) => <p key={x.slice(0, 32)} className={nat.para}>{x}</p>)}
          <Calculator c={a.calc} />
          {src(a.measure.sources)}
        </Block>

        <Block title={a.share.title} id="share">
          <Table cols={a.share.cols} rows={a.share.rows} />
          {a.share.paras.map((x) => <p key={x.slice(0, 32)} className={nat.para}>{x}</p>)}
          {src(a.share.sources)}
        </Block>

        <Block title={a.dra.title} id="dra">
          <ul className={nat.list}>{a.dra.items.map((x) => <li key={x.slice(0, 40)}>{x}</li>)}</ul>
          {src(a.dra.sources)}
        </Block>

        <Block title={a.scale.title} id="scale">
          <ul className={nat.list}>{a.scale.items.map((x) => <li key={x.slice(0, 40)}>{x}</li>)}</ul>
          <Offer o={a.offer} place="gpu-end" article={ARTICLE} />
        </Block>
      </div>
    </article>
  );
}
