// Sections shared by several pages: FAQ, final call to action, floating card, footer,
// contact form and the blog.
import { gsap, ScrollTrigger, SplitText } from "../core/gsap.js";
import { $ } from "../core/env.js";
import { batchReveal } from "../core/reveal.js";

// smooth open/close for the FAQ <details>
export function faq(scope) {
  const off = [];
  $(".faq-list details", scope).forEach((d) => {
    const summary = d.querySelector("summary");
    const body = d.querySelector(".faq-a");
    let busy = false;
    const click = (e) => {
      e.preventDefault();
      if (busy) return;
      busy = true;
      const done = () => {
        gsap.set(body, { clearProps: "all" });
        busy = false;
        ScrollTrigger.refresh();
      };
      if (d.open) {
        gsap.to(body, { height: 0, opacity: 0, duration: 0.45, ease: "koy.io", onComplete: () => ((d.open = false), done()) });
      } else {
        d.open = true;
        gsap.fromTo(body, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.6, ease: "koy", onComplete: done });
      }
    };
    summary.addEventListener("click", click);
    off.push(() => summary.removeEventListener("click", click));
  });
  batchReveal($(".faq-list details", scope), { y: 30, stagger: 0.06 });
  return () => off.forEach((fn) => fn());
}

// giant call to action: letters rise one by one, then lean with the pointer
export function cta(scope) {
  const link = scope.querySelector(".cta-giant");
  if (!link) return;
  const split = SplitText.create(link, { type: "chars", charsClass: "gc" });
  gsap.from(split.chars, {
    yPercent: 120,
    rotate: 8,
    duration: 1.2,
    stagger: 0.035,
    scrollTrigger: { trigger: link, start: "top 88%", once: true },
  });
}

// floating quote card: slides in after a while, dismissible for the session
export function floatCta(scope) {
  const card = scope.querySelector(".float-cta");
  if (!card) return;
  let dismissed = false;
  try {
    dismissed = sessionStorage.getItem("floatCtaClosed") === "1";
  } catch {
    /* storage blocked */
  }
  if (dismissed) {
    card.remove();
    return;
  }
  gsap.to(card, { y: 0, duration: 1, delay: 4, ease: "koy" });
  card.querySelector(".float-close").addEventListener("click", () => {
    try {
      sessionStorage.setItem("floatCtaClosed", "1");
    } catch {
      /* storage blocked */
    }
    gsap.to(card, { y: "160%", duration: 0.6, ease: "koy.io", onComplete: () => card.remove() });
  });
  // step aside while the final call to action and footer are on screen
  ScrollTrigger.create({
    trigger: scope.querySelector(".cta") || scope.querySelector(".footer"),
    start: "top 85%",
    end: () => ScrollTrigger.maxScroll(window) + 200,
    onToggle: (self) => gsap.to(card, { autoAlpha: self.isActive ? 0 : 1, duration: 0.3 }),
  });
}

// footer rises from below the page; the giant name settles letter by letter
export function footer(scope) {
  const foot = scope.querySelector(".footer");
  if (!foot) return;
  gsap.from(foot.querySelector(".footer-inner"), {
    yPercent: -30,
    ease: "none",
    scrollTrigger: { trigger: foot, start: "top bottom", end: "bottom bottom", scrub: true },
  });
  const word = foot.querySelector(".footer-word");
  SplitText.create(word, {
    type: "chars",
    mask: "chars",
    onSplit(self) {
      return gsap.from(self.chars, {
        yPercent: 100,
        stagger: 0.05,
        ease: "none",
        scrollTrigger: { trigger: foot, start: "top 70%", end: "bottom bottom", scrub: 0.6 },
      });
    },
  });
}

// no backend: compose a ready-to-send email in the visitor's mail app
export function contactForm(scope) {
  const form = scope.querySelector(".contact-form");
  if (!form) return;
  const submit = (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const types = data.getAll("type").join(", ");
    const subject = `${form.querySelector(".form-h").textContent} — ${data.get("name")}`;
    const body = `${data.get("message")}\n\n${types ? `→ ${types}\n` : ""}${data.get("name")} · ${data.get("email")}`;
    window.location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const done = form.querySelector(".form-done");
    done.textContent = form.dataset.done;
    gsap.from(done, { autoAlpha: 0, y: 10, duration: 0.8 });
  };
  form.addEventListener("submit", submit);
  return () => form.removeEventListener("submit", submit);
}

// blog list reveals and the article reading bar
export function blog(scope) {
  batchReveal($(".blog-card", scope), { y: 60, stagger: 0.1 });
  batchReveal($(".article-body > *, .article-cta", scope), { y: 30, stagger: 0.03, start: "top 92%" });
  const bar = scope.querySelector(".read-progress");
  const article = scope.querySelector(".article");
  if (bar && article) {
    gsap.to(bar, { scaleX: 1, ease: "none", scrollTrigger: { trigger: article, start: "top top", end: "bottom bottom", scrub: 0.3 } });
  }
}

// services page blocks
export function serviceBlocks(scope) {
  $(".svc-block", scope).forEach((block) => {
    gsap.from(block.querySelector(".svc-block-copy > p:last-child"), {
      autoAlpha: 0,
      y: 40,
      duration: 1.1,
      scrollTrigger: { trigger: block, start: "top 70%", once: true },
    });
  });
}
