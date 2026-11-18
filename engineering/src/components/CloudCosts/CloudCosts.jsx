"use client";

import styles from "./CloudCosts.module.css";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

import { useLang } from "@/lib/useLang";
import { CLOUD_COSTS } from "@/content/cloudCosts";
import { PRICES, PRICES_CHECKED, REGIONS, SOURCES } from "@/content/cloudPrices";

const track = (name, data) => {
  try {
    window.umami?.track(name, data);
  } catch {
    /* analytics must never break the page */
  }
};

const DEFAULTS = {
  "s3-nat": { gb: 100000 },
  "cross-az": { gb: 500000, zones: 3, local: 80 },
  "spot-ebs": { instances: 100, hours: 730, spot: 90 },
  dynamodb: { writes: 20000, size: 1, factor: 2, hours: 730 },
};

// monthly cost before / after for each scenario, from the inputs and the Region's prices
function compute(id, v, p) {
  if (id === "s3-nat") {
    const before = v.gb * p.natGb;
    return { before, after: 0, price: `$${p.natGb} / GB (NAT Gateway)` };
  }
  if (id === "cross-az") {
    const zones = Math.max(1, v.zones);
    const crossing = v.gb * ((zones - 1) / zones);
    const before = crossing * p.interAz * 2;
    const after = before * (1 - Math.min(100, Math.max(0, v.local)) / 100);
    return { before, after, price: `$${p.interAz} / GB × 2 (out + in)` };
  }
  if (id === "spot-ebs") {
    const share = Math.min(100, Math.max(0, v.spot)) / 100;
    const before = v.instances * v.hours * p.m5OnDemand;
    const after = v.instances * v.hours * (share * p.m5Spot + (1 - share) * p.m5OnDemand);
    return { before, after, price: `m5.2xlarge: $${p.m5OnDemand}/h On-Demand · $${p.m5Spot}/h Spot` };
  }
  // dynamodb: one write unit per KB (rounded up) per second
  const wcu = v.writes * Math.max(1, Math.ceil(v.size));
  const before = wcu * Math.max(1, v.factor) * p.wcuHour * v.hours;
  const after = wcu * p.wcuHour * v.hours;
  return { before, after, price: `$${p.wcuHour} / WCU-hour`, shards: Math.ceil(wcu / 1000) };
}

function Scenario({ s, region, c, fmt, index }) {
  const [v, setV] = useState(DEFAULTS[s.id]);
  const used = useRef(false);
  const p = PRICES[region];
  const r = useMemo(() => compute(s.id, v, p), [s.id, v, p]);
  const saved = Math.max(0, r.before - r.after);

  const onField = (k) => (e) => {
    const n = Number(e.target.value);
    setV((o) => ({ ...o, [k]: Number.isFinite(n) && n >= 0 ? n : 0 }));
    if (!used.current) {
      used.current = true;
      track("cost-calc", { scenario: s.id, region });
    }
  };

  return (
    <section className={styles.scenario} id={s.id} data-umami-section={`cost-${s.id}`}>
      <header className={styles.head}>
        <p className="mono sm">{String(index + 1).padStart(2, "0")}</p>
        <h3>{s.title}</h3>
        <p className={styles.problem}>{s.problem}</p>
      </header>

      <div className={styles.compare}>
        <div className={styles.side}>
          <p className="mono sm">{c.before}</p>
          <p>{s.default}</p>
          <p className={styles.amount}>{fmt(r.before)} <span>{c.perMonth}</span></p>
        </div>
        <div className={`${styles.side} ${styles.good}`}>
          <p className="mono sm">{c.after}</p>
          <p>{s.optimised}</p>
          <p className={styles.amount}>{fmt(r.after)} <span>{c.perMonth}</span></p>
        </div>
      </div>

      <div className={styles.calc}>
        <div className={styles.fields}>
          <p className="mono sm">{c.inputs}</p>
          {Object.entries(s.fields).map(([k, label]) => (
            <label key={k} className={styles.field}>
              <span>{label}</span>
              <input type="number" min="0" inputMode="decimal" value={v[k]} onChange={onField(k)} />
            </label>
          ))}
          <p className={styles.price}>
            {c.priceUsed}: {r.price}
          </p>
        </div>
        <div className={styles.result}>
          <p className="mono sm">{c.savings}</p>
          <p className={styles.big}>{fmt(saved)} <span>{c.perMonth}</span></p>
          <p className={styles.year}>{fmt(saved * 12)} {c.perYear}</p>
          {r.shards ? (
            <p className={styles.shards}>
              {s.shardsLabel}: <strong>{r.shards}</strong>
            </p>
          ) : null}
        </div>
      </div>

      <div className={styles.lists}>
        <div>
          <p className="mono sm">{c.howTo}</p>
          <ul>{s.how.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
        <div>
          <p className="mono sm">{c.tradeoffs}</p>
          <ul>{s.tradeoffs.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}

export default function CloudCosts() {
  const { lang, href } = useLang();
  const c = CLOUD_COSTS[lang];
  const [region, setRegion] = useState(REGIONS[0].id);
  const fmt = useMemo(() => {
    const nf = new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
    return (n) => nf.format(Math.round(n));
  }, [lang]);

  const onRegion = (e) => {
    setRegion(e.target.value);
    track("cost-region", { region: e.target.value });
  };

  return (
    <section className={styles.cloudCosts} data-umami-section="cost-scenarios">
      <div className="container">
        <div className={styles.toolbar}>
          <p className="mono sm">{c.kicker}</p>
          <label className={styles.region}>
            <span>{c.regionLabel}</span>
            <select value={region} onChange={onRegion}>
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label[lang]} · {r.id}
                </option>
              ))}
            </select>
          </label>
          <p className={styles.note}>{c.regionNote}</p>
        </div>

        {c.scenarios.map((s, i) => (
          <Scenario key={s.id} s={s} region={region} c={c} fmt={fmt} index={i} />
        ))}

        <div className={styles.cta}>
          <h3>{c.ctaTitle}</h3>
          <p>{c.ctaCopy}</p>
          <div className={styles.ctaButtons}>
            <Link className={styles.ctaPrimary} href={href("/contact")} data-umami-event="cost-audit-cta" data-umami-event-region={region}>
              <span>{c.ctaAudit}</span>
              <FiArrowRight aria-hidden="true" />
            </Link>
            <Link className={styles.ctaSecondary} href={href("/nearshore")} data-umami-event="cost-nearshore-cta">
              <span>{c.ctaTalk}</span>
              <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className={styles.footnotes}>
          <p>{c.disclaimer.replace("{date}", PRICES_CHECKED)}</p>
          <p className="mono sm">{c.sourcesTitle}</p>
          <ul>
            {SOURCES.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
