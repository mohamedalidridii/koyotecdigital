import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type { GL } from '../gl/Canvas';

gsap.registerPlugin(ScrollTrigger, SplitText);

type Theme = { bg: string; fg: string; muted: string; line: string; accent: string; light: number };
const themes: Record<string, Theme> = {
  steel: { bg: '#0d0e0f', fg: '#ecebe7', muted: 'rgba(236, 235, 231, 0.58)', line: 'rgba(236, 235, 231, 0.14)', accent: '#e2231a', light: 0 },
  inox: { bg: '#cfd0d0', fg: '#0d0e0f', muted: 'rgba(13, 14, 15, 0.62)', line: 'rgba(13, 14, 15, 0.16)', accent: '#c81d15', light: 1 },
};

/** The page colours and the steel sheet's finish shift as each [data-theme] section crosses mid-screen. */
export function initThemes(root: HTMLElement, gl: GL | null) {
  const apply = (name: string, duration = 1) => {
    const t = themes[name] ?? themes.steel;
    gsap.to(document.documentElement, { '--bg': t.bg, '--fg': t.fg, '--muted': t.muted, '--line': t.line, '--accent': t.accent, duration, ease: 'power2.out', overwrite: 'auto' });
    document.documentElement.dataset.theme = name;
    if (gl) {
      if (duration) gl.to({ light: t.light }, duration * 1.3, 'power2.inOut');
      else gl.set({ light: t.light });
    }
  };
  const sections = root.querySelectorAll<HTMLElement>('[data-theme]');
  sections.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => self.isActive && apply(el.dataset.theme!),
    });
  });
  apply(sections[0]?.dataset.theme ?? 'steel', 0);
}

/** Headings rise line by line from a mask the first time they enter. */
export function initTextReveals(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    if (el.closest('.page-hero')) return;
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'line',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 115,
          rotate: 2.5,
          duration: 1.4,
          stagger: 0.09,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        }),
    });
  });
}

/** The manifesto lights up word by word as it is scrolled through. */
export function initScrub(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-scrub]').forEach((el) => {
    SplitText.create(el, {
      type: 'words',
      wordsClass: 'word',
      autoSplit: true,
      onSplit: (self) =>
        gsap.fromTo(
          self.words,
          { opacity: 0.1, filter: 'blur(6px)' },
          {
            opacity: 1,
            filter: 'blur(0px)',
            stagger: 0.05,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 50%', scrub: true },
          },
        ),
    });
  });
}

/** Paragraphs, rows and cards fade up once. */
export function initReveals(root: HTMLElement) {
  const els = [...root.querySelectorAll<HTMLElement>('[data-reveal]')].filter((el) => !el.closest('.page-hero'));
  gsap.set(els, { autoAlpha: 0 });
  ScrollTrigger.batch(els, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.fromTo(batch, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.2, stagger: 0.07, ease: 'expo.out', overwrite: true }),
  });
}

/** Line icons draw themselves once they are on screen (including inside the sideways track). */
export function initIcons(root: HTMLElement) {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-drawn');
        io.unobserve(e.target);
      }),
    { threshold: 0.4 },
  );
  root.querySelectorAll('.icon').forEach((el) => io.observe(el));
  return () => io.disconnect();
}

/**
 * Photos: the frame wipes open and the picture settles from a slight zoom. The zoom uses the CSS
 * `scale` property (via --s) because Locomotive owns the img's `transform` for its parallax.
 */
export function initMedia(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-media]').forEach((el) => {
    const img = el.querySelector('img');
    if (el.dataset.media === 'scrub') {
      gsap
        .timeline({ scrollTrigger: { trigger: el, start: 'top 90%', end: 'center 55%', scrub: true } })
        .fromTo(el, { clipPath: 'inset(14% 18% 14% 18% round 2px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none' }, 0)
        .fromTo(img, { '--s': 1.35 }, { '--s': 1, ease: 'none' }, 0);
      return;
    }
    gsap
      .timeline({ scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
      .fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' }, 0)
      .fromTo(img, { '--s': 1.3 }, { '--s': 1, duration: 2, ease: 'expo.out' }, 0.2);
  });
}
