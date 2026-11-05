import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { missions } from '../content';
import type { GL, Params } from '../gl/Canvas';
import { PLAN_H, PLAN_W, zoneAt, zoneRects } from '../gl/layout';
import type { PageId } from '../pages/parts';
import { pointer } from '../pointer';
import { velocity } from '../scroll';
import { initForm } from './form';
import { initIcons, initMedia, initReveals, initScrub, initTextReveals, initThemes } from './text';
import { initMagnetic } from './ui';

gsap.registerPlugin(ScrollTrigger, SplitText);

const desktop = '(min-width: 901px) and (pointer: fine)';
const wide = () => matchMedia('(min-width: 901px)').matches;

export type Scene = { intro: gsap.core.Timeline; cleanup?: () => void };

// ---------------------------------------------------------------------------------------------
// WebGL states: each [data-gl] section names how the steel and the plan should look while it is
// in the middle of the screen. Framing is recomputed on every call, so it follows the viewport.
// ---------------------------------------------------------------------------------------------
type State = Partial<Params>;
const off: State = { plan: 0, dim: 0, grid: 0, heat: 0, pulse: 0, zoneMix: 0, steam: 0, ripple: 1, flowOpacity: 0 };
const whole = () => ({ fx: PLAN_W / 2, fy: PLAN_H / 2 });

function states(): Record<string, State> {
  const w = wide();
  const s: Record<string, State> = {
    hero: { ...off },
    flow: { plan: 1, dim: 0.76, grid: 1, flowOpacity: 1, zoneMix: 1, steam: 1, ripple: 0.4, pulse: 0, heat: 0, ...whole(), x: w ? 0.27 : 0, y: w ? -0.04 : 0.3, zoom: w ? 0.86 : 1.22, tilt: w ? 0.42 : 0.2 },
    mission: { ...off, dim: 0.5, grid: 0.35 },
    founder: { ...off, dim: 0.62, grid: 0.15 },
    light: { ...off },
    cta: { ...off, dim: 0.08, heat: 1 },
    'about-hero': { ...off, dim: 0.04 },
    'about-dim': { ...off, dim: 0.52, grid: 0.25 },
    'svc-hero': { ...off, plan: 0.8, dim: 0.58, grid: 0.6, flow: 0, zoneMix: 0, ...whole(), x: w ? 0.5 : 0, y: w ? 0.3 : 0.3, zoom: w ? 0.5 : 0.95, tilt: 0.55 },
    process: { ...off, dim: 0.42, grid: 0.2 },
    'contact-hero': { ...off, plan: 0.75, dim: 0.6, grid: 0.5, flowOpacity: 1, pulse: 1, steam: 1, ...whole(), x: w ? 0.5 : 0, y: w ? 0.28 : 0.3, zoom: w ? 0.52 : 0.95, tilt: 0.5 },
  };
  missions.forEach((m, i) => {
    const z = zoneRects[m.zone];
    s[`m${i}`] = z
      ? { ...off, plan: 1, dim: 0.72, grid: 0.8, zone: m.zone, zoneMix: 1, flow: 0, steam: m.zone === 3 ? 1 : 0, fx: z.x + z.w / 2, fy: z.y + z.h / 2, x: w ? 0.5 : 0, y: w ? -0.02 : -0.48, zoom: w ? 1.9 : 1.6, tilt: 0.3 }
      : { ...off, plan: 1, dim: 0.72, grid: 0.8, zoneMix: 0, flow: 1, flowOpacity: 1, steam: 1, ...whole(), x: w ? 0.5 : 0, y: w ? -0.04 : -0.48, zoom: w ? 0.58 : 0.8, tilt: 0.4 };
  });
  return s;
}

function initGlStates(root: HTMLElement, gl: GL) {
  root.querySelectorAll<HTMLElement>('[data-gl]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => self.isActive && gl.to(states()[el.dataset.gl!] ?? off, 1.8, 'power3.inOut'),
    });
  });
}

/** Set the first section's look instantly (hidden behind the preloader or the curtain). */
function primeGl(root: HTMLElement, gl: GL) {
  const first = root.querySelector<HTMLElement>('[data-gl]')?.dataset.gl ?? 'hero';
  gl.set({ ...states()[first], draw: 0, flow: 0, zone: -1 });
  return first;
}

// ---------------------------------------------------------------------------------------------

