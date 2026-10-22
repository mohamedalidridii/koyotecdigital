// Environment flags read once at boot.
export const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
export const isSmall = () => window.innerWidth <= 960;
export const $ = (sel, root = document) => [...root.querySelectorAll(sel)];
