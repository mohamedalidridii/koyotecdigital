import { getDict } from "@/i18n/config";

import FabricHero from "@/components/FabricHero/FabricHero";
import Manifesto from "@/components/Manifesto/Manifesto";
import NameOrigin from "@/components/NameOrigin/NameOrigin";
import CollectionGallery from "@/components/CollectionGallery/CollectionGallery";
import GoldDetails from "@/components/GoldDetails/GoldDetails";
import PieceGrid from "@/components/PieceCard/PieceGrid";
import StageCurtain from "@/components/StageCurtain/StageCurtain";
import MarqueeBanner from "@/components/MarqueeBanner/MarqueeBanner";
import CollectionsIndex from "@/components/CollectionsIndex/CollectionsIndex";
import Feature from "@/components/Feature/Feature";
import { img } from "@/data/media";

const FEATURED = ["robe-or-brodee", "fourreau-fleurs-or", "robe-bustier-pourpre", "robe-cape-faille"];

export default async function Home({ params }) {
  const { lang } = await params;
  const dict = getDict(lang);

  return (
    <>
      <FabricHero />
      <Manifesto
        label={dict.home.manifestoLabel}
        text={dict.home.manifesto}
        images={[img.embroidery, img.goldGown, img.drape]}
        at={[2, 10, 18]}
      />
      <NameOrigin />
      <CollectionGallery />
      <GoldDetails />
      <Feature
        label={dict.home.filmLabel}
        title={dict.home.filmTitle}
        copy={dict.home.filmCopy}
        image={img.atelier}
        inset={img.thread}
        reverse
        dark
      />
      <PieceGrid label={dict.home.selectionLabel} title={dict.home.selectionTitle} slugs={FEATURED} />
      <StageCurtain
        label={dict.home.stageLabel}
        title={dict.home.stageTitle}
        copy={dict.home.stageCopy}
        cta={dict.home.stageCta}
        ctaHref={`/${lang}/defile`}
        focus="86% 45%"
      />
      <MarqueeBanner words={dict.home.marquee} />
      <CollectionsIndex label={dict.home.linesLabel} title={dict.home.linesTitle} />
    </>
  );
}
