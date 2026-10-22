// Custom cursor (fine pointers only) and magnetic buttons.
import { gsap } from "./gsap.js";
import { $, fine } from "./env.js";

const INTERACTIVE = "a, button, summary, label, input, textarea, [data-cursor]";

export function initCursor() {
  const el = document.querySelector(".cursor");
  if (!fine || !el) return;
  const label = el.querySelector(".cursor-label");
  const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
  const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
  gsap.set(el, { x: window.innerWidth / 2, y: window.innerHeight / 2 });

  window.addEventListener(
    "pointermove",
    (e) => {
      x(e.clientX);
      y(e.clientY);
      el.classList.remove("is-hidden");
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", () => el.classList.add("is-hidden"));

  // the closest data-cursor wins; plain links just grow the ring
  document.addEventListener("pointerover", (e) => {
    const target = e.target.closest(INTERACTIVE);
    const tagged = e.target.closest("[data-cursor]");
    const text = tagged && (!target || tagged.contains(target) || target === tagged) ? tagged.dataset.cursor : "";
    label.textContent = text;
    el.classList.toggle("has-label", !!text);
    el.classList.toggle("is-link", !text && !!target && target !== tagged);
  });
}

export function resetCursor() {
  document.querySelector(".cursor")?.classList.remove("has-label", "is-link");
}

// buttons lean toward the pointer
export function magnetic(scope) {
  if (!fine) return;
  const off = [];
  $("[data-magnetic]", scope).forEach((btn) => {
    const x = gsap.quickTo(btn, "x", { duration: 0.6, ease: "power3" });
    const y = gsap.quickTo(btn, "y", { duration: 0.6, ease: "power3" });
    const move = (e) => {
      const r = btn.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * 0.28);
      y((e.clientY - (r.top + r.height / 2)) * 0.38);
    };
    const leave = () => {
      x(0);
      y(0);
    };
    btn.addEventListener("pointermove", move);
    btn.addEventListener("pointerleave", leave);
    off.push(() => {
      btn.removeEventListener("pointermove", move);
      btn.removeEventListener("pointerleave", leave);
    });
  });
  return () => off.forEach((fn) => fn());
}
