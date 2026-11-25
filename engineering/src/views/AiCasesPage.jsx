import PageHeader from "@/components/PageHeader";
import AiCasesList from "@/components/AiCases/AiCasesList";

import { DICTS, localize } from "@/lib/i18n";

// listing of a case-study collection (AI by default, DevOps with collection="devopsCases")
export default function AiCasesPage({ lang, collection = "aiCases", base = "/ai" }) {
  const t = DICTS[lang];
  const a = t[collection];
  const need = collection === "devopsCases" ? "devops" : "ai";
  const cta = { href: localize(lang, `/contact/?need=${need}#project-form`), label: a.labels.ctaTop, event: "eng-contact-cta", place: `${collection}-hero` };
  return (
    <>
      <PageHeader {...a.header} kicker={a.intro.kicker.join(" · ")} cta={cta} reassure={t.auditCta.note} />
      <AiCasesList collection={collection} base={base} />
    </>
  );
}
