import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, DoubleSide, LineSegments, Mesh, NormalBlending, ShaderMaterial } from 'three';
import { PLAN_H, PLAN_W, segments, zoneRects, type Kind } from './layout';
import planVert from './shaders/plan.vert';
import planFrag from './shaders/plan.frag';
import fillVert from './shaders/fill.vert';
import fillFrag from './shaders/fill.frag';

/** Plan coordinates (metres, y down) → local GL coordinates (centred, y up). */
export const toLocal = (x: number, y: number): [number, number] => [x - PLAN_W / 2, -(y - PLAN_H / 2)];

const kindIndex: Record<Kind, number> = { wall: 0, door: 1, equip: 2, dim: 3 };

// When each family of lines is drawn, as a share of the whole drawing: walls, then doors, then
// equipment zone by zone, dimensions last. Within a family each line starts a little apart.
const windows: Record<Kind, [number, number]> = { wall: [0, 0.32], door: [0.3, 0.46], equip: [0.4, 0.92], dim: [0.7, 1] };

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class KitchenPlan {
  lines: LineSegments<BufferGeometry, ShaderMaterial>;
  fills: Mesh<BufferGeometry, ShaderMaterial>;
  uniforms = {
    uDraw: { value: 0 },
    uOpacity: { value: 0 },
    uZone: { value: -1 },
    uZoneMix: { value: 0 },
    uLight: { value: 0 },
    uAccent: { value: new Color(0xe2231a) },
  };

  constructor() {
    const rand = rng(7);
    const n = segments.length;
    const pos = new Float32Array(n * 6);
    const s = new Float32Array(n * 2);
    const zone = new Float32Array(n * 2);
    const kind = new Float32Array(n * 2);
    segments.forEach((seg, i) => {
      const [ax, ay] = toLocal(...seg.a);
      const [bx, by] = toLocal(...seg.b);
      pos.set([ax, ay, 0, bx, by, 0], i * 6);
      const [w0, w1] = windows[seg.kind];
      let start: number;
      let dur: number;
      if (seg.kind === 'equip') {
        // Zones furnish in flow order.
        const span = (w1 - w0) / 6;
        start = w0 + seg.zone * span * 0.8 + rand() * span;
        dur = 0.05 + rand() * 0.06;
      } else {
        start = w0 + rand() * (w1 - w0) * 0.6;
        dur = (w1 - w0) * 0.4;
      }
      s[i * 2] = start;
      s[i * 2 + 1] = Math.min(start + dur, 0.999);
      zone[i * 2] = zone[i * 2 + 1] = seg.zone;
      kind[i * 2] = kind[i * 2 + 1] = kindIndex[seg.kind];
    });
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(pos, 3));
    g.setAttribute('aS', new BufferAttribute(s, 1));
    g.setAttribute('aZone', new BufferAttribute(zone, 1));
    g.setAttribute('aKind', new BufferAttribute(kind, 1));
    this.lines = new LineSegments(
      g,
      new ShaderMaterial({ vertexShader: planVert, fragmentShader: planFrag, uniforms: this.uniforms, transparent: true, depthTest: false, depthWrite: false, blending: NormalBlending }),
    );
    this.lines.renderOrder = 2;
    this.lines.frustumCulled = false;

    // One quad per zone, for the hatching.
    const fp = new Float32Array(zoneRects.length * 18);
    const fz = new Float32Array(zoneRects.length * 6);
    zoneRects.forEach((z, i) => {
      const [x0, y0] = toLocal(z.x + 0.1, z.y + 0.1);
      const [x1, y1] = toLocal(z.x + z.w - 0.1, z.y + z.h - 0.1);
      fp.set([x0, y0, 0, x1, y0, 0, x1, y1, 0, x0, y0, 0, x1, y1, 0, x0, y1, 0], i * 18);
      fz.fill(i, i * 6, i * 6 + 6);
    });
    const fg = new BufferGeometry();
    fg.setAttribute('position', new BufferAttribute(fp, 3));
    fg.setAttribute('aZone', new BufferAttribute(fz, 1));
    this.fills = new Mesh(
      fg,
      new ShaderMaterial({ vertexShader: fillVert, fragmentShader: fillFrag, uniforms: this.uniforms, transparent: true, depthTest: false, depthWrite: false, blending: AdditiveBlending, side: DoubleSide }),
    );
    this.fills.renderOrder = 1;
    this.fills.frustumCulled = false;
  }
}
