// A professional kitchen drawn as a top-down plan, in metres: x → right, y → down, 16 × 9.
// One source for both the WebGL plan and the static SVG fallback.

export type Kind = 'wall' | 'door' | 'equip' | 'dim';
export type P = [number, number];
export type Seg = { a: P; b: P; kind: Kind; zone: number };

export const PLAN_W = 16;
export const PLAN_H = 9;
const T = 0.18; // wall thickness

const segs: Seg[] = [];
const line = (a: P, b: P, kind: Kind, zone = -1) => segs.push({ a, b, kind, zone });

function rect(x: number, y: number, w: number, h: number, kind: Kind, zone: number) {
  line([x, y], [x + w, y], kind, zone);
  line([x + w, y], [x + w, y + h], kind, zone);
  line([x + w, y + h], [x, y + h], kind, zone);
  line([x, y + h], [x, y], kind, zone);
}

function arc(cx: number, cy: number, r: number, a0: number, a1: number, kind: Kind, zone: number, steps = 14) {
  for (let i = 0; i < steps; i++) {
    const t0 = a0 + ((a1 - a0) * i) / steps;
    const t1 = a0 + ((a1 - a0) * (i + 1)) / steps;
    line([cx + Math.cos(t0) * r, cy + Math.sin(t0) * r], [cx + Math.cos(t1) * r, cy + Math.sin(t1) * r], kind, zone);
  }
}
const circle = (cx: number, cy: number, r: number, zone: number) => arc(cx, cy, r, 0, Math.PI * 2, 'equip', zone, 18);

/** A dashed rectangle, e.g. the extraction hood above the cooking line. */
function dashed(x: number, y: number, w: number, h: number, zone: number, dash = 0.22) {
  const edge = (a: P, b: P) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = Math.floor(len / dash);
    for (let i = 0; i < n; i += 2) {
      const t0 = i / n;
      const t1 = Math.min((i + 1) / n, 1);
      line([a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0], [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1], 'equip', zone);
    }
  };
  edge([x, y], [x + w, y]);
  edge([x + w, y], [x + w, y + h]);
  edge([x + w, y + h], [x, y + h]);
  edge([x, y + h], [x, y]);
}

/** Axis-aligned wall drawn as two parallel lines, split around door openings, with end caps. */
function wall(axis: 'h' | 'v', at: number, from: number, to: number, openings: [number, number][] = []) {
  const pieces: [number, number][] = [];
  let cur = from;
  for (const [o0, o1] of [...openings].sort((p, q) => p[0] - q[0])) {
    pieces.push([cur, o0]);
    cur = o1;
  }
  pieces.push([cur, to]);
  const h = T / 2;
  for (const [s, e] of pieces) {
    if (e - s < 0.01) continue;
    if (axis === 'h') {
      line([s, at - h], [e, at - h], 'wall');
      line([s, at + h], [e, at + h], 'wall');
      line([s, at - h], [s, at + h], 'wall');
      line([e, at - h], [e, at + h], 'wall');
    } else {
      line([at - h, s], [at - h, e], 'wall');
      line([at + h, s], [at + h, e], 'wall');
      line([at - h, s], [at + h, s], 'wall');
      line([at - h, e], [at + h, e], 'wall');
    }
  }
}

/** Door leaf + swing, hinged at (hx, hy), opening from angle a0 to a1. */
function door(hx: number, hy: number, r: number, a0: number, a1: number) {
  line([hx, hy], [hx + Math.cos(a0) * r, hy + Math.sin(a0) * r], 'door');
  arc(hx, hy, r, a0, a1, 'door', -1, 12);
}

// --- Zones: 3 columns × 2 rows -------------------------------------------------------------
const COLS = [0, 5.2, 10.6, 16];
const ROWS = [0, 4.5, 9];
export const FLOW_TOP = 2.2;
export const FLOW_BOTTOM = 6.8;
export const DOWN_X = 15;

export type Zone = { x: number; y: number; w: number; h: number; cx: number; cy: number };
// Flow order: top row left → right, bottom row right → left.
const zoneCells: [number, number][] = [
  [0, 0],
  [1, 0],
  [2, 0],
  [2, 1],
  [1, 1],
  [0, 1],
];
export const zoneRects: Zone[] = zoneCells.map(([c, r]) => {
  const x = COLS[c];
  const y = ROWS[r];
  const w = COLS[c + 1] - x;
  const h = ROWS[r + 1] - y;
  return { x, y, w, h, cx: x + w / 2, cy: r === 0 ? FLOW_TOP : FLOW_BOTTOM };
});

