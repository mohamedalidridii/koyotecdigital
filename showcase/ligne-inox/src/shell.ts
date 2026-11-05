import { contact, copy, sectors } from './content';
import { esc, logo, order, pad, paths, type PageId } from './pages/parts';

/** Everything that survives page changes: injected once, the active page marked in place. */
export function mountShell() {
  document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <canvas class="webgl" aria-hidden="true"></canvas>
    <div class="plan-labels mono" aria-hidden="true"></div>
    <div class="grain" aria-hidden="true"></div>

    <div class="preloader" aria-hidden="true">
      <div class="preloader__mark">${logo('logo logo--loader', true)}</div>
      <div class="preloader__words">${sectors.map((w) => `<span>${esc(w)}</span>`).join('')}</div>
      <p class="preloader__tag mono">${esc(copy.common.tagline)}</p>
      <p class="preloader__count mono"><span class="preloader__label">Préchauffage</span><span class="preloader__num">000</span><sup>°</sup></p>
      <div class="preloader__bar"><span></span></div>
    </div>

    <div class="curtain" aria-hidden="true">
      <span class="curtain__line"></span>
      <p class="curtain__label"></p>
      <p class="curtain__code mono"></p>
    </div>

    <div class="cursor" aria-hidden="true"><span class="cursor__ring"><span class="cursor__label"></span></span><span class="cursor__dot"></span></div>

    <header class="nav">
      <a class="nav__logo" href="${paths.home}" data-link data-magnetic aria-label="Ligne Inox — accueil">${logo('logo logo--nav', true)}</a>
      <nav class="nav__links mono" aria-label="Navigation principale"></nav>
      <a class="nav__cta mono" href="${paths.contact}" data-link data-magnetic><span><i class="nav__cta-dot"></i>Démarrer un projet</span></a>
      <button class="nav__menu mono" aria-expanded="false" aria-controls="menu"><span class="nav__menu-label">${copy.nav.menu}</span><span class="nav__menu-icon"><i></i><i></i></span></button>
    </header>

    <nav class="menu" id="menu" aria-label="${copy.nav.menu}">
      <ul class="menu__list"></ul>
      <div class="menu__foot mono">
        <a href="mailto:${contact.email}">${contact.email}</a>
        <a href="tel:${contact.phoneIntl}">${contact.phoneDisplay}</a>
      </div>
    </nav>

    <a class="credit" href="https://www.koyotec.digital" target="_blank" rel="noopener" aria-label="Réalisé par KOYOTEC — art of difference">
      <span class="credit__text" aria-hidden="true">art of difference</span>
      <span class="credit__k" aria-hidden="true">K<i>.</i></span>
    </a>`,
  );
}

/** Writes the nav and menu links and marks the active page. */
export function labelShell(page: PageId) {
  document.querySelector('.nav__links')!.innerHTML = order
    .map(
      (p, i) =>
        `<a href="${paths[p]}" data-link${p === page ? ' aria-current="page"' : ''}><span class="nav__n">${pad(i + 1)}</span><span class="nav__t">${esc(copy.nav[p])}</span></a>`,
    )
    .join('');
  document.querySelector('.menu__list')!.innerHTML = order
    .map(
      (p, i) =>
        `<li><a class="menu__link" href="${paths[p]}" data-link${p === page ? ' aria-current="page"' : ''}><span class="mono">${pad(i + 1)}</span><span class="menu__label">${esc(copy.nav[p])}</span></a></li>`,
    )
    .join('');
  document.querySelector('.nav__cta')?.classList.toggle('is-hidden', page === 'contact');
}
