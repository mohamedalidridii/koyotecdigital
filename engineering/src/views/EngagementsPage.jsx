import PageHeader from "@/components/PageHeader";
import StatementBanner from "@/components/StatementBanner";
import FocusAreas from "@/components/FocusAreas";
import PartnersSection from "@/components/PartnersSection";

import { DICTS } from "@/lib/i18n";

export default function EngagementsPage({ lang }) {
  const page = DICTS[lang].pages.engagements;
  return (
    <>
      <PageHeader {...page} icon="UserIcon" />

      <StatementBanner
        showContent={false}
        src="/images/partnerships/banner.jpg"
      />

      <FocusAreas items="engagements" />

      <PartnersSection />
    </>
  );
}