// --- Walls & doors -------------------------------------------------------------------------
wall('h', 0, -T / 2, PLAN_W + T / 2);
wall('h', PLAN_H, -T / 2, PLAN_W + T / 2, [[6.4, 9.4]]); // pass-through to the dining room
wall('v', 0, 0, PLAN_H, [
  [1.7, 2.7],
  [6.3, 7.3],
]);
wall('v', PLAN_W, 0, PLAN_H);
wall('h', ROWS[1], T / 2, PLAN_W - T / 2, [[14.5, 15.5]]);
for (const x of [COLS[1], COLS[2]]) {
  wall('v', x, T / 2, ROWS[1] - T / 2, [[1.7, 2.7]]);
  wall('v', x, ROWS[1] + T / 2, PLAN_H - T / 2, [[6.3, 7.3]]);
}
door(0, 1.7, 1, 0, Math.PI / 2); // delivery entrance
door(0, 7.3, 1, 0, -Math.PI / 2); // waste exit
door(COLS[1], 1.7, 1, 0, Math.PI / 2);
door(COLS[2], 1.7, 1, 0, Math.PI / 2);
door(14.5, ROWS[1], 1, Math.PI / 2, 0);
door(COLS[2], 7.3, 1, Math.PI, Math.PI * 1.5);
door(COLS[1], 7.3, 1, Math.PI, Math.PI * 1.5);

// --- Equipment, zone by zone ------------------------------------------------------------------
// Z-01 Réception: control table, scales, hand-wash basin, trolley rack.
rect(0.5, 0.45, 2.4, 0.8, 'equip', 0);
line([1.7, 0.45], [1.7, 1.25], 'equip', 0);
rect(3.3, 0.45, 0.9, 0.9, 'equip', 0);
circle(3.75, 0.9, 0.3, 0);
rect(0.5, 3.4, 0.8, 0.65, 'equip', 0);
circle(0.9, 3.72, 0.2, 0);
rect(1.7, 3.4, 2.9, 0.7, 'equip', 0);
for (let x = 2.42; x < 4.6; x += 0.72) line([x, 3.4], [x, 4.1], 'equip', 0);

// Z-02 Stockage: two cold rooms (insulated walls, cross = refrigerated), dry-store shelving.
for (const [x, w] of [
  [5.6, 2.3],
  [8.1, 2.1],
] as const) {
  rect(x, 0.45, w, 1.5, 'equip', 1);
  rect(x + 0.12, 0.57, w - 0.24, 1.26, 'equip', 1);
  line([x + 0.12, 0.57], [x + w - 0.12, 1.83], 'equip', 1);
  line([x + w - 0.12, 0.57], [x + 0.12, 1.83], 'equip', 1);
}
rect(5.6, 3.35, 4.6, 0.75, 'equip', 1);
for (let x = 6.1; x < 10.2; x += 0.5) line([x, 3.35], [x, 4.1], 'equip', 1);

// Z-03 Préparation: three workstations, double sink, island table.
rect(11, 0.45, 4.6, 0.8, 'equip', 2);
line([12.53, 0.45], [12.53, 1.25], 'equip', 2);
line([14.06, 0.45], [14.06, 1.25], 'equip', 2);
rect(11, 3.35, 1.5, 0.75, 'equip', 2);
rect(11.12, 3.47, 0.58, 0.51, 'equip', 2);
rect(11.8, 3.47, 0.58, 0.51, 'equip', 2);
rect(12.8, 3.35, 1.4, 0.75, 'equip', 2);

// Z-04 Cuisson: combi oven, tilting pan, cooking line (range, plancha, fryer, bain-marie) under a hood.
rect(11, 5, 1.2, 1, 'equip', 3);
rect(11.12, 5.12, 0.8, 0.76, 'equip', 3);
circle(12.06, 5.5, 0.07, 3);
rect(12.6, 5, 1.4, 1, 'equip', 3);
rect(12.72, 5.12, 1.16, 0.6, 'equip', 3);
rect(11, 7.8, 4.6, 0.85, 'equip', 3);
for (const x of [12.3, 13.3, 14.4]) line([x, 7.8], [x, 8.65], 'equip', 3);
for (const [cx, cy] of [
  [11.33, 8.02],
  [11.97, 8.02],
  [11.33, 8.43],
  [11.97, 8.43],
])
  circle(cx, cy, 0.16, 3);
for (let x = 12.42; x < 13.25; x += 0.12) line([x, 7.9], [x, 8.55], 'equip', 3);
rect(13.45, 7.92, 0.38, 0.6, 'equip', 3);
rect(13.88, 7.92, 0.38, 0.6, 'equip', 3);
rect(14.5, 7.92, 1, 0.6, 'equip', 3);
dashed(10.85, 7.55, 4.95, 1.3, 3);

// Z-05 Service: plating table and the hot pass with heat lamps.
rect(6.2, 5, 3.4, 0.75, 'equip', 4);
rect(5.9, 7.8, 4, 0.75, 'equip', 4);
for (let i = 0; i < 4; i++) circle(6.4 + i * 1, 8.17, 0.18, 4);

// Z-06 Plonge: hood-type dishwasher, in/out tables with basins, rack shelving.
rect(0.5, 7.6, 1.3, 1.1, 'equip', 5);
line([0.5, 7.6], [1.8, 8.7], 'equip', 5);
line([1.8, 7.6], [0.5, 8.7], 'equip', 5);
rect(1.8, 7.85, 2.9, 0.7, 'equip', 5);
rect(2.0, 7.97, 0.9, 0.46, 'equip', 5);
rect(3.05, 7.97, 0.9, 0.46, 'equip', 5);
rect(0.5, 5, 3, 0.6, 'equip', 5);
for (let x = 1.1; x < 3.5; x += 0.6) line([x, 5], [x, 5.6], 'equip', 5);

