import PageHeader from "@/components/PageHeader";
import ResearchStatement from "@/components/ResearchStatement";
import AuditTimeline from "@/components/AuditTimeline";
import FAQ from "@/components/FAQ";
import ContactBanner from "@/components/ContactBanner";
import CloudCallout from "@/components/CloudCallout";
import AuditCta from "@/components/AuditCta";

import { DICTS, localize } from "@/lib/i18n";
import { CONTACT } from "@/content/shared";

// The 2-week audit offer (the money page): value, action, reassurance and the plain facts in the first
// screen, the steps as a timeline beside it, then the spec sheet, the steps in full, FAQ and contact.
export default function NearshorePage({ lang }) {
  const t = DICTS[lang];
  const page = t.pages.nearshore;
  // the offer's action in the first screen on a phone too
  const cta = { href: localize(lang, "/contact/?need=devops-audit#project-form"), label: t.auditCta.cta, event: "eng-audit-cta", place: "nearshore-header" };
  const wa = {
    href: `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(t.auditCta.waText)}`,
    label: t.auditCta.wa,
    event: "whatsapp",
    place: "engineering-nearshore-header",
    external: true,
  };
  const proof = t.nearshoreStatement.stats.map((s) => `${s.value} · ${s.label}`);
  return (
    <>
      <PageHeader
        {...page}
        kicker={t.auditCta.kicker}
        cta={cta}
        secondary={wa}
        reassure={t.auditCta.note}
        proof={proof}
        aside={<AuditTimeline tone="red" />}
        compact
      />

      <AuditCta place="nearshore-top" />

      <ResearchStatement k="nearshoreStatement" />

      <section data-umami-section="auditSteps" style={{ background: "var(--base-200)", padding: "clamp(3rem, 7vw, 6rem) 0" }}>
        <div className="container">
          <AuditTimeline variant="full" />
        </div>
      </section>

      <AuditCta place="nearshore-steps" compact />

      <CloudCallout />

      <FAQ k="nearshoreFaq" />

      <ContactBanner />
    </>
  );
}
