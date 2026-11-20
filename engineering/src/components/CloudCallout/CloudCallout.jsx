"use client";

import styles from "./CloudCallout.module.css";

import Link from "next/link";

import { useLang } from "@/lib/useLang";
import { CLOUD_PAGES } from "@/lib/cloudPages";

// a compact band pointing to the four cloud pages, placed on the home, nearshore and cloud cost pages
export default function CloudCallout() {
  const { t, href } = useLang();
  const c = t.cloud.callout;
  return (
    <section className={styles.callout}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.text}>
          <p className={`mono ${styles.kicker}`}>
            <i aria-hidden="true" />
            {c.kicker}
          </p>
          <h2 className={styles.title}>{c.title}</h2>
          <p className={styles.copy}>{c.copy}</p>
          <Link href={href("/cloud")} className={styles.cta}>
            {c.cta} <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <ul className={styles.list}>
          {CLOUD_PAGES.filter((p) => p.key !== "hub").map((p) => {
            const page = t.cloud.pages[p.key];
            return (
              <li key={p.key}>
                <Link href={href(p.route)}>
                  <span className={styles.itemTitle}>{page.title}</span>
                  <span className={styles.itemSub}>{page.subtitle}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
