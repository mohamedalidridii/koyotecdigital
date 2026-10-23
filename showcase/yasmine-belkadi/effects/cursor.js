import gsap from "gsap";
import { isTouch } from "./env.js";

// Ring that trails the pointer plus a dot that sticks to it. The ring grows
// over links and shows a label over elements with [data-cursor="Label"].
export function initCursor() {
  if (isTouch) return;

  const ring = document.createElement("div");
  ring.className = "cursor is-hidden";
  ring.innerHTML = '<span class="cursor-label"></span>';
  const dot = document.createElement("div");
  dot.className = "cursor-dot is-hidden";
  document.body.append(ring, dot);
  document.documentElement.classList.add("has-cursor");

  const label = ring.querySelector(".cursor-label");
  const ringX = gsap.quickTo(ring, "x", { duration: 0.55, ease: "power3" });
  const ringY = gsap.quickTo(ring, "y", { duration: 0.55, ease: "power3" });
  const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3" });
  const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3" });

  window.addEventListener("pointermove", (e) => {
    ringX(e.clientX);
    ringY(e.clientY);
    dotX(e.clientX);
    dotY(e.clientY);
    ring.classList.remove("is-hidden");
    dot.classList.remove("is-hidden");
  });

  document.addEventListener("pointerleave", () => {
    ring.classList.add("is-hidden");
    dot.classList.add("is-hidden");
  });

  // pointerover fires on every element entered, so the state is recomputed
  // from scratch each time instead of tracking enter/leave pairs
  document.addEventListener("pointerover", (e) => {
    const labelled = e.target.closest("[data-cursor]");
    const link = e.target.closest("a, button, [data-magnetic]");
    ring.classList.toggle("is-label", !!labelled);
    ring.classList.toggle("is-link", !labelled && !!link);
    dot.classList.toggle("is-hidden", !!labelled || !!link);
    if (labelled) label.textContent = labelled.dataset.cursor;
  });

  window.addEventListener("pointerdown", () =>
    gsap.to(ring, { scale: 0.8, duration: 0.2 }),
  );
  window.addEventListener("pointerup", () =>
    gsap.to(ring, { scale: 1, duration: 0.4, ease: "back.out(3)" }),
  );
}
