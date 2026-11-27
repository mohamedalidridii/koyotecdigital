import PageHeader from "@/components/PageHeader";
import TrendsArticle from "@/components/TrendsArticle";
import FAQ from "@/components/FAQ";
import ContactBanner from "@/components/ContactBanner";
import JsonLd from "@/components/JsonLd";

import { DICTS, localize } from "@/lib/i18n";
import { ORG_ID, pageUrl } from "@/lib/schema";
import { GPU_REVIEW_ROUTE } from "@/lib/offers";

const ROUTE = "/devops-trends-2027";
const PUBLISHED = "2026-11-27";

// DevOps trends 2027–2028, for CTOs, platform and security leads: the guide (summary table, one section
// per change, sources), its FAQ, then the contact band. The first action is reading (jump to the summary);
// the GPU & Kubernetes cost review is offered as a quieter link here, and in full inside and after the guide.
export default function TrendsPage({ lang }) {
  const t = DICTS[lang];
  const page = t.pages["devops-trends-2027"];
  const a = t.devopsTrends;
  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: t.meta.pages["devops-trends-2027"],
    description: a.articleDescription,
    inLanguage: lang,
    url: pageUrl(lang, ROUTE),
    image: "https://www.koyotec.digital/og/koyotec.jpg",
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    author: { "@type": "Person", name: "Mohamed Ali Dridi", url: pageUrl(lang, "/medalydridi") },
    publisher: { "@id": ORG_ID },
    keywords: ["DevOps trends", "platform engineering", "Kubernetes DRA", "GPU costs", "post-quantum TLS", "workload identity", "CEL admission policy", "eBPF", "confidential computing"],
  };

  return (
    <>
      <JsonLd data={schema} />
      <PageHeader
        {...page}
        kicker={a.audience}
        cta={{ href: "#summary", label: a.jump, event: "article-jump", place: "trends-hero" }}
        secondary={{ href: localize(lang, GPU_REVIEW_ROUTE), label: a.offer.cta, event: "eng-contact-cta", place: "trends-hero" }}
        compact
      />

      <TrendsArticle />

      <FAQ k="trendsFaq" />

      <ContactBanner />
    </>
  );
}
