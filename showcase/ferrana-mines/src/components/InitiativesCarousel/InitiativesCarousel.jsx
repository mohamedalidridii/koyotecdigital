"use client";

import "./InitiativesCarousel.css";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { MdArrowOutward } from "react-icons/md";

import copyStyles from "@/components/Copy/Copy.module.css";
import { easeOut } from "@/components/Menu/eases";
import TransitionLink from "@/components/TransitionLink";

import {
  COPY_REVEAL_DURATION,
  COPY_REVEAL_STAGGER,
  setupCopyReveal,
  waitForCopyFonts,
} from "@/lib/copyReveal";

import { initiatives } from "./data";

gsap.registerPlugin(CustomEase);

if (!CustomEase.get("carouselHop")) {
  CustomEase.create(
    "carouselHop",
    "M0,0 C0.083,0.294 0.117,0.767 0.413,0.908 0.606,1 0.752,1 1,1",
  );
}

const DURATION = 1.5;
const PROGRESS_DURATION = 4;
const PROGRESS_COMPLETE_MAX = 1;
const PROGRESS_EXIT_DURATION = 0.5;
const PROGRESS_EXIT_LEAD = 0.4;
const TRAIL_COUNT = 3;
const YEAR_COUNT = initiatives.length;
const TOTAL_SLOTS = YEAR_COUNT + TRAIL_COUNT;
const GROW_PATTERN = [5, 4, 3, 1.5, 1];
const SLIDE_TOTAL = initiatives.length;
const MOBILE_BREAKPOINT = 1000;
const REVEAL_DELAY = 1.5;
const YEAR_REVEAL_START = "135%";
const PREVIEW_PARALLAX_IN = 60;
const PREVIEW_PARALLAX_OUT = -120;

const INITIAL_GROWS = [
  ...GROW_PATTERN.map(String),
  ...Array(TOTAL_SLOTS - GROW_PATTERN.length).fill("0"),
];

function getSlideParallax() {
  const width = window.innerWidth;

  if (width <= MOBILE_BREAKPOINT) {
    return {
      in: Math.round(width * 0.2),
      out: -Math.round(width * 0.4),
    };
  }

  return { in: 250, out: -500 };
}

function getPreviewParallax() {
  const width = window.innerWidth;

  if (width <= MOBILE_BREAKPOINT) {
    return {
      in: Math.round(width * 0.1),
      out: -Math.round(width * 0.18),
    };
  }

  return { in: PREVIEW_PARALLAX_IN, out: PREVIEW_PARALLAX_OUT };
}

function growValue(value) {
  return Number.parseFloat(value) || 0;
}

function getNextGrows(current) {
  return current.map((_, i) => (i === 0 ? "0" : current[i - 1]));
}

