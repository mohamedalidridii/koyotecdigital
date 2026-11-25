"use client";

import styles from "./PageHeader.module.css";

import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

import Button from "@/components/Button";
import SourceKicker from "@/components/SourceKicker";

// The first screen of every Engineering page, built on the LIFT model:
// kicker (relevance) · H1 (the value) · one-line lede (benefit vs cost) · one primary action + one text
// link (clarity) · reassurance (anxiety) · proof row. An explanatory visual sits in its own column,
// never behind the text. The H1 text is unchanged from the previous design (title + " " + subtitle).
export default function PageHeader({
  title,
  subtitle,
  description,
  kicker = null,
  cta = null, // { href, label, event, place }
  secondary = null, // { href, label, event, place }: a quieter text link
  reassure = null, // e.g. "Fixed price · reply within 24 business hours"
  proof = null, // short facts shown as a row under the hero
  aside = null, // an explanatory visual or a spec list, in its own column
  tone = "red", // "red" | "paper" | "dark"
  compact = false,
}) {
  const onRed = tone === "red";
  return (
    <section
      className={`${styles.pageHeader} ${styles[tone] || ""}${compact ? ` ${styles.compact}` : ""}${aside ? ` ${styles.withAside}` : ""}`}
      data-umami-section="pageHeader"
    >
      <div className={`container ${styles.grid}`}>
        <div className={styles.main}>
          {kicker ? (
            <p className={`mono sm ${styles.kicker}`}>
              <i aria-hidden="true" />
              {kicker}
            </p>
          ) : null}
          <SourceKicker className={`mono sm ${styles.source}`} />
          <h1 className={styles.heading} data-focus="">
            <span>{title}</span>
            {/* the space keeps the two parts apart in the text (crawlers, copy-paste); the layout ignores it */}
            {subtitle ? (
              <>
                {" "}
                <span className={styles.subtitle}>{subtitle}</span>
              </>
            ) : null}
          </h1>
          {description ? <p className={styles.lede}>{description}</p> : null}
          {cta || secondary ? (
            <div className={styles.actions}>
              {cta ? (
                <Button variant={onRed ? "light" : "primary"} href={cta.href} event={cta.event} eventPlace={cta.place} focus className={styles.cta}>
                  {cta.label}
                </Button>
              ) : null}
              {secondary && secondary.external ? (
                <a
                  href={secondary.href}
                  className={styles.secondary}
                  target="_blank"
                  rel="noreferrer"
                  data-track={secondary.event}
                  data-track-place={secondary.event ? secondary.place : undefined}
                >
                  {secondary.label} <FiArrowRight aria-hidden="true" />
                </a>
              ) : secondary ? (
                <Link
                  href={secondary.href}
                  className={styles.secondary}
                  data-track={secondary.event}
                  data-track-place={secondary.event ? secondary.place : undefined}
                >
                  {secondary.label} <FiArrowRight aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          ) : null}
          {reassure ? <p className={`mono sm ${styles.reassure}`}>{reassure}</p> : null}
        </div>
        {aside ? <div className={styles.aside}>{aside}</div> : null}
        {proof?.length ? (
          <ul className={`mono sm ${styles.proof}`}>
            {proof.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
