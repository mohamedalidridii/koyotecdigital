import { copy, expertise, missions, process, rich, sectorDetails } from '../content';
import { svgPlan } from '../gl/svgPlan';
import { esc, footer, icons, nextBlock, pad, titleLines } from './parts';

const s = copy.services;
const iconFor = ['besoins', 'plans', 'prestataire', 'reception'];

export function services() {
  return `
  <section class="page-hero page-hero--services" data-theme="steel" data-gl="svc-hero">
    <p class="eyebrow mono">${esc(s.eyebrow)}</p>
    <h1 class="page-hero__title">${titleLines(s.title, rich)}</h1>
    <div class="page-hero__foot">
      <p class="page-hero__lead" data-reveal>${esc(s.lead)}</p>
      <ol class="svc-index mono" data-reveal>
        ${missions.map((m) => `<li><a href="#m-${m.n}" data-goto="#m-${m.n}"><span>${m.n}</span>${esc(m.short)}</a></li>`).join('')}
      </ol>
    </div>
  </section>

  <section class="stack" data-theme="steel">
    ${missions
      .map(
        (m, i) => `
      <article class="scard" id="m-${m.n}" data-gl="m${i}">
        <div class="scard__panel">
          <div class="scard__top">
            <span class="scard__n">${m.n}</span>
            <span class="mono scard__of">Mission ${m.n} / 04</span>
          </div>
          <h2 class="scard__title">${esc(m.title)}</h2>
          <p class="scard__text">${esc(m.text)}</p>
          <ul class="scard__points">${m.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
          <span class="scard__icon">${icons[iconFor[i]]}</span>
        </div>
        <div class="scard__window" aria-hidden="true"><i></i><i></i><i></i><i></i><span class="mono">${m.zone >= 0 ? `Z-0${m.zone + 1}` : 'Plan général'}</span></div>
      </article>`,
      )
      .join('')}
  </section>

  <section class="exp" data-theme="steel" data-gl="process">
    <div class="exp__text">
      <p class="eyebrow mono">${esc(s.expEyebrow)}</p>
      <h2 class="section-title" data-split>${rich(s.expTitle)}</h2>
      <p class="exp__lead" data-reveal>${esc(s.expLead)}</p>
      <ol class="exp__list">
        ${expertise.map((x, i) => `<li class="exp__item" data-reveal><span class="mono">${pad(i + 1)}</span><span>${esc(x)}</span></li>`).join('')}
      </ol>
    </div>
    <div class="exp__visual">
      <figure class="exp__plan exp__plan--svg" data-reveal>${svgPlan()}</figure>
      <p class="mono exp__caption">${esc(s.planCaption)}</p>
    </div>
  </section>

  <section class="for" data-theme="inox" data-gl="light">
    <header class="section-head">
      <p class="eyebrow mono">${esc(s.forEyebrow)}</p>
      <h2 class="section-title" data-split>${rich(s.forTitle)}</h2>
    </header>
    <ul class="for__list">
      ${sectorDetails
        .map(
          (d, i) => `
        <li class="for__row" data-reveal data-icon="${d.icon}">
          <span class="mono for__n">${pad(i + 1)}</span>
          <span class="for__name">${esc(d.name)}</span>
          <span class="for__meta"><span class="mono for__note">${esc(d.note)}</span><span class="for__text">${esc(d.text)}</span></span>
          <span class="for__icon">${icons[d.icon]}</span>
        </li>`,
        )
        .join('')}
    </ul>
    <div class="for__preview" aria-hidden="true">${sectorDetails.map((d) => `<span data-icon="${d.icon}">${icons[d.icon]}</span>`).join('')}</div>
  </section>

  <section class="process" data-theme="steel" data-gl="process">
    <header class="section-head">
      <p class="eyebrow mono">${esc(s.processEyebrow)}</p>
      <h2 class="section-title" data-split>${rich(s.processTitle)}</h2>
    </header>
    <div class="process__body">
    <span class="process__line" aria-hidden="true"><span></span></span>
    <ol class="process__list">
      ${process
        .map(
          (p, i) => `
        <li class="step" data-reveal>
          <span class="step__node" aria-hidden="true"></span>
          <span class="mono step__n">Étape ${pad(i + 1)}</span>
          <h3 class="step__t">${esc(p.t)}</h3>
          <p class="step__d">${esc(p.d)}</p>
        </li>`,
        )
        .join('')}
    </ol>
    </div>
  </section>

  ${nextBlock('Parlons de votre projet', 'contact')}
  ${footer()}`;
}