/** Builds every scroll scene for a freshly rendered page. Must run inside a gsap.context. */
export function initPage(page: PageId, root: HTMLElement, gl: GL | null, motion: boolean): Scene {
  initMagnetic(root);
  initGoto(root);
  if (page === 'contact') initForm(root);

  if (!motion) {
    initThemes(root, gl);
    root.classList.add('is-static');
    root.querySelectorAll('.icon').forEach((el) => el.classList.add('is-drawn'));
    return { intro: gsap.timeline() };
  }

  const cleanups: (() => void)[] = [];
  const first = gl ? primeGl(root, gl) : 'hero';

  // Pinned scenes first, so later triggers measure positions with the pin spacing in place.
  if (page === 'home') {
    initFlow(root, gl);
    initTrack(root, '.mission', '.mission__pin', '.mission__track', '.mcard');
    cleanups.push(initMarquee(root));
  }
  if (page === 'services') {
    initStack(root);
    cleanups.push(initPreview(root));
    initProcess(root);
  }
  if (page === 'about') {
    initTrack(root, '.events', '.events__pin', '.events__track', '.evt');
    initSpec(root);
  }

  initThemes(root, gl);
  if (gl) initGlStates(root, gl);
  initTextReveals(root);
  initScrub(root);
  initReveals(root);
  initMedia(root);
  cleanups.push(initIcons(root));

  const intro = page === 'home' ? homeIntro(root, gl) : pageIntro(root, gl, first);
  if (page === 'home') initHeroScroll(root);
  return { intro, cleanup: () => cleanups.forEach((c) => c()) };
}

/** Anchors inside the page scroll smoothly instead of jumping. */
function initGoto(root: HTMLElement) {
  root.querySelectorAll<HTMLAnchorElement>('[data-goto]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      dispatchEvent(new CustomEvent('goto', { detail: a.dataset.goto }));
    }),
  );
}

// --- Intros ----------------------------------------------------------------------------------

function glIntro(tl: gsap.core.Timeline, gl: GL | null, first: string) {
  if (!gl) return;
  if (gl.params.intro < 1) tl.add(gl.to({ intro: 1 }, 2.8, 'power2.inOut'), 0);
  // Pages that open on the plan draw it in.
  if (first === 'svc-hero' || first === 'contact-hero') tl.add(gl.to({ draw: 1 }, 3.2, 'power2.inOut'), 0.2);
  if (first === 'contact-hero') tl.add(gl.to({ flow: 1 }, 2.6, 'power2.inOut'), 1.6);
}

function homeIntro(root: HTMLElement, gl: GL | null) {
  const lines = root.querySelectorAll<HTMLElement>('.hero__line > span');
  const split = SplitText.create(lines, { type: 'words,chars', charsClass: 'char' });
  const tl = gsap.timeline({ paused: true });
  glIntro(tl, gl, 'hero');
  tl.from(split.chars, { yPercent: 118, rotate: 6, duration: 1.5, stagger: 0.022, ease: 'expo.out' }, 0.3)
    .from('.hero__dim', { scaleX: 0, duration: 1.6, ease: 'expo.inOut' }, 0.6)
    .from('.hero__dim span', { autoAlpha: 0, duration: 0.6 }, 1.6)
    .from('.hero__corner, .hero__bottom > *', { y: 24, autoAlpha: 0, duration: 1.2, stagger: 0.08, ease: 'expo.out' }, 1);
  return tl;
}

/** Inner pages: title lines rise, the rest of the hero fades up. */
function pageIntro(root: HTMLElement, gl: GL | null, first: string) {
  const lines = root.querySelectorAll<HTMLElement>('.page-hero .title__line > span');
  const tl = gsap.timeline({ paused: true });
  glIntro(tl, gl, first);
  tl.from(lines, { yPercent: 115, rotate: 2.5, duration: 1.5, stagger: 0.1, ease: 'expo.out' }, 0.15).from(
    root.querySelectorAll('.page-hero .eyebrow, .page-hero [data-reveal]'),
    { y: 30, autoAlpha: 0, duration: 1.2, stagger: 0.1, ease: 'expo.out' },
    0.55,
  );
  return tl;
}

/** As the hero leaves, its three lines drift apart. */
function initHeroScroll(root: HTMLElement) {
  const hero = root.querySelector('.hero');
  if (!hero) return;
  gsap
    .timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
    .to('.hero__line:nth-child(1)', { xPercent: -7, ease: 'none' }, 0)
    .to('.hero__line:nth-child(2)', { xPercent: 5, ease: 'none' }, 0)
    .to('.hero__line:nth-child(3)', { xPercent: -3, ease: 'none' }, 0)
    .to('.hero__dim, .hero__corner', { autoAlpha: 0, ease: 'none' }, 0);
}

