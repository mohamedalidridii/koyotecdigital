// 2026-11 redesign (LIFT): the WebGL particle stage is gone (it sat behind the text and explained
// nothing). This stub keeps the small API the section scripts call (hover previews, pulses), as no-ops.
export const gl = {
  shape: () => {},
  focus: () => {},
  blur: () => {},
  alpha: () => {},
  dim: () => {},
  pulse: () => {},
  scatter: () => Promise.resolve(),
};
