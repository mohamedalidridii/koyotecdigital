import PageHeader from "@/components/PageHeader";
import FirmIntro from "@/components/FirmIntro";
import OpenPositions from "@/components/OpenPositions";
import StatementBanner from "@/components/StatementBanner";

import { DICTS } from "@/lib/i18n";

export default function StudioPage({ lang }) {
  const t = DICTS[lang];
  return (
    <>
      <PageHeader {...t.pages.studio} icon="OrbitIcon" />

      <FirmIntro />

      <OpenPositions />

      <StatementBanner
        src="/images/firm/banner.jpg"
        copyTopLeft={t.studioStatement.topLeft}
        copyBottomRight={t.studioStatement.bottomRight}
      />
    </>
  );
}
