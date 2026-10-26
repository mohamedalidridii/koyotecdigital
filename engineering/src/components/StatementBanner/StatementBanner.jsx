"use client";

import styles from "./StatementBanner.module.css";

import { Fragment } from "react";

import DitherImage from "@/components/DitherImage/DitherImage";
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
      <h6
        className={`${className}${lines.length > 1 ? ` ${styles.multiline}` : ""}`}
      >
        {lines.map((line, i) => (
          <Fragment key={i}>
            {i > 0 ? <br /> : null}
            {line}
          </Fragment>
        ))}
      </h6>
    </Copy>
  );
}

export default function StatementBanner({
  showContent = true,
  src = "/images/home/statement.jpg",
  copyTopLeft,
  copyBottomRight,
}) {
  const { t } = useLang();
  copyTopLeft ??= t.statement.topLeft;
  copyBottomRight ??= t.statement.bottomRight;
  return (
    <section className={styles.statementBanner}>
      <div className={styles.bg}>
        <DitherImage src={src} alt="" />
      </div>
      {showContent ? (
        <div className={`container ${styles.content}`}>
          <BannerCopy copy={copyTopLeft} className={styles.title} />
          <BannerCopy
            copy={copyBottomRight}
            className={styles.copy}
          />
        </div>
      ) : null}
    </section>
  );
}
