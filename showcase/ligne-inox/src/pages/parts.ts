import { BASE, BRAND, contact, copy } from '../content';

export type PageId = 'home' | 'about' | 'services' | 'contact';

export const paths: Record<PageId, string> = { home: BASE, about: `${BASE}a-propos/`, services: `${BASE}services/`, contact: `${BASE}contact/` };
export const order: PageId[] = ['home', 'about', 'services', 'contact'];

const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
export const esc = (s: string) => s.replace(/[&<>"]/g, (c) => entities[c]);
export const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Ligne Inox mark: a steel plate crossed by the red "marche en avant" line, which ends in a dot,
 * the same line that runs through the kitchen plan. `word` adds the name beside it.
 */
export function logo(className = 'logo', word = false) {
  return `<span class="${className}" aria-hidden="true">
    <svg class="logo__mark" viewBox="0 0 40 28" focusable="false">
      <rect class="logo__plate" x="1" y="1" width="38" height="26" rx="3" pathLength="1"/>
      <path class="logo__flow" d="M1 9H29a5 5 0 0 1 0 10H11" pathLength="1"/>
      <circle class="logo__dot" cx="9" cy="19" r="2.6"/>
    </svg>${word ? '<span class="logo__word">Ligne <em>Inox</em></span>' : ''}
  </span>`;
}

const icon = (body: string) => `<svg class="icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">${body}</svg>`;
const p = (d: string) => `<path pathLength="1" d="${d}"/>`;

/** Line icons for the four missions and the sectors; drawn on with stroke-dashoffset. */
export const icons: Record<string, string> = {
  besoins: icon(p('M13 8h22v34H13z') + p('M19 5h10v6H19z') + p('M18 20l2.5 2.5L25 18M18 29l2.5 2.5L25 27M28 21h3M28 30h3')),
  plans: icon(p('M6 8h36v32H6z') + p('M6 24h14M28 24h14M24 8v7M24 33v7') + p('M10 16h28v16H11') + p('M15 28l-4 4 4 4')),
  prestataire: icon(p('M24 7v34M14 41h20M10 13h28') + p('M10 13L4 27h12zM38 13l-6 14h12z')),
  reception: icon(p('M6 16l18-8 18 8v20l-18 8-18-8z') + p('M6 16l18 8 18-8M24 24v20') + p('M17 31l4 4 8-8')),
  combi: icon(p('M7 9h34v30H7z') + p('M12 14h18v20H12z') + p('M35.5 16v.5M35.5 22v.5') + p('M10 42v-3M38 42v-3')),
  range: icon(p('M5 14h38v26H5z') + p('M5 22h38') + p('M15 18a3 3 0 1 1 0 .1M33 18a3 3 0 1 1 0 .1') + p('M14 6c-2 2 2 4 0 6M24 5c-2 2 2 4 0 6M34 6c-2 2 2 4 0 6')),
  tray: icon(p('M6 34h36M4 38h40') + p('M9 34a15 15 0 0 1 30 0') + p('M24 19v-4M21 15h6')),
  pot: icon(p('M9 18h30v18a6 6 0 0 1-6 6H15a6 6 0 0 1-6-6z') + p('M4 22h5M39 22h5M9 18l3-4h24l3 4') + p('M20 9c-2-2 2-3 0-5M28 9c-2-2 2-3 0-5')),
  cup: icon(p('M9 18h24v10a10 10 0 0 1-10 10h-4A10 10 0 0 1 9 28z') + p('M33 21h3a4 4 0 0 1 0 8h-4') + p('M6 42h30M17 13c-2-2 2-3 0-6M24 13c-2-2 2-3 0-6')),
  mixer: icon(p('M10 40h28M14 40V30h20v10') + p('M14 30l-2-14h24l-2 14') + p('M30 16V7H16v4M30 7h4v9')),
  oven: icon(p('M5 40V22a19 19 0 0 1 38 0v18z') + p('M13 40V27a11 11 0 0 1 22 0v13') + p('M2 40h44')),
};

/**
 * A photo in a masked frame: it is revealed by a clip-path wipe when it enters, and drifts inside
 * its frame with the scroll (Locomotive data-scroll-speed). `reveal="scrub"` opens with the scroll instead.
 */
export function media(name: string, alt: string, cls = '', opts: { speed?: number; reveal?: 'once' | 'scrub'; pos?: string } = {}) {
  const { speed = 0.05, reveal = 'once', pos = '50% 50%' } = opts;
  return `<figure class="media ${cls}" data-media="${reveal}">
    <img src="${BASE}images/${name}.webp" alt="${esc(alt)}" decoding="async" style="object-position:${pos}" data-scroll data-scroll-speed="${speed}" />
  </figure>`;
}

/** Big closing link to the next page. */
export function nextBlock(label: string, target: PageId) {
  return `
  <section class="next" data-theme="steel">
    <a class="next__link" href="${paths[target]}" data-link data-cursor="${esc(copy.common.next)}">
      <span class="mono next__label">${esc(label)}</span>
      <span class="next__title"><span>${esc(copy.nav[target])}</span><i aria-hidden="true">→</i></span>
    </a>
  </section>`;
}

/** The footer is revealed from under the last section, like a drawer. */
export function footer() {
  const year = new Date().getFullYear();
  return `
  <div class="footer-wrap" data-theme="steel">
    <footer class="footer">
      <div class="footer__top">
        <p class="footer__claim">Une cuisine bien pensée <em>ne revient jamais en arrière.</em></p>
        <div class="footer__contact">
          <a class="footer__big" href="mailto:${contact.email}" data-cursor="${esc(copy.common.write)}">${contact.email}</a>
          <a class="footer__big" href="tel:${contact.phoneIntl}" data-cursor="${esc(copy.common.call)}">${contact.phoneDisplay}</a>
          <p class="footer__small mono">${esc(contact.address)}</p>
        </div>
      </div>
      <div class="footer__mark">${logo('logo logo--giant', true)}</div>
      <div class="footer__row mono">
        <p>${esc(copy.common.tagline)}</p>
        <nav class="footer__nav" aria-label="Pied de page">
          ${order.map((pg) => `<a href="${paths[pg]}" data-link>${esc(copy.nav[pg])}</a>`).join('')}
        </nav>
        <p>© ${year} ${BRAND} · ${esc(copy.common.rights)}</p>
      </div>
    </footer>
  </div>`;
}

/** Title lines: each array item is a masked line; `*x*` is the serif accent. */
export const titleLines = (lines: string[], rich: (s: string) => string, cls = 'title__line') =>
  // A real space between the lines: they are blocks visually, but the text must read as words.
  lines.map((l) => `<span class="${cls}"><span>${rich(l)}</span></span>`).join(' ');
