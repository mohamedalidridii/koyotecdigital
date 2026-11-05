import { contact as c, copy, rich } from '../content';
import { esc, footer, titleLines } from './parts';

const k = copy.contactPage;

const chips = (name: string, values: string[], type: 'radio' | 'checkbox' = 'radio') =>
  values
    .map(
      (v, i) =>
        `<label class="chip"><input type="${type}" name="${name}" value="${esc(v)}"${i === 0 && type === 'radio' && name === 'projet' ? ' checked' : ''}/><span>${esc(v)}</span></label>`,
    )
    .join('');

export function contactPage() {
  return `
  <section class="page-hero page-hero--contact" data-theme="steel" data-gl="contact-hero">
    <p class="eyebrow mono">${esc(k.eyebrow)}</p>
    <h1 class="page-hero__title">${titleLines(k.title, rich)}</h1>
    <div class="page-hero__foot">
      <p class="page-hero__lead" data-reveal>${esc(k.lead)}</p>
    </div>
  </section>

  <section class="channels" data-theme="steel" data-gl="about-dim">
    <div class="channel" data-reveal>
      <p class="mono channel__k">E-mail</p>
      <a class="channel__v" href="mailto:${c.email}" data-cursor="${esc(copy.common.write)}">${c.email}</a>
      <button class="channel__copy mono" type="button" data-copy="${c.email}">${esc(k.copy)}</button>
    </div>
    <div class="channel" data-reveal>
      <p class="mono channel__k">Téléphone</p>
      <a class="channel__v" href="tel:${c.phoneIntl}" data-cursor="${esc(copy.common.call)}">${c.phoneDisplay}</a>
    </div>
    <div class="channel" data-reveal>
      <p class="mono channel__k">Bureau</p>
      <p class="channel__v channel__v--small">${esc(c.address)}</p>
    </div>
    <p class="toast mono" role="status" aria-live="polite"></p>
  </section>

  <section class="form-sec" data-theme="inox" data-gl="light" id="formulaire">
    <header class="form-sec__head">
      <p class="eyebrow mono">Formulaire</p>
      <h2 class="section-title" data-split>${rich('Décrivez votre *projet.*')}</h2>
      <p class="form-sec__note" data-reveal>Quelques lignes suffisent : le type d’établissement, la nature du projet et vos coordonnées. Nous revenons vers vous rapidement.</p>
    </header>
    <form class="form" novalidate>
      <div class="form__grid">
        <label class="field-in" data-reveal><span class="mono">${esc(k.labels.name)} *</span><input name="nom" autocomplete="name" required /></label>
        <label class="field-in" data-reveal><span class="mono">${esc(k.labels.company)}</span><input name="etablissement" autocomplete="organization" /></label>
        <label class="field-in" data-reveal><span class="mono">${esc(k.labels.email)} *</span><input name="email" type="email" autocomplete="email" required /></label>
        <label class="field-in" data-reveal><span class="mono">${esc(k.labels.phone)} *</span><input name="telephone" type="tel" autocomplete="tel" required /></label>
      </div>
      <fieldset class="chips" data-reveal><legend class="mono">${esc(k.labels.type)}</legend>${chips('type', ['Hôtel', 'Restaurant', 'Clinique', 'École', 'Laboratoire', 'Collectivité', 'Autre'])}</fieldset>
      <fieldset class="chips" data-reveal><legend class="mono">${esc(k.labels.project)}</legend>${chips('projet', k.projectTypes)}</fieldset>
      <label class="field-in field-in--area" data-reveal><span class="mono">${esc(k.labels.message)} *</span><textarea name="message" rows="5" required placeholder="${esc(k.placeholder)}"></textarea></label>
      <input class="form__hp" type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true" />
      <div class="form__foot" data-reveal>
        <p class="form__status mono" role="status" aria-live="polite"></p>
        <button class="form__send" type="submit" data-magnetic><span><span class="form__send-label">${esc(k.send)}</span> <i aria-hidden="true">→</i></span></button>
      </div>
    </form>
  </section>
  ${footer()}`;
}
