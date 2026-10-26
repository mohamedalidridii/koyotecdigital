"use client";

import styles from "./PageHeader.module.css";

import { isValidElement, useRef } from "react";
import dynamic from "next/dynamic";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import Copy from "@/components/Copy";

import { useLang } from "@/lib/useLang";

gsap.registerPlugin(useGSAP);

const ICON_PROPS = { size: 80, texture: "dither", animate: true };
const HEADING_DELAY = 1;
const COPY_DURATION = 0.75;
const META_DELAY = 0.5 + COPY_DURATION;

const iconCache = new Map();

function ditherIcon(name) {
  let Icon = iconCache.get(name);
  if (!Icon) {
    Icon = dynamic(
      () =>
        import("@unlocalhosted/dither-icons").then(
          (mod) => mod[name] ?? mod.WorkspaceIcon,
        ),
      {
        ssr: false,
        loading: () => <span className={styles.iconSlot} aria-hidden="true" />,
      },
    );
    iconCache.set(name, Icon);
  }
  return Icon;
}

function HeaderIcon({ icon }) {
  if (isValidElement(icon)) return icon;
  if (typeof icon === "string" || icon == null) {
    const Icon = ditherIcon(icon || "WorkspaceIcon");
    return <Icon {...ICON_PROPS} />;
  }
  const Icon = icon;
  return <Icon {...ICON_PROPS} />;
}

export default function PageHeader({
  title,
  subtitle,
  description,
  icon = "WorkspaceIcon",
}) {
  const sectionRef = useRef(null);
  const iconRef = useRef(null);
  const lenis = useLenis();
  const { t } = useLang();

  const scrollNext = () => {
    const next = sectionRef.current?.nextElementSibling;
    if (!next) return;
    if (lenis) lenis.scrollTo(next);
    else next.scrollIntoView({ behavior: "smooth" });
  };

  useGSAP(
    () => {
      const iconEl = iconRef.current;
      if (!iconEl) return;

      gsap.set(iconEl, { scale: 0, transformOrigin: "center", force3D: false });
      gsap.to(iconEl, {
        scale: 1,
        duration: 0.5,
        delay: META_DELAY,
        ease: "power3.out",
        force3D: false,
      });
    },
    { scope: sectionRef, dependencies: [] },
  );

  return (
    <section ref={sectionRef} className={styles.pageHeader}>
      <div className={`container ${styles.container}`}>
        <div className={styles.inner}>
          <Copy animateOnScroll={false} delay={HEADING_DELAY}>
            <h1 className={styles.heading}>
              <span>{title}</span>
              {subtitle ? (
                <span className={styles.subtitle}>{subtitle}</span>
              ) : null}
            </h1>
          </Copy>

          <div className={styles.meta}>
            <button
              type="button"
              className={`di-trigger ${styles.scrollBtn}`}
              onClick={scrollNext}
              aria-label={t.scrollToContent}
            >
              <span ref={iconRef} className={styles.iconWrap}>
                <HeaderIcon icon={icon} />
              </span>
            </button>
            {description ? (
              <Copy animateOnScroll={false} delay={META_DELAY}>
                <h6 className={styles.copy}>{description}</h6>
              </Copy>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
