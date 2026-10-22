// Home and services sections: the hover list, the statement, table rows.
import { gsap, SplitText } from "../core/gsap.js";
import { $, fine } from "../core/env.js";
import { batchReveal } from "../core/reveal.js";
import { gl } from "../core/gl.js";

// the signature interaction: hovering a service name gathers the ink into its shape beside the cursor
export function serviceHover(scope) {
  const rows = $("[data-shape]", scope);
  if (!rows.length) return;
  batchReveal(rows.map((r) => r.querySelector(".svc-name")), { y: 80, stagger: 0.08 });
  // touch screens have no hover: each row summons its shape while it crosses the middle of the screen
  if (!fine) {
    rows.forEach((row) => {
      row.dataset.gl = row.dataset.shape;
      row.dataset.glDim = "0.8";
    });
    return;
  }
  const off = [];
  let leaveTimer = 0;
  rows.forEach((row) => {
    const enter = () => {
      clearTimeout(leaveTimer);
      gl.focus(row.dataset.shape);
    };
    // a short grace period lets the pointer travel between rows without dropping the shape
    const leave = () => {
      leaveTimer = setTimeout(() => gl.blur(), 160);
    };
    row.addEventListener("pointerenter", enter);
    row.addEventListener("pointerleave", leave);
    row.addEventListener("focus", enter);
    row.addEventListener("blur", leave);
    off.push(() => {
      row.removeEventListener("pointerenter", enter);
      row.removeEventListener("pointerleave", leave);
      row.removeEventListener("focus", enter);
      row.removeEventListener("blur", leave);
    });
  });
  return () => {
    clearTimeout(leaveTimer);
    gl.blur();
    off.forEach((fn) => fn());
  };
}

// the statement inks in word by word as it is read; italic key phrases are already there
export function statement(scope) {
  const text = scope.querySelector("[data-words]");
  if (!text) return;
  SplitText.create(text, {
    type: "words",
    aria: "none",
    ignore: ".stamp, .g",
    autoSplit: true,
    onSplit(self) {
      return gsap.fromTo(
        self.words.filter((w) => !w.closest(".highlight")),
        { opacity: 0.5 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: { trigger: text, start: "top 80%", end: "bottom 50%", scrub: true },
        },
      );
    },
  });
  batchReveal($(".statement-copy p, .link-list li, .pillars li", scope), { y: 30, stagger: 0.08 });
}

// table rows (process, FAQ, posts, service blocks) slide up one after another
export function rows(scope) {
  batchReveal($(".row, .faq-list details, .post-row, .svc-block > *", scope), { y: 40, stagger: 0.06, start: "top 92%" });
}
