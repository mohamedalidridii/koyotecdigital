"use client";

import styles from "./ParallaxImage.module.css";

import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";

const DESKTOP_QUERY = "(min-width: 1001px)";
const DEFAULT_SCALE = 1.5;

export default function ParallaxImage({
  src,
  alt = "",
  speed = 0.25,
  scale = DEFAULT_SCALE,
  className = "",
  activeRef,
}) {
  const wrapperRef = useRef(null);
  const imageRef = useRef(null);
  const boundsRef = useRef(null);
  const desktopRef = useRef(false);
  const scrollRef = useRef(0);
  const speedRef = useRef(speed);
  const scaleRef = useRef(scale);
  const activeFlagRef = activeRef ?? { current: true };

  speedRef.current = speed;
  scaleRef.current = scale;

  const applyParallaxRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const image = imageRef.current;
    if (!wrapper || !image) return;

    const mq = window.matchMedia(DESKTOP_QUERY);

    const resetTransform = () => {
      image.style.transform = desktopRef.current
        ? `translate3d(0, 0, 0) scale(${scaleRef.current})`
        : "";
    };

    const applyParallax = (scroll) => {
      if (!desktopRef.current || !activeFlagRef.current || !boundsRef.current) {
        resetTransform();
        return;
      }

      const { top, height } = boundsRef.current;
      const y =
        (scroll + window.innerHeight / 2 - (top + height / 2)) *
        speedRef.current;

      image.style.transform = `translate3d(0, ${y}px, 0) scale(${scaleRef.current})`;
    };

    applyParallaxRef.current = applyParallax;

    const updateBounds = () => {
      const rect = wrapper.getBoundingClientRect();
      boundsRef.current = {
        top: rect.top + window.scrollY,
        height: rect.height,
      };
      applyParallax(scrollRef.current);
    };

    const syncDesktop = () => {
      desktopRef.current = mq.matches;
      updateBounds();
    };

    syncDesktop();
    mq.addEventListener("change", syncDesktop);

    const resizeObserver = new ResizeObserver(updateBounds);
    resizeObserver.observe(wrapper);
    window.addEventListener("resize", updateBounds);

    return () => {
      applyParallaxRef.current = null;
      mq.removeEventListener("change", syncDesktop);
      window.removeEventListener("resize", updateBounds);
      resizeObserver.disconnect();
    };
  }, [activeFlagRef]);

  useLenis((lenis) => {
    scrollRef.current = lenis.scroll;
    applyParallaxRef.current?.(lenis.scroll);
  });

  return (
    <div
      ref={wrapperRef}
      className={`${styles.wrapper}${className ? ` ${className}` : ""}`}
    >
      <img ref={imageRef} src={src} alt={alt} className={styles.image} />
    </div>
  );
}
