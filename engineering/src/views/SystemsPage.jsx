import PageHeader from "@/components/PageHeader";
import Systems from "@/components/Systems";

import { DICTS, localize } from "@/lib/i18n";

export default function SystemsPage({ lang }) {
  const t = DICTS[lang];
  const page = t.systems.header;
  const cta = { href: localize(lang, "/contact"), label: t.navContact.title, event: "eng-contact-cta", place: "systems-hero" };
  return (
    <>
      <PageHeader {...page} cta={cta} reassure={t.contact.formNote} />
      <Systems />
    </>
  );
}
