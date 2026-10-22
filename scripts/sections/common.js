// Sections shared by several pages: FAQ, final call to action, footer, contact form, article.
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
  return () => off.forEach((fn) => fn());
}

// giant call to action: letters rise one by one
export function cta(scope) {
  const word = scope.querySelector(".cta-word");
  if (!word) return;
  SplitText.create(word, {
    type: "chars",
    charsClass: "gc",
    mask: "chars",
    onSplit(self) {
      return gsap.from(self.chars, {
        yPercent: 110,
        duration: 1.3,
        stagger: 0.04,
        scrollTrigger: { trigger: word, start: "top 88%", once: true },
      });
    },
  });
  batchReveal($(".cta-kicker, .cta-links", scope), { y: 20 });
}

// footer: columns fade up, the address lockup rises line by line
export function footer(scope) {
  const foot = scope.querySelector(".footer");
  if (!foot) return;
  batchReveal($(".footer-cols > div", foot), { y: 30, stagger: 0.08 });
  const lines = $(".al-line", foot);
  gsap.from(lines, {
    yPercent: 60,
    autoAlpha: 0,
    duration: 1.3,
    stagger: 0.1,
    scrollTrigger: { trigger: foot.querySelector(".address-lockup"), start: "top 90%", once: true },
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

// article: body blocks rise in, the reading bar follows progress
export function article(scope) {
  batchReveal($(".article-body > *, .article-cta", scope), { y: 30, stagger: 0.03, start: "top 92%" });
  const bar = scope.querySelector(".read-progress");
  const body = scope.querySelector(".article");
  if (bar && body) {
    gsap.to(bar, { scaleX: 1, ease: "none", scrollTrigger: { trigger: body, start: "top top", end: "bottom bottom", scrub: 0.3 } });
  }
}
