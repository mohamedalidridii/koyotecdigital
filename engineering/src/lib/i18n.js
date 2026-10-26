import fr from "@/content/fr";
import en from "@/content/en";

export const DICTS = { fr, en };

// the site is served from a sub-path (/engineering): public files need it, Link adds it on its own
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const asset = (path) => `${BASE}${path}`;

// "/en/contact/" -> { lang: "en", route: "/contact" }; accepts paths with or without the base path
export function splitPath(pathname = "/") {
  let path = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  path = path.replace(/\/+$/, "") || "/";
  if (path === "/en" || path.startsWith("/en/")) {
    return { lang: "en", route: path.slice(3) || "/" };
  }
  return { lang: "fr", route: path };
}

export const localize = (lang, route) =>
  lang === "en" ? (route === "/" ? "/en" : `/en${route}`) : route;
