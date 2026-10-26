let seen = false;
let decided = null;

export const PRELOADER_EASE = ".87,0,.13,1";

export const PRELOADER_BAND_DELAY = 1;
export const PRELOADER_BAND_DURATION = 1.5;

export const PRELOADER_COUNT_DELAY = 3;
export const PRELOADER_COUNT_DURATION = 2;

export const PRELOADER_OPEN_DELAY = 5;
export const PRELOADER_OPEN_DURATION = 1;
export const PRELOADER_HERO_SCALE_DURATION = 1.25;
export const PRELOADER_PROGRESS_FADE = 0.3;
export const PRELOADER_OVERLAY_HOLD = 0.75;

export const PRELOADER_COPY_BASE_DELAY = 5.75;
export const HOME_COPY_BASE_DELAY = 0.75;

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
