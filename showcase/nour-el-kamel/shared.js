import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

export const revealProps = { y: "0%", duration: 1, ease: "power4.out" };

export const splitText = (selector, type, className) => {
  return SplitText.create(selector, {
    type: type,
    [`${type}Class`]: className,
    mask: type,
  });
};

/* Setup shared by every page: smooth scroll, section reveals, colours,
   progress bar, nav and cursor. Returns the (paused) smoother. */

export const initSite = () => {
  gsap.registerPlugin(
    CustomEase,
    SplitText,
    ScrollTrigger,
    ScrollSmoother,
    ScrambleTextPlugin,
  );
  CustomEase.create("hop", "0.8, 0, 0.02, 1");

  const smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.2,
    effects: true,
  });
  smoother.paused(true);

  /* Mobile menu. Registered before the # link handler so a menu link
     closes the menu (and unpauses scrolling) before it scrolls. */

  const menu = document.querySelector(".menu");
  const menuToggle = document.querySelector(".menu-toggle");
  const menuTl = gsap
    .timeline({ paused: true })
    .set(menu, { visibility: "visible" })
    .to(menu, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "hop" })
    .fromTo(
      ".menu-links a",
      { yPercent: 100 },
      { yPercent: 0, duration: 0.8, ease: "power4.out", stagger: 0.06 },
      "<0.3",
    )
    .fromTo(".menu-footer", { opacity: 0 }, { opacity: 0.55, duration: 0.6 }, "<0.2");

  let menuOpen = false;
  let pausedBeforeMenu = false;

  const setMenu = (open) => {
    if (open === menuOpen) return;
    menuOpen = open;
    menuToggle.textContent = open ? "Close" : "Menu";
    menuToggle.setAttribute("aria-expanded", open);
    menu.setAttribute("aria-hidden", !open);
    menu.inert = !open;

    if (open) {
      pausedBeforeMenu = smoother.paused();
      smoother.paused(true);
      menuTl.play();
    } else {
      smoother.paused(pausedBeforeMenu);
      menuTl.reverse();
    }
  };

  menuToggle.addEventListener("click", () => setMenu(!menuOpen));
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });
  gsap.matchMedia().add("(min-width: 769px)", () => setMenu(false));

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const target = link.getAttribute("href");
      smoother.scrollTo(target === "#" ? 0 : target, true, "top top");
    });
  });

  /* Section colours: each section keeps its own palette, and blends into it
     from the previous section's palette as it scrolls in */

  const palettes = {
    light: { "--bg": "#ffffff", "--fg": "#0f0f0f", "--line": "rgba(15, 15, 15, 0.15)" },
    dark: { "--bg": "#0f0f0f", "--fg": "#ffffff", "--line": "rgba(255, 255, 255, 0.18)" },
  };
  const colourSections = gsap.utils.toArray("[data-bg]");

  colourSections.forEach((section, index) => {
    const from = palettes[colourSections[index - 1]?.dataset.bg ?? "light"];
    const to = palettes[section.dataset.bg];

    gsap.fromTo(section, from, {
      ...to,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "top 40%",
        scrub: true,
      },
    });
  });

  /* Section text reveals */

  document.querySelectorAll(".section-label").forEach((label) => {
    const text = label.textContent;
    label.textContent = "";

    gsap.to(label, {
      duration: 1.2,
      scrambleText: { text, chars: "upperCase", speed: 0.6 },
      scrollTrigger: { trigger: label, start: "top 90%" },
    });
  });

  splitText(".section-title, .reveal-text", "lines", "line");

  document.querySelectorAll(".section-title, .reveal-text").forEach((element) => {
    gsap.to(element.querySelectorAll(".line"), {
      ...revealProps,
      stagger: 0.08,
      scrollTrigger: { trigger: element, start: "top 85%" },
    });
  });

  ScrollTrigger.batch(
    ".card, .work-item, .timeline-item, .tags li, .contact-links a, .reveal-up",
    {
      start: "top 90%",
      onEnter: (batch) =>
        gsap.fromTo(
          batch,
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: "power4.out", stagger: 0.1 },
        ),
    },
  );

  /* Images */

  gsap.utils.toArray(".parallax").forEach((wrapper) => {
    gsap.fromTo(
      wrapper.querySelector(":scope > img"),
      { yPercent: -10 },
      {
        yPercent: 10,
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  });

  gsap.utils.toArray(".reveal-img").forEach((wrapper) => {
    gsap.fromTo(
      wrapper,
      { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" },
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1.5,
        ease: "hop",
        scrollTrigger: { trigger: wrapper, start: "top 85%" },
      },
    );
  });

  /* Scroll progress bar + nav hide on scroll down */

  gsap.to(".scroll-progress", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: { start: 0, end: "max", scrub: true },
  });

  const nav = document.querySelector("nav");

  ScrollTrigger.create({
    start: 200,
    end: "max",
    onUpdate: (self) => {
      gsap.to(nav, {
        yPercent: self.direction === 1 ? -100 : 0,
        duration: 0.6,
        ease: "power3.out",
        overwrite: true,
      });
    },
    onLeaveBack: () => gsap.to(nav, { yPercent: 0, overwrite: true }),
  });

  /* Pointer-only: cursor and magnetic links */

  const mm = gsap.matchMedia();

  mm.add("(hover: hover) and (pointer: fine)", () => {
    const cursor = document.querySelector(".cursor");
    const cursorX = gsap.quickTo(cursor, "x", { duration: 0.4, ease: "power3" });
    const cursorY = gsap.quickTo(cursor, "y", { duration: 0.4, ease: "power3" });

    const onMouseMove = (event) => {
      cursorX(event.clientX);
      cursorY(event.clientY);
    };

    window.addEventListener("mousemove", onMouseMove);

    gsap.set(cursor, { scale: 0.15 });

    const growCursor = () => gsap.to(cursor, { scale: 0.5, duration: 0.4 });
    const shrinkCursor = () => gsap.to(cursor, { scale: 0.15, duration: 0.4 });

    const hoverables = document.querySelectorAll(
      // Work links are skipped: their row drives the larger "View" cursor
      "a:not(.work-link), button, input, select, textarea, .tags li, .gallery-item",
    );
    hoverables.forEach((element) => {
      element.addEventListener("mouseenter", growCursor);
      element.addEventListener("mouseleave", shrinkCursor);
    });

    // Magnetic pull towards the pointer
    const magnets = document.querySelectorAll(
      ".contact-links a, .tags li, .nav-item a, .btn",
    );
    const magnetHandlers = [...magnets].map((magnet) => {
      const moveX = gsap.quickTo(magnet, "x", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      const moveY = gsap.quickTo(magnet, "y", { duration: 0.8, ease: "elastic.out(1, 0.4)" });

      const onMove = (event) => {
        const rect = magnet.getBoundingClientRect();
        moveX((event.clientX - rect.left - rect.width / 2) * 0.35);
        moveY((event.clientY - rect.top - rect.height / 2) * 0.35);
      };
      const onLeave = () => {
        moveX(0);
        moveY(0);
      };

      magnet.addEventListener("mousemove", onMove);
      magnet.addEventListener("mouseleave", onLeave);
      return { magnet, onMove, onLeave };
    });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      hoverables.forEach((element) => {
        element.removeEventListener("mouseenter", growCursor);
        element.removeEventListener("mouseleave", shrinkCursor);
      });
      magnetHandlers.forEach(({ magnet, onMove, onLeave }) => {
        magnet.removeEventListener("mousemove", onMove);
        magnet.removeEventListener("mouseleave", onLeave);
      });
    };
  });

  return smoother;
};
