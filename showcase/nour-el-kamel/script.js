import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initSite, splitText, revealProps } from "./shared.js";

document.addEventListener("DOMContentLoaded", () => {
  const smoother = initSite();

  splitText(".nav-item a, .hero-copy > p, .hero-footer p", "lines", "line");

  /* Intro */

  const counterColumns = document.querySelectorAll(".digit-col");

  counterColumns.forEach((column) => {
    for (let digit = 0; digit <= 9; digit++) {
      const digitElement = document.createElement("span");
      digitElement.textContent = digit;
      column.appendChild(digitElement);
    }
  });

  const digitHeight = counterColumns[0]
    .querySelector("span")
    .getBoundingClientRect().height;

  const animateCounterTo = (value) => {
    const tens = Math.floor(value / 10);
    const ones = value % 10;

    gsap.to(counterColumns[0], {
      y: -tens * digitHeight,
      duration: 0.75,
      ease: "hop",
    });

    gsap.to(counterColumns[1], {
      y: -ones * digitHeight,
      duration: 0.75,
      ease: "hop",
    });
  };

  gsap.delayedCall(1, () => animateCounterTo(3));
  gsap.delayedCall(1.75, () => animateCounterTo(6));
  gsap.delayedCall(2.5, () => animateCounterTo(8));
  gsap.delayedCall(3.25, () => animateCounterTo(10));

  const marqueeTrack = document.querySelector(".marquee-track");
  const marqueeItemWidth = marqueeTrack.querySelector("h1").offsetWidth;

  gsap.to(marqueeTrack, {
    x: -marqueeItemWidth,
    duration: 7.5,
    ease: "none",
    repeat: -1,
  });

  document.body.classList.add("is-loading");

  const tl = gsap.timeline({
    delay: 0.5,
    onComplete: () => {
      document.body.classList.remove("is-loading");
      createHeroScrollOut();
      smoother.paused(false);
      ScrollTrigger.refresh();
      // Arriving from another page via /#section: jump straight there
      if (location.hash) smoother.scrollTo(location.hash, false, "top top");
    },
  });

  document.querySelectorAll(".hero-img").forEach((heroImage, index) => {
    const startTime = index * 0.5;

    tl.to(
      heroImage,
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1.5,
        ease: "hop",
      },
      startTime,
    );

    tl.to(
      heroImage.querySelector("img"),
      {
        scale: 1,
        duration: 1.5,
        ease: "hop",
      },
      startTime,
    );
  });

  /* Explosion: after the preloader the stack bursts across the screen */

  const heroImgWrapper = document.querySelector(".hero-img-wrapper");
  const heroImages = gsap.utils.toArray(".hero-img");

  // Centre via xPercent/yPercent so GSAP owns the transform and it stays responsive
  gsap.set([heroImgWrapper, ...heroImages], { x: 0, y: 0, xPercent: -50, yPercent: -50 });

  // [x, y] as fractions of the viewport from centre, then scale and rotation
  const scatter = [
    [-0.17, -0.19, 0.7, -8],
    [0.16, -0.2, 0.6, 6],
    [-0.31, 0.0, 0.75, 5],
    [0.31, -0.01, 0.8, -6],
    [-0.23, 0.18, 0.62, -4],
    [0.23, 0.17, 0.72, 7],
  ];

  // Phones: a collage above and beside the name, clear of the copy below it
  const scatterMobile = [
    [-0.33, -0.3, 0.36, -8],
    [-0.11, -0.21, 0.32, 6],
    [0.11, -0.31, 0.34, 5],
    [0.33, -0.2, 0.38, -6],
    [-0.38, -0.03, 0.34, -4],
    [0.38, -0.01, 0.36, 7],
  ];

  const scatterProps = (index) => {
    const isMobile = window.innerWidth <= 768;
    const [fx, fy, scale, rotation] = (isMobile ? scatterMobile : scatter)[index];

    return {
      x: fx * window.innerWidth,
      y: fy * window.innerHeight,
      scale,
      rotation,
    };
  };

  tl.to(".hero-overlay", {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
    duration: 1,
    ease: "hop",
  });

  tl.set(heroImgWrapper, { overflow: "visible" }, "<");

  heroImages.forEach((heroImage, index) => {
    tl.to(
      heroImage,
      { ...scatterProps(index), duration: 1.6, ease: "expo.inOut" },
      `<${index === 0 ? 0.2 : 0.05}`,
    );
  });

  tl.to(".marquee-track h1", { ...revealProps }, "<0.6");
  tl.to("nav .line", { ...revealProps, stagger: 0.1 }, "<0.125");
  tl.from(".menu-toggle", { yPercent: 100, opacity: 0, ...revealProps }, "<");
  tl.to(".hero-copy > p .line", { ...revealProps, stagger: 0.1 }, "<0.125");
  tl.to(".hero-callout p", { ...revealProps, opacity: 1 }, "<0.125");
  tl.to(".hero-footer .line", { ...revealProps }, "<0.125");
  tl.from(".credit-badge", { xPercent: 100, duration: 1, ease: "power4.out" }, "<0.125");

  // Keep the scattered layout in proportion when the window resizes
  window.addEventListener("resize", () => {
    if (tl.progress() < 1) return;
    heroImages.forEach((heroImage, index) =>
      gsap.set(heroImage, scatterProps(index)),
    );
  });

  // Gentle idle float once they've landed
  tl.add(() => {
    heroImages.forEach((heroImage, index) => {
      const inner = heroImage.querySelector("img");
      gsap.to(inner, { scale: 1.12, duration: 1.5, ease: "power2.out" });
      gsap.to(inner, {
        yPercent: index % 2 ? 4 : -4,
        duration: 3 + index * 0.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    });
  });

  /* Hero scroll-out: pin, images drift apart (same size) and fade.
     Built only after the intro ends, so a mid-intro refresh can't record
     the burst's in-between positions as the scroll-out's start values. */

  const createHeroScrollOut = () => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "+=100%",
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          refreshPriority: 1,
        },
      })
      .to(
        heroImages,
        {
          x: (index) => scatterProps(index).x * 2.2,
          y: (index) => scatterProps(index).y * 2.2 - window.innerHeight * 0.15,
          rotation: (index) => scatterProps(index).rotation * 2,
          ease: "power2.in",
          stagger: 0.04,
        },
        0,
      )
      .to(heroImgWrapper, { opacity: 0, ease: "none", duration: 0.5 }, 0.5)
      .to(".marquee", { yPercent: -150, opacity: 0, ease: "none" }, 0)
      .to(".hero-copy > p, .hero-callout, .hero-footer", { y: -80, opacity: 0, ease: "none" }, 0);
    ScrollTrigger.sort();
  };

  gsap.utils.toArray(".gallery-row").forEach((row) => {
    const direction = Number(row.dataset.direction);
    const distance = () => row.scrollWidth - window.innerWidth;

    gsap.fromTo(
      row,
      { x: () => (direction > 0 ? -distance() : 0) },
      {
        x: () => (direction > 0 ? 0 : -distance()),
        ease: "none",
        scrollTrigger: {
          trigger: ".gallery",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    );
  });

  /* Desktop-only: horizontal expertise cards */

  const mm = gsap.matchMedia();

  mm.add("(min-width: 769px)", () => {
    const track = document.querySelector(".cards-scroll");
    const distance = () => track.scrollWidth - track.offsetWidth;

    gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: "#expertise",
        start: "top top",
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
  });

  /* Timeline progress line */

  gsap.fromTo(
    ".timeline-progress",
    { scaleY: 0 },
    {
      scaleY: 1,
      ease: "none",
      scrollTrigger: {
        trigger: ".timeline",
        start: "top 70%",
        end: "bottom 70%",
        scrub: true,
      },
    },
  );

  document.querySelectorAll(".timeline-item").forEach((item) => {
    ScrollTrigger.create({
      trigger: item,
      start: "top 70%",
      end: "bottom 70%",
      toggleClass: "is-active",
    });
  });

  /* Pointer-only: hero depth parallax and work preview */

  mm.add("(hover: hover) and (pointer: fine)", () => {
    const cursor = document.querySelector(".cursor");
    const workPreview = document.querySelector(".work-preview");
    const workPreviewImg = workPreview.querySelector("img");
    const previewX = gsap.quickTo(workPreview, "x", { duration: 0.6, ease: "power3" });
    const previewY = gsap.quickTo(workPreview, "y", { duration: 0.6, ease: "power3" });
    const previewRotate = gsap.quickTo(workPreview, "rotation", {
      duration: 0.6,
      ease: "power3",
    });

    let lastX = 0;

    const onMouseMove = (event) => {
      // Depth parallax: each scattered image drifts by a different amount
      const offsetX = event.clientX / window.innerWidth - 0.5;
      const offsetY = event.clientY / window.innerHeight - 0.5;
      heroImages.forEach((heroImage, index) => {
        const depth = 20 + index * 8;
        gsap.to(heroImage, {
          "--mx": `${offsetX * depth}px`,
          "--my": `${offsetY * depth}px`,
          duration: 1.2,
          ease: "power3.out",
          overwrite: "auto",
        });
      });

      previewX(event.clientX - workPreview.offsetWidth / 2);
      previewY(event.clientY - workPreview.offsetHeight / 2);
      previewRotate(gsap.utils.clamp(-12, 12, (event.clientX - lastX) * 0.6));
      lastX = event.clientX;
    };

    window.addEventListener("mousemove", onMouseMove);

    const workItems = document.querySelectorAll(".work-item");
    const showPreview = (event) => {
      workPreviewImg.src = event.currentTarget.dataset.img;
      cursor.classList.add("is-view");
      gsap.to(cursor, { scale: 1, duration: 0.4 });
      gsap.to(workPreview, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "hop" });
      gsap.fromTo(workPreviewImg, { scale: 1.4 }, { scale: 1, duration: 0.8, ease: "hop" });
    };
    const hidePreview = () => {
      cursor.classList.remove("is-view");
      gsap.to(cursor, { scale: 0.15, duration: 0.4 });
      gsap.to(workPreview, { clipPath: "inset(50% 50% 50% 50%)", duration: 0.6, ease: "hop" });
    };
    workItems.forEach((item) => {
      item.addEventListener("mouseenter", showPreview);
      item.addEventListener("mouseleave", hidePreview);
    });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      workItems.forEach((item) => {
        item.removeEventListener("mouseenter", showPreview);
        item.removeEventListener("mouseleave", hidePreview);
      });
    };
  });

  // Arriving via /#section: skip the intro. Done last so every
  // ScrollTrigger exists before onComplete refreshes and scrolls.
  if (location.hash) tl.progress(1);
});
