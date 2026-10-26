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
    // words wrap the letters so long headings break between words, not inside them
    type: "words,chars",
    wordsClass: "gw",
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

// posts the request to the mail API on the VPS; falls back to the visitor's mail app if it fails
export function contactForm(scope) {
  const form = scope.querySelector(".contact-form");
  if (!form) return;
  const done = form.querySelector(".form-done");
  const otherChip = form.querySelector("[data-other]");
  const otherField = form.querySelector(".other-field");
  const toggleOther = () => {
    otherField.hidden = !otherChip.checked;
    if (otherChip.checked) otherField.querySelector("input").focus();
    else otherField.querySelector("input").value = "";
  };
  otherChip.addEventListener("change", toggleOther);
  const btn = form.querySelector(".send");
  const say = (text, failed = false) => {
    done.textContent = text;
    done.classList.toggle("is-error", failed);
    gsap.fromTo(done, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.8 });
  };
  const submit = async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const payload = {
      name: data.get("name"),
      email: data.get("email"),
      type: data.getAll("type"),
      message: data.get("message"),
      other: data.get("other"),
      website: data.get("website"),
      lang: form.dataset.lang,
      subject: form.querySelector(".form-h").textContent,
    };
    btn.disabled = true;
    say(form.dataset.sending);
    try {
      const res = await fetch(form.dataset.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      toggleOther();
      say(form.dataset.done);
    } catch {
      const types = payload.type.join(", ");
      const subject = `${payload.subject} — ${payload.name}`;
      const body = `${payload.message}\n\n${types ? `→ ${types}${payload.other ? ` (${payload.other})` : ""}\n` : ""}${payload.name} · ${payload.email}`;
      say(form.dataset.error, true);
      window.location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } finally {
      btn.disabled = false;
    }
  };
  form.addEventListener("submit", submit);
  return () => {
    form.removeEventListener("submit", submit);
    otherChip.removeEventListener("change", toggleOther);
  };
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
