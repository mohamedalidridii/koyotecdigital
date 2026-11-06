"use client";

import { useRef } from "react";

import SystemsIntro from "./SystemsIntro";
import SystemsRail from "./SystemsRail";
import Chapter from "./Chapter";

import { useLang } from "@/lib/useLang";

// "What we build": the index, then one chapter per field, with a progress rail across them
export default function Systems() {
  const { t } = useLang();
  const chapters = t.systems.chapters;
  // shared, mutable, read every frame by the rail: never React state
  const store = useRef({ active: -1, progress: chapters.map(() => 0) });

  return (
    <>
      <SystemsIntro />
      {chapters.map((c, i) => (
        <Chapter key={c.id} chapter={c} index={i} total={chapters.length} store={store} />
      ))}
      <SystemsRail store={store} />
    </>
  );
}
