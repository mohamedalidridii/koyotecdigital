import fr from "./dictionaries/fr";
import en from "./dictionaries/en";

export const locales = ["fr", "en"];
export const defaultLocale = "fr";

const dictionaries = { fr, en };

export const isLocale = (value) => locales.includes(value);
export const getDict = (lang) => dictionaries[lang] ?? dictionaries[defaultLocale];

// Swap the locale segment of a pathname: /fr/ss27 -> /en/ss27
export const switchLocalePath = (pathname, lang) => {
  const parts = (pathname || "/").split("/");
  if (isLocale(parts[1])) parts[1] = lang;
  else parts.splice(1, 0, lang);
  return parts.join("/").replace(/\/$/, "") || `/${lang}`;
};
