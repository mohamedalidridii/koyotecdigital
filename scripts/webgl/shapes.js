// Point clouds for every scene. Flat icons are drawn on a 2D canvas and sampled, so a new
// shape is just a few canvas calls. All object shapes are centred on the origin, ~3.2 units wide.

const TAU = Math.PI * 2;
// the KOYOTEC mark (see public/koyotec-logo.svg)
const LOGO_PATHS = ["M220.5 10C175.75 9.25 132.75 31 92 90.25L19.66 206", "M79 1.5V72.5M80 112V206", "M142.1 106L233.1 206", "M1 104H246"];
const SIZE = 384;

// draw(ctx, s) paints in white on a SIZE x SIZE canvas; returns n points with a little depth
function sampleCanvas(n, draw, { depth = 0.3, span = 3.2 } = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.fillStyle = ctx.strokeStyle = "#fff";
  ctx.lineCap = ctx.lineJoin = "round";
  draw(ctx, SIZE);

  const data = ctx.getImageData(0, 0, SIZE, SIZE).data;
  const pixels = [];
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      if (data[(y * SIZE + x) * 4 + 3] > 120) pixels.push(x, y);
    }
  }
  const out = new Float32Array(n * 3);
  const count = pixels.length / 2;
  const px = span / SIZE;
  for (let i = 0; i < n; i++) {
    const k = ((Math.random() * count) | 0) * 2;
    out[i * 3] = (pixels[k] + Math.random() - SIZE / 2) * px;
    out[i * 3 + 1] = -(pixels[k + 1] + Math.random() - SIZE / 2) * px;
    out[i * 3 + 2] = (Math.random() - 0.5) * depth * (0.4 + Math.random());
  }
  return out;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

