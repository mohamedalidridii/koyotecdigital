import "./contact.css";
import { getDict } from "@/i18n/config";
import { img } from "@/data/media";
import { site } from "@/data/site";

import PageHero from "@/components/PageHero/PageHero";
import AppointmentForm from "@/components/AppointmentForm/AppointmentForm";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const dict = getDict(lang);
  return { title: dict.nav.contact, description: dict.contact.intro };
}

export default async function Contact({ params }) {
  const { lang } = await params;
  const dict = getDict(lang);
  const c = dict.contact;

  return (
    <>
      <PageHero eyebrow={c.eyebrow} title={c.title} intro={c.intro} meta={c.city} />
      <section className="contact">
        <div className="container contact-grid">
          <div className="contact-aside">
            <div className="contact-media media">
              <img src={img.ivoryGown} alt="" loading="lazy" />
            </div>
            <div className="contact-blocks">
              {c.blocks.map((block) => (
                <div className="contact-block" key={block.key}>
                  <span className="label gold">{block.label}</span>
                  <a href={`mailto:${site[block.key]}`} className="link-line">
                    {site[block.key]}
                  </a>
                </div>
              ))}
              <div className="contact-block">
                <span className="label gold">Instagram</span>
                <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="link-line">
                  Maison Aurèle
                </a>
              </div>
            </div>
          </div>
          <AppointmentForm />
        </div>
      </section>
    </>
  );
}
