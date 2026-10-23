import { getDict } from "@/i18n/config";
import { img } from "@/data/media";

import PageHero from "@/components/PageHero/PageHero";
import Manifesto from "@/components/Manifesto/Manifesto";
import NameOrigin from "@/components/NameOrigin/NameOrigin";
import Pillars from "@/components/Pillars/Pillars";
import Feature from "@/components/Feature/Feature";
import MarqueeBanner from "@/components/MarqueeBanner/MarqueeBanner";
import CollectionsIndex from "@/components/CollectionsIndex/CollectionsIndex";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const dict = getDict(lang);
  return { title: dict.nav.maison, description: dict.maison.intro };
}

export default async function Maison({ params }) {
  const { lang } = await params;
  const dict = getDict(lang);
  const m = dict.maison;

  return (
    <>
      <PageHero eyebrow={m.eyebrow} title={m.title} meta="Paris" image={img.atelierDoor} />
      <Manifesto label={m.eyebrow} text={m.intro} images={[img.atelier, img.drape]} at={[8, 22]} />
      <NameOrigin />
      <Feature
        label={m.founderLabel}
        title={m.founderTitle}
        copy={m.founderCopy}
        image={img.fitting}
        inset={img.mannequin}
        reverse
      />
      <Pillars label={m.pillarsLabel} items={m.pillars} images={[img.hand, img.toiles, img.goldLace, img.gownHanger]} />
      <Feature label={m.pfwLabel} title={m.pfwTitle} copy={m.pfwCopy} image={img.salon} inset={img.salonPortrait} dark />
      <MarqueeBanner words={["Nacre", "Minuit", "Ivoire", "Fil d'or"]} />
      <CollectionsIndex label={m.linesLabel} title={dict.home.linesTitle} copy={m.linesCopy} />
    </>
  );
}
