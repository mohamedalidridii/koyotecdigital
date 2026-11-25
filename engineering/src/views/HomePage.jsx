"use client";

import styles from "./home.module.css";

import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

import { useLang } from "@/lib/useLang";

import PageHeader from "@/components/PageHeader";
import AuditTimeline from "@/components/AuditTimeline";
import Copy from "@/components/Copy";
import SectionHeader from "@/components/SectionHeader";
import FocusAreas from "@/components/FocusAreas";
import CloudCallout from "@/components/CloudCallout";
import AuditCta from "@/components/AuditCta";
import ProcessSteps from "@/components/ProcessSteps";

// LIFT page structure: value + one action + proof in the first screen (the audit timeline explains the
// offer beside it), then who we are, what we build, how we work, and the offer sheet.
const FEATURED = [
  ["aiCases", "/ai", "maintenance-ai-assistant"],
  ["aiCases", "/ai", "rag-document-assistant"],
  ["aiCases", "/ai", "text-to-sql-agent"],
  ["devopsCases", "/devops", "self-healing-ci"],
  ["devopsCases", "/devops", "predictive-autoscaling"],
  ["devopsCases", "/devops", "oncall-copilot"],
];

export default function Home() {
  const { t, href } = useLang();
  const navLabel = (route) => t.nav.find((l) => l.route === route)?.label || route;
  const featured = FEATURED.map(([col, base, slug]) => {
    const c = t[col].cases.find((x) => x.slug === slug);
    return c ? { ...c, to: `${base}/${slug}`, kind: col === "aiCases" ? "IA" : "DevOps" } : null;
  }).filter(Boolean);

  return (
    <>
      <PageHeader
        tone="paper"
        kicker={t.home.header[0]}
        title={t.home.title}
        description={t.home.lede}
        cta={{ href: href("/contact/?need=devops-audit#project-form"), label: t.home.ctaPrimary, event: "eng-audit-cta", place: "home-hero" }}
        secondary={{ href: href("/nearshore"), label: t.home.ctaSecondary, event: "eng-offer-view", place: "home-hero" }}
        reassure={t.auditCta.note}
        proof={t.home.proof}
        aside={<AuditTimeline tone="paper" />}
      />

      <section className={styles.about}>
        <Copy variant="flicker">
          <SectionHeader bullet left={t.home.aboutHeader[0]} right={t.home.aboutHeader[1]} />
        </Copy>
        <div className={`container ${styles.aboutCols}`}>
          <div className={styles.aboutCol} />
          <div className={styles.aboutCopy}>
            <Copy>
              <h4>{t.home.about}</h4>
            </Copy>
          </div>
        </div>
      </section>

      <FocusAreas />

      <CloudCallout />

      <section className={styles.cases} data-umami-section="cases">
        <Copy variant="flicker">
          <SectionHeader bullet left={t.home.casesHeader[0]} right={t.home.casesHeader[1]} />
        </Copy>
        <div className={`container ${styles.casesInner}`}>
          <h2 className={styles.casesTitle}>{t.home.casesTitle}</h2>
          <ol className={styles.caseGrid}>
            {featured.map((c) => (
              <li key={c.slug}>
                <Link href={href(c.to)} className={styles.caseCard}>
                  <span className={`mono sm ${styles.caseKind}`}>
                    {c.kind} · {c.sector}
                  </span>
                  <span className={styles.caseTitle}>{c.short}</span>
                  <span className={`mono sm ${styles.caseRead}`}>
                    {t.aiCases.labels.read} <FiArrowRight aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          <div className={styles.casesFoot}>
            <p className={`mono sm ${styles.casesNote}`}>{t.aiCases.note}</p>
            <div className={styles.casesLinks}>
              <Link href={href("/ai")} className={styles.casesAll}>
                {navLabel("/ai")} · {t.aiCases.cases.length} <FiArrowRight aria-hidden="true" />
              </Link>
              <Link href={href("/devops")} className={styles.casesAll}>
                {navLabel("/devops")} · {t.devopsCases.cases.length} <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ProcessSteps />

      <AuditCta place="home-steps" />
    </>
  );
}
