import { getDict } from "@/i18n/config";
import { aurele, img } from "@/data/media";
import { credits } from "@/data/credits";

import PageHero from "@/components/PageHero/PageHero";
import Feature from "@/components/Feature/Feature";
import StageCurtain from "@/components/StageCurtain/StageCurtain";
import MarqueeBanner from "@/components/MarqueeBanner/MarqueeBanner";
import { ParallaxColumns, Ribbon, Stats } from "@/components/EventGallery/EventGallery";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const dict = getDict(lang);
  return { title: dict.event.title, description: dict.event.intro };
}

export default async function Defile({ params }) {
  const { lang } = await params;
  const dict = getDict(lang);
  const e = dict.event;

  return (
    <>
      <PageHero eyebrow={e.eyebrow} title={e.title} intro={e.intro} meta="Paris 7e" image={img.salon} dark />
      <Stats items={e.stats} />
      <ParallaxColumns label={e.salonLabel} copy={e.salonCopy} images={aurele.runway} />
      <Feature label={e.tableLabel} title={e.tableLabel} copy={e.tableCopy} image={img.backstage} inset={img.backstageHair} />
      <StageCurtain
        label={e.stageLabel}
        title={dict.home.stageTitle}
        copy={e.stageCopy}
        image={img.runwayWide}
        imageMobile={img.runwayRed}
        focus="68% 26%"
      />
      <Feature
        label={e.stageLabel}
        title={e.title}
        copy={e.stageCopy}
        image={img.backstageCape}
        inset={img.backstageMakeup}
        reverse
        dark
      />
      <MarqueeBanner words={["Fil d'or", "Haute Couture", "Paris", "Printemps-Été 2027"]} />
      <Ribbon label={e.guestsLabel} images={aurele.frontRow} />
      <section className="container event-credit">
        <p className="label">
          {e.credit} : Unsplash — {credits.map((c) => c.name).join(", ")}
        </p>
      </section>
    </>
  );
}
