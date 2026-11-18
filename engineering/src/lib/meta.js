import { DICTS, localize } from "@/lib/i18n";

const SITE = "https://www.koyotec.digital/engineering";
// keep descriptions within the ~160 characters Google shows, cutting at a word boundary
const clip = (text = "", max = 158) =>
  text.length <= max ? text : `${text.slice(0, text.lastIndexOf(" ", max - 1)).replace(/[,;:\s]+$/, "")}…`;

const url = (lang, route) => `${SITE}${localize(lang, route)}/`.replace(/\/\/$/, "/");

// page metadata with hreflang alternates; `page` is a key of t.meta.pages, or null for the home page
export function meta(lang, page) {
  const t = DICTS[lang].meta;
  const route = page ? `/${page}` : "/";
  const title = page ? t.pages[page] : t.title;
  const description = clip((page && t.descriptions?.[page]) || t.description);
  return {
    title,
    description,
    alternates: {
      canonical: url(lang, route),
      languages: { fr: url("fr", route), en: url("en", route), "x-default": url("fr", route) },
    },
    openGraph: {
      title,
      description,
      url: url(lang, route),
      siteName: "Koyotec Engineering",
      locale: lang === "en" ? "en_US" : "fr_FR",
      images: ["https://www.koyotec.digital/og/koyotec.jpg"],
      type: "website",
    },
  };
}

// metadata for pages whose title comes from the content (the AI case studies)
export function metaFor(lang, route, title, rawDescription) {
  const description = clip(rawDescription);
  return {
    title,
    description,
    alternates: {
      canonical: url(lang, route),
      languages: { fr: url("fr", route), en: url("en", route), "x-default": url("fr", route) },
    },
    openGraph: {
      title,
      description,
      url: url(lang, route),
      siteName: "Koyotec Engineering",
      locale: lang === "en" ? "en_US" : "fr_FR",
      images: ["https://www.koyotec.digital/og/koyotec.jpg"],
      type: "article",
    },
  };
}
