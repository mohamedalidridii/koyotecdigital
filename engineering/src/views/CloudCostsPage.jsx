import PageHeader from "@/components/PageHeader";
import CloudCosts from "@/components/CloudCosts";
import FAQ from "@/components/FAQ";
import ContactBanner from "@/components/ContactBanner";
import CloudCallout from "@/components/CloudCallout";

import { DICTS } from "@/lib/i18n";

// cloud cost scenarios: four AWS architecture defaults, their cost per Region and the optimised design,
// with calculators; leads to the cloud cost audit
export default function CloudCostsPage({ lang }) {
  const page = DICTS[lang].pages["cloud-costs"];
  return (
    <>
      <PageHeader {...page} icon="ChartIcon" compact />

      <CloudCosts />

      <CloudCallout />

      <FAQ k="cloudCostsFaq" />

      <ContactBanner />
    </>
  );
}
