export const PRELOADER_INITIAL_DELAY = 1;
export const PRELOADER_START_DELAY = 0.3;
export const PRELOADER_LOGO_INTRO_DURATION = 1;
export const PRELOADER_STEP_COUNT = 5;
export const PRELOADER_STEP_DURATION = 1;
export const PRELOADER_EXIT_DURATION = 0.75;
export const PRELOADER_CLIP_DELAY = 0.25;
export const PRELOADER_CLIP_DURATION = 1.25;

export const PRELOADER_PROGRESS_START =
  PRELOADER_INITIAL_DELAY +
  PRELOADER_START_DELAY +
  PRELOADER_LOGO_INTRO_DURATION;

export const PRELOADER_EXIT_START =
  PRELOADER_PROGRESS_START + PRELOADER_STEP_COUNT * PRELOADER_STEP_DURATION;

export const PRELOADER_COPY_BASE_DELAY =
  PRELOADER_EXIT_START + PRELOADER_CLIP_DELAY + 0.5;

export const HOME_COPY_BASE_DELAY = 1.35;

export const HOME_COPY_OFFSETS = {
  tagline: 0,
  aside: 0.25,
  btn: 0.5,
  monoStart: 0.9,
  monoEnd: 1.1,
};

let isInitialLoad = true;

export function shouldShowPreloader() {
  return isInitialLoad;
}

export function markPreloaderSeen() {
  isInitialLoad = false;
}