function isMobileViewport() {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

function formatSlideIndex(index) {
  return String(index + 1).padStart(2, "0");
}

function createDummy() {
  const dummy = document.createElement("h3");
  dummy.className = "timeline-dummy";
  dummy.setAttribute("aria-hidden", "true");
  // Same footprint as a real year so flex recycle stays seamless
  dummy.appendChild(document.createTextNode("0000"));
  const sup = document.createElement("sup");
  sup.className = "mono-sm";
  sup.textContent = "ore";
  dummy.appendChild(sup);
  return dummy;
}

function createPreviewSlide(imageSrc) {
  const slide = document.createElement("div");
  slide.className = "preview-slide";

  const img = document.createElement("img");
  img.src = imageSrc;
  img.alt = "";
  slide.appendChild(img);

  return slide;
}

export default function InitiativesCarousel() {
  const rootRef = useRef(null);
  const previewRef = useRef(null);
  const indexLabelARef = useRef(null);
  const indexLabelBRef = useRef(null);
  const titleLabelARef = useRef(null);
  const titleLabelBRef = useRef(null);
  const yearLabelARef = useRef(null);
  const yearLabelBRef = useRef(null);
  const activeTitleLabelRef = useRef("a");
  const activeYearLabelRef = useRef("a");
  const progressFillARef = useRef(null);
  const progressFillBRef = useRef(null);
  const activeIndexLabelRef = useRef("a");
  const activeProgressRef = useRef("a");
  const currentIndexRef = useRef(0);
  const progressTweenRef = useRef(null);
  const pauseCarouselRef = useRef(() => {});

  const handleTitleLinkClick = (event) => {
    event.stopPropagation();
    pauseCarouselRef.current();
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const labelA = indexLabelARef.current;
    const labelB = indexLabelBRef.current;
    const titleA = titleLabelARef.current;
    const titleB = titleLabelBRef.current;
    const yearA = yearLabelARef.current;
    const yearB = yearLabelBRef.current;
    const titleClipA = titleA?.parentElement;
    const titleClipB = titleB?.parentElement;
    const fillA = progressFillARef.current;
    const fillB = progressFillBRef.current;

    function syncTitleClipPointerEvents() {
      const showA = activeTitleLabelRef.current === "a";
      titleClipA?.classList.toggle("title-clip-active", showA);
      titleClipB?.classList.toggle("title-clip-active", !showA);
    }

    gsap.set(labelA, { yPercent: 0 });
    gsap.set(labelB, { yPercent: 110 });
    gsap.set(titleA, { yPercent: 0 });
    gsap.set(titleB, { yPercent: 110 });
    gsap.set(yearA, { yPercent: 0 });
    gsap.set(yearB, { yPercent: 110 });
    syncTitleClipPointerEvents();
    gsap.set(fillA, { scaleX: 0, transformOrigin: "left center" });
    gsap.set(fillB, { scaleX: 0, transformOrigin: "left center" });

    function startProgressFill(fillEl) {
      progressTweenRef.current?.kill();

      gsap.set(fillEl, { scaleX: 0, transformOrigin: "left center" });

      progressTweenRef.current = gsap.to(fillEl, {
        scaleX: 1,
        duration: PROGRESS_DURATION,
        ease: "none",
        onComplete: () => {
          if (!animating) handleSlider();
        },
      });
    }

    function getCompleteDuration(currentScale) {
      const remaining = 1 - currentScale;
      return Math.min(
        PROGRESS_COMPLETE_MAX,
        Math.max(0.5, PROGRESS_DURATION * remaining * 0.25),
      );
    }

    function cycleProgressBar() {
      if (!fillA || !fillB) return;

      progressTweenRef.current?.kill();

      const outgoing = activeProgressRef.current === "a" ? fillA : fillB;
      const incoming = activeProgressRef.current === "a" ? fillB : fillA;
      const currentScale = Number(gsap.getProperty(outgoing, "scaleX")) || 0;
      const isFull = currentScale >= 0.999;

      gsap.killTweensOf([fillA, fillB]);
      gsap.set(incoming, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(outgoing, {
        scaleX: isFull ? 1 : currentScale,
        transformOrigin: "left center",
      });

      const timeline = gsap.timeline({
        onComplete: () => {
          activeProgressRef.current =
            activeProgressRef.current === "a" ? "b" : "a";
          startProgressFill(incoming);
        },
      });

      progressTweenRef.current = timeline;

      if (!isFull) {
        const completeDuration = getCompleteDuration(currentScale);
        const exitStart = Math.max(0, completeDuration - PROGRESS_EXIT_LEAD);

        timeline.to(outgoing, {
          scaleX: 1,
          duration: completeDuration,
          ease: easeOut,
        });

        timeline
          .set(
            outgoing,
            { scaleX: 1, transformOrigin: "right center" },
            exitStart,
          )
          .to(
            outgoing,
            {
              scaleX: 0,
              duration: PROGRESS_EXIT_DURATION,
              ease: easeOut,
            },
            exitStart,
          );
      } else {
        timeline
          .set(outgoing, { scaleX: 1, transformOrigin: "right center" })
          .to(outgoing, {
            scaleX: 0,
            duration: PROGRESS_EXIT_DURATION,
            ease: easeOut,
          });
      }
    }

    function updateTitleLabel(labelEl, index) {
      const link = labelEl?.querySelector("a");
      const text = link?.querySelector(".title-link-text");
      if (!link || !text) return;

      const { name, href } = initiatives[index];
      text.textContent = name;
      link.setAttribute("href", href);
    }

    function animateMaskedLabel({
      labelAEl,
      labelBEl,
      activeRef,
      onIncoming,
      killTargets,
    }) {
      const outgoing = activeRef.current === "a" ? labelAEl : labelBEl;
      const incoming = activeRef.current === "a" ? labelBEl : labelAEl;

      onIncoming(incoming);

      gsap.killTweensOf(killTargets);
      gsap.set(outgoing, { yPercent: 0 });
      gsap.set(incoming, { yPercent: 110 });

      gsap.to(outgoing, {
        yPercent: -110,
        duration: 1.25,
        delay: 0.1,
        ease: easeOut,
      });

      gsap.to(incoming, {
        yPercent: 0,
        duration: 1.25,
        delay: 0.2,
        ease: easeOut,
      });

      activeRef.current = activeRef.current === "a" ? "b" : "a";
    }

    function animateSlideIndex(nextIndex) {
      if (!labelA || !labelB) return;

      animateMaskedLabel({
        labelAEl: labelA,
        labelBEl: labelB,
        activeRef: activeIndexLabelRef,
        killTargets: [labelA, labelB],
        onIncoming: (incoming) => {
          incoming.textContent = formatSlideIndex(nextIndex);
        },
      });

      currentIndexRef.current = nextIndex;
    }

    function updateYearLabel(labelEl, index) {
      const h3 = labelEl?.querySelector("h3");
      if (!h3) return;

      const yearNode = h3.querySelector(".year-value");
      if (yearNode) {
        yearNode.textContent = initiatives[index].year;
      }
    }

    function animateSlideTitle(nextIndex) {
      if (!titleA || !titleB) return;

      animateMaskedLabel({
        labelAEl: titleA,
        labelBEl: titleB,
        activeRef: activeTitleLabelRef,
        killTargets: [titleA, titleB],
        onIncoming: (incoming) => {
          updateTitleLabel(incoming, nextIndex);
        },
      });

      syncTitleClipPointerEvents();
    }

    function animateSlideYear(nextIndex) {
      if (!yearA || !yearB) return;

      animateMaskedLabel({
        labelAEl: yearA,
        labelBEl: yearB,
        activeRef: activeYearLabelRef,
        killTargets: [yearA, yearB],
        onIncoming: (incoming) => {
          updateYearLabel(incoming, nextIndex);
        },
      });
    }

    const hiddenClip = "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)";
    const visibleClip = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
    const revealClip = "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)";
    let revealCleanups = [];

    function setupPreview(previewEl) {
      if (!previewEl) return;

      previewEl.replaceChildren(
        createPreviewSlide(initiatives[1 % SLIDE_TOTAL].image),
        createPreviewSlide(initiatives[2 % SLIDE_TOTAL].image),
      );

      const [, secondSlide] = previewEl.querySelectorAll(".preview-slide");
      if (secondSlide) {
        gsap.set(secondSlide, { clipPath: hiddenClip });
      }
    }

    function animatePreview(nextIndex) {
      const previewEl = previewRef.current;
      if (!previewEl) return;

      const previewSlides = previewEl.querySelectorAll(".preview-slide");
      if (previewSlides.length !== 2) {
        setupPreview(previewEl);
        return;
      }

      const firstSlide = previewSlides[0];
      const secondSlide = previewSlides[1];
      const firstSlideImg = firstSlide.querySelector("img");
      const secondSlideImg = secondSlide.querySelector("img");

      secondSlideImg.src = initiatives[(nextIndex + 1) % SLIDE_TOTAL].image;

      const { in: previewIn, out: previewOut } = getPreviewParallax();

      gsap.set(secondSlide, { clipPath: hiddenClip });
      gsap.set(secondSlideImg, { x: previewIn });

      gsap.to(secondSlideImg, {
        x: 0,
        duration: DURATION,
        ease: "carouselHop",
      });

      gsap.to(firstSlideImg, {
        x: previewOut,
        duration: DURATION,
        ease: "carouselHop",
      });

      gsap.to(secondSlide, {
        clipPath: visibleClip,
        duration: DURATION,
        ease: "carouselHop",
        onComplete() {
          firstSlide.remove();
          previewEl.appendChild(firstSlide);

          gsap.set(firstSlide, { clipPath: hiddenClip });
          gsap.set(firstSlideImg, { x: 0 });
        },
      });
    }

    const slider = root.querySelector(".slider");
    const timeline = root.querySelector(".timeline");
    if (!slider || !timeline) return;

    slider.replaceChildren();
    timeline.replaceChildren();
    setupPreview(previewRef.current);

    initiatives.forEach((item) => {
      const slide = document.createElement("div");
      slide.className = "slide";

      const img = document.createElement("img");
      img.src = item.image;
      img.alt = "";
      slide.appendChild(img);
      slider.appendChild(slide);

      const year = document.createElement("h3");
      year.className = "timeline-year";
      const yearCopy = document.createElement("span");
      yearCopy.className = "year-copy";
      const yearValue = document.createElement("span");
      yearValue.className = "year-value";
      yearValue.textContent = item.year;
      const sup = document.createElement("sup");
      sup.className = "mono-sm";
      sup.textContent = "ore";
      yearCopy.appendChild(yearValue);
      yearCopy.appendChild(sup);
      year.appendChild(yearCopy);
      timeline.appendChild(year);
    });

    // 2024 takes the off-screen hang slot so the strip starts on 2017
    const years = timeline.querySelectorAll(".timeline-year");
    timeline.insertBefore(years[years.length - 1], years[0]);

    for (let i = 0; i < TRAIL_COUNT; i++) {
      timeline.appendChild(createDummy());
    }

    let slides = slider.querySelectorAll(".slide");
    let animating = false;
    let currentGrows = [...INITIAL_GROWS];

    slides.forEach((slide, index) => {
      if (index > 0) gsap.set(slide, { clipPath: hiddenClip });
    });

    function allCounters() {
      return timeline.querySelectorAll("h3");
    }

    function yearCounters() {
      return timeline.querySelectorAll(".timeline-year");
    }

    function paintGrows(grows) {
      allCounters().forEach((p, i) => {
        const grow = grows[i];
        p.style.flexGrow = grow;
        p.style.width = growValue(grow) > 0 ? "max-content" : "0px";
      });
    }

    paintGrows(currentGrows);

    function setYearCopiesHidden() {
      if (isMobileViewport()) {
        const mobileYear = yearA?.querySelector(".year-copy");
        if (mobileYear) gsap.set(mobileYear, { y: YEAR_REVEAL_START });
        return;
      }

      allCounters().forEach((el, i) => {
        if (growValue(currentGrows[i]) > 0) {
          const yearCopy = el.querySelector(".year-copy");
          if (yearCopy) gsap.set(yearCopy, { y: YEAR_REVEAL_START });
        }
      });
    }

    setYearCopiesHidden();

    function animateTimeline(nextGrows) {
      const counters = allCounters();

      counters.forEach((p) => {
        p.classList.remove("last");
        p.classList.remove("first");
      });

      let firstAssigned = false;

      counters.forEach((p, i) => {
        const toGrow = nextGrows[i];
        const toNumeric = growValue(toGrow);

        gsap.to(p, {
          flexGrow: toGrow,
          duration: DURATION,
          ease: "carouselHop",
          onStart: () => {
            gsap.set(p, {
              width: toNumeric > 0 ? "max-content" : "0px",
            });

            if (toNumeric === 5) {
              p.classList.add("first");
              firstAssigned = true;
            } else if (toNumeric === 1 && !firstAssigned) {
              p.classList.add("last");
            }
          },
        });
      });
    }

    function recycleYear() {
      const firstYear = yearCounters()[0];
      const firstDummy = timeline.querySelector(".timeline-dummy");

      // After shift, grows are [0,5,4,3,1.5,1,…]. Moving the zeroed year
      // to the end leaves [5,4,3,1.5,1,…] — identical to INITIAL.
      // Don't repaint grows here; that remeasure is what caused the end-of-cycle jump.
      if (firstDummy) {
        timeline.insertBefore(firstYear, firstDummy);
      } else {
        timeline.appendChild(firstYear);
      }

      currentGrows = [...INITIAL_GROWS];
    }

    const handleSlider = (event) => {
      if (
        event?.target instanceof Element &&
        event.target.closest(".slider-title a")
      ) {
        return;
      }

      if (animating) return;
      animating = true;

      cycleProgressBar();

      const nextIndex = (currentIndexRef.current + 1) % SLIDE_TOTAL;
      animateSlideIndex(nextIndex);
      animateSlideTitle(nextIndex);
      animatePreview(nextIndex);

      if (isMobileViewport()) {
        animateSlideYear(nextIndex);
      }

      slides = slider.querySelectorAll(".slide");

      const firstSlide = slides[0];
      const firstSlideImg = firstSlide.querySelector("img");
      const secondSlide = slides[1];
      const secondSlideImg = secondSlide.querySelector("img");
      const { in: slideIn, out: slideOut } = getSlideParallax();

      gsap.set(secondSlideImg, { x: slideIn });

      gsap.to(secondSlideImg, {
        x: 0,
        duration: DURATION,
        ease: "carouselHop",
      });

      gsap.to(firstSlideImg, {
        x: slideOut,
        duration: DURATION,
        ease: "carouselHop",
      });

      gsap.to(secondSlide, {
        clipPath: visibleClip,
        duration: DURATION,
        ease: "carouselHop",
        onComplete: function () {
          firstSlide.remove();
          slider.appendChild(firstSlide);

          gsap.set(firstSlide, { clipPath: hiddenClip });
          gsap.set(firstSlideImg, { x: 0 });

          if (!isMobileViewport()) {
            recycleYear();
          }

          animating = false;
        },
      });

      if (!isMobileViewport()) {
        const nextGrows = getNextGrows(currentGrows);
        animateTimeline(nextGrows);
        currentGrows = nextGrows;
      }
    };

    function pauseCarousel() {
      progressTweenRef.current?.kill();
      animating = false;
      gsap.killTweensOf(slider.querySelectorAll(".slide, .slide img"));
      gsap.killTweensOf(
        previewRef.current?.querySelectorAll(
          ".preview-slide, .preview-slide img",
        ),
      );
      gsap.killTweensOf(timeline.querySelectorAll("h3, .year-copy"));
      gsap.killTweensOf([
        labelA,
        labelB,
        titleA,
        titleB,
        yearA,
        yearB,
        fillA,
        fillB,
      ]);
    }

    pauseCarouselRef.current = pauseCarousel;

    async function playEntranceReveal() {
      await waitForCopyFonts();

      const progressTrack = root.querySelector(".progress-track");
      const previewContainer = root.querySelector(".slider-preview-container");
      const indexTotal = root.querySelector(".index-total");
      const textTargets = [];
      const yearTargets = [];

      if (isMobileViewport()) {
        const mobileYear = yearA?.querySelector(".year-copy");
        if (mobileYear) yearTargets.push(mobileYear);
      } else {
        allCounters().forEach((el, i) => {
          if (growValue(currentGrows[i]) > 0) {
            const yearCopy = el.querySelector(".year-copy");
            if (yearCopy) yearTargets.push(yearCopy);
          }
        });
      }

      if (labelA) textTargets.push(labelA);
      if (indexTotal) textTargets.push(indexTotal);

      if (progressTrack) {
        gsap.set(progressTrack, { scaleX: 0, transformOrigin: "left center" });
      }

      if (previewContainer) {
        gsap.set(previewContainer, { clipPath: revealClip });
      }

      let staggerIndex = 0;

      yearTargets.forEach((el) => {
        gsap.set(el, { y: YEAR_REVEAL_START });
        gsap.to(el, {
          y: "0%",
          duration: COPY_REVEAL_DURATION,
          ease: "power4.out",
          delay: REVEAL_DELAY + staggerIndex * COPY_REVEAL_STAGGER,
        });
        staggerIndex += 1;
      });

      textTargets.forEach((el) => {
        const { cleanup } = setupCopyReveal({
          elements: [el],
          type: "lines",
          delay: REVEAL_DELAY + staggerIndex * COPY_REVEAL_STAGGER,
          animateOnScroll: false,
          lineClass: copyStyles.line,
          wordClass: copyStyles.word,
        });
        revealCleanups.push(cleanup);
        staggerIndex += 1;
      });

      const titleLink = titleA?.querySelector(".title-link");
      const titleLinkText = titleLink?.querySelector(".title-link-text");
      const titleLinkIcon = titleLink?.querySelector(".title-link-icon");

      if (titleLinkText) {
        const titleDelay = REVEAL_DELAY + staggerIndex * COPY_REVEAL_STAGGER;
        const { cleanup } = setupCopyReveal({
          elements: [titleLinkText],
          type: "lines",
          delay: titleDelay,
          animateOnScroll: false,
          lineClass: copyStyles.line,
          wordClass: copyStyles.word,
        });
        revealCleanups.push(cleanup);

        if (titleLinkIcon) {
          gsap.set(titleLinkIcon, { y: "110%" });
          gsap.to(titleLinkIcon, {
            y: "0%",
            duration: COPY_REVEAL_DURATION,
            ease: "power4.out",
            delay: titleDelay,
          });
        }

        staggerIndex += 1;
      }

      if (progressTrack) {
        gsap.to(progressTrack, {
          scaleX: 1,
          duration: 0.8,
          ease: "power4.out",
          delay: REVEAL_DELAY + 0.15,
          transformOrigin: "left center",
        });
      }

      if (previewContainer) {
        gsap.to(previewContainer, {
          clipPath: visibleClip,
          duration: 1,
          ease: "power4.out",
          delay: REVEAL_DELAY + 0.3,
        });
      }
    }

    root.addEventListener("click", handleSlider);
    playEntranceReveal();
    gsap.delayedCall(REVEAL_DELAY + 1.2, () => startProgressFill(fillA));

    return () => {
      pauseCarouselRef.current = () => {};
      root.removeEventListener("click", handleSlider);
      progressTweenRef.current?.kill();
      revealCleanups.forEach((cleanup) => cleanup());
      gsap.killTweensOf(root.querySelector(".progress-track"));
      gsap.killTweensOf(root.querySelector(".slider-preview-container"));
      gsap.killTweensOf(slider.querySelectorAll(".slide, .slide img"));
      gsap.killTweensOf(
        previewRef.current?.querySelectorAll(
          ".preview-slide, .preview-slide img",
        ),
      );
      gsap.killTweensOf(timeline.querySelectorAll("h3, .year-copy"));
      gsap.killTweensOf([
        labelA,
        labelB,
        titleA,
        titleB,
        yearA,
        yearB,
        fillA,
        fillB,
      ]);
    };
  }, []);

  return (
    <div ref={rootRef} className="initiatives-carousel">
      <div className="slider" />
      <div className="timeline" />

      <div className="timeline-mobile" aria-live="polite">
        <div className="year-digits">
          <span className="year-clip">
            <span ref={yearLabelARef} className="year-label">
              <h3>
                <span className="year-copy">
                  <span className="year-value">{initiatives[0].year}</span>
                  <sup className="mono-sm">ore</sup>
                </span>
              </h3>
            </span>
          </span>
          <span className="year-clip">
            <span ref={yearLabelBRef} className="year-label">
              <h3>
                <span className="year-copy">
                  <span className="year-value">{initiatives[0].year}</span>
                  <sup className="mono-sm">ore</sup>
                </span>
              </h3>
            </span>
          </span>
        </div>
      </div>

      <div className="slider-footer">
        <div className="slider-footer-left">
          <div className="slider-index mono-sm">
            <div className="index-digits" aria-live="polite">
              <span className="index-clip">
                <span ref={indexLabelARef} className="index-label">
                  {formatSlideIndex(0)}
                </span>
              </span>
              <span className="index-clip">
                <span ref={indexLabelBRef} className="index-label">
                  {formatSlideIndex(0)}
                </span>
              </span>
            </div>
            <span className="index-total">
              {" / "}
              {String(SLIDE_TOTAL).padStart(2, "0")}
            </span>
          </div>

          <div className="progress-bar" aria-hidden="true">
            <div className="progress-track">
              <span className="progress-layer">
                <span ref={progressFillARef} className="progress-fill" />
              </span>
              <span className="progress-layer">
                <span ref={progressFillBRef} className="progress-fill" />
              </span>
            </div>
          </div>
        </div>

        <div className="slider-footer-center">
          <div className="slider-title mono-sm">
            <div className="title-digits" aria-live="polite">
              <span className="title-clip">
                <span ref={titleLabelARef} className="title-label">
                  <TransitionLink
                    href={initiatives[0].href}
                    className="title-link"
                    onClick={handleTitleLinkClick}
                  >
                    <span className="title-link-text">
                      {initiatives[0].name}
                    </span>
                    <span className="title-link-icon" aria-hidden="true">
                      <MdArrowOutward />
                    </span>
                  </TransitionLink>
                </span>
              </span>
              <span className="title-clip">
                <span ref={titleLabelBRef} className="title-label">
                  <TransitionLink
                    href={initiatives[0].href}
                    className="title-link"
                    onClick={handleTitleLinkClick}
                  >
                    <span className="title-link-text">
                      {initiatives[0].name}
                    </span>
                    <span className="title-link-icon" aria-hidden="true">
                      <MdArrowOutward />
                    </span>
                  </TransitionLink>
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="slider-footer-right">
          <div className="slider-preview-container">
            <div ref={previewRef} className="slider-preview" />
          </div>
        </div>
      </div>
    </div>
  );
}
