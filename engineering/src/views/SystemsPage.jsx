import PageHeader from "@/components/PageHeader";
import Systems from "@/components/Systems";

import { DICTS } from "@/lib/i18n";

export default function SystemsPage({ lang }) {
  const page = DICTS[lang].systems.header;
  return (
    <>
      <PageHeader {...page} icon="NetworkIcon" />
      <Systems />
    </>
  );
}
