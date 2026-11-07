import PageHeader from "@/components/PageHeader";
import AiCasesList from "@/components/AiCases/AiCasesList";

import { DICTS } from "@/lib/i18n";

// listing of a case-study collection (AI by default, DevOps with collection="devopsCases")
export default function AiCasesPage({ lang, collection = "aiCases", base = "/ai", icon = "SparklesIcon" }) {
  return (
    <>
      <PageHeader {...DICTS[lang][collection].header} icon={icon} />
      <AiCasesList collection={collection} base={base} />
    </>
  );
}
