import PageHeader from "@/components/PageHeader";
import ResearchStatement from "@/components/ResearchStatement";
import FocusAreas from "@/components/FocusAreas";
import FAQ from "@/components/FAQ";
import ContactBanner from "@/components/ContactBanner";

import { DICTS } from "@/lib/i18n";

// landing page for European buyers: nearshore DevOps & cloud, entered through a fixed-price 2-week audit
export default function NearshorePage({ lang }) {
  const page = DICTS[lang].pages.nearshore;
  return (
    <>
      <PageHeader {...page} icon="TerminalIcon" />

      <ResearchStatement k="nearshoreStatement" />

      <FocusAreas items="nearshoreAudit" />

      <FAQ k="nearshoreFaq" />

      <ContactBanner />
    </>
  );
}
