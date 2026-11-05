import { HalfFloatType, LinearFilter, Mesh, OrthographicCamera, PlaneGeometry, RGBAFormat, Scene, ShaderMaterial, Vector2, WebGLRenderTarget, type WebGLRenderer } from 'three';
import { pointer } from '../pointer';
import vertexShader from './shaders/screen.vert';
import fragmentShader from './shaders/ripple.frag';

/** Ping-pong height-field simulation at a fraction of the screen size. The pointer drags waves through it. */
export class Ripple {
  private targets: [WebGLRenderTarget, WebGLRenderTarget];
  private scene = new Scene();
  private camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private material: ShaderMaterial;
  private prev = new Vector2(0.5, 0.5);
  private last = { x: pointer.x, y: pointer.y };
  private drop = 0;

  constructor(private scale: number) {
    const opts = { type: HalfFloatType, format: RGBAFormat, minFilter: LinearFilter, magFilter: LinearFilter, depthBuffer: false };
    this.targets = [new WebGLRenderTarget(4, 4, opts), new WebGLRenderTarget(4, 4, opts)];
    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uState: { value: null },
        uTexel: { value: new Vector2() },
        uMouse: { value: new Vector2(0.5, 0.5) },
        uPrev: { value: new Vector2(0.5, 0.5) },
        uForce: { value: 0 },
        uRadius: { value: 0.022 },
        uAspect: { value: 1 },
      },
      depthTest: false,
      depthWrite: false,
    });
    const quad = new Mesh(new PlaneGeometry(2, 2), this.material);
    quad.frustumCulled = false;
    this.scene.add(quad);
    addEventListener('pointerdown', () => (this.drop = 1));
  }

  get texture() {
    return this.targets[0].texture;
  }

  get texel() {
    return this.material.uniforms.uTexel.value as Vector2;
  }

  resize(w: number, h: number) {
    const sw = Math.max(8, Math.round(w * this.scale));
    const sh = Math.max(8, Math.round(h * this.scale));
    this.targets.forEach((t) => t.setSize(sw, sh));
    this.material.uniforms.uTexel.value.set(1 / sw, 1 / sh);
    this.material.uniforms.uAspect.value = w / h;
  }

  /** One simulation step; `strength` lets a page calm the surface down. */
  step(renderer: WebGLRenderer, strength: number) {
    const u = this.material.uniforms;
    const mx = pointer.x / innerWidth;
    const my = 1 - pointer.y / innerHeight;
    const moved = Math.hypot(pointer.x - this.last.x, pointer.y - this.last.y);
    this.last = { x: pointer.x, y: pointer.y };
    // A jump (pointer re-entering the window, touch) starts a new stroke instead of dragging across.
    if (moved > 160) this.prev.set(mx, my);
    u.uPrev.value.copy(this.prev);
    u.uMouse.value.set(mx, my);
    this.prev.set(mx, my);
    u.uForce.value = pointer.active ? (Math.min((moved > 160 ? 0 : moved) * 0.008, 0.22) + this.drop * 1.2) * strength : 0;
    u.uRadius.value = 0.022 + this.drop * 0.03;
    this.drop = 0;
    u.uState.value = this.targets[0].texture;
    renderer.setRenderTarget(this.targets[1]);
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(null);
    this.targets.reverse();
  }
}
