import FounderProfile from "@/components/FounderProfile";
import ContactBanner from "@/components/ContactBanner";
import JsonLd from "@/components/JsonLd";

import { DICTS } from "@/lib/i18n";
import { founderSchema } from "@/lib/schema";

// the founder on the Engineering site: who leads the team, his two jobs (engineering and strategy),
// path, talks and verifiable profiles; the full personal story lives on koyotec.digital/medalydridi
export default function FounderPage({ lang }) {
  const t = DICTS[lang];
  const f = t.founderPage;
  const schema = founderSchema({
    lang,
    title: t.meta.pages.medalydridi,
    description: t.meta.descriptions.medalydridi,
    jobTitles: f.roles.slice(1),
    sameAs: f.profiles.items.map((p) => p.href),
  });
  return (
    <div data-theme="white">
      <JsonLd data={schema} />
      <FounderProfile />
      <ContactBanner />
    </div>
  );
}
