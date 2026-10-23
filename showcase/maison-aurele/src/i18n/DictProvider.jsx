"use client";
import { createContext, useContext, useCallback } from "react";

import { getDict } from "./config";

const DictContext = createContext({ lang: "fr", dict: getDict("fr") });

export default function DictProvider({ lang, children }) {
  return (
    <DictContext.Provider value={{ lang, dict: getDict(lang) }}>
      {children}
    </DictContext.Provider>
  );
}

export const useDict = () => useContext(DictContext).dict;
export const useLang = () => useContext(DictContext).lang;

// Prefix an internal path with the active locale
export const useHref = () => {
  const lang = useLang();
  return useCallback(
    (path = "/") => (path === "/" ? `/${lang}` : `/${lang}${path}`),
    [lang]
  );
};

// Pick the active-locale value from a { fr, en } field
export const useT = () => {
  const lang = useLang();
  return useCallback((field) => (field && typeof field === "object" ? field[lang] : field), [lang]);
};
