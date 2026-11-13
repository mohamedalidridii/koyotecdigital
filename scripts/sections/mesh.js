// /projets: the showcase as a mesh. The WebGL surface (webgl/projectMesh.js) holds one node per
// piece; this module turns its hover and pick events into the page's typography: the big title
// rolls into the project's name, a preview card follows the pointer, the counter and sector
// update, and a click opens the piece through its link in the index below.
// Runs even with reduced motion (the scene is then still, and the title swaps without rolling).
import { gsap, ScrollTrigger } from "../core/gsap.js";
import { $, fine, reduced } from "../core/env.js";

const pad = (n) => String(n).padStart(2, "0");

// one masked span per character, so a word can roll out and the next roll in
function chars(el, text) {
  el.textContent = "";
  return [...text].map((ch) => {
    const mask = document.createElement("span");
    mask.className = "mesh-ch";
    const inner = document.createElement("span");
    inner.textContent = ch === " " ? " " : ch;
    mask.append(inner);
    el.append(mask);
    return inner;
  });
}

export function meshStage(scope, { ready = Promise.resolve() } = {}) {
  const stage = scope.querySelector(".mesh-stage");
  if (!stage) return;
  const canvas = stage.querySelector(".mesh-gl");
  const title = stage.querySelector(".mesh-title");
  const name = stage.querySelector(".mesh-name");
  const num = stage.querySelector(".mesh-num");
  const sector = stage.querySelector(".mesh-sector");
  const hint = stage.querySelector(".mesh-hint");
  const card = stage.querySelector(".mesh-card");
  const img = card.querySelector(".mesh-card-img");
  const video = card.querySelector(".mesh-card-video");
  const cardLine = card.querySelector(".mesh-card-line");
  const cardGo = card.querySelector(".mesh-card-go");
  const links = $(".mesh-link", scope);
  const filters = $(".mesh-filter", scope);
  const items = links.map((a) => ({ ...a.dataset }));
  const total = pad(items.length);
  if (!fine) {
    stage.classList.add("is-touch");
    hint.textContent = hint.dataset.touch;
    sector.textContent = sector.dataset.touch;
  }
  const idle = sector.textContent;

  let mesh = null;
  let cancelled = false;
  let current = -1;
  let roll = null;
  let scrub = null;
  const titleChars = chars(title, title.textContent);

  // ---- name the hovered project ----
  function show(i) {
    if (i === current) return;
    current = i;
    roll?.kill();
    const it = items[i];
    stage.classList.toggle("is-hovering", i >= 0);
    if (i >= 0) {
      stage.style.setProperty("--accent", it.accent);
      num.textContent = `N° ${pad(i + 1)} / ${total}`;
      sector.textContent = `${it.kindLabel} · ${it.sector} · ${it.year}`;
      cardLine.textContent = it.tagline;
      cardGo.textContent = `${it.go} ${links[i].target === "_blank" ? "↗" : "→"}`;
      img.src = `/art/previews/${it.slug}.webp`;
      // the motion preview only loads on hover, and only where a mouse is
      if (fine && !reduced) {
        video.pause();
        video.innerHTML = `<source src="/art/previews/${it.slug}.webm" type="video/webm"><source src="/art/previews/${it.slug}.mp4" type="video/mp4">`;
        video.load();
        video.play().catch(() => {});
      }
      canvas.dataset.cursor = canvas.dataset.cursorEnter;
    } else {
      num.textContent = `— / ${total}`;
      sector.textContent = idle;
      video.pause();
      delete canvas.dataset.cursor;
    }
    // the custom cursor reads data-cursor on pointerover: nudge it
    canvas.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));

    // every call starts from wherever the letters are, so fast hovers never leave a word half-rolled
    if (reduced) {
      if (i >= 0) chars(name, it.client);
      else name.textContent = "";
      gsap.set(titleChars, { yPercent: i >= 0 ? 110 : 0 });
      return;
    }
    const old = [...name.querySelectorAll(".mesh-ch > span")];
    roll = gsap.timeline();
    if (i >= 0) {
      roll.to(titleChars, { yPercent: -110, duration: 0.3, stagger: 0.008, ease: "power2.in" }, 0);
      const inn = chars(name, it.client);
      roll.fromTo(inn, { yPercent: 110 }, { yPercent: 0, duration: 0.75, stagger: 0.016, ease: "koy" }, old.length ? 0 : 0.14);
    } else {
      if (old.length) roll.to(old, { yPercent: -110, duration: 0.28, stagger: 0.008, ease: "power2.in" }, 0);
      roll.fromTo(titleChars, { yPercent: 110 }, { yPercent: 0, duration: 0.75, stagger: 0.02, ease: "koy" }, old.length ? 0.16 : 0);
      roll.call(() => current < 0 && (name.textContent = ""));
    }
  }

  // ---- preview card: follows the mouse; on touch it sits at the bottom with its link ----
  const xTo = fine ? gsap.quickTo(card, "x", { duration: 0.55, ease: "power3" }) : null;
  const yTo = fine ? gsap.quickTo(card, "y", { duration: 0.55, ease: "power3" }) : null;
  const follow = (e) => {
    if (!xTo) return;
    const r = stage.getBoundingClientRect();
    const w = card.offsetWidth;
    const flip = e.clientX - r.left + w + 48 > r.width;
    xTo(e.clientX - r.left + (flip ? -w - 28 : 28));
    yTo(e.clientY - r.top - card.offsetHeight * 0.5);
  };
  stage.addEventListener("pointermove", follow);
  const openCard = (e) => {
    if (fine || current < 0) return;
    e.preventDefault();
    links[current].click();
  };
  card.addEventListener("click", openCard);

  // ---- filters ----
  const applyFilter = (kind) => {
    filters.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === kind)));
    mesh?.filter((it) => kind === "all" || it.kind === kind);
    $(".mesh-item", scope).forEach((li) => li.classList.toggle("is-out", kind !== "all" && li.dataset.kind !== kind));
  };
  const onFilter = (e) => {
    const b = e.target.closest(".mesh-filter");
    if (b) applyFilter(b.dataset.filter);
  };
  stage.addEventListener("click", onFilter);

  // ---- the index below: keyboard focus names the node too ----
  const onFocus = (e) => {
    const a = e.target.closest(".mesh-link");
    if (a && mesh && stage.getBoundingClientRect().bottom > 80) {
      mesh.highlight(Number(a.dataset.i));
      show(Number(a.dataset.i));
    }
  };
  scope.addEventListener("focusin", onFocus);

  // ---- WebGL ----
  const hasGL = (() => {
    try {
      const c = document.createElement("canvas");
      return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      return false;
    }
  })();
  if (!hasGL) stage.classList.add("no-gl");
  else {
    import("../webgl/projectMesh.js")
      .then(({ createProjectMesh }) => {
        if (cancelled) return;
        mesh = createProjectMesh(canvas, {
          items: items.map((it) => ({ accent: it.accent, kind: it.kind })),
          reduced,
          onHover: show,
          onPick: (i) => links[i].click(),
        });
        mesh.start();
        ready.then(() => !cancelled && mesh.intro());
        // scrolling into the index dissolves the surface
        if (!reduced) {
          scrub = ScrollTrigger.create({
            trigger: stage,
            start: "top top",
            end: "bottom 15%",
            scrub: true,
            onUpdate: (st) => mesh?.scatter(st.progress),
          });
        }
      })
      .catch(() => stage.classList.add("no-gl"));
  }

  // ---- entrance of the type ----
  const tweens = [];
  if (!reduced) {
    const parts = stage.querySelectorAll(".mesh-top, .mesh-meta, .mesh-controls");
    gsap.set(titleChars, { yPercent: 110 });
    gsap.set(parts, { autoAlpha: 0, y: 16 });
    ready.then(() => {
      tweens.push(
        gsap.to(titleChars, { yPercent: 0, duration: 1.1, stagger: 0.04, ease: "koy", delay: 0.5 }),
        gsap.to(parts, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, delay: 0.9, clearProps: "opacity,visibility,transform" }),
      );
    });
  }

  return () => {
    cancelled = true;
    roll?.kill();
    scrub?.kill();
    tweens.forEach((t) => t.kill());
    stage.removeEventListener("pointermove", follow);
    stage.removeEventListener("click", onFilter);
    card.removeEventListener("click", openCard);
    scope.removeEventListener("focusin", onFocus);
    video.pause();
    mesh?.destroy();
    mesh = null;
  };
}
