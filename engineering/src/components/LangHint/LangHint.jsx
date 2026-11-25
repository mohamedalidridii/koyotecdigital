"use client";

import styles from "./LangHint.module.css";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useLang } from "@/lib/useLang";
import { localize } from "@/lib/i18n";

// LIFT relevance: a visitor whose browser speaks the other language is offered that version of the page.
// Never a redirect (search engines and shared links keep their language), and nothing in the static HTML.
const KEY = "koy-lang-hint";
const TEXT = {
  fr: { line: "Cette page existe en français.", cta: "Lire en français", close: "Fermer" },
  en: { line: "This page is also in English.", cta: "Read in English", close: "Close" },
};

export default function LangHint() {
  const { lang, route } = useLang();
  const other = lang === "en" ? "fr" : "en";
  const [show, setShow] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = Boolean(window.localStorage.getItem(KEY));
    } catch {
      /* storage blocked: still offer it */
    }
    if (dismissed) return;
    const pref = String((navigator.languages && navigator.languages[0]) || navigator.language || "")
      .slice(0, 2)
      .toLowerCase();
    setShow(pref === other);
  }, [other]);

  if (!show) return null;
  const copy = TEXT[other];
  const close = () => {
    setShow(false);
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <aside className={styles.hint} lang={other} aria-label={copy.line}>
      <p>{copy.line}</p>
      <Link href={localize(other, route)} hrefLang={other} className={styles.cta} data-track="lang-hint" data-track-to={other} onClick={close}>
        {copy.cta} →
      </Link>
      <button type="button" className={styles.close} onClick={close} aria-label={copy.close}>
        ×
      </button>
    </aside>
  );
}
