"use client";

import { useRevealer } from "@/hooks/useRevealer";

export default function Template({ children }) {
  // run page transition revealer on route change
  useRevealer();

  return (
    <>
      <div className="revealer" aria-hidden="true" />
      {children}
    </>
  );
}
