import PageHeader from "@/components/PageHeader";
import NatArticle from "@/components/NatArticle";
import CloudCosts from "@/components/CloudCosts";
import FAQ from "@/components/FAQ";
import ContactBanner from "@/components/ContactBanner";
import JsonLd from "@/components/JsonLd";

import { DICTS, localize } from "@/lib/i18n";
import { CLOUD_COSTS } from "@/content/cloudCosts";
import { ORG_ID, pageUrl } from "@/lib/schema";
import { NAT_PRICES_CHECKED } from "@/content/cloudPrices";

const ROUTE = "/cloud-costs/nat-instance";

// NAT Gateways vs NAT instances in non-production accounts: the guide, then the calculator for this
// scenario only (same component and prices as the /cloud-costs hub), then its FAQ
export default function NatInstancePage({ lang }) {
  const t = DICTS[lang];
  const page = t.pages["cloud-costs/nat-instance"];
  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: t.meta.pages["cloud-costs/nat-instance"],
    description: t.natInstance.articleDescription,
    inLanguage: lang,
    url: pageUrl(lang, ROUTE),
    datePublished: NAT_PRICES_CHECKED,
    dateModified: NAT_PRICES_CHECKED,
    author: { "@type": "Person", name: "Mohamed Ali Dridi", url: pageUrl(lang, "/medalydridi") },
    publisher: { "@id": ORG_ID },
    about: ["Amazon VPC", "NAT Gateway", "AWS cost optimization"],
  };

  return (
    <>
      <JsonLd data={schema} />
      <PageHeader
        {...page}
        kicker={CLOUD_COSTS[lang].kicker}
        cta={{ href: localize(lang, "/contact/?need=audit#project-form"), label: CLOUD_COSTS[lang].stickyCta, event: "cost-audit-cta", place: "nat-hero" }}
        reassure={t.auditCta.note}
        compact
      />

      <NatArticle />

      <CloudCosts only="nat-instance" />

      <FAQ k="natFaq" />

      <ContactBanner />
    </>
  );
}
