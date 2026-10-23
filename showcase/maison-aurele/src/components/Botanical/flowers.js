// Botanical line drawing (viewBox 0 0 600 600): the lily used as an ornament.

// Rounded so server and client render identical path strings
const n = (v) => Math.round(v * 100) / 100;
const pt = ([x, y]) => `${n(x)},${n(y)}`;

// Six-petal line flower. `curl` bends the petal tips back.
export const petalFlower = (cx, cy, r, curl, petals = 6, rotation = 0) =>
  Array.from({ length: petals }, (_, i) => {
    const a = ((360 / petals) * i + rotation) * (Math.PI / 180);
    const tip = [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    const side = (s) => {
      const b = a + s * 0.42;
      return [cx + Math.cos(b) * r * 0.55, cy + Math.sin(b) * r * 0.55];
    };
    const c = a + Math.PI / 2;
    const curlPt = [tip[0] + Math.cos(c) * r * curl, tip[1] + Math.sin(c) * r * curl];
    return `M${cx},${cy} Q${pt(side(-1))} ${pt(curlPt)} T${pt(tip)} Q${pt(side(1))} ${cx},${cy}`;
  }).join(" ");

export const stamens = (cx, cy, r, count = 6) =>
  Array.from({ length: count }, (_, i) => {
    const a = ((360 / count) * i + 30) * (Math.PI / 180);
    const tip = [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    const ctrl = [cx + Math.cos(a + 0.3) * r * 0.5, cy + Math.sin(a + 0.3) * r * 0.5];
    return `M${cx},${cy} Q${pt(ctrl)} ${pt(tip)} M${n(tip[0] - 4)},${n(tip[1])} a4,4 0 1,0 8,0 a4,4 0 1,0 -8,0`;
  }).join(" ");

export const LILY = petalFlower(300, 300, 270, 0.16, 6, -90);
export const LILY_STAMENS = stamens(300, 300, 150);
