"use client";

import { usePathname } from "next/navigation";
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(CustomEase);

if (!CustomEase.get("pageHop")) {
  CustomEase.create("pageHop", "0.9, 0, 0.1, 1");
}

let hasSkippedInitialReveal = false;

export function useRevealer() {
  const pathname = usePathname();

  useGSAP(
    () => {
      gsap.killTweensOf(".revealer");

      if (!hasSkippedInitialReveal) {
        hasSkippedInitialReveal = true;
        gsap.set(".revealer", { scaleY: 0 });
        return;
      }

      gsap.set(".revealer", { scaleY: 1 });
      gsap.to(".revealer", {
        scaleY: 0,
        duration: 1.25,
        delay: 1,
        ease: "pageHop",
      });
    },
    { dependencies: [pathname] },
  );
}