// --- Home ------------------------------------------------------------------------------------

/**
 * La marche en avant: the section pins, the plan draws itself, then the red flow crosses the six
 * zones in order. The caption on the left follows the zone the flow is in.
 */
function initFlow(root: HTMLElement, gl: GL | null) {
  const section = root.querySelector<HTMLElement>('.flow');
  if (!section) return;
  const captions = [...section.querySelectorAll<HTMLElement>('.flow__zone')];
  const ticks = [...section.querySelectorAll<HTMLElement>('.flow__tick')];
  const fill = section.querySelector<HTMLElement>('.flow__rail-fill')!;
  const svgFlow = section.querySelector<SVGPathElement>('.svg-plan__flow');
  gsap.set(captions, { autoAlpha: 0, y: 30 });
  let current = -2;

  const show = (z: number) => {
    if (z === current) return;
    const prev = captions[current];
    const dir = z > current ? 1 : -1;
    current = z;
    if (prev) gsap.to(prev, { autoAlpha: 0, y: -30 * dir, duration: 0.5, ease: 'power3.in', overwrite: true });
    const next = captions[z];
    if (next) {
      gsap.fromTo(next, { autoAlpha: 0, y: 40 * dir }, { autoAlpha: 1, y: 0, duration: 0.9, delay: prev ? 0.25 : 0, ease: 'expo.out', overwrite: true });
      gsap.fromTo(next.querySelector('.flow__name'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.1, delay: prev ? 0.3 : 0.05, ease: 'expo.inOut' });
    }
    ticks.forEach((t, i) => {
      t.classList.toggle('is-active', i === z);
      t.classList.toggle('is-past', i < z);
    });
  };

  const o = { p: 0 };
  const DRAW = 0.2;
  const update = () => {
    const draw = gsap.utils.clamp(0, 1, o.p / DRAW);
    const flow = gsap.utils.clamp(0, 1, (o.p - DRAW) / (0.97 - DRAW));
    const z = zoneAt(flow);
    if (gl) {
      gl.params.draw = draw;
      gl.params.flow = flow;
      if (z >= 0) gl.params.zone = z;
    }
    if (svgFlow) svgFlow.style.strokeDashoffset = String(1 - flow);
    fill.style.transform = `scaleX(${flow})`;
    show(z);
  };

  gsap.to(o, {
    p: 1,
    ease: 'none',
    onUpdate: update,
    scrollTrigger: {
      trigger: section,
      pin: '.flow__pin',
      start: 'top top',
      end: () => `+=${innerHeight * (wide() ? 4.2 : 3.4)}`,
      scrub: 0.9,
      invalidateOnRefresh: true,
    },
  });
  update();
}

/** Desktop: cards slide sideways inside a pinned frame (missions on home, events on À propos). */
function initTrack(root: HTMLElement, sectionSel: string, pinSel: string, trackSel: string, cardSel: string) {
  const mm = gsap.matchMedia();
  mm.add(desktop, () => {
    const section = root.querySelector<HTMLElement>(sectionSel);
    const track = root.querySelector<HTMLElement>(trackSel);
    if (!section || !track) return;
    const distance = () => Math.max(0, track.scrollWidth - track.clientWidth);
    const cards = track.querySelectorAll<HTMLElement>(cardSel);
    gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        pin: section.querySelector(pinSel),
        start: 'top top',
        end: () => `+=${distance()}`,
        scrub: 0.9,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          // Cards lean into the motion.
          const skew = gsap.utils.clamp(-6, 6, self.getVelocity() / -400);
          gsap.to(cards, { skewX: skew, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
        },
      },
    });
  });
}

/** One sectors row; scroll speed pushes it faster and skews the type. */
function initMarquee(root: HTMLElement) {
  const row = root.querySelector<HTMLElement>('.marquee__inner');
  if (!row) return () => {};
  let x = 0;
  let skew = 0;
  const tick = (_: number, delta: number) => {
    const v = velocity();
    const boost = 1 + Math.min(Math.abs(v) * 0.2, 6);
    skew += (gsap.utils.clamp(-12, 12, -v * 0.5) - skew) * 0.1;
    x = gsap.utils.wrap(-50, 0, x - boost * delta * 0.0028 * (v < -0.5 ? -1 : 1));
    row.style.transform = `translate3d(${x}%, 0, 0) skewX(${skew}deg)`;
  };
  gsap.ticker.add(tick);
  return () => gsap.ticker.remove(tick);
}

// --- Services --------------------------------------------------------------------------------

