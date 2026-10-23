"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { locales, switchLocalePath } from "@/i18n/config";
import { useLang } from "@/i18n/DictProvider";

export default function LangSwitch({ className = "", onNavigate }) {
  const pathname = usePathname();
  const lang = useLang();

  const remember = (locale) => {
    document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000;samesite=lax`;
    onNavigate?.();
  };

  return (
    <div className={`lang-switch label ${className}`}>
      {locales.map((locale, i) => (
        <span key={locale}>
          {i > 0 && <span className="lang-sep"> / </span>}
          {locale === lang ? (
            <span className="lang-active" aria-current="true">
              {locale.toUpperCase()}
            </span>
          ) : (
            <Link
              href={switchLocalePath(pathname, locale)}
              hrefLang={locale}
              onClick={() => remember(locale)}
              className="lang-link"
            >
              {locale.toUpperCase()}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}
