import { getDict } from "@/i18n/config";
import { pieces } from "@/data/pieces";

import PageHero from "@/components/PageHero/PageHero";
import CollectionGrid from "@/components/CollectionGrid/CollectionGrid";
import CollectionsIndex from "@/components/CollectionsIndex/CollectionsIndex";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const dict = getDict(lang);
  return { title: dict.nav.collections, description: dict.ss27.intro };
}

export default async function Collections({ params }) {
  const { lang } = await params;
  const dict = getDict(lang);
  const c = dict.collections;

  return (
    <>
      <PageHero eyebrow={c.eyebrow} title={c.title} meta={`${pieces.length} ${c.count}`} />
      <CollectionGrid />
      <CollectionsIndex label={c.archiveLabel} title={dict.home.linesTitle} copy={dict.maison.linesCopy} />
    </>
  );
}
