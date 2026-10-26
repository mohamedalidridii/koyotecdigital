import { DICTS, localize } from "@/lib/i18n";

const SITE = "https://www.koyotec.digital/engineering";
const url = (lang, route) => `${SITE}${localize(lang, route)}/`.replace(/\/\/$/, "/");

// page metadata with hreflang alternates; `page` is a key of t.meta.pages, or null for the home page
export function meta(lang, page) {
  const t = DICTS[lang].meta;
  const route = page ? `/${page}` : "/";
  const title = page ? t.pages[page] : t.title;
  return {
    title,
    description: t.description,
    alternates: {
      canonical: url(lang, route),
      languages: { fr: url("fr", route), en: url("en", route), "x-default": url("fr", route) },
    },
    openGraph: {
      title,
      description: t.description,
      url: url(lang, route),
      siteName: "Koyotec Engineering",
      locale: lang === "en" ? "en_US" : "fr_FR",
      images: ["https://www.koyotec.digital/og/koyotec.jpg"],
      type: "website",
    },
  };
}
