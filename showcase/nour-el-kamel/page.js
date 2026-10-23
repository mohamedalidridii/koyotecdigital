import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initSite, splitText, revealProps } from "./shared.js";

/* Inner pages: a short title reveal in place of the home page's intro */

document.addEventListener("DOMContentLoaded", () => {
  const smoother = initSite();

  splitText(".nav-item a, .page-title, .page-intro", "lines", "line");

  const intro = gsap
    .timeline({
      delay: 0.2,
      onComplete: () => {
        smoother.paused(false);
        ScrollTrigger.refresh();
      },
    })
    .to(".page-title .line", { ...revealProps, stagger: 0.1 })
    .to("nav .line", { ...revealProps, stagger: 0.08 }, "<0.1")
    .from(".menu-toggle", { yPercent: 100, opacity: 0, ...revealProps }, "<")
    .to(".page-intro .line", { ...revealProps, stagger: 0.08 }, "<0.2");

  // Project pages only
  const projectMeta = document.querySelector(".page-hero .project-meta");
  if (projectMeta) {
    intro.fromTo(
      projectMeta,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power4.out" },
      "<0.2",
    );
  }

  /* Contact form: post with fetch so the visitor stays on the page */

  const form = document.querySelector(".form");
  if (!form) return;

  const status = form.querySelector(".form-status");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "Sending…";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(response.statusText);
      form.reset();
      status.textContent = "Thank you, your message has been sent.";
    } catch {
      status.textContent =
        "Sorry, something went wrong. Please email me directly instead.";
    }
  });
});
