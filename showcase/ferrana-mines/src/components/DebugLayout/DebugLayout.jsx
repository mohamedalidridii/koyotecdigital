"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function DebugLayout() {
  const searchParams = useSearchParams();
  const enabled = searchParams.get("debugLayout") === "true";

  // toggle debug grid overlay from query param
  useEffect(() => {
    document.documentElement.classList.toggle("debug-layout", enabled);
    return () => document.documentElement.classList.remove("debug-layout");
  }, [enabled]);

  return null;
}
