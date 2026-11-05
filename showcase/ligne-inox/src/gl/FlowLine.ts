import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, DoubleSide, Mesh, Points, ShaderMaterial } from 'three';
import { flowLength, flowPoints, pointAt, steamArea } from './layout';
import { toLocal } from './KitchenPlan';
import flowVert from './shaders/flow.vert';
import flowFrag from './shaders/flow.frag';
import headVert from './shaders/head.vert';
import headFrag from './shaders/head.frag';
import steamVert from './shaders/steam.vert';
import steamFrag from './shaders/steam.frag';

const accent = new Color(0xe2231a);

/** The marche-en-avant path as a ribbon, its glowing head, and steam over the range. */
export class FlowLine {
  ribbon: Mesh<BufferGeometry, ShaderMaterial>;
  head: Points<BufferGeometry, ShaderMaterial>;
  steam: Points<BufferGeometry, ShaderMaterial>;
  uniforms = {
    uProgress: { value: 0 },
    uOpacity: { value: 0 },
    uTime: { value: 0 },
    uLength: { value: flowLength },
    uAccent: { value: accent },
    uSize: { value: 26 },
    uPulse: { value: 0 },
  };
  steamUniforms = { uTime: { value: 0 }, uSize: { value: 40 }, uOpacity: { value: 0 }, uLight: { value: 0 } };

  constructor(mobile: boolean, dpr: number) {
    const width = 0.16;
    const n = flowPoints.length;
    const pos = new Float32Array(n * 2 * 3);
    const u = new Float32Array(n * 2);
    const side = new Float32Array(n * 2);
    const index: number[] = [];
    for (let i = 0; i < n; i++) {
      const p = toLocal(...flowPoints[i]);
      const a = toLocal(...flowPoints[Math.max(i - 1, 0)]);
      const b = toLocal(...flowPoints[Math.min(i + 1, n - 1)]);
      const tx = b[0] - a[0];
      const ty = b[1] - a[1];
      const len = Math.hypot(tx, ty) || 1;
      const nx = -ty / len;
      const ny = tx / len;
      for (const k of [0, 1]) {
        const sgn = k ? 1 : -1;
        pos.set([p[0] + nx * sgn * width * 0.5, p[1] + ny * sgn * width * 0.5, 0.002], (i * 2 + k) * 3);
        u[i * 2 + k] = i / (n - 1);
        side[i * 2 + k] = sgn;
      }
      if (i < n - 1) {
        const j = i * 2;
        index.push(j, j + 1, j + 2, j + 1, j + 3, j + 2);
      }
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(pos, 3));
    g.setAttribute('aU', new BufferAttribute(u, 1));
    g.setAttribute('aSide', new BufferAttribute(side, 1));
    g.setIndex(index);
    this.ribbon = new Mesh(g, new ShaderMaterial({ vertexShader: flowVert, fragmentShader: flowFrag, uniforms: this.uniforms, transparent: true, depthTest: false, depthWrite: false, side: DoubleSide }));
    this.ribbon.renderOrder = 3;
    this.ribbon.frustumCulled = false;

    this.uniforms.uSize.value = 34 * dpr;
    const hg = new BufferGeometry();
    hg.setAttribute('position', new BufferAttribute(new Float32Array(3), 3));
    this.head = new Points(hg, new ShaderMaterial({ vertexShader: headVert, fragmentShader: headFrag, uniforms: this.uniforms, transparent: true, depthTest: false, depthWrite: false }));
    this.head.renderOrder = 4;
    this.head.frustumCulled = false;

    const count = mobile ? 50 : 140;
    const sp = new Float32Array(count * 3);
    const seed = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const [x, y] = toLocal(steamArea.x + Math.random() * steamArea.w, steamArea.y + Math.random() * steamArea.h);
      sp.set([x, y, 0], i * 3);
      seed.set([Math.random(), Math.random(), Math.random()], i * 3);
    }
    const sg = new BufferGeometry();
    sg.setAttribute('position', new BufferAttribute(sp, 3));
    sg.setAttribute('aSeed', new BufferAttribute(seed, 3));
    this.steamUniforms.uSize.value = 26 * dpr;
    this.steam = new Points(sg, new ShaderMaterial({ vertexShader: steamVert, fragmentShader: steamFrag, uniforms: this.steamUniforms, transparent: true, depthTest: false, depthWrite: false, blending: AdditiveBlending }));
    this.steam.renderOrder = 5;
    this.steam.frustumCulled = false;
  }

  update(time: number) {
    this.uniforms.uTime.value = time;
    this.steamUniforms.uTime.value = time;
    const [x, y] = toLocal(...pointAt(this.uniforms.uProgress.value));
    const attr = this.head.geometry.attributes.position as BufferAttribute;
    attr.setXYZ(0, x, y, 0.004);
    attr.needsUpdate = true;
  }
}
