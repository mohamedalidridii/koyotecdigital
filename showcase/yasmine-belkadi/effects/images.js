import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isTouch, reduceMotion } from "./env.js";

gsap.registerPlugin(ScrollTrigger);

const SHOWN = "inset(0% 0% 0% 0%)";
const HIDDEN_BELOW = "inset(100% 0% 0% 0%)";
const HIDDEN_ABOVE = "inset(0% 0% 100% 0%)";

export function initImages() {
  if (reduceMotion) return;

  // Frames wipe open from the bottom while the photo settles from a zoom
  document.querySelectorAll("[data-img-reveal]").forEach((frame) => {
    const img = frame.querySelector("img");
    const tl = gsap.timeline({
      scrollTrigger: { trigger: frame, start: "top 85%", once: true },
    });
    tl.fromTo(
      frame,
      { clipPath: HIDDEN_BELOW },
      { clipPath: SHOWN, duration: 1.4, ease: "power4.inOut" },
    );
    if (img)
      tl.fromTo(
        img,
        { scale: 1.4 },
        { scale: 1, duration: 1.8, ease: "power3.out" },
        0,
      );
  });

  // Parallax images. The image is 120% of its frame, so ±8% of its own
  // height is the most it can move without leaving a gap. Portraits only
  // move downwards so her face is never pushed out of the top of the frame.
  document.querySelectorAll("[data-parallax]").forEach((img) => {
    const isFace = img.classList.contains("face");
    gsap.fromTo(
      img,
      { yPercent: isFace ? 0 : -8 },
      {
        yPercent: 8,
        ease: "none",
        scrollTrigger: {
          trigger: img.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  });
}

// A floating thumbnail follows the pointer over [data-preview] rows, using
// the row's own <img> (hidden on desktop) as its source
export function initHoverPreview() {
  const rows = document.querySelectorAll("[data-preview]");
  if (!rows.length || isTouch) return;

  const preview = document.createElement("div");
  preview.className = "hover-preview";
  const img = document.createElement("img");
  img.alt = "";
  preview.appendChild(img);
  document.body.appendChild(preview);

  gsap.set(preview, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });
  const xTo = gsap.quickTo(preview, "x", { duration: 0.6, ease: "power3" });
  const yTo = gsap.quickTo(preview, "y", { duration: 0.6, ease: "power3" });
  const rotateTo = gsap.quickTo(preview, "rotation", {
    duration: 0.8,
    ease: "power3",
  });

  let lastX = 0;
  window.addEventListener("pointermove", (e) => {
    xTo(e.clientX);
    yTo(e.clientY);
    // Tilts in the direction of travel
    rotateTo(gsap.utils.clamp(-15, 15, (e.clientX - lastX) * 0.8));
    lastX = e.clientX;
  });

  rows.forEach((row) => {
    row.addEventListener("pointerenter", () => {
      const source = row.querySelector("img");
      if (!source) return;
      img.src = source.getAttribute("src");
      gsap.to(preview, {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: "power3.out",
        overwrite: "auto",
      });
    });
    row.addEventListener("pointerleave", () =>
      gsap.to(preview, {
        scale: 0,
        opacity: 0,
        duration: 0.4,
        ease: "power3.in",
        overwrite: "auto",
      }),
    );
  });
}

// Sticky frame whose photo changes as each [data-sg-item] crosses the middle
// of the screen. New photos wipe in over the previous one.
export function initStickyGallery() {
  document.querySelectorAll("[data-sticky-gallery]").forEach((root) => {
    const images = root.querySelectorAll("[data-sg-image]");
    const items = root.querySelectorAll("[data-sg-item]");
    const count = root.querySelector("[data-sg-count]");
    let current = 0;
    let z = 1;

    gsap.set(images, { clipPath: HIDDEN_BELOW });
    gsap.set(images[0], { clipPath: SHOWN, zIndex: z });

    function show(index) {
      if (index === current) return;
      const forward = index > current;
      current = index;
      const frame = images[index];
      gsap.set(frame, { zIndex: ++z });
      if (count) count.textContent = String(index + 1).padStart(2, "0");

      if (reduceMotion) {
        gsap.set(frame, { clipPath: SHOWN });
        return;
      }
      gsap.fromTo(
        frame,
        { clipPath: forward ? HIDDEN_BELOW : HIDDEN_ABOVE },
        {
          clipPath: SHOWN,
          duration: 1.1,
          ease: "power4.inOut",
          overwrite: true,
        },
      );
      gsap.fromTo(
        frame.querySelector("img"),
        { scale: 1.3 },
        { scale: 1, duration: 1.6, ease: "power3.out", overwrite: true },
      );
    }

    items.forEach((item, i) =>
      ScrollTrigger.create({
        trigger: item,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => self.isActive && show(i),
      }),
    );
  });
}
