"use client";

import styles from "./Blueprints.module.css";

import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

import PageHeader from "@/components/PageHeader";
import ContactBanner from "@/components/ContactBanner";

import { useLang } from "@/lib/useLang";

// The reference designs, readable at a glance: each one says what it is and leads to the offer behind
// it. (It used to be an endless slider of dithered photos with a hidden title.) The H1 text is unchanged.
const ROUTES = ["/ai", "/cloud", "/devops", "/expertise", "/expertise"];

export default function Blueprints() {
  const { t, href } = useLang();
  const heading = t.workLabels.heading;
  const cut = heading.indexOf(":");
  const title = cut > 0 ? heading.slice(0, cut + 1).trim() : heading;
  const subtitle = cut > 0 ? heading.slice(cut + 1).trim() : null;

  return (
    <>
      <PageHeader tone="paper" kicker={t.workLabels.header} title={title} subtitle={subtitle} description={t.meta.descriptions?.work} compact />
      <section className={styles.blueprints} data-umami-section="blueprints">
        <ol className={`container ${styles.grid}`}>
          {t.work.map((item, i) => (
            <li key={item.title}>
              <Link href={href(ROUTES[i] || "/expertise")} className={styles.card}>
                <span className={`mono sm ${styles.no}`}>
                  {String(i + 1).padStart(2, "0")} · {item.category}
                </span>
                <span className={styles.title}>{item.title}</span>
                <span className={`mono sm ${styles.more}`}>
                  {t.menu.viewPage} <FiArrowRight aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
      <ContactBanner />
    </>
  );
}
