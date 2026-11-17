let seen = false;
let decided = null;

export const PRELOADER_EASE = ".87,0,.13,1";

// Intro timing. It used to hold the page for ~6.75 s on every visit; it now runs ~2 s on the first
// visit of a session, 4x faster on later visits, and almost instantly with reduced motion.
// Timing values only feed animations (never rendered markup), so server and client may differ safely.
const INTRO_KEY = "koy-eng-intro";
function introSpeed() {
  if (typeof window === "undefined") return 1;
  try {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return 0.1;
    if (window.sessionStorage.getItem(INTRO_KEY)) return 0.25;
  } catch {
    /* storage blocked: keep the normal intro */
  }
  return 1;
}
const F = introSpeed();

export function markIntroPlayed() {
  try {
    window.sessionStorage.setItem(INTRO_KEY, "1");
  } catch {
    /* ignore */
  }
}

export const PRELOADER_BAND_DELAY = 0.2 * F;
export const PRELOADER_BAND_DURATION = 0.6 * F;

export const PRELOADER_COUNT_DELAY = 0.6 * F;
export const PRELOADER_COUNT_DURATION = 0.8 * F;

export const PRELOADER_OPEN_DELAY = 1.4 * F;
export const PRELOADER_OPEN_DURATION = 0.8 * F;
export const PRELOADER_HERO_SCALE_DURATION = 1 * Math.max(F, 0.4);
export const PRELOADER_PROGRESS_FADE = 0.3 * F;
export const PRELOADER_OVERLAY_HOLD = 0.5 * F;

export const PRELOADER_COPY_BASE_DELAY = PRELOADER_OPEN_DELAY + 0.75 * F;
export const HOME_COPY_BASE_DELAY = 0.75;

// delay before the home copy and menu animate in, never negative when the intro is fast
export const introWait = () => Math.max(0, PRELOADER_COPY_BASE_DELAY - HOME_COPY_BASE_DELAY);

export const HOME_COPY_OFFSETS = {
  header: 0.25,
  title: 0,
  ctas: 0,
};

export function shouldShowPreloader() {
  if (decided === null) decided = !seen;
  return decided;
}

export function markPreloaderSeen() {
  seen = true;
}

export function releasePreloaderVisit() {
  decided = null;
}
