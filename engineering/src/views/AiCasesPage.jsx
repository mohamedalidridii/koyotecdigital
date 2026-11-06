import PageHeader from "@/components/PageHeader";
import AiCasesList from "@/components/AiCases/AiCasesList";

import { DICTS } from "@/lib/i18n";

export default function AiCasesPage({ lang }) {
  return (
    <>
      <PageHeader {...DICTS[lang].aiCases.header} icon="SparklesIcon" />
      <AiCasesList />
    </>
  );
}
