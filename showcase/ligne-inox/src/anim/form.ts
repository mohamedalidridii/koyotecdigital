import { gsap } from 'gsap';
import { copy } from '../content';

const k = copy.contactPage;

/** Contact page: copy-to-clipboard, and the project form. In this concept the form is a demo: nothing is sent. */
export function initForm(root: HTMLElement) {
  initCopy(root);
  const form = root.querySelector<HTMLFormElement>('.form');
  if (!form) return;
  const status = form.querySelector<HTMLElement>('.form__status')!;
  const label = form.querySelector<HTMLElement>('.form__send-label')!;
  const button = form.querySelector<HTMLButtonElement>('.form__send')!;

  const say = (text: string, kind: 'ok' | 'error' | '' = '') => {
    status.textContent = text;
    status.dataset.kind = kind;
    gsap.fromTo(status, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'expo.out' });
  };

  // Clear a field's error as soon as it is edited.
  form.addEventListener('input', (e) => (e.target as HTMLElement).closest('.field-in')?.classList.remove('is-invalid'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const required = [...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[required]')];
    const invalid = required.filter((el) => !el.value.trim() || (el.type === 'email' && !el.checkValidity()));
    required.forEach((el) => el.closest('.field-in')?.classList.toggle('is-invalid', invalid.includes(el)));
    if (invalid.length) {
      say(k.invalid, 'error');
      invalid[0].focus();
      gsap.fromTo(invalid.map((el) => el.closest('.field-in')), { x: -8 }, { x: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
      return;
    }
    // Play the sending state, then explain that this is a demonstration.
    button.disabled = true;
    label.textContent = k.sending;
    form.classList.add('is-sending');
    await new Promise((r) => setTimeout(r, 900));
    form.reset();
    say(k.sent, 'ok');
    button.disabled = false;
    label.textContent = k.send;
    form.classList.remove('is-sending');
  });
}

function initCopy(root: HTMLElement) {
  const toast = root.querySelector<HTMLElement>('.toast');
  root.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((b) =>
    b.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(b.dataset.copy!);
      } catch {
        return;
      }
      if (!toast) return;
      toast.textContent = k.copied;
      gsap
        .timeline()
        .fromTo(toast, { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'expo.out' })
        .to(toast, { y: -10, autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, '+=1.6');
    }),
  );
}