// --- Dimension lines ---------------------------------------------------------------------------
const DY = -0.75;
const DX = PLAN_W + 0.75;
line([0, DY], [PLAN_W, DY], 'dim');
for (const x of COLS) {
  line([x, DY - 0.2], [x, -0.2], 'dim');
  line([x - 0.12, DY + 0.12], [x + 0.12, DY - 0.12], 'dim');
}
line([DX, 0], [DX, PLAN_H], 'dim');
for (const y of ROWS) {
  line([PLAN_W + 0.2, y], [DX + 0.2, y], 'dim');
  line([DX - 0.12, y + 0.12], [DX + 0.12, y - 0.12], 'dim');
}

export const segments = segs;

/** Labels positioned on the plan, in plan coordinates. */
export const dimLabels: { p: P; text: string; vertical?: boolean }[] = [
  ...COLS.slice(0, -1).map((x, i) => ({ p: [(x + COLS[i + 1]) / 2, DY - 0.28] as P, text: (COLS[i + 1] - x).toFixed(2) })),
  ...ROWS.slice(0, -1).map((y, i) => ({ p: [DX + 0.32, (y + ROWS[i + 1]) / 2] as P, text: (ROWS[i + 1] - y).toFixed(2), vertical: true })),
];

// --- The flow: marche en avant ------------------------------------------------------------------
// Straight runs with rounded corners, sampled evenly so the reveal moves at a constant speed.
const corners: P[] = [
  [-0.9, FLOW_TOP],
  [DOWN_X, FLOW_TOP],
  [DOWN_X, FLOW_BOTTOM],
  [-0.9, FLOW_BOTTOM],
];

function roundedPath(points: P[], radius: number, step = 0.04): P[] {
  const out: P[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const [p0, p1, p2] = [points[i - 1], points[i], points[i + 1]];
    const d0 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
    const d1 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const r = Math.min(radius, d0 / 2, d1 / 2);
    const a: P = [p1[0] - ((p1[0] - p0[0]) / d0) * r, p1[1] - ((p1[1] - p0[1]) / d0) * r];
    const b: P = [p1[0] + ((p2[0] - p1[0]) / d1) * r, p1[1] + ((p2[1] - p1[1]) / d1) * r];
    out.push(a);
    // Quadratic Bézier through the corner.
    for (let k = 1; k <= 10; k++) {
      const t = k / 10;
      const u = 1 - t;
      out.push([u * u * a[0] + 2 * u * t * p1[0] + t * t * b[0], u * u * a[1] + 2 * u * t * p1[1] + t * t * b[1]]);
    }
  }
  out.push(points[points.length - 1]);
  // Resample at an even spacing.
  const cum = [0];
  for (let i = 1; i < out.length; i++) cum.push(cum[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
  const total = cum[cum.length - 1];
  const n = Math.ceil(total / step);
  const res: P[] = [];
  let j = 0;
  for (let i = 0; i <= n; i++) {
    const s = (i / n) * total;
    while (j < cum.length - 2 && cum[j + 1] < s) j++;
    const t = (s - cum[j]) / Math.max(cum[j + 1] - cum[j], 1e-6);
    res.push([out[j][0] + (out[j + 1][0] - out[j][0]) * t, out[j][1] + (out[j + 1][1] - out[j][1]) * t]);
  }
  return res;
}

export const flowPoints = roundedPath(corners, 0.7);
export const flowLength = flowPoints.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - flowPoints[i - 1][0], p[1] - flowPoints[i - 1][1]) : 0), 0);

/** Where along the flow (0–1) each zone's centre is crossed. */
export const zoneU = zoneRects.map((z) => {
  let best = 0;
  let bestD = Infinity;
  flowPoints.forEach((p, i) => {
    const d = Math.hypot(p[0] - z.cx, p[1] - z.cy);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best / (flowPoints.length - 1);
});

/** The zone the flow is in at progress u, or -1 before the first / after the last. */
export function zoneAt(u: number) {
  if (u <= 0.005) return -1;
  // Each zone owns the stretch around its centre, halfway to its neighbours.
  for (let i = 0; i < zoneU.length; i++) {
    const next = i < zoneU.length - 1 ? (zoneU[i] + zoneU[i + 1]) / 2 : 1;
    if (u < next) return i;
  }
  return zoneU.length - 1;
}

export function pointAt(u: number): P {
  const f = Math.min(Math.max(u, 0), 1) * (flowPoints.length - 1);
  const i = Math.floor(f);
  const t = f - i;
  const a = flowPoints[i];
  const b = flowPoints[Math.min(i + 1, flowPoints.length - 1)];
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** Steam rises above the range and the tilting pan. */
export const steamArea = { x: 11.1, y: 7.85, w: 2.1, h: 0.75 };
