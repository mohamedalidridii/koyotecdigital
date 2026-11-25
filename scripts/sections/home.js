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

// the statement is readable at once (its words used to start at half opacity and ink in on scroll);
// only the smaller blocks below it slide in as they arrive
export function statement(scope) {
  batchReveal($(".statement-copy p, .link-list li, .pillars li", scope), { y: 30, stagger: 0.08 });
}

// table rows (process, FAQ, posts, service blocks) slide up one after another
export function rows(scope) {
  batchReveal($(".row, .faq-list details, .post-row, .svc-block > *", scope), { y: 40, stagger: 0.06, start: "top 92%" });
}
