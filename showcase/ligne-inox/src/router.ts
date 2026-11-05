import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initPage, type Scene } from './anim/pages';
import type { Menu } from './anim/ui';
import { copy, seo } from './content';
import type { GL } from './gl/Canvas';
import { renders } from './pages';
import { order, pad, paths, type PageId } from './pages/parts';
import { jumpTo, scrollTo, swapScrollElements } from './scroll';
import { labelShell } from './shell';

export function pageFor(pathname: string): PageId {
  const p = pathname.replace(/index\.html$/, '').replace(/\/?$/, '/');
  return (Object.keys(paths) as PageId[]).find((k) => paths[k] === p) ?? 'home';
}

/**
 * Swaps <main> in place, so the WebGL canvas and the shell persist. A curtain hides each swap;
 * direct loads of any URL work without it.
 */
export class Router {
  page: PageId;
  private ctx: gsap.Context | null = null;
  private scene: Scene | null = null;
  private busy = false;
  private mounted = false;
  private main = document.querySelector<HTMLElement>('main')!;
  private curtain = document.querySelector<HTMLElement>('.curtain')!;

  constructor(
    private gl: GL | null,
    private motion: boolean,
    private menu: Menu,
  ) {
    this.page = pageFor(location.pathname);

    document.addEventListener('click', (e) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('a[data-link]');
      if (a && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
        e.preventDefault();
        const url = new URL(a.href);
        this.go(pageFor(url.pathname), url.hash);
      }
    });
    addEventListener('goto', (e) => scrollTo((e as CustomEvent<string>).detail));
    addEventListener('popstate', () => this.go(pageFor(location.pathname), location.hash, false));
  }

  /**
   * Renders the page and builds its scenes. Resolves with the (paused) intro timeline, wrapped:
   * a timeline is thenable, so returning it bare would make the promise wait for it to finish.
   */
  async mount(page: PageId, onProgress?: (l: number, total: number) => void) {
    this.page = page;
    this.main.dataset.page = page;
    this.main.innerHTML = renders[page]();
    if (this.mounted) swapScrollElements(this.main, 'add');
    this.mounted = true;
    document.title = seo[page].title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', seo[page].description);
    labelShell(page);

    // Pins and triggers measure the layout, so photos must be decoded first (frames have fixed ratios,
    // this mostly avoids a pop-in once the curtain lifts).
    const images = [...this.main.querySelectorAll('img')];
    let loaded = 0;
    await Promise.race([
      Promise.all(
        images.map((img) => {
          img.loading = 'eager';
          return img
            .decode()
            .catch(() => {})
            .then(() => onProgress?.(++loaded, images.length));
        }),
      ),
      new Promise((r) => setTimeout(r, 5000)),
    ]);
    onProgress?.(1, 1);
    await document.fonts.ready;
    this.ctx = gsap.context(() => {
      this.scene = initPage(page, this.main, this.gl, this.motion);
    }, this.main);
    ScrollTrigger.refresh();
    dispatchEvent(new Event('page:mounted'));
    return { intro: this.scene!.intro };
  }

  private unmount() {
    swapScrollElements(this.main, 'remove');
    this.scene?.cleanup?.();
    this.ctx?.revert();
    this.ctx = null;
    this.scene = null;
  }

  private cover(page: PageId) {
    this.curtain.querySelector('.curtain__label')!.textContent = copy.nav[page];
    this.curtain.querySelector('.curtain__code')!.textContent = `${pad(order.indexOf(page) + 1)} / ${pad(order.length)}`;
    if (!this.motion) return gsap.set(this.curtain, { visibility: 'visible', clipPath: 'inset(0% 0 0 0)' }).then();
    return gsap
      .timeline()
      .set(this.curtain, { visibility: 'visible' })
      .fromTo(this.curtain, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 0.95, ease: 'expo.inOut' })
      .fromTo('.curtain__line', { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 1, ease: 'expo.inOut' }, 0.3)
      .fromTo('.curtain__label, .curtain__code', { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.8, stagger: 0.06, ease: 'expo.out' }, 0.5)
      .then();
  }

  private uncover() {
    if (!this.motion) return gsap.set(this.curtain, { visibility: 'hidden' }).then();
    return gsap
      .timeline()
      .to('.curtain__line', { scaleX: 0, transformOrigin: 'right center', duration: 0.7, ease: 'expo.in' })
      .to('.curtain__label, .curtain__code', { yPercent: -60, autoAlpha: 0, duration: 0.5, ease: 'expo.in' }, 0)
      .to(this.curtain, { clipPath: 'inset(0 0 100% 0)', duration: 1.05, ease: 'expo.inOut' }, '-=0.2')
      .set(this.curtain, { visibility: 'hidden' })
      .then();
  }

  async go(page: PageId, hash = '', push = true) {
    if (this.busy) return;
    if (page === this.page) {
      await this.menu.close();
      if (push && hash) scrollTo(hash);
      else if (push) scrollTo(0);
      return;
    }
    this.busy = true;
    await this.menu.close();
    await this.cover(page);
    this.unmount();
    jumpTo(0);
    if (push) history.pushState(null, '', paths[page] + hash);
    const { intro } = await this.mount(page);
    if (hash) {
      const target = document.querySelector<HTMLElement>(hash);
      if (target) jumpTo(target.getBoundingClientRect().top + scrollY);
    }
    await this.uncover();
    intro.play();
    this.busy = false;
  }
}
