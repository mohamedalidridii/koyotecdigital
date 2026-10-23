"use client";
import Link from "next/link";

import { Emblem } from "@/components/BrandIcon/BrandIcon";
import { useDict, useHref } from "@/i18n/DictProvider";

export default function NotFound() {
  const dict = useDict();
  const href = useHref();

  return (
    <section
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2rem",
        textAlign: "center",
        padding: "0 var(--gutter)",
      }}
    >
      <span style={{ width: "4rem", height: "4.8rem", color: "var(--gold)" }}>
        <Emblem />
      </span>
      <h2>
        404 — <em>{dict.notFound.title}</em>
      </h2>
      <Link href={href("/")} className="pill">
        {dict.notFound.cta}
      </Link>
    </section>
  );
}
