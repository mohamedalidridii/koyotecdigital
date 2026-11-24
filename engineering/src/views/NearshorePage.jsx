import PageHeader from "@/components/PageHeader";
import ResearchStatement from "@/components/ResearchStatement";
import FocusAreas from "@/components/FocusAreas";
import FAQ from "@/components/FAQ";
import ContactBanner from "@/components/ContactBanner";
import CloudCallout from "@/components/CloudCallout";
import AuditCta from "@/components/AuditCta";

import { DICTS, localize } from "@/lib/i18n";

// landing page for European buyers: nearshore DevOps & cloud, entered through a fixed-price 2-week audit
export default function NearshorePage({ lang }) {
  const page = DICTS[lang].pages.nearshore;
  // the offer's action in the first screen on a phone too (the audit band below starts lower)
  const cta = { href: localize(lang, "/contact/?need=devops-audit#project-form"), label: DICTS[lang].auditCta.cta, event: "eng-audit-cta", place: "nearshore-header" };
  return (
    <>
      <PageHeader {...page} icon="TerminalIcon" compact cta={cta} />

      <AuditCta place="nearshore-top" />

      <ResearchStatement k="nearshoreStatement" />

      <FocusAreas items="nearshoreAudit" />

      <AuditCta place="nearshore-steps" compact />

      <CloudCallout />

      <FAQ k="nearshoreFaq" />

      <ContactBanner />
    </>
  );
}
