"use client";

import styles from "./NatArticle.module.css";

import { useMemo } from "react";
import Link from "next/link";

import Copy from "@/components/Copy";
import SectionHeader from "@/components/SectionHeader";

import { useLang } from "@/lib/useLang";
import { PRICES, REGIONS, HOURS_PER_MONTH, NAT_INSTANCE_DISK_GB, natInstanceCosts } from "@/content/cloudPrices";

// The NAT Gateway vs NAT instance guide. Text comes from content/natInstance.{fr,en}.js; every figure is
// computed here from content/cloudPrices.js, so a price update changes the article and the calculator together.

const EXAMPLE = { region: "eu-west-3", zones: 3, gb: 500 };
const ACCOUNT_STEPS = [1, 10, 30];
const ACCOUNT_REGIONS = ["eu-west-3", "eu-central-1", "me-central-1"];

const fill = (text, vars) => text.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));

function Table({ cols, rows, strongLast = false }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>{cols.map((c, i) => <th key={c || i} scope="col">{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r[0]} className={strongLast && i === rows.length - 1 ? styles.total : undefined}>
              {r.map((cell, j) => (j === 0 ? <th key={j} scope="row">{cell}</th> : <td key={j}>{cell}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Block({ title, children }) {
  return (
    <div className={styles.block}>
      <Copy>
        <h2 className={styles.h2}>{title}</h2>
      </Copy>
      {children}
    </div>
  );
}

export default function NatArticle() {
  const { t, lang, href } = useLang();
  const a = t.natInstance;
  const s = a.sections;
  const label = (id) => REGIONS.find((r) => r.id === id).label[lang];

  const money = useMemo(() => {
    const loc = lang === "fr" ? "fr-FR" : "en-US";
    const two = new Intl.NumberFormat(loc, { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const whole = new Intl.NumberFormat(loc, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
    const rate = new Intl.NumberFormat(loc, { style: "currency", currency: "USD", minimumFractionDigits: 3, maximumFractionDigits: 4 });
    return { two: (n) => two.format(n), whole: (n) => whole.format(Math.round(n)), rate: (n) => rate.format(n) };
  }, [lang]);

  const h = HOURS_PER_MONTH;
  const gbUnit = lang === "fr" ? "Go" : "GB";
  const z = EXAMPLE.zones;

  const todayRows = REGIONS.map((r) => {
    const p = PRICES[r.id];
    return [label(r.id), money.rate(p.natHour), money.rate(p.natGb), money.two(natInstanceCosts(p, { zones: z, gb: 0 }).gateways)];
  });
  const instanceRows = REGIONS.map((r) => {
    const p = PRICES[r.id];
    return [label(r.id), money.rate(p.nanoHour), money.two(natInstanceCosts(p, { zones: z, gb: 0 }).box)];
  });

  const p = PRICES[EXAMPLE.region];
  const ex = natInstanceCosts(p, { zones: z, gb: EXAMPLE.gb });
  const r = s.example.rows;
  const exampleRows = [
    [r.hours, `${z} × ${money.rate(p.natHour)} × ${h} h = ${money.two(z * p.natHour * h)}`, `${money.rate(p.nanoHour)} × ${h} h = ${money.two(p.nanoHour * h)}`],
    [r.ipv4, `${z} × ${money.rate(p.ipv4Hour)} × ${h} h = ${money.two(z * p.ipv4Hour * h)}`, `${money.rate(p.ipv4Hour)} × ${h} h = ${money.two(p.ipv4Hour * h)}`],
    [r.disk, s.example.na, `${NAT_INSTANCE_DISK_GB} ${gbUnit} × ${money.rate(p.gp3Gb)} = ${money.two(NAT_INSTANCE_DISK_GB * p.gp3Gb)}`],
    [r.traffic, `${EXAMPLE.gb} ${gbUnit} × ${money.rate(p.natGb)} = ${money.two(EXAMPLE.gb * p.natGb)}`, `${z - 1}/${z} × ${EXAMPLE.gb} ${gbUnit} × ${money.rate(p.interAz * 2)} = ${money.two(ex.crossAz)}`],
    [r.total, money.two(ex.gateways), money.two(ex.best)],
  ];
  const savedMonth = ex.gateways - ex.best;

  const yearly = (id, accounts) => {
    const c = natInstanceCosts(PRICES[id], { zones: z, gb: EXAMPLE.gb });
    return accounts * (c.gateways - c.best) * 12;
  };
  const accountRows = ACCOUNT_STEPS.map((n) => [String(n), ...ACCOUNT_REGIONS.map((id) => money.whole(yearly(id, n)))]);
  const vars = { region: label(EXAMPLE.region), gb: EXAMPLE.gb, zones: z };

  return (
    <article className={styles.article} data-umami-section="nat-article">
      <Copy variant="flicker">
        <SectionHeader bullet left={a.header[0]} right={a.header[1]} />
      </Copy>
      <div className={`container ${styles.body}`}>
        <Copy>
          <p className={styles.lede}>{a.title}</p>
        </Copy>
        {a.intro.map((x) => <p key={x.slice(0, 32)} className={styles.para}>{x}</p>)}

        <Block title={s.today.title}>
          {s.today.paras.map((x) => <p key={x.slice(0, 32)} className={styles.para}>{x}</p>)}
          <Table cols={s.today.cols} rows={todayRows} />
        </Block>

        <Block title={s.instance.title}>
          <Table cols={s.instance.cols} rows={instanceRows} />
          {s.instance.paras.map((x) => <p key={x.slice(0, 32)} className={styles.para}>{x}</p>)}
        </Block>

        <Block title={fill(s.example.title, vars)}>
          <Table cols={s.example.cols.map((c) => fill(c, vars))} rows={exampleRows} strongLast />
          <p className={styles.result}>{fill(s.example.result, { month: money.two(savedMonth), year: money.whole(savedMonth * 12) })}</p>
        </Block>

        <Block title={s.accounts.title}>
          {s.accounts.paras.map((x) => <p key={x.slice(0, 32)} className={styles.para}>{fill(x, vars)}</p>)}
          <Table cols={[s.accounts.colAccounts, ...ACCOUNT_REGIONS.map((id) => `${label(id)}, ${s.accounts.perYear}`)]} rows={accountRows} />
          <p className={styles.para}>{fill(s.accounts.note, { us: money.whole(yearly("us-east-1", 10)) })}</p>
        </Block>

        <Block title={s.fit.title}>
          <ol className={styles.questions}>{s.fit.questions.map((q) => <li key={q}>{q}</li>)}</ol>
          {s.fit.paras.map((x) => <p key={x.slice(0, 32)} className={styles.para}>{x}</p>)}
        </Block>

        <Block title={s.setup.title}>
          <ul className={styles.list}>{s.setup.items.map((x) => <li key={x.slice(0, 40)}>{x}</li>)}</ul>
        </Block>

        <Block title={s.gotchas.title}>
          <ul className={styles.list}>{s.gotchas.items.map((x) => <li key={x.slice(0, 40)}>{x}</li>)}</ul>
        </Block>

        <div className={styles.calcHead}>
          <Copy>
            <h2 className={styles.h2}>{a.calcTitle}</h2>
          </Copy>
          <Link className={styles.back} href={href("/cloud-costs")} data-umami-event="cost-more" data-umami-event-place="nat-back">
            ← {a.backLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
