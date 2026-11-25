"use client";

import styles from "./StatementBanner.module.css";

import { Fragment } from "react";

import Copy from "@/components/Copy";

import { useLang } from "@/lib/useLang";

function copyLines(copy) {
  if (copy == null || copy === "") return [];
  if (Array.isArray(copy)) return copy;
  return String(copy).split("\n");
}

function BannerCopy({ copy, className }) {
  const lines = copyLines(copy);
  if (!lines.length) return null;
  return (
    <Copy>
      <p className={className}>
        {lines.map((line, i) => (
          <Fragment key={i}>
            {i > 0 ? <br /> : null}
            {line}
          </Fragment>
        ))}
      </p>
    </Copy>
  );
}

// A statement in large type on a plain band. The full-screen photo it used to sit on is gone: it
// explained nothing. A banner without words (showContent={false}) now renders nothing at all.
export default function StatementBanner({ showContent = true, copyTopLeft, copyBottomRight }) {
  const { t } = useLang();
  if (!showContent) return null;
  copyTopLeft ??= t.statement.topLeft;
  copyBottomRight ??= t.statement.bottomRight;
  return (
    <section className={styles.statementBanner}>
      <div className={`container ${styles.content}`}>
        <BannerCopy copy={copyTopLeft} className={styles.title} />
        <BannerCopy copy={copyBottomRight} className={styles.copy} />
      </div>
    </section>
  );
}
