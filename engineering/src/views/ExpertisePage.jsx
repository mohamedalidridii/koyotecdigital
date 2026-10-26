import PageHeader from "@/components/PageHeader";
import StatementBanner from "@/components/StatementBanner";
import ResearchStatement from "@/components/ResearchStatement";
import ResearchAreas from "@/components/ResearchAreas";
import ResearchOutcomes from "@/components/ResearchOutcomes";

import { DICTS } from "@/lib/i18n";

export default function ExpertisePage({ lang }) {
  const page = DICTS[lang].pages.expertise;
  return (
    <>
      <PageHeader {...page} icon="TensorIcon" />

      <StatementBanner showContent={false} src="/images/research/banner.jpg" />

      <ResearchStatement />

      <ResearchAreas />

      <ResearchOutcomes />
    </>
  );
}
