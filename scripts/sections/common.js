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

// analytics must never break the page
const track = (name, data) => {
  try {
    window.umami?.track(name, data);
  } catch {
    /* ignore */
  }
};

// clicks on elements with data-track="event" (+ data-track-place="…" and other data-track-* fields) send that
// event and leave the click alone: barba transitions and links keep working at full speed. The tracker's own
// data-umami-event is avoided on purpose: it cancels the click and sets location.href once its request is
// answered (a full reload, held while the analytics server is slow). umami.track() sends with fetch keepalive,
// so the event survives a navigation that unloads the page. Bound once, outside the barba container.
let tracking = false;
export function bindTrackedClicks() {
  if (tracking) return;
  tracking = true;
  document.addEventListener(
    "click",
    (e) => {
      const el = e.target instanceof Element ? e.target.closest("[data-track]") : null;
      if (!el) return;
      const data = {};
      for (const { name, value } of el.attributes) if (name.startsWith("data-track-")) data[name.slice(11)] = value;
      track(el.getAttribute("data-track"), Object.keys(data).length ? data : undefined);
    },
    true,
  );
}

// posts the request to the mail API on the VPS; if it fails, offers WhatsApp and a pre-filled e-mail
// (the visitor chooses: nothing opens on its own)
// analytics: quote-start (first focus), quote-invalid, quote-sent, quote-error, quote-abandon (left after starting)
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
  const lang = form.dataset.lang;
  let started = false;
  let finished = false;
  const onStart = () => {
    if (started) return;
    started = true;
    track("quote-start", { lang });
  };
  form.addEventListener("focusin", onStart);
  // the browser blocks submit on empty required fields before our handler runs: listen to "invalid"
  let invalidReported = 0;
  const onInvalid = (e) => {
    if (Date.now() - invalidReported < 500) return; // one event per submit attempt
    invalidReported = Date.now();
    track("quote-invalid", { field: e.target.name || "unknown", lang });
  };
  form.addEventListener("invalid", onInvalid, true);
  const reportAbandon = () => {
    if (!started || finished) return;
    finished = true;
    const filled = ["name", "email", "message"].filter((n) => String(form.elements[n]?.value || "").trim()).length;
    track("quote-abandon", { filled: `${filled}/3`, lang });
  };
  window.addEventListener("pagehide", reportAbandon);
  const say = (text, failed = false) => {
    done.textContent = text;
    done.classList.toggle("is-error", failed);
    gsap.fromTo(done, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.8 });
  };
  const submit = async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return; // "invalid" events are tracked by onInvalid
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
      // conversion for the analytics (Umami); absent until the tracker is configured
      finished = true;
      track("quote-sent", { type: payload.type.join(", ") || "none", lang: payload.lang });
      form.reset();
      toggleOther();
      say(form.dataset.done);
    } catch {
      const types = payload.type.join(", ");
      const subject = `${payload.subject} — ${payload.name}`;
      const body = `${payload.message}\n\n${types ? `→ ${types}${payload.other ? ` (${payload.other})` : ""}\n` : ""}${payload.name} · ${payload.email}`;
      say(form.dataset.error, true);
      track("quote-error", { lang });
      // two ways to still reach us, without losing what was typed
      const mail = document.createElement("a");
      mail.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      mail.textContent = form.dataset.email;
      const wa = document.createElement("a");
      // the typed request goes into the WhatsApp message too (the error text says it is ready on both)
      wa.href = `${form.dataset.wa.split("?")[0]}?text=${encodeURIComponent(`${subject}\n\n${body}`.slice(0, 1500))}`;
      wa.target = "_blank";
      wa.rel = "noopener";
      wa.textContent = "WhatsApp";
      wa.dataset.track = "whatsapp";
      wa.dataset.trackPlace = "form-error";
      done.append(" ", wa, " · ", mail);
    } finally {
      btn.disabled = false;
    }
  };
  form.addEventListener("submit", submit);
  return () => {
    reportAbandon(); // leaving the page inside the site (barba navigation)
    window.removeEventListener("pagehide", reportAbandon);
    form.removeEventListener("focusin", onStart);
    form.removeEventListener("invalid", onInvalid, true);
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

// analytics: how far visitors read (25 / 50 / 75 / 100% of the main content), once per page view.
// Runs on service pages, blog articles and case studies, even with reduced motion.
export function scrollDepth(scope) {
  const main = scope.querySelector("main");
  if (!main) return;
  const marks = [25, 50, 75, 100];
  const sent = new Set();
  const page = location.pathname;
  const check = () => {
    const r = main.getBoundingClientRect();
    const read = (window.innerHeight - r.top) / Math.max(1, r.height);
    for (const m of marks) {
      if (!sent.has(m) && read >= m / 100 - (m === 100 ? 0.02 : 0)) {
        sent.add(m);
        window.umami?.track("scroll-depth", { page, depth: `${m}%` });
      }
    }
    if (sent.size === marks.length) window.removeEventListener("scroll", check);
  };
  window.addEventListener("scroll", check, { passive: true });
  return () => window.removeEventListener("scroll", check);
}

// analytics: real reading time, once per page view. Counts only while the tab is visible, so a page
// left open in the background is not "engaged". Marks: 30 s and 2 min.
export function engagedTime() {
  const page = location.pathname;
  const marks = [[30, "30s"], [120, "2min"]];
  let seconds = 0;
  const tick = setInterval(() => {
    if (document.visibilityState !== "visible") return;
    seconds += 1;
    for (const [s, label] of marks) {
      if (seconds === s) window.umami?.track("engaged", { page, time: label });
    }
    if (seconds >= marks[marks.length - 1][0]) clearInterval(tick);
  }, 1000);
  return () => clearInterval(tick);
}

// analytics: visitors who copy the email address or phone number instead of clicking it
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.]{2,}/;
const PHONE_RE = /(\+?216)?[\s.]?\d{2}[\s.]?\d{3}[\s.]?\d{3}/;
export function trackContactCopy() {
  document.addEventListener("copy", () => {
    const text = String(window.getSelection?.() || "").trim();
    if (!text || text.length > 120) return;
    const type = EMAIL_RE.test(text) ? "email" : PHONE_RE.test(text) ? "phone" : null;
    if (type) window.umami?.track("contact-copy", { type, page: location.pathname });
  });
}
