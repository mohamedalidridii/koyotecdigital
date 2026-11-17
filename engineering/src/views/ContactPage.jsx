import PageHeader from "@/components/PageHeader";
import ContactActions from "@/components/ContactActions";
import ContactBanner from "@/components/ContactBanner";
import FAQ from "@/components/FAQ";

import { DICTS } from "@/lib/i18n";

export default function ContactPage({ lang }) {
  const page = DICTS[lang].pages.contact;
  return (
    <>
      <PageHeader {...page} icon="SendIcon" compact />

      <ContactActions />

      <ContactBanner />

      <FAQ />
    </>
  );
}
