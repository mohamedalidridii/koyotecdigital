"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";

import { triggerPageTransition } from "@/lib/pageTransition";

const TransitionLink = forwardRef(function TransitionLink(
  { href, children, onClick, replace = false, ...props },
  ref,
) {
  const router = useTransitionRouter();
  const pathname = usePathname();

  function handleClick(event) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (event.button !== 0) return;

    const url = typeof href === "string" ? href : href?.pathname;
    if (!url || url.startsWith("mailto:") || url.startsWith("http")) return;

    event.preventDefault();

    if (url === pathname) return;

    const navigate = replace ? router.replace : router.push;
    navigate(url, {
      onTransitionReady: triggerPageTransition,
    });
  }

  return (
    <Link ref={ref} href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
});

export default TransitionLink;
