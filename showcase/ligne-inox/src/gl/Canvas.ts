import { gsap } from 'gsap';
import { ColorManagement, Group, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { pointer } from '../pointer';
import { FlowLine } from './FlowLine';
import { InoxSurface } from './InoxSurface';
import { KitchenPlan, toLocal } from './KitchenPlan';
import { dimLabels, PLAN_H, PLAN_W, zoneRects } from './layout';
import { Ripple } from './Ripple';

// Shaders here work in plain sRGB values end to end; skip three's linear conversions.
ColorManagement.enabled = false;

/** Everything a page or a scroll scene can animate. Tween these with `gl.to()` or gsap directly. */
export type Params = {
  /** Steel sheet: lights up on load (0 → 1). */
  intro: number;
  /** Darkens the steel behind the plan. */
  dim: number;
  /** 0 = dark graphite steel, 1 = bright brushed inox (light sections). */
  light: number;
  grid: number;
  heat: number;
  ripple: number;
  /** Plan: opacity, how much is drawn, highlighted zone. */
  plan: number;
  draw: number;
  zone: number;
  zoneMix: number;
  /** Flow line: progress along the path, opacity, the exit pulse, steam over the range. */
  flow: number;
  flowOpacity: number;
  pulse: number;
  steam: number;
  /** Framing: the plan point (fx, fy, metres) is placed at screen (x, y) in −1…1, scaled by zoom. */
  fx: number;
  fy: number;
  x: number;
  y: number;
  zoom: number;
  tilt: number;
};

export const defaults: Params = {
  intro: 0,
  dim: 0,
  light: 0,
  grid: 0,
  heat: 0,
  ripple: 1,
  plan: 0,
  draw: 0,
  zone: -1,
  zoneMix: 0,
  flow: 0,
  flowOpacity: 0,
  pulse: 0,
  steam: 0,
  fx: PLAN_W / 2,
  fy: PLAN_H / 2,
  x: 0,
  y: 0,
  zoom: 1,
  tilt: 0.42,
};

/** One fixed renderer: the steel sheet, and the kitchen plan with its flow, behind every page. */
export class GL {
  renderer: WebGLRenderer;
  params: Params = { ...defaults };
  private scene = new Scene();
  private camera = new PerspectiveCamera(30, 1, 0.1, 100);
  private surface = new InoxSurface();
  private ripple: Ripple | null;
  private plan = new KitchenPlan();
  private flow: FlowLine;
  private group = new Group();
  private inner = new Group();
  private halfW = 1;
  private halfH = 1;
  private fit = 1;
  private mouse = { x: 0.5, y: 0.5 };
  private tiltPointer = { x: 0, y: 0 };
  private scroll = 0;
  private labels: HTMLElement | null;
  private labelEls: { el: HTMLElement; p: Vector3; zone: number }[] = [];
  private activeZone = -2;
  private v = new Vector3();

  constructor(canvas: HTMLCanvasElement, private mobile: boolean) {
    this.renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    const dpr = Math.min(devicePixelRatio, mobile ? 1.5 : 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setClearColor(0x0d0e0f, 1);

    // Half-float render targets need WebGL2; without them the steel simply doesn't ripple.
    this.ripple = this.renderer.capabilities.isWebGL2 ? new Ripple(mobile ? 0.2 : 0.25) : null;
    this.flow = new FlowLine(mobile, dpr);

    this.scene.add(this.surface.mesh);
    this.inner.add(this.plan.fills, this.plan.lines, this.flow.ribbon, this.flow.steam, this.flow.head);
    this.group.add(this.inner);
    this.scene.add(this.group);
    this.camera.position.z = 10;

    this.labels = document.querySelector<HTMLElement>('.plan-labels');
    this.buildLabels();

    this.resize();
    addEventListener('resize', () => this.resize());
  }

  /** Tween any params; returns the tween so it can sit in a timeline. */
  to(p: Partial<Params>, duration = 1.6, ease = 'power3.inOut') {
    return gsap.to(this.params, { ...p, duration, ease, overwrite: 'auto' });
  }

  set(p: Partial<Params>) {
    gsap.killTweensOf(this.params, Object.keys(p).join(','));
    Object.assign(this.params, p);
  }

  private buildLabels() {
    if (!this.labels) return;
    const zoneNames = ['Réception', 'Stockage', 'Préparation', 'Cuisson', 'Service', 'Plonge'];
    const html = [
      ...zoneRects.map((_, i) => `<span class="plan-label plan-label--zone" data-zone="${i}"><b>Z-0${i + 1}</b> ${zoneNames[i]}</span>`),
      ...dimLabels.map((d) => `<span class="plan-label plan-label--dim${d.vertical ? ' is-v' : ''}">${d.text}</span>`),
    ].join('');
    this.labels.innerHTML = html;
    const els = [...this.labels.children] as HTMLElement[];
    zoneRects.forEach((z, i) => {
      const [x, y] = toLocal(z.x + 0.28, z.y + 0.3);
      this.labelEls.push({ el: els[i], p: new Vector3(x, y, 0), zone: i });
    });
    dimLabels.forEach((d, i) => {
      const [x, y] = toLocal(...d.p);
      this.labelEls.push({ el: els[zoneRects.length + i], p: new Vector3(x, y, 0), zone: -1 });
    });
  }

  resize() {
    const w = innerWidth;
    const h = innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.halfH = Math.tan((this.camera.fov * Math.PI) / 360) * this.camera.position.z;
    this.halfW = this.halfH * (w / h);
    // The whole plan with its dimension lines fits in ~74% of the width, or ~72% of the height.
    this.fit = Math.min((this.halfW * 2 * 0.74) / (PLAN_W + 2.4), (this.halfH * 2 * 0.72) / (PLAN_H + 1.8));
    this.surface.uniforms.uRes.value.set(w, h);
    this.ripple?.resize(w, h);
  }

  /** Screen position (px) of a plan point, e.g. to anchor DOM to the plan. */
  project(x: number, y: number) {
    const [lx, ly] = toLocal(x, y);
    this.v.set(lx, ly, 0);
    this.inner.localToWorld(this.v);
    this.v.project(this.camera);
    return { x: (this.v.x * 0.5 + 0.5) * innerWidth, y: (-this.v.y * 0.5 + 0.5) * innerHeight };
  }

  render(time: number, velocity: number) {
    if (document.hidden) return;
    const p = this.params;
    const s = this.surface.uniforms;

    // Pointer, smoothed.
    this.mouse.x += (pointer.x / innerWidth - this.mouse.x) * 0.08;
    this.mouse.y += (1 - pointer.y / innerHeight - this.mouse.y) * 0.08;
    this.tiltPointer.x += (pointer.nx - this.tiltPointer.x) * 0.04;
    this.tiltPointer.y += (pointer.ny - this.tiltPointer.y) * 0.04;
    this.scroll += velocity * 0.0004;

    if (this.ripple && p.ripple > 0.01 && p.intro > 0.2) {
      this.ripple.step(this.renderer, p.ripple * (1 - p.dim * 0.6));
      s.uRipple.value = this.ripple.texture;
      s.uRippleTexel.value.copy(this.ripple.texel);
    }
    s.uTime.value = time;
    s.uMouse.value.set(this.mouse.x, this.mouse.y);
    s.uIntro.value = p.intro;
    s.uDim.value = p.dim;
    s.uLight.value = p.light;
    s.uGrid.value = p.grid;
    s.uHeat.value = p.heat;
    s.uVel.value += (velocity - s.uVel.value) * 0.1;
    s.uScroll.value = this.scroll;

    const visible = p.plan > 0.002;
    this.group.visible = visible;
    if (visible) {
      const u = this.plan.uniforms;
      u.uDraw.value = p.draw;
      u.uOpacity.value = p.plan;
      u.uZone.value = p.zone;
      u.uZoneMix.value = p.zoneMix;
      u.uLight.value = p.light;
      const f = this.flow.uniforms;
      f.uProgress.value = p.flow;
      f.uOpacity.value = p.flowOpacity * p.plan;
      f.uPulse.value = p.pulse;
      this.flow.steamUniforms.uOpacity.value = p.steam * p.plan;
      this.flow.steamUniforms.uLight.value = p.light;
      this.flow.update(time);

      const scale = this.fit * p.zoom;
      const [lx, ly] = toLocal(p.fx, p.fy);
      this.inner.position.set(-lx, -ly, 0);
      this.group.scale.setScalar(scale);
      this.group.position.set(p.x * this.halfW, p.y * this.halfH, 0);
      const sway = this.mobile ? 0 : 1;
      this.group.rotation.set(-p.tilt + this.tiltPointer.y * 0.05 * sway, this.tiltPointer.x * 0.07 * sway, -0.02);
      this.group.updateMatrixWorld();
      this.placeLabels();
    } else if (this.labels) {
      this.labels.style.opacity = '0';
    }

    this.renderer.render(this.scene, this.camera);
  }

  private placeLabels() {
    if (!this.labels) return;
    const p = this.params;
    const o = p.plan * gsap.utils.clamp(0, 1, (p.draw - 0.55) * 3);
    this.labels.style.opacity = o.toFixed(3);
    if (o < 0.01) return;
    const zone = p.zoneMix > 0.5 ? Math.round(p.zone) : -1;
    if (zone !== this.activeZone) {
      this.activeZone = zone;
      this.labelEls.forEach((l) => l.el.classList.toggle('is-active', l.zone >= 0 && l.zone === zone));
    }
    for (const l of this.labelEls) {
      this.v.copy(l.p);
      this.inner.localToWorld(this.v);
      this.v.project(this.camera);
      const x = (this.v.x * 0.5 + 0.5) * innerWidth;
      const y = (-this.v.y * 0.5 + 0.5) * innerHeight;
      l.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }
  }
}
