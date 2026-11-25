import PageHeader from "@/components/PageHeader";
import CloudCosts from "@/components/CloudCosts";
import FAQ from "@/components/FAQ";
import ContactBanner from "@/components/ContactBanner";
import CloudCallout from "@/components/CloudCallout";

import { DICTS, localize } from "@/lib/i18n";
import { CLOUD_COSTS } from "@/content/cloudCosts";

import styles from "./costs.module.css";

// cloud cost scenarios: five AWS architecture defaults, their cost per Region and the optimised design,
// with calculators; leads to the cloud cost audit. The first screen says what the page holds (the five
// settings, as links) next to the one action.
export default function CloudCostsPage({ lang }) {
  const t = DICTS[lang];
  const page = t.pages["cloud-costs"];
  const c = CLOUD_COSTS[lang];
  const cta = { href: localize(lang, "/contact/?need=audit#project-form"), label: c.stickyCta, event: "cost-audit-cta", place: "hero" };
  const index = (
    <nav className={styles.index} aria-label={c.heroJump}>
      <p className="mono sm">{c.heroJump}</p>
      <ol>
        {c.scenarios.map((s, i) => (
          <li key={s.id}>
            <a href={`#${s.id}`}>
              <span className="mono sm">{String(i + 1).padStart(2, "0")}</span>
              <span>{c.jump[s.id]}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
  return (
    <>
      <PageHeader {...page} kicker={c.kicker} cta={cta} reassure={t.auditCta.note} aside={index} compact />

      <CloudCosts />

      <CloudCallout />

      <FAQ k="cloudCostsFaq" />

      <ContactBanner />
    </>
  );
}
