"use client";

import { usePathname } from "next/navigation";

import { DICTS, localize, splitPath } from "@/lib/i18n";

export function useLang() {
  const { lang, route } = splitPath(usePathname());
  return {
    lang,
    route,
    t: DICTS[lang],
    href: (to) => localize(lang, to),
    isHome: route === "/",
  };
}
