"use client";

import styles from "./Footer.module.css";

import Link from "next/link";

import { useLang } from "@/lib/useLang";
import { CONTACT } from "@/content/shared";

// The full link map of the Engineering site (every page stays one click from every other: internal
// links for visitors and for search engines), the contact details and the wordmark. No animation.
export default function Footer() {
  const { t, lang, href } = useLang();
  const LINKS = [
    ...t.nav.map((link) => ({ href: href(link.route), label: link.label })),
    { href: href("/contact"), label: t.navContact.title },
  ];

  return (
    <footer key={lang} className={styles.footer}>
      <div className={`container ${styles.footerInner}`}>
        <div className={styles.footerContent}>
          <div className={styles.footerAbout}>
            <p className={styles.footerCopy}>{t.footer.copy}</p>
            <div className={`mono sm ${styles.footerReach}`}>
              <a href={CONTACT.email.href} data-track="email" data-track-place="footer">
                {CONTACT.email.text}
              </a>
              <a href={CONTACT.phone.href} data-track="phone" data-track-place="footer">
                {CONTACT.phone.text}
              </a>
              <a href={t.menu.backHref}>{t.menu.back}</a>
            </div>
          </div>
          <nav className={styles.footerLinks} aria-label="Footer">
            {LINKS.map(({ href: to, label }) => (
              <Link key={to} href={to} className={styles.footerLink}>
                {label}
              </Link>
            ))}
            {/* the careers page lives on the main site, outside this app's basePath */}
            <a href={t.menu.careersHref} className={styles.footerLink}>
              {t.menu.careers}
            </a>
          </nav>
        </div>
        <div className={styles.footerHeader} aria-hidden="true">
          {t.footer.words.map((word) => (
            <div key={word} className={`h1 ${styles.footerWord}`}>
              {word}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
