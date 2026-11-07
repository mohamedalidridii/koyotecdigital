// Careers page (/carrieres, /en/careers) and its home teaser.
// careersForm runs even with reduced motion (it is the form); the others are motion only.
import { gsap, ScrollTrigger } from "../core/gsap.js";
import { $, reduced, fine } from "../core/env.js";
import { scroll } from "../core/scroll.js";
import { gl } from "../core/gl.js";
import { batchReveal } from "../core/reveal.js";

const MAX_CV = 8 * 1024 * 1024;
const CV_EXT = /\.(pdf|docx?)$/i;
const SCROLL_OFFSET = -48;

const listen = (off) => (el, ev, fn, opts) => {
  el.addEventListener(ev, fn, opts);
  off.push(() => el.removeEventListener(ev, fn, opts));
};
// ---------- Cloudflare Turnstile (anti-bot), only when the page carries a site key ----------
// The script loads once for the whole visit (page transitions keep it); each visit to the
// careers page renders its own widget, invisible unless Cloudflare wants an interaction.
let tsScript;
const loadTurnstile = () =>
  (tsScript ||= new Promise((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    window.__koyTs = () => resolve(window.turnstile);
    const sc = document.createElement("script");
    sc.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__koyTs";
    sc.async = true;
    sc.onerror = () => {
      tsScript = null;
      reject(new Error("turnstile script"));
    };
    document.head.appendChild(sc);
  }));

function turnstileWidget(slot, lang) {
  let id = null;
  let token = "";
  let waiting = [];
  let dead = false;
  const settle = (t) => {
    token = t;
    waiting.forEach((fn) => fn(t));
    waiting = [];
  };
  loadTurnstile()
    .then((ts) => {
      if (dead) return;
      id = ts.render(slot, {
        sitekey: slot.dataset.sitekey,
        language: lang,
        appearance: "interaction-only",
        size: "flexible",
        callback: (t) => settle(t),
        "expired-callback": () => (token = ""),
        "error-callback": () => settle(""),
      });
    })
    .catch(() => settle("")); // blocked or offline: let the server decide
  return {
    // resolves with a token, or "" after `wait` ms (the server then answers 403 if it needs one)
    token: (wait = 15000) =>
      token
        ? Promise.resolve(token)
        : new Promise((resolve) => {
            waiting.push(resolve);
            setTimeout(() => resolve(token), wait);
          }),
    // tokens are single-use: get a fresh one after every submission
    reset: () => {
      token = "";
      if (id !== null) window.turnstile?.reset(id);
    },
    destroy: () => {
      dead = true;
      if (id !== null) window.turnstile?.remove(id);
    },
  };
}

