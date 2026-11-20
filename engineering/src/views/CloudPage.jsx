import CloudHero from "@/components/CloudHero";
import { Explainer, Services, Process, Proof, Founder, Related } from "@/components/CloudSections";
import FAQ from "@/components/FAQ";
import ContactBanner from "@/components/ContactBanner";
import JsonLd from "@/components/JsonLd";

import { DICTS } from "@/lib/i18n";
import { cloudPage } from "@/lib/cloudPages";
import { cloudSchema } from "@/lib/schema";

// the four cloud pages (hub, consultant Tunisia, migration Tunisia, consultant France): one founder-led
// layout on a white page, written for readers who know nothing about the cloud
export default function CloudPage({ lang, pageKey }) {
  const t = DICTS[lang];
  const page = t.cloud.pages[pageKey];
  const { route, meta } = cloudPage(pageKey);
  const schema = cloudSchema({
    lang,
    key: pageKey,
    route,
    title: `${page.title} · ${page.subtitle}`,
    description: t.meta.descriptions[meta],
  });

  return (
    <div data-theme="white">
      <JsonLd data={schema} />
      <CloudHero pageKey={pageKey} />
      <Explainer block={page.explain} diagrams={t.cloud.diagrams} />
      <Services block={page.services} />
      <Founder />
      <Explainer block={page.market} diagrams={t.cloud.diagrams} flip />
      <Process />
      <Proof />
      <FAQ k={page.faqKey} />
      <Related pageKey={pageKey} />
      <ContactBanner />
    </div>
  );
}