const DRAW = {
  // a website: window chrome, hero block, copy lines and a button
  browser(ctx, s) {
    ctx.lineWidth = 5;
    roundRect(ctx, s * 0.08, s * 0.16, s * 0.84, s * 0.66, 18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s * 0.08, s * 0.26);
    ctx.lineTo(s * 0.92, s * 0.26);
    ctx.stroke();
    [0.14, 0.18, 0.22].forEach((x) => {
      ctx.beginPath();
      ctx.arc(s * x, s * 0.21, 6, 0, TAU);
      ctx.fill();
    });
    roundRect(ctx, s * 0.14, s * 0.32, s * 0.44, s * 0.06, 6);
    ctx.fill();
    ctx.lineWidth = 3;
    [0.43, 0.48, 0.53].forEach((y, i) => {
      ctx.beginPath();
      ctx.moveTo(s * 0.14, s * y);
      ctx.lineTo(s * (0.5 - i * 0.06), s * y);
      ctx.stroke();
    });
    roundRect(ctx, s * 0.14, s * 0.62, s * 0.18, s * 0.07, 20);
    ctx.fill();
    roundRect(ctx, s * 0.62, s * 0.32, s * 0.24, s * 0.4, 10);
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(s * 0.74, s * 0.47, s * 0.06, 0, TAU);
    ctx.fill();
  },

  // the brand: the KOYOTEC mark itself (same paths as the logo SVG, 250 x 195 units)
  glyph(ctx, s) {
    const k = (s * 0.86) / 250;
    ctx.save();
    ctx.translate((s - 250 * k) / 2, (s - 195 * k) / 2);
    ctx.scale(k, k);
    ctx.beginPath();
    ctx.rect(0, 0, 250, 194.5);
    ctx.clip();
    ctx.lineCap = "butt";
    ctx.lineJoin = "miter";
    ctx.lineWidth = 18;
    for (const d of LOGO_PATHS) ctx.stroke(new Path2D(d));
    ctx.restore();
    ctx.fillRect((s - 250 * k) / 2 + 232 * k, (s - 195 * k) / 2 + 2 * k, 18 * k, 18 * k);
  },

  // SEO: a rising signal with bars and an arrow
  signal(ctx, s) {
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(s * 0.1, s * 0.12);
    ctx.lineTo(s * 0.1, s * 0.88);
    ctx.lineTo(s * 0.92, s * 0.88);
    ctx.stroke();
    [0.22, 0.36, 0.5, 0.64, 0.78].forEach((x, i) => {
      const h = s * (0.12 + i * 0.1);
      roundRect(ctx, s * x - s * 0.035, s * 0.84 - h, s * 0.07, h, 4);
      ctx.fill();
    });
    ctx.lineWidth = 7;
    ctx.beginPath();
    const pts = [[0.14, 0.7], [0.32, 0.58], [0.46, 0.63], [0.62, 0.4], [0.86, 0.18]];
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(s * x, s * y) : ctx.moveTo(s * x, s * y)));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s * 0.88, s * 0.16);
    ctx.lineTo(s * 0.76, s * 0.18);
    ctx.lineTo(s * 0.86, s * 0.28);
    ctx.closePath();
    ctx.fill();
  },

  // UI/UX: a wireframe of cards and controls
  grid(ctx, s) {
    ctx.lineWidth = 4;
    const cell = s * 0.25;
    const gap = s * 0.04;
    const x0 = s * 0.1;
    const y0 = s * 0.1;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const x = x0 + c * (cell + gap);
        const y = y0 + r * (cell + gap);
        roundRect(ctx, x, y, cell, cell, 14);
        if ((r + c) % 3 === 0) ctx.fill();
        else ctx.stroke();
      }
    }
    ctx.beginPath();
    ctx.arc(x0 + 2 * (cell + gap) + cell / 2, y0 + cell + gap + cell / 2, cell * 0.22, 0, TAU);
    ctx.fill();
  },

  // e-commerce: a shopping bag
  bag(ctx, s) {
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(s * 0.2, s * 0.32);
    ctx.lineTo(s * 0.8, s * 0.32);
    ctx.lineTo(s * 0.86, s * 0.88);
    ctx.lineTo(s * 0.14, s * 0.88);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(s / 2, s * 0.32, s * 0.15, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(s * 0.35, s * 0.42, 9, 0, TAU);
    ctx.arc(s * 0.65, s * 0.42, 9, 0, TAU);
    ctx.fill();
    ctx.font = `600 ${s * 0.22}px "Clash Display", "Arial Black", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✦", s / 2, s * 0.64);
  },

  // strategy: a compass rose
  compass(ctx, s) {
    const c = s / 2;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(c, c, s * 0.42, 0, TAU);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(c, c, s * 0.33, 0, TAU);
    ctx.stroke();
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * TAU;
      const r1 = s * (i % 4 === 0 ? 0.36 : 0.385);
      ctx.beginPath();
      ctx.moveTo(c + Math.cos(a) * r1, c + Math.sin(a) * r1);
      ctx.lineTo(c + Math.cos(a) * s * 0.41, c + Math.sin(a) * s * 0.41);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(c, c - s * 0.3);
    ctx.lineTo(c + s * 0.06, c);
    ctx.lineTo(c, c + s * 0.3);
    ctx.lineTo(c - s * 0.06, c);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(c - s * 0.3, c);
    ctx.lineTo(c, c - s * 0.04);
    ctx.lineTo(c + s * 0.3, c);
    ctx.lineTo(c, c + s * 0.04);
    ctx.closePath();
    ctx.lineWidth = 3;
    ctx.stroke();
  },
};

// endless dune field in world space (height is computed in the shader)
function dunes(n) {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    // denser near the camera
    const t = Math.pow(Math.random(), 0.8);
    out[i * 3] = (Math.random() - 0.5) * (10 + t * 30);
    out[i * 3 + 1] = 0;
    out[i * 3 + 2] = 4 - t * 28;
  }
  return out;
}

// a tilted spiral galaxy: the night sky behind the process and FAQ
function constellation(n) {
  const out = new Float32Array(n * 3);
  const arms = 3;
  for (let i = 0; i < n; i++) {
    const r = Math.pow(Math.random(), 0.7) * 3.4;
    const arm = (i % arms) * (TAU / arms);
    const a = arm + r * 1.35 + (Math.random() - 0.5) * (0.9 / (r + 0.4));
    const spread = 0.18 + r * 0.06;
    const x = Math.cos(a) * r + (Math.random() - 0.5) * spread;
    const z = Math.sin(a) * r + (Math.random() - 0.5) * spread;
    const y = (Math.random() - 0.5) * 0.25 * Math.exp(-r * 0.6);
    // tilt toward the viewer
    out[i * 3] = x;
    out[i * 3 + 1] = y * 0.9 + z * 0.42;
    out[i * 3 + 2] = z * 0.9 - y * 0.42;
  }
  return out;
}

// a planet with a ring: the signal waiting for an answer
function orbit(n) {
  const out = new Float32Array(n * 3);
  const sphere = Math.floor(n * 0.5);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    let x, y, z;
    if (i < sphere) {
      const yy = 1 - (i / (sphere - 1)) * 2;
      const rr = Math.sqrt(1 - yy * yy);
      const th = golden * i;
      const R = 1.05 + (Math.random() - 0.5) * 0.04;
      x = Math.cos(th) * rr * R;
      y = yy * R;
      z = Math.sin(th) * rr * R;
    } else {
      const a = Math.random() * TAU;
      const R = 1.6 + Math.pow(Math.random(), 1.5) * 0.9;
      x = Math.cos(a) * R;
      y = (Math.random() - 0.5) * 0.03;
      z = Math.sin(a) * R;
    }
    // tilt the ring plane
    const tilt = 0.42;
    out[i * 3] = x;
    out[i * 3 + 1] = y * Math.cos(tilt) - z * Math.sin(tilt);
    out[i * 3 + 2] = y * Math.sin(tilt) + z * Math.cos(tilt);
  }
  return out;
}

const BUILDERS = { dunes, constellation, orbit };
const cache = new Map();

export const TERRAIN = new Set(["dunes"]);
export const SHAPE_NAMES = ["dunes", "constellation", "orbit", ...Object.keys(DRAW)];

export function getShape(name, n) {
  const key = `${name}:${n}`;
  if (!cache.has(key)) {
    const build = BUILDERS[name] || ((count) => sampleCanvas(count, DRAW[name]));
    cache.set(key, build(n));
  }
  return cache.get(key);
}
