import PageHeader from "@/components/PageHeader";
import FocusAreas from "@/components/FocusAreas";
import PartnersSection from "@/components/PartnersSection";
import AuditCta from "@/components/AuditCta";

import { DICTS, localize } from "@/lib/i18n";

export default function EngagementsPage({ lang }) {
  const t = DICTS[lang];
  const page = t.pages.engagements;
  const cta = { href: localize(lang, "/contact/?need=devops-audit#project-form"), label: t.auditCta.cta, event: "eng-audit-cta", place: "engagements-hero" };
  return (
    <>
      <PageHeader {...page} cta={cta} reassure={t.auditCta.note} />

      <FocusAreas items="engagements" offset={2} />

      <PartnersSection />

      <AuditCta place="engagements" />
    </>
  );
}
