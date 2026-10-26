"use client";

import styles from "./PartnerList.module.css";

import { useCallback, useEffect, useRef, useState } from "react";

import { TOOLS } from "@/content/shared";

const MOBILE_QUERY = "(max-width: 1000px)";

const ROWS = TOOLS;

const NAMES = ROWS.flat();

export default function PartnerList() {
  const containerRef = useRef(null);
  const highlightRef = useRef(null);
  const itemRefs = useRef([]);
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const placeHighlight = useCallback((index) => {
    const highlight = highlightRef.current;
    const container = containerRef.current;
    const item = itemRefs.current[index];
    if (!highlight || !container || !item) return;

    const row = item.parentElement;
    const grid = row?.parentElement;
    if (!row || !grid) return;

    const itemRect = item.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    const gridRect = grid.getBoundingClientRect();
    const crate = container.getBoundingClientRect();

    const left =
      item === row.firstElementChild ? gridRect.left + 1 : itemRect.left;
    const top =
      row === grid.firstElementChild ? gridRect.top + 1 : itemRect.top;
    const right =
      item === row.lastElementChild ? gridRect.right - 1 : itemRect.right - 1;
    const bottom =
      row === grid.lastElementChild ? gridRect.bottom - 1 : rowRect.bottom - 1;

    highlight.style.transform = `translate(${left - crate.left}px, ${
      top - crate.top
    }px)`;
    highlight.style.width = `${right - left}px`;
    highlight.style.height = `${bottom - top}px`;
  }, []);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    placeHighlight(active);

    const onResize = () => placeHighlight(active);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active, isMobile, placeHighlight]);

  return (
    <div className={styles.partnerList}>
      <div className={`container ${styles.inner}`} ref={containerRef}>
        <div className={styles.grid}>
          {ROWS.map((row, rowIndex) => (
            <div key={row.join("-")} className={styles.row}>
              {row.map((name) => {
                const index = NAMES.indexOf(name);
                return (
                  <div
                    key={name}
                    ref={(node) => {
                      itemRefs.current[index] = node;
                    }}
                    className={`${styles.item} ${
                      !isMobile && active === index ? styles.itemActive : ""
                    }`}
                    onMouseEnter={() => {
                      if (!isMobile) setActive(index);
                    }}
                  >
                    <p>{name}</p>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div
          ref={highlightRef}
          className={styles.highlight}
          hidden={isMobile}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
