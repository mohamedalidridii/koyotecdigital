// Top bar (hide on scroll down, glass once scrolled), full-screen menu and scrambled hover labels.
import { gsap, ScrollTrigger } from "./gsap.js";
import { $, fine, reduced } from "./env.js";
import { scroll } from "./scroll.js";

export function initNav(scope) {
  const nav = scope.querySelector(".site-nav");
  const menu = scope.querySelector(".menu");
  const btn = scope.querySelector(".menu-btn");
  if (!nav) return;
  const off = [];

  // ---------- smart bar ----------
  let hidden = false;
  const setHidden = (h) => {
    if (h === hidden) return;
    hidden = h;
    gsap.to(nav, { yPercent: h ? -100 : 0, duration: 0.6, ease: "koy", overwrite: true });
  };
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate(self) {
      const y = self.scroll();
      nav.classList.toggle("is-scrolled", y > 20);
      setHidden(!menu?.classList.contains("is-open") && y > 160 && self.direction === 1);
    },
  });

  // ---------- menu ----------
  if (menu && btn) {
    const bg = menu.querySelector(".menu-bg");
    const links = $(".menu-list a", menu);
    const foot = $(".menu-foot a", menu);
    const label = btn.querySelector(".menu-btn-label");
    const tl = gsap
      .timeline({ paused: true, defaults: { ease: "koy" } })
      .set(menu, { visibility: "visible" })
      .fromTo(bg, { clipPath: "circle(0% at calc(100% - 3rem) 2.5rem)" }, { clipPath: "circle(150% at calc(100% - 3rem) 2.5rem)", duration: 1.1, ease: "koy.io" }, 0)
      .fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.06 }, 0.35)
      .fromTo(foot, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.04 }, 0.6);

    const open = () => {
      menu.classList.add("is-open");
      menu.inert = false;
      document.documentElement.classList.add("menu-open");
      btn.setAttribute("aria-expanded", "true");
      label.textContent = label.dataset.close;
      scroll.lock();
      setHidden(false);
      reduced ? tl.progress(1) : tl.timeScale(1).play();
      links[0]?.focus({ preventScroll: true });
    };
    const close = (instant = false) => {
      menu.inert = true;
      document.documentElement.classList.remove("menu-open");
      btn.setAttribute("aria-expanded", "false");
      label.textContent = label.dataset.open;
      scroll.unlock();
      const done = () => menu.classList.remove("is-open");
      if (instant || reduced) {
        tl.progress(0).pause();
        done();
      } else {
        tl.timeScale(1.6).reverse().then(done);
      }
    };
    const toggle = () => (menu.classList.contains("is-open") ? close() : open());
    const onKey = (e) => {
      if (!menu.classList.contains("is-open")) return;
      if (e.key === "Escape") {
        close();
        btn.focus();
      }
      // keep Tab inside the menu and its toggle
      if (e.key === "Tab") {
        const items = [btn, ...links, ...foot];
        const i = items.indexOf(document.activeElement);
        const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : (i + 1) % items.length;
        e.preventDefault();
        items[next].focus();
      }
    };
    btn.addEventListener("click", toggle);
    document.addEventListener("keydown", onKey);
    links.forEach((a) => a.addEventListener("click", () => close(true)));
    off.push(() => {
      btn.removeEventListener("click", toggle);
      document.removeEventListener("keydown", onKey);
      if (menu.classList.contains("is-open")) {
        document.documentElement.classList.remove("menu-open");
        scroll.unlock();
      }
    });
  }

  // ---------- scrambled hover labels ----------
  if (fine && !reduced) {
    $("[data-scramble]", scope).forEach((el) => {
      const text = el.textContent;
      const enter = () => gsap.to(el, { duration: 0.6, scrambleText: { text, chars: "upperCase", speed: 0.6 }, overwrite: true });
      el.addEventListener("pointerenter", enter);
      off.push(() => el.removeEventListener("pointerenter", enter));
    });
  }

  return () => off.forEach((fn) => fn());
}
