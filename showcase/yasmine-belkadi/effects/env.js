export const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

// No custom cursor, magnetic buttons or hover previews on touch screens
export const isTouch = window.matchMedia(
  "(hover: none), (pointer: coarse)",
).matches;
