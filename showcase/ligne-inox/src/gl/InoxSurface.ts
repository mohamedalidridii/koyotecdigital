import { Mesh, PlaneGeometry, ShaderMaterial, Texture, Vector2 } from 'three';
import vertexShader from './shaders/screen.vert';
import fragmentShader from './shaders/inox.frag';

/** Full-screen brushed steel sheet, drawn first, behind the plan. */
export class InoxSurface {
  mesh: Mesh<PlaneGeometry, ShaderMaterial>;
  uniforms = {
    uRipple: { value: null as Texture | null },
    uRippleTexel: { value: new Vector2(1 / 256, 1 / 256) },
    uRes: { value: new Vector2(1, 1) },
    uMouse: { value: new Vector2(0.5, 0.5) },
    uTime: { value: 0 },
    uIntro: { value: 0 },
    uDim: { value: 0 },
    uLight: { value: 0 },
    uGrid: { value: 0 },
    uVel: { value: 0 },
    uHeat: { value: 0 },
    uScroll: { value: 0 },
  };

  constructor() {
    const material = new ShaderMaterial({ vertexShader, fragmentShader, uniforms: this.uniforms, depthTest: false, depthWrite: false });
    this.mesh = new Mesh(new PlaneGeometry(2, 2), material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -10;
  }
}
