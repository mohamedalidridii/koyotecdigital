import PageHeader from "@/components/PageHeader";
import ResearchStatement from "@/components/ResearchStatement";
import ResearchAreas from "@/components/ResearchAreas";
import ResearchOutcomes from "@/components/ResearchOutcomes";
import ContactBanner from "@/components/ContactBanner";

import { DICTS, localize } from "@/lib/i18n";

export default function ExpertisePage({ lang }) {
  const t = DICTS[lang];
  const page = t.pages.expertise;
  const cta = { href: localize(lang, "/contact"), label: t.navContact.title, event: "eng-contact-cta", place: "expertise-hero" };
  return (
    <>
      <PageHeader {...page} cta={cta} reassure={t.contact.formNote} />

      <ResearchStatement />

      <ResearchAreas />

      <ResearchOutcomes />

      <ContactBanner />
    </>
  );
}
