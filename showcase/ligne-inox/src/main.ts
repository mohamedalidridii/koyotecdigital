import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import '@fontsource-variable/fraunces/wght-italic.css';
import '@fontsource-variable/fraunces/wght.css';
import './styles/base.css';
import './styles/pages.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initCursor, initMagnetic, initMenu } from './anim/ui';
import { GL } from './gl/Canvas';
import { Router } from './router';
import { initScroll, startScroll, velocity } from './scroll';
import { mountShell } from './shell';

gsap.registerPlugin(ScrollTrigger);

const motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = matchMedia('(max-width: 900px), (pointer: coarse)').matches;

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

// The intro always starts at the top; restoring a mid-page position would also make
// already-passed `once` triggers kill themselves inside ScrollTrigger's first refresh.
history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

mountShell();
// The static cover in the HTML hides the prerendered page until the animated preloader takes over.
document.querySelector('.boot-cover')?.remove();
initScroll(motion);

let gl: GL | null = null;
if (motion && webglAvailable()) {
  try {
    gl = new GL(document.querySelector<HTMLCanvasElement>('.webgl')!, mobile);
  } catch {
    gl = null;
  }
}
if (gl) {
  document.documentElement.classList.add('gl-ready');
  gsap.ticker.add((time) => gl!.render(time, velocity()));
} else {
  document.documentElement.classList.add('no-gl');
  document.querySelector('.webgl')?.remove();
}

initCursor();
initMagnetic(document.querySelector('.nav')!);
const router = new Router(gl, motion, initMenu(motion));

boot();

async function boot() {
  const pre = document.querySelector<HTMLElement>('.preloader')!;
  if (!motion) {
    await router.mount(router.page);
    pre.remove();
    document.body.classList.remove('is-loading');
    return;
  }

  const num = pre.querySelector<HTMLElement>('.preloader__num')!;
  const bar = pre.querySelector<HTMLElement>('.preloader__bar span')!;
  const words = pre.querySelectorAll<HTMLElement>('.preloader__words span');
  const strokes = pre.querySelectorAll<SVGElement>('.logo__plate, .logo__flow');

  // The mark draws itself like the plan: the steel plate, then the red flow line, then its head and the name.
  gsap
    .timeline({ delay: 0.2 })
    .fromTo(strokes, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.5, stagger: 0.45, ease: 'expo.inOut' })
    .from(pre.querySelector('.logo__dot'), { scale: 0, transformOrigin: 'center', duration: 0.7, ease: 'back.out(3)' }, 1.6)
    .from(pre.querySelector('.logo__word'), { clipPath: 'inset(0 100% 0 0)', x: -20, duration: 1.1, ease: 'expo.out' }, 1.5);
  gsap.set(words, { yPercent: 110 });
  const wordsTl = gsap.timeline({ repeat: -1, delay: 0.4 });
  words.forEach((w) => wordsTl.to(w, { yPercent: 0, duration: 0.5, ease: 'expo.out' }).to(w, { yPercent: -110, duration: 0.4, ease: 'expo.in' }, '+=0.22'));
  gsap.from('.preloader__tag, .preloader__count', { y: 20, autoAlpha: 0, duration: 1.2, stagger: 0.1, ease: 'expo.out' });

  // Progress blends real loading with a minimum, so the intro always breathes.
  const progress = { real: 0, shown: 0 };
  // The full intro once per visit; later page loads in the same session get a short one.
  let seen = false;
  try {
    seen = sessionStorage.getItem('li-intro') === '1';
    sessionStorage.setItem('li-intro', '1');
  } catch {
    // Storage blocked: always play the full intro.
  }
  const MIN = seen ? 0.9 : 2.6;
  const minTime = gsap.to({}, { duration: MIN });
  let parts = 0;
  const ready = router.mount(router.page, (l, total) => (parts = l / total)).then((r) => {
    progress.real = 1;
    return r;
  });
  const counter = (_: number, delta: number) => {
    const real = Math.max(progress.real, parts * 0.95);
    const target = Math.min(real, minTime.time() / MIN) * 100;
    progress.shown += (target - progress.shown) * Math.min(delta / 140, 1);
    num.textContent = String(Math.round(progress.shown)).padStart(3, '0');
    bar.style.transform = `scaleX(${progress.shown / 100})`;
  };
  gsap.ticker.add(counter);
  const { intro } = await ready;
  await new Promise<void>((resolve) => {
    const check = () => (progress.shown > 99.4 ? resolve() : requestAnimationFrame(check));
    check();
  });
  gsap.ticker.remove(counter);
  num.textContent = '100';

  gsap
    .timeline({
      onComplete: () => {
        wordsTl.kill();
        pre.remove();
        document.body.classList.remove('is-loading');
        startScroll();
        ScrollTrigger.refresh();
        // Direct links to a section (e.g. /services/#m-02) glide there once the intro is done.
        if (location.hash && document.querySelector(location.hash)) dispatchEvent(new CustomEvent('goto', { detail: location.hash }));
      },
    })
    .to('.preloader__mark, .preloader__words, .preloader__tag, .preloader__count, .preloader__bar', { yPercent: -40, autoAlpha: 0, duration: 0.8, stagger: 0.04, ease: 'expo.in' })
    .to(pre, { clipPath: 'inset(0 0 100% 0)', duration: 1.3, ease: 'expo.inOut' }, '-=0.2')
    .add(() => {
      intro.play();
    }, '-=0.95')
    .from('.nav > *', { y: -20, autoAlpha: 0, duration: 1, stagger: 0.06, ease: 'expo.out' }, '-=0.4');
}