/** Sticky stacked cards: each one steps back as the next slides over it. */
function initStack(root: HTMLElement) {
  const cards = [...root.querySelectorAll<HTMLElement>('.scard')];
  cards.forEach((card, i) => {
    const next = cards[i + 1];
    const panel = card.querySelector<HTMLElement>('.scard__panel')!;
    gsap.from(panel.querySelectorAll('.scard__title, .scard__text, .scard__points li'), {
      y: 40,
      autoAlpha: 0,
      duration: 1.1,
      stagger: 0.06,
      ease: 'expo.out',
      scrollTrigger: { trigger: card, start: 'top 60%', once: true },
    });
    if (!next) return;
    gsap
      .timeline({ scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true } })
      .to(panel, { scale: 0.9, yPercent: -3, autoAlpha: 0, ease: 'power1.in' }, 0)
      .to(card.querySelector('.scard__window'), { autoAlpha: 0, ease: 'none', duration: 0.4 }, 0);
  });
}

/** "Pour qui": a line icon follows the pointer over the hovered sector. */
function initPreview(root: HTMLElement) {
  const box = root.querySelector<HTMLElement>('.for__preview');
  const list = root.querySelector<HTMLElement>('.for__list');
  if (!box || !list || matchMedia('(pointer: coarse)').matches) return () => {};
  const xTo = gsap.quickTo(box, 'x', { duration: 0.7, ease: 'power3.out' });
  const yTo = gsap.quickTo(box, 'y', { duration: 0.7, ease: 'power3.out' });
  const items = [...box.querySelectorAll<HTMLElement>('[data-icon]')];
  const move = () => {
    xTo(pointer.x);
    yTo(pointer.y);
  };
  const enter = (e: Event) => {
    const row = (e.target as Element).closest<HTMLElement>('.for__row');
    if (!row) return;
    items.forEach((it) => it.classList.toggle('is-on', it.dataset.icon === row.dataset.icon));
    box.classList.add('is-visible');
  };
  const leave = () => box.classList.remove('is-visible');
  gsap.set(box, { x: pointer.x, y: pointer.y });
  list.addEventListener('pointermove', move);
  list.addEventListener('pointerover', enter);
  list.addEventListener('pointerleave', leave);
  return () => {
    list.removeEventListener('pointermove', move);
    list.removeEventListener('pointerover', enter);
    list.removeEventListener('pointerleave', leave);
  };
}

/** A red line runs down the process; each step lights up as it passes. */
function initProcess(root: HTMLElement) {
  const body = root.querySelector<HTMLElement>('.process__body');
  if (!body) return;
  gsap.fromTo(
    body.querySelector('.process__line span'),
    { scaleY: 0 },
    { scaleY: 1, ease: 'none', scrollTrigger: { trigger: body, start: 'top 60%', end: 'bottom 60%', scrub: true } },
  );
  body.querySelectorAll<HTMLElement>('.step').forEach((step) =>
    ScrollTrigger.create({ trigger: step, start: 'top 60%', toggleClass: { targets: step, className: 'is-on' } }),
  );
}

// --- About -----------------------------------------------------------------------------------

/** The specification sheet writes itself, then gets its stamp. */
function initSpec(root: HTMLElement) {
  const doc = root.querySelector<HTMLElement>('.doc');
  if (!doc) return;
  const rows = doc.querySelectorAll<HTMLElement>('.doc__row');
  const tl = gsap.timeline({ scrollTrigger: { trigger: doc, start: 'top 72%', once: true } });
  tl.from(doc.querySelector('.doc__sheet'), { y: 60, rotate: -2, autoAlpha: 0, duration: 1.3, ease: 'expo.out' })
    .from(doc.querySelectorAll('.doc__head, .doc__title'), { autoAlpha: 0, y: 10, duration: 0.6, stagger: 0.1 }, '-=0.7');
  rows.forEach((r) => {
    tl.from(r.querySelector('.doc__k'), { clipPath: 'inset(0 100% 0 0)', duration: 0.35, ease: 'none' }, '-=0.05')
      .from(r.querySelector('.doc__dots'), { scaleX: 0, transformOrigin: 'left', duration: 0.25, ease: 'power2.out' })
      .from(r.querySelector('.doc__v'), { clipPath: 'inset(0 100% 0 0)', duration: 0.3, ease: 'none' });
  });
  tl.fromTo(doc.querySelector('.doc__stamp'), { scale: 2.4, rotate: -24, autoAlpha: 0 }, { scale: 1, rotate: -12, autoAlpha: 1, duration: 0.5, ease: 'back.out(2.5)' });
}
