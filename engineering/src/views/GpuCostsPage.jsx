import PageHeader from "@/components/PageHeader";
import GpuArticle from "@/components/GpuArticle";
import FAQ from "@/components/FAQ";
import ContactBanner from "@/components/ContactBanner";
import JsonLd from "@/components/JsonLd";

import { DICTS, localize } from "@/lib/i18n";
import { ORG_ID, pageUrl } from "@/lib/schema";
import { GPU_REVIEW_ROUTE } from "@/lib/offers";

const ROUTE = "/cloud-costs/kubernetes-gpu";
const PUBLISHED = "2026-11-27";

// Kubernetes GPU costs, the evergreen guide: people who search this have the problem, so the review is the
// first action here; the calculator is the second. Then the guide, its FAQ and the contact band.
export default function GpuCostsPage({ lang }) {
  const t = DICTS[lang];
  const page = t.pages["cloud-costs/kubernetes-gpu"];
  const a = t.gpuCosts;
  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: t.meta.pages["cloud-costs/kubernetes-gpu"],
    description: a.articleDescription,
    inLanguage: lang,
    url: pageUrl(lang, ROUTE),
    image: "https://www.koyotec.digital/og/koyotec.jpg",
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    author: { "@type": "Person", name: "Mohamed Ali Dridi", url: pageUrl(lang, "/medalydridi") },
    publisher: { "@id": ORG_ID },
    about: ["Kubernetes", "GPU cost optimization", "NVIDIA MIG", "GPU time-slicing", "Dynamic Resource Allocation", "DCGM"],
  };

  return (
    <>
      <JsonLd data={schema} />
      <PageHeader
        {...page}
        kicker={a.audience}
        cta={{ href: localize(lang, GPU_REVIEW_ROUTE), label: a.offer.cta, event: "eng-contact-cta", place: "gpu-hero" }}
        secondary={{ href: "#calculator", label: page.calcLink, event: "gpu-calc-jump", place: "gpu-hero" }}
        reassure={a.offer.note}
        compact
      />

      <GpuArticle />

      <FAQ k="gpuFaq" />

      <ContactBanner />
    </>
  );
}