const size = (b) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} Ko` : `${(b / 1024 / 1024).toFixed(1)} Mo`);

// ---------- the application form ----------
export function careersForm(scope, { ready = Promise.resolve() } = {}) {
  const form = scope.querySelector(".apply-form");
  if (!form) return;
  const off = [];
  const on = listen(off);
  const section = scope.querySelector("#postuler");
  const box = form.closest(".apply-box");
  const done = box.querySelector(".apply-done");
  const status = form.querySelector(".form-done");
  const btn = form.querySelector(".apply-send");
  const fill = btn.querySelector(".send-fill");
  const label = btn.querySelector(".send-label");
  const labelText = label.textContent;
  const word = scope.querySelector(".apply-pole-word");
  const ink = form.querySelector(".ps-ink");
  const otherField = form.querySelector(".other-field");
  const otherInput = otherField.querySelector("input");
  const poleInputs = $('input[name="pole"]', form);
  const sets = $(".role-set", form);
  const en = form.dataset.lang === "en";
  const tsSlot = form.querySelector(".ts-slot");
  const human = tsSlot ? turnstileWidget(tsSlot, en ? "en" : "fr") : null;
  if (human) off.push(human.destroy);

  const say = (text, failed = false) => {
    status.textContent = text;
    status.classList.toggle("is-error", failed);
    if (!reduced && text) gsap.fromTo(status, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6 });
  };

  // ----- pole switch: sliding ink, role chips swap, the big word in the aside rolls over
  const current = () => poleInputs.find((i) => i.checked)?.value;
  const poleName = (key) => scope.querySelector(`.pole[data-pole="${key}"] .pole-name`)?.textContent || key;
  const moveInk = (instant = false) => {
    const opt = poleInputs.find((i) => i.checked)?.closest(".ps-opt");
    if (!opt || !opt.offsetWidth) return;
    gsap.to(ink, { x: opt.offsetLeft, width: opt.offsetWidth, autoAlpha: 1, duration: instant || reduced ? 0 : 0.75, ease: "koy", overwrite: true });
    ink.parentElement.classList.add("is-measured");
  };
  const swapWord = (key, instant) => {
    if (!word) return;
    const next = poleName(key);
    if (word.textContent === next) return;
    if (instant || reduced) {
      word.textContent = next;
      return;
    }
    gsap.killTweensOf(word);
    gsap.timeline()
      .to(word, { yPercent: -105, duration: 0.35, ease: "koy.io" })
      .add(() => (word.textContent = next))
      .fromTo(word, { yPercent: 105 }, { yPercent: 0, duration: 0.8, ease: "koy" });
  };
  const toggleOther = () => {
    const chosen = form.querySelector('input[name="role"]:checked:not(:disabled)');
    const show = chosen?.value === "other";
    otherInput.required = show;
    if (show === !otherField.hidden) return;
    otherField.hidden = !show;
    if (show) {
      otherInput.focus({ preventScroll: true });
      if (!reduced) gsap.from(otherField, { autoAlpha: 0, y: -8, duration: 0.5 });
    } else otherInput.value = "";
    ScrollTrigger.refresh();
  };
  const setPole = (key, { instant = false, role } = {}) => {
    const input = poleInputs.find((i) => i.value === key);
    if (!input) return;
    input.checked = true;
    const next = sets.find((s) => s.dataset.for === key);
    const changed = next.hidden;
    sets.forEach((s) => {
      s.hidden = s !== next;
      $("input", s).forEach((i) => (i.disabled = s !== next));
    });
    if (role) {
      const r = $("input", next).find((i) => i.value === role);
      if (r) r.checked = true;
    }
    if (changed && !instant && !reduced) {
      gsap.fromTo(next.children, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.035, clearProps: "opacity,visibility,transform" });
    }
    moveInk(instant);
    swapWord(key, instant);
    toggleOther();
  };

  // presets from the URL: /carrieres?pole=engineering&role=devops#postuler
  const params = new URLSearchParams(location.search);
  const wanted = params.get("pole");
  setPole(poleInputs.some((i) => i.value === wanted) ? wanted : poleInputs[0].value, { instant: true, role: params.get("role") || undefined });
  const contract = params.get("contract");
  if (contract) {
    const c = $('input[name="contract"]', form).find((i) => i.value === contract);
    if (c) c.checked = true;
  }
  document.fonts?.ready.then(() => moveInk(true));
  on(window, "resize", () => moveInk(true));

  on(form, "change", (e) => {
    if (e.target.name === "pole") setPole(e.target.value);
    if (e.target.name === "role") toggleOther();
  });

  // "apply" links in the hero and on each arm: preset the arm, glide to the form
  const goToForm = (opts = {}) => scroll.to(section, { offset: SCROLL_OFFSET, duration: 1.6, ...opts });
  $("[data-pick-pole]", scope).forEach((a) =>
    on(a, "click", (e) => {
      e.preventDefault();
      if (a.dataset.pickPole) setPole(a.dataset.pickPole);
      goToForm();
      history.replaceState(history.state, "", `${location.pathname}${a.dataset.pickPole ? `?pole=${a.dataset.pickPole}` : location.search}#postuler`);
    }),
  );
  // a preset arm means "take me to the form" (page transitions drop the #postuler hash)
  if (location.hash === "#postuler" || params.has("pole")) ready.then(() => setTimeout(() => goToForm({ immediate: reduced }), 350));

  // ----- CV drop zone (the file input covers the zone, so click and native drop both work)
  const zone = form.querySelector(".drop-zone");
  const input = form.querySelector(".drop-input");
  const pill = form.querySelector(".drop-file");
  const err = form.querySelector(".drop-error");
  input.required = false; // checked by hand below, with a friendlier message
  const problem = (f) => (!f ? form.dataset.cvMissing : !CV_EXT.test(f.name) ? form.dataset.cvBad : f.size > MAX_CV ? form.dataset.cvBig : "");
  const shake = (el) => !reduced && gsap.fromTo(el, { x: -8 }, { x: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
  const showFile = () => {
    const f = input.files[0];
    const p = f ? problem(f) : "";
    err.textContent = p;
    if (!f || p) {
      if (p) {
        input.value = "";
        shake(zone);
      }
      pill.hidden = true;
      zone.hidden = false;
      return;
    }
    pill.querySelector(".drop-name").textContent = f.name;
    pill.querySelector(".drop-size").textContent = en ? size(f.size).replace("Ko", "KB").replace("Mo", "MB") : size(f.size);
    zone.hidden = true;
    pill.hidden = false;
    if (!reduced) {
      gsap.timeline()
        .fromTo(pill, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.6, clearProps: "transform" })
        .fromTo(pill.querySelector(".drop-check path"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, ease: "koy.io" }, 0.15);
    }
  };
  on(input, "change", showFile);
  on(pill.querySelector(".drop-remove"), "click", () => {
    input.value = "";
    showFile();
    input.focus();
  });
  let depth = 0;
  on(zone, "dragenter", () => {
    depth += 1;
    zone.classList.add("is-over");
  });
  on(zone, "dragleave", () => {
    depth = Math.max(0, depth - 1);
    if (!depth) zone.classList.remove("is-over");
  });
  on(zone, "drop", () => {
    depth = 0;
    zone.classList.remove("is-over");
  });
  // a file dropped next to the zone must not make the browser navigate away from the form
  on(section, "dragover", (e) => e.target !== input && e.preventDefault());
  on(section, "drop", (e) => {
    if (e.target === input) return;
    e.preventDefault();
    if (e.dataTransfer?.files.length) {
      input.files = e.dataTransfer.files;
      showFile();
    }
  });

  // ----- submit with upload progress filling the button
  const progress = (p, d = 0.4) => gsap.to(fill, { scaleX: p, duration: reduced ? 0 : d, ease: "koy", overwrite: true });
  const idle = () => {
    btn.disabled = false;
    btn.style.minWidth = "";
    form.classList.remove("is-sending");
    label.textContent = labelText;
    progress(0, 0.6);
  };
  const fail = (code) => {
    idle();
    if (code === 413 || code === 415) {
      input.value = "";
      showFile();
      err.textContent = code === 413 ? form.dataset.cvBig : form.dataset.cvBad;
      return say("");
    }
    say(code === 429 ? form.dataset.limit : code === 403 ? form.dataset.captcha : form.dataset.error, true);
  };
  const success = () => {
    const pole = current();
    const finish = () => {
      form.hidden = true;
      done.hidden = false;
      form.reset();
      setPole(pole, { instant: true });
      input.value = "";
      showFile();
      idle();
      say("");
      ScrollTrigger.refresh();
      done.focus({ preventScroll: true });
    };
    if (reduced) return finish();
    const r = btn.getBoundingClientRect();
    gl.pulse(((r.left + r.width / 2) / innerWidth) * 2 - 1, -(((r.top + r.height / 2) / innerHeight) * 2 - 1), 1.6);
    const [ring, tick] = $(".apply-done-mark circle, .apply-done-mark path", done);
    gsap.timeline()
      .to(fill, { scaleX: 1, duration: 0.3, overwrite: true })
      .to(form, { autoAlpha: 0, y: -24, duration: 0.55, ease: "koy.io" }, "+=0.15")
      .add(finish)
      .add(() => scroll.to(box, { offset: -120, duration: 1.2 }))
      .fromTo(done, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.9 })
      .fromTo(ring, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, ease: "koy.io" }, "<")
      .fromTo(tick, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6, ease: "koy.io" }, "-=0.45")
      .from($(".apply-done-h, .apply-done-text, .apply-again", done), { autoAlpha: 0, y: 16, duration: 0.8, stagger: 0.1 }, "-=0.7")
      .set(form, { clearProps: "opacity,visibility,transform" });
  };

  on(form, "submit", async (e) => {
    e.preventDefault();
    if (btn.disabled) return;
    if (!form.checkValidity()) return form.reportValidity();
    const p = problem(input.files[0]);
    if (p) {
      err.textContent = p;
      shake(pill.hidden ? zone : pill);
      return zone.scrollIntoView?.({ block: "center", behavior: reduced ? "auto" : "smooth" });
    }
    btn.style.minWidth = `${btn.offsetWidth}px`; // the shorter "sending" label must not shrink the button
    btn.disabled = true;
    form.classList.add("is-sending");
    label.textContent = form.dataset.sending;
    say("");
    progress(0.04);
    if (human) await human.token();
    const body = new FormData(form);
    human?.reset();
    const xhr = new XMLHttpRequest();
    xhr.open("POST", form.dataset.endpoint);
    xhr.timeout = 90000;
    // the upload is most of the wait; keep the last tenth for the server sending the mail
    xhr.upload.onprogress = (ev) => ev.lengthComputable && progress(0.04 + (ev.loaded / ev.total) * 0.86);
    xhr.onload = () => (xhr.status === 200 ? success() : fail(xhr.status));
    xhr.onerror = xhr.ontimeout = () => fail(0);
    xhr.send(body);
  });

  on(done.querySelector(".apply-again"), "click", () => {
    done.hidden = true;
    form.hidden = false;
    ScrollTrigger.refresh();
    moveInk(true);
    if (!reduced) gsap.from(form, { autoAlpha: 0, y: 24, duration: 0.8, clearProps: "opacity,visibility,transform" });
    form.querySelector('input[name="name"]').focus({ preventScroll: true });
  });

  return () => off.forEach((fn) => fn());
}

