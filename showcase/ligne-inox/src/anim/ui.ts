import { gsap } from 'gsap';
import { lockScroll } from '../scroll';
import { pointer } from '../pointer';

/** Dot + lagging ring; the ring grows and shows a label over [data-cursor] targets. */
export function initCursor() {
  if (matchMedia('(pointer: coarse)').matches) return;
  const cursor = document.querySelector<HTMLElement>('.cursor')!;
  const ring = cursor.querySelector<HTMLElement>('.cursor__ring')!;
  const dot = cursor.querySelector<HTMLElement>('.cursor__dot')!;
  const label = cursor.querySelector<HTMLElement>('.cursor__label')!;
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.55, ease: 'power3.out' });
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.55, ease: 'power3.out' });
  const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' });
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' });

  addEventListener('pointermove', () => {
    cursor.classList.add('is-on');
    ringX(pointer.x);
    ringY(pointer.y);
    dotX(pointer.x);
    dotY(pointer.y);
  });
  document.documentElement.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));

  const sync = (el: Element | null) => {
    const target = el?.closest<HTMLElement>('[data-cursor], a, button');
    cursor.classList.toggle('is-link', !!target && !target.dataset.cursor);
    cursor.classList.toggle('is-label', !!target?.dataset.cursor);
    if (target?.dataset.cursor) label.textContent = target.dataset.cursor;
  };
  document.addEventListener('pointerover', (e) => sync(e.target as Element));
  // Content moves under a still pointer while scrolling (or after a page swap), which fires no pointerover.
  const resync = () => pointer.active && sync(document.elementFromPoint(pointer.x, pointer.y));
  addEventListener('scroll', resync, { passive: true });
  addEventListener('page:mounted', resync);
}

/** Elements drift toward the pointer, and their inner text drifts a little further. */
export function initMagnetic(root: ParentNode) {
  if (matchMedia('(pointer: coarse)').matches) return;
  root.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    const y = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    const inner = el.firstElementChild as HTMLElement | null;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - r.left - r.width / 2;
      const dy = e.clientY - r.top - r.height / 2;
      x(dx * 0.3);
      y(dy * 0.3);
      if (inner) gsap.to(inner, { x: dx * 0.15, y: dy * 0.15, duration: 0.6, ease: 'power3.out' });
    });
    el.addEventListener('pointerleave', () => {
      x(0);
      y(0);
      if (inner) gsap.to(inner, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

export type Menu = { close: () => Promise<void>; isOpen: () => boolean };

/** Full-screen menu for narrow screens. Its links are rewritten on each page, so they are queried on open. */
export function initMenu(motion: boolean): Menu {
  const btn = document.querySelector<HTMLButtonElement>('.nav__menu')!;
  const menu = document.querySelector<HTMLElement>('.menu')!;
  let open = false;
  let tl: gsap.core.Timeline | null = null;

  const build = () =>
    gsap
      .timeline({ paused: true, defaults: { ease: 'expo.inOut' } })
      .set(menu, { visibility: 'visible' })
      .fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: motion ? 1 : 0.01 })
      .from(menu.querySelectorAll('.menu__label'), { yPercent: 110, duration: motion ? 1 : 0.01, stagger: 0.06, ease: 'expo.out' }, '-=0.45')
      .from(menu.querySelector('.menu__foot'), { autoAlpha: 0, duration: 0.5 }, '-=0.6');

  const toggle = (state = !open) => {
    open = state;
    btn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    lockScroll(open);
    if (open) {
      tl?.kill();
      gsap.set(menu, { clearProps: 'all' });
      tl = build();
      tl.play();
    } else tl?.timeScale(1.6).reverse();
    return tl;
  };
  btn.addEventListener('click', () => toggle());
  addEventListener('keydown', (e) => e.key === 'Escape' && open && toggle(false));

  return {
    isOpen: () => open,
    close: () =>
      new Promise<void>((resolve) => {
        if (!open) return resolve();
        const t = toggle(false);
        if (t) t.eventCallback('onReverseComplete', () => resolve());
        else resolve();
      }),
  };
}
