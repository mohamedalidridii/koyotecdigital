import PageHeader from "@/components/PageHeader";
import FirmIntro from "@/components/FirmIntro";
import OpenPositions from "@/components/OpenPositions";
import StatementBanner from "@/components/StatementBanner";

import { DICTS, localize } from "@/lib/i18n";

export default function StudioPage({ lang }) {
  const t = DICTS[lang];
  const cta = { href: localize(lang, "/contact"), label: t.navContact.title, event: "eng-contact-cta", place: "studio-hero" };
  return (
    <>
      <PageHeader {...t.pages.studio} cta={cta} reassure={t.contact.formNote} />

      <FirmIntro />

      <OpenPositions />

      <StatementBanner
        copyTopLeft={t.studioStatement.topLeft}
        copyBottomRight={t.studioStatement.bottomRight}
      />
    </>
  );
}
