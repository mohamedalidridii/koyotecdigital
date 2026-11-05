import { copy, fields, missions, rich, sectors, zones } from '../content';
import { svgPlan } from '../gl/svgPlan';
import { esc, footer, icons, paths, titleLines } from './parts';

const h = copy.home;
const iconFor = ['besoins', 'plans', 'prestataire', 'reception'];

export function home() {
  const marquee = [...sectors, ...sectors].map((s) => `<span>${esc(s)}</span><i aria-hidden="true"></i>`).join('');
  return `
  <section class="hero page-hero" data-theme="steel" data-gl="hero">
    <p class="hero__corner hero__corner--tl mono"><span class="dot"></span>${esc(h.eyebrow)}</p>
    <p class="hero__corner hero__corner--tr mono">Cuisines professionnelles<br/>&amp; buanderies</p>
    <h1 class="hero__title">${titleLines(h.title, rich, 'hero__line')}</h1>
    <div class="hero__dim" aria-hidden="true"><i></i><span class="mono">± 0,00 mm</span><i></i></div>
    <div class="hero__bottom">
      <p class="hero__lead" data-scroll data-scroll-speed="0.06">${esc(h.lead)}</p>
      <a class="hero__scroll mono" href="#flow" data-goto="#flow" data-cursor="${esc(copy.common.scroll)}"><span>${esc(copy.common.scroll)}</span><i aria-hidden="true"></i></a>
    </div>
  </section>

  <section class="marquee" data-theme="steel" data-gl="hero" aria-label="Secteurs">
    <div class="marquee__inner mono">${marquee}</div>
  </section>

  <section class="flow" id="flow" data-theme="steel" data-gl="flow">
    <div class="flow__pin">
      <header class="flow__head">
        <p class="eyebrow mono">${esc(h.flowEyebrow)}</p>
        <h2 class="flow__title">${rich(h.flowTitle)}</h2>
        <p class="flow__lead">${esc(h.flowLead)}</p>
      </header>
      <ol class="flow__zones">
        ${zones
          .map(
            (z, i) => `
          <li class="flow__zone" data-zone="${i}">
            <p class="mono flow__code"><span>${z.code}</span> / 06</p>
            <h3 class="flow__name">${esc(z.name)}</h3>
            <p class="flow__text">${esc(z.text)}</p>
          </li>`,
          )
          .join('')}
      </ol>
      <div class="flow__rail mono" aria-hidden="true">
        <span class="flow__rail-track"><span class="flow__rail-fill"></span></span>
        ${zones.map((z, i) => `<span class="flow__tick" data-zone="${i}">${z.code}</span>`).join('')}
      </div>
      <div class="flow__svg">${svgPlan()}</div>
    </div>
  </section>

  <section class="mission" data-theme="steel" data-gl="mission">
    <div class="mission__pin">
      <header class="mission__head">
        <p class="eyebrow mono">${esc(h.missionEyebrow)}</p>
        <h2 class="mission__title" data-split>${rich(h.missionTitle)}</h2>
        <p class="mission__hint mono" aria-hidden="true">01 — 04 →</p>
      </header>
      <div class="mission__track">
        ${missions
          .map(
            (m, i) => `
          <article class="mcard" data-scroll data-scroll-offset="10%,0">
            <div class="mcard__top"><span class="mcard__n">${m.n}</span><span class="mcard__icon">${icons[iconFor[i]]}</span></div>
            <div class="mcard__body">
              <p class="mono mcard__short">${esc(m.short)}</p>
              <h3 class="mcard__title">${esc(m.title)}</h3>
              <p class="mcard__text">${esc(m.text)}</p>
            </div>
            <a class="mcard__link mono" href="${paths.services}#m-${m.n}" data-link>Détail <i aria-hidden="true">→</i></a>
          </article>`,
          )
          .join('')}
      </div>
    </div>
  </section>

  <section class="fields" data-theme="inox" data-gl="light">
    <header class="fields__head">
      <p class="eyebrow mono">${esc(h.fieldsEyebrow)}</p>
      <h2 class="fields__title" data-split>${rich(h.fieldsTitle)}</h2>
    </header>
    <div class="fields__grid">
      ${fields
        .map(
          (f, i) => `
        <article class="field" data-reveal>
          <p class="mono field__n">0${i + 1} — ${f.id === 'cuisine' ? 'K' : 'L'}</p>
          <h3 class="field__title">${esc(f.title)}</h3>
          <p class="field__text">${esc(f.text)}</p>
          <ol class="field__flow mono">${f.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>
        </article>`,
        )
        .join('')}
    </div>
  </section>

  <section class="cta" data-theme="steel" data-gl="cta">
    <a class="cta__link" href="${paths.contact}" data-link data-cursor="${esc(copy.common.write)}">
      <span class="cta__title" data-split>${h.ctaTitle.map((l) => rich(l)).join('<br/>')}</span>
      <span class="cta__btn" data-magnetic><span>${esc(h.ctaLabel)} <i aria-hidden="true">→</i></span></span>
    </a>
  </section>
  ${footer()}`;
}
