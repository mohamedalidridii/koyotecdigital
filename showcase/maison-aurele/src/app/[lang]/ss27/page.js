import { getDict } from "@/i18n/config";
import { img } from "@/data/media";

import PageHero from "@/components/PageHero/PageHero";
import Chapters from "@/components/Chapters/Chapters";
import GoldDetails from "@/components/GoldDetails/GoldDetails";
import Palette from "@/components/Palette/Palette";
import PieceGrid from "@/components/PieceCard/PieceGrid";
import MarqueeBanner from "@/components/MarqueeBanner/MarqueeBanner";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const dict = getDict(lang);
  return { title: dict.ss27.title, description: dict.ss27.intro };
}

export default async function SS27({ params }) {
  const { lang } = await params;
  const dict = getDict(lang);
  const s = dict.ss27;

  return (
    <>
      <PageHero eyebrow={s.eyebrow} title={s.title} intro={s.intro} meta="Paris — Haute Couture" image={img.sequinGown} dark />
      <Chapters chapters={s.chapters} images={[img.embroidery, img.velvet, img.ivoryGown, img.runwayRed]} />
      <MarqueeBanner words={dict.home.marquee} dark />
      <GoldDetails />
      <Palette label={s.paletteLabel} swatches={s.palette} />
      <PieceGrid
        label={s.outro}
        title={dict.home.selectionTitle}
        slugs={[
          "robe-or-brodee",
          "robe-manches-cloche",
          "sirene-sequins-or",
          "robe-noire-brodee",
          "robe-bal-tulle",
          "robe-volants",
          "robe-bal-ivoire",
          "smoking-noir",
          "robe-manteau-velours",
        ]}
      />
    </>
  );
}