// ---------- the two arms: reveal, particles gather into the arm's icon on hover ----------
export function careersPoles(scope) {
  const poles = $(".pole", scope);
  if (!poles.length) return;
  const off = [];
  const on = listen(off);

  poles.forEach((pole, n) => {
    const parts = $(".pole-kicker, .pole-name, .pole-pitch, .pole-disc, .pole-roles, .pole-cta", pole);
    gsap.timeline({ scrollTrigger: { trigger: pole, start: "top 85%", once: true }, delay: n * 0.12 })
      .fromTo(pole, { clipPath: "inset(18% 0% 0% 0% round 28px)" }, { clipPath: "inset(0% 0% 0% 0% round 28px)", duration: 1.4, ease: "koy", clearProps: "clipPath" })
      .from(parts, { autoAlpha: 0, y: 40, duration: 1.1, stagger: 0.07, clearProps: "opacity,visibility,transform" }, 0.15);
  });

  // touch screens: each arm summons its shape while it crosses the middle of the screen
  if (!fine) {
    poles.forEach((p) => {
      p.dataset.gl = p.dataset.poleShape;
      p.dataset.glDim = "0.7";
    });
    return;
  }
  let leaveTimer = 0;
  poles.forEach((pole) => {
    on(pole, "pointerenter", () => {
      clearTimeout(leaveTimer);
      gl.focus(pole.dataset.poleShape);
    });
    on(pole, "pointerleave", () => (leaveTimer = setTimeout(() => gl.blur(), 160)));
    // soft light that follows the pointer across the card
    on(pole, "pointermove", (e) => {
      const r = pole.getBoundingClientRect();
      pole.style.setProperty("--mx", `${e.clientX - r.left}px`);
      pole.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });
  return () => {
    clearTimeout(leaveTimer);
    gl.blur();
    off.forEach((fn) => fn());
  };
}

// ---------- home teaser: marquee that speeds up with the scroll, big links per arm ----------
export function careersTeaser(scope) {
  const sec = scope.querySelector(".careers-teaser");
  if (!sec) return;
  const off = [];
  const on = listen(off);
  const track = sec.querySelector(".ct-marquee-track");
  const loop = gsap.to(track, { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
  let boost = 1;
  const tick = () => {
    const v = Math.min(Math.abs(scroll.velocity) / 12, 5);
    boost += (1 + v - boost) * 0.08;
    loop.timeScale(boost);
  };
  gsap.ticker.add(tick);
  off.push(() => gsap.ticker.remove(tick), () => loop.kill());

  const links = $(".ct-pole", sec);
  batchReveal(links.map((a) => a.querySelector(".ct-name")), { y: 80, stagger: 0.1 });
  if (!fine) {
    links.forEach((a) => {
      a.dataset.gl = a.dataset.poleShape;
      a.dataset.glDim = "0.8";
    });
  } else {
    let leaveTimer = 0;
    links.forEach((a) => {
      const enter = () => {
        clearTimeout(leaveTimer);
        gl.focus(a.dataset.poleShape);
      };
      const leave = () => (leaveTimer = setTimeout(() => gl.blur(), 160));
      on(a, "pointerenter", enter);
      on(a, "pointerleave", leave);
      on(a, "focus", enter);
      on(a, "blur", leave);
    });
    off.push(() => {
      clearTimeout(leaveTimer);
      gl.blur();
    });
  }
  return () => off.forEach((fn) => fn());
}
