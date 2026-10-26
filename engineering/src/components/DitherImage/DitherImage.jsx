"use client";

import styles from "./DitherImage.module.css";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";

import { BASE } from "@/lib/i18n";

// image paths are written from the site root ("/images/…"): serve them from the base path
const withBase = (src) =>
  BASE && src?.startsWith("/") && !src.startsWith(`${BASE}/`) ? `${BASE}${src}` : src;

const DEFAULTS = {
  mode: "ordered",
  pixelSize: 2,

  gridSize: 3,
  threshold: 0.5,
  brightness: 0,
  contrast: 1,
  darkColor: "#0d0d0d",
  lightColor: "#f3f1ec",

  matrixSize: 4,
  lumPixelSize: 1,
  pixelSizeMultiplier: 5,
  scaleResolution: 1,
  ditherAmount: 1,
  bias: 0,
  biasNoiseScale: 10,
  biasNoiseSpeed: 0.75,
  biasPulseSpeed: 0.5,
  biasNoiseWeight: 0.5,
  biasPulseWeight: 0.05,
  biasAnimationStrength: 1.25,
  trailDecay: 0.85,
  trailRadius: 0.15,
  trailIntensityMultiplier: 5,
};

let sharedRenderer = null;
const pointerEffects = new Set();
let pointerBound = false;

function handleSharedPointerMove(e) {
  pointerEffects.forEach((effect) => {
    if (!effect.visible) return;
    effect.onPointerMove(e);
  });
}

function watchPointer(effect) {
  pointerEffects.add(effect);
  if (pointerBound) return;
  pointerBound = true;
  window.addEventListener("pointermove", handleSharedPointerMove, {
    passive: true,
  });
}

function unwatchPointer(effect) {
  pointerEffects.delete(effect);
  if (pointerEffects.size || !pointerBound) return;
  pointerBound = false;
  window.removeEventListener("pointermove", handleSharedPointerMove);
}

function getRenderer() {
  if (!sharedRenderer) {
    sharedRenderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      premultipliedAlpha: false,
    });
    sharedRenderer.setPixelRatio(1);
  }
  return sharedRenderer;
}

const VERTEX = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

function diffusionFragment(grid) {
  return `
precision highp float;

#define GRID_X ${grid}.0
#define GRID_Y ${grid}.0

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uCoverScale;
uniform float uThreshold;
uniform float uBrightness;
uniform float uContrast;
uniform vec3 uDarkColor;
uniform vec3 uLightColor;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform float uMouseRadius;
uniform float uTime;

out vec4 fragColor;

const vec2 gridSize = vec2(GRID_X, GRID_Y);
const int arrSize = int(GRID_X * GRID_Y);
float errAcc[arrSize];

int getIndex(vec2 p) {
  int x = int(p.x);
  int y = int(p.y);
  if (x < 0 || y < 0 || x >= int(GRID_X) || y >= int(GRID_Y)) return -1;
  return x + y * int(GRID_X);
}

vec4 sampleTex(vec2 pix) {
  vec2 uv = (pix + 0.5) / uResolution;
  uv = (uv - 0.5) * uCoverScale + 0.5;
  return texture(uTexture, uv);
}

float sampleLuma(vec2 pix) {
  vec3 c = sampleTex(pix).rgb;
  float g = dot(c, vec3(0.2126, 0.7152, 0.0722));
  g += uBrightness;
  g = (g - 0.5) * uContrast + 0.5;
  return g;
}

vec2 dispersion(vec2 p) {
  vec2 toP = p - uMouse;
  float d = length(toP);
  vec2 dir = d > 1e-4 ? toP / d : vec2(0.0);
  float falloff = exp(-(d * d) / (uMouseRadius * uMouseRadius));
  float ripple = 0.85 + 0.15 * sin(d * 0.18 - uTime * 5.0);

  return -dir * falloff * uMouseStrength * uMouseRadius * 0.3 * ripple;
}

void main() {

  vec2 pix = floor(vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y));
  vec2 topLeft = floor(pix / gridSize) * gridSize;
  vec2 myPos = pix - topLeft;

  for (int i = 0; i < arrSize; i++) errAcc[i] = 0.0;

  vec2 disp = dispersion(topLeft + gridSize * 0.5);

  float outColor = 0.0;
  for (float y = 0.0; y < GRID_Y; y += 1.0) {
    for (float x = 0.0; x < GRID_X; x += 1.0) {
      vec2 cell = vec2(x, y);
      vec2 srcPix = topLeft + cell + disp;

      if (sampleTex(srcPix).a < 0.01) continue;
      float ideal = sampleLuma(srcPix) + errAcc[int(x) + int(y) * int(GRID_X)];
      float value = step(uThreshold, ideal);
      float err = ideal - value;

      int r = getIndex(cell + vec2(1.0, 0.0));  if (r >= 0) errAcc[r] += err * (7.0 / 16.0);
      int bl = getIndex(cell + vec2(-1.0, 1.0)); if (bl >= 0) errAcc[bl] += err * (3.0 / 16.0);
      int b = getIndex(cell + vec2(0.0, 1.0));  if (b >= 0) errAcc[b] += err * (5.0 / 16.0);
      int br = getIndex(cell + vec2(1.0, 1.0));  if (br >= 0) errAcc[br] += err * (1.0 / 16.0);
      if (cell == myPos) outColor = value;
    }
  }

  fragColor = vec4(mix(uDarkColor, uLightColor, outColor), sampleTex(pix + disp).a);
}
`;
}

const TRAIL_FRAGMENT = `
precision highp float;

uniform sampler2D uPrev;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec2 uPrevMouse;
uniform float uTrailDecay;
uniform float uTrailRadius;
uniform float uBrushStrength;

out vec4 fragColor;

float distToSegment(vec2 p, vec2 a, vec2 b) {
  vec2 ab = b - a;
  float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-4), 0.0, 1.0);
  return length(p - (a + ab * t));
}

void main() {
  vec2 p = gl_FragCoord.xy;

  float prev = texture(uPrev, p / uResolution).r * uTrailDecay;

  float d = distToSegment(p, uPrevMouse, uMouse);
  float brush = smoothstep(uTrailRadius, 0.0, d) * uBrushStrength;
  fragColor = vec4(clamp(prev + brush, 0.0, 1.0), 0.0, 0.0, 1.0);
}
`;

const CNOISE = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

float cnoise(vec3 P) {
  vec3 Pi0 = floor(P);
  vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
  vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
  vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
  vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
  vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}
`;

function orderedFragment(matrix) {
  return `
precision highp float;

#define MATRIX_SIZE ${matrix}

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uCoverScale;
uniform float uBrightness;
uniform float uContrast;
uniform float uThreshold;
uniform vec3 uDarkColor;
uniform vec3 uLightColor;
uniform float uTime;
uniform sampler2D uTrail;
uniform float uTrailIntensityMultiplier;
uniform float uPixelSize;
uniform float uPixelSizeMultiplier;
uniform float uScaleResolution;
uniform float uDitherAmount;
uniform float uBias;
uniform float uBiasNoiseScale;
uniform float uBiasNoiseSpeed;
uniform float uBiasPulseSpeed;
uniform float uBiasNoiseWeight;
uniform float uBiasPulseWeight;
uniform float uBiasAnimationStrength;

out vec4 fragColor;

${CNOISE}

const float bayer2[4] = float[4](0.0, 2.0, 3.0, 1.0);
const float bayer4[16] = float[16](
  0.0, 8.0, 2.0, 10.0,
  12.0, 4.0, 14.0, 6.0,
  3.0, 11.0, 1.0, 9.0,
  15.0, 7.0, 13.0, 5.0
);
const float bayer8[64] = float[64](
  0.0, 32.0, 8.0, 40.0, 2.0, 34.0, 10.0, 42.0,
  48.0, 16.0, 56.0, 24.0, 50.0, 18.0, 58.0, 26.0,
  12.0, 44.0, 4.0, 36.0, 14.0, 46.0, 6.0, 38.0,
  60.0, 28.0, 52.0, 20.0, 62.0, 30.0, 54.0, 22.0,
  3.0, 35.0, 11.0, 43.0, 1.0, 33.0, 9.0, 41.0,
  51.0, 19.0, 59.0, 27.0, 49.0, 17.0, 57.0, 25.0,
  15.0, 47.0, 7.0, 39.0, 13.0, 45.0, 5.0, 37.0,
  63.0, 31.0, 55.0, 23.0, 61.0, 29.0, 53.0, 21.0
);

float bayerThreshold(vec2 p, int size) {
  int x = int(mod(p.x, float(size)));
  int y = int(mod(p.y, float(size)));
  int idx = y * size + x;
  if (size == 2) return (bayer2[idx] + 0.5) / 4.0;
  if (size == 4) return (bayer4[idx] + 0.5) / 16.0;
  return (bayer8[idx] + 0.5) / 64.0;
}

vec4 sampleTex(vec2 centerPix) {
  vec2 uv = centerPix / uResolution;
  uv = (uv - 0.5) * uCoverScale + 0.5;
  return texture(uTexture, uv);
}

vec3 adjust(vec3 c) {
  c += uBrightness;
  return (c - 0.5) * uContrast + 0.5;
}

void main() {
  vec2 frag = gl_FragCoord.xy;

  float trail = clamp(texture(uTrail, frag / uResolution).r * uTrailIntensityMultiplier, 0.0, 1.0);

  vec2 up = vec2(frag.x, uResolution.y - frag.y);

  vec2 colorCenter = (floor(up / uPixelSize) + 0.5) * uPixelSize;
  vec4 src = sampleTex(colorCenter);
  vec3 sourceColor = adjust(src.rgb);

  float dynPx = mix(uPixelSize, uPixelSize * uPixelSizeMultiplier, trail);
  vec2 lumCenter = (floor(up / dynPx) + 0.5) * dynPx;
  vec4 ls = sampleTex(lumCenter);
  float lum = dot(ls.rgb, vec3(0.2126, 0.7152, 0.0722));
  lum += uBrightness;
  lum = (lum - 0.5) * uContrast + 0.5;

  vec2 uvN = up / uResolution;
  float n = cnoise(vec3(uvN * uBiasNoiseScale, uTime * uBiasNoiseSpeed));
  float pulse = sin(uTime * uBiasPulseSpeed) * 0.5 + 0.5;
  float bias = uBias + (n * uBiasNoiseWeight + pulse * uBiasPulseWeight) * uBiasAnimationStrength;

  int size = trail >= 0.5 ? 8 : MATRIX_SIZE;
  float threshold = bayerThreshold(floor(frag / uScaleResolution), size);

  float value = threshold + bias * (1.0 + 2.0 * trail) + (uThreshold - 0.5);
  vec3 dithered = mix(uDarkColor, uLightColor, step(value, lum));

  fragColor = vec4(mix(sourceColor, dithered, uDitherAmount), src.a);
}
`;
}

class DitherEffect {
  constructor(canvas, img) {
    this.canvas = canvas;
    this.img = img;
    this.ctx = canvas.getContext("2d");
    this.settings = { ...DEFAULTS };
    this.width = 0;
    this.height = 0;
    this.texture = null;
    this.mode = null;
    this.grid = null;
    this.matrix = null;

    this.time = 0;
    this.raf = 0;
    this.visible = true;

    this.mouse = new THREE.Vector2();
    this.strength = 0;

    this.prevMouse = new THREE.Vector2();
    this.hasMouse = false;
    this.trailFrames = 0;
    this.trailA = null;
    this.trailB = null;
    this.trailMaterial = null;
    this.trailMesh = null;
    this.scene = new THREE.Scene();
    this.trailScene = new THREE.Scene();
    this.camera = new THREE.Camera();
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
    this.createMaterial();
  }

  createMaterial() {
    if (this.mode !== this.settings.mode) {

      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
    this.material?.dispose();
    this.mode = this.settings.mode;
    const common = {
      uTexture: { value: this.texture },
      uResolution: { value: new THREE.Vector2(this.width, this.height) },
      uCoverScale: { value: new THREE.Vector2(1, 1) },
      uBrightness: { value: this.settings.brightness },
      uContrast: { value: this.settings.contrast },
      uThreshold: { value: this.settings.threshold },

      uDarkColor: {
        value: new THREE.Color().setStyle(
          this.settings.darkColor,
          THREE.NoColorSpace,
        ),
      },
      uLightColor: {
        value: new THREE.Color().setStyle(
          this.settings.lightColor,
          THREE.NoColorSpace,
        ),
      },
      uTime: { value: this.time },
    };

    if (this.mode === "ordered") {
      this.matrix = this.settings.matrixSize;
      this.material = new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        uniforms: {
          ...common,
          uTrail: { value: null },
          uTrailIntensityMultiplier: { value: 1 },
          uPixelSize: { value: 1 },
          uPixelSizeMultiplier: { value: 3 },
          uScaleResolution: { value: 1 },
          uDitherAmount: { value: 1 },
          uBias: { value: 0 },
          uBiasNoiseScale: { value: 3 },
          uBiasNoiseSpeed: { value: 0.3 },
          uBiasPulseSpeed: { value: 1 },
          uBiasNoiseWeight: { value: 0.15 },
          uBiasPulseWeight: { value: 0.05 },
          uBiasAnimationStrength: { value: 1 },
        },
        vertexShader: VERTEX,
        fragmentShader: orderedFragment(this.matrix),
      });
      this.ensureTrailMaterial();
    } else {
      this.grid = this.settings.gridSize;
      this.material = new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        uniforms: {
          ...common,
          uMouse: { value: new THREE.Vector2() },
          uMouseStrength: { value: 0 },
          uMouseRadius: { value: 1 },
        },
        vertexShader: VERTEX,
        fragmentShader: diffusionFragment(this.grid),
      });
    }
    this.mesh.material = this.material;
  }

  ensureTrailMaterial() {
    if (this.trailMaterial) return;
    this.trailMaterial = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      uniforms: {
        uPrev: { value: null },
        uResolution: { value: new THREE.Vector2() },
        uMouse: { value: new THREE.Vector2() },
        uPrevMouse: { value: new THREE.Vector2() },
        uTrailDecay: { value: 0.94 },
        uTrailRadius: { value: 1 },
        uBrushStrength: { value: 0 },
      },
      vertexShader: VERTEX,
      fragmentShader: TRAIL_FRAGMENT,
    });
    this.trailMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      this.trailMaterial,
    );
    this.trailMesh.frustumCulled = false;
    this.trailScene.add(this.trailMesh);
  }

  load(onReady) {
    const setup = () => {
      this.texture?.dispose();
      const tex = new THREE.Texture(this.img);
      tex.flipY = false;
      tex.premultiplyAlpha = false;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      tex.needsUpdate = true;
      this.texture = tex;
      this.material.uniforms.uTexture.value = tex;
      onReady();
    };
    if (this.img.complete && this.img.naturalWidth > 0) setup();
    else this.img.addEventListener("load", setup, { once: true });
  }

  resize() {
    const px = this.settings.pixelSize;
    const w = Math.max(1, Math.round(this.canvas.clientWidth / px));
    const h = Math.max(1, Math.round(this.canvas.clientHeight / px));
    if (w === this.width && h === this.height && this.canvas.width === w)
      return false;
    this.width = w;
    this.height = h;
    this.canvas.width = w;
    this.canvas.height = h;
    if (this.mode === "ordered") this.ensureTargets();
    return true;
  }

  coverScale() {
    const imgAspect =
      (this.img.naturalWidth || 1) / (this.img.naturalHeight || 1);
    const canvasAspect = this.width / this.height;
    return imgAspect > canvasAspect
      ? new THREE.Vector2(canvasAspect / imgAspect, 1)
      : new THREE.Vector2(1, imgAspect / canvasAspect);
  }

  makeTarget() {
    const r = getRenderer();
    const type = r.capabilities.isWebGL2
      ? THREE.HalfFloatType
      : THREE.UnsignedByteType;
    return new THREE.WebGLRenderTarget(this.width, this.height, {
      type,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      depthBuffer: false,
      stencilBuffer: false,
    });
  }

  ensureTargets() {
    if (
      this.trailA &&
      this.trailA.width === this.width &&
      this.trailA.height === this.height
    )
      return;
    this.disposeTargets();
    this.trailA = this.makeTarget();
    this.trailB = this.makeTarget();
    const r = getRenderer();
    r.setRenderTarget(this.trailA);
    r.setClearColor(0x000000, 1);
    r.clear();
    r.setRenderTarget(this.trailB);
    r.clear();
    r.setRenderTarget(null);
  }

  disposeTargets() {
    this.trailA?.dispose();
    this.trailB?.dispose();
    this.trailA = null;
    this.trailB = null;
  }

  renderTrail(r) {
    const tu = this.trailMaterial.uniforms;
    tu.uResolution.value.set(this.width, this.height);
    tu.uPrev.value = this.trailA.texture;

    tu.uMouse.value.set(this.mouse.x, this.height - this.mouse.y);
    tu.uPrevMouse.value.set(this.prevMouse.x, this.height - this.prevMouse.y);
    tu.uTrailDecay.value = this.settings.trailDecay;
    tu.uTrailRadius.value =
      Math.min(this.width, this.height) * this.settings.trailRadius;

    const dist = this.mouse.distanceTo(this.prevMouse);
    const speed = Math.min(
      1,
      dist / (Math.min(this.width, this.height) * 0.05),
    );
    tu.uBrushStrength.value = speed;

    r.setRenderTarget(this.trailB);
    r.render(this.trailScene, this.camera);
    const t = this.trailA;
    this.trailA = this.trailB;
    this.trailB = t;
    this.prevMouse.copy(this.mouse);
  }

  needsRebuild() {
    if (this.mode !== this.settings.mode) return true;
    if (this.settings.mode === "diffusion")
      return this.grid !== this.settings.gridSize;
    return this.matrix !== this.settings.matrixSize;
  }

  render() {
    if (!this.texture) return;
    if (this.needsRebuild()) this.createMaterial();

    const r = getRenderer();
    r.setSize(this.width, this.height, false);
    const u = this.material.uniforms;

    u.uResolution.value.set(this.width, this.height);
    u.uCoverScale.value.copy(this.coverScale());
    u.uBrightness.value = this.settings.brightness;
    u.uContrast.value = this.settings.contrast;
    u.uThreshold.value = this.settings.threshold;
    u.uDarkColor.value.setStyle(this.settings.darkColor, THREE.NoColorSpace);
    u.uLightColor.value.setStyle(this.settings.lightColor, THREE.NoColorSpace);
    u.uTime.value = this.time;

    if (this.mode === "ordered") {
      this.ensureTargets();
      this.renderTrail(r);
      u.uTrail.value = this.trailA.texture;
      u.uTrailIntensityMultiplier.value =
        this.settings.trailIntensityMultiplier;
      u.uPixelSize.value = this.settings.lumPixelSize;
      u.uPixelSizeMultiplier.value = this.settings.pixelSizeMultiplier;
      u.uScaleResolution.value = this.settings.scaleResolution;
      u.uDitherAmount.value = this.settings.ditherAmount;
      u.uBias.value = this.settings.bias;
      u.uBiasNoiseScale.value = this.settings.biasNoiseScale;
      u.uBiasNoiseSpeed.value = this.settings.biasNoiseSpeed;
      u.uBiasPulseSpeed.value = this.settings.biasPulseSpeed;
      u.uBiasNoiseWeight.value = this.settings.biasNoiseWeight;
      u.uBiasPulseWeight.value = this.settings.biasPulseWeight;
      u.uBiasAnimationStrength.value = this.settings.biasAnimationStrength;
    } else {
      u.uMouse.value.copy(this.mouse);
      u.uMouseStrength.value = this.strength;
      u.uMouseRadius.value = Math.min(this.width, this.height) * 0.35;
    }

    r.setClearColor(0x000000, 0);
    r.setRenderTarget(null);
    r.render(this.scene, this.camera);

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.drawImage(r.domElement, 0, 0);
  }

  visibleHoverRect() {
    const canvasRect = this.canvas.getBoundingClientRect();
    let left = canvasRect.left;
    let top = canvasRect.top;
    let right = canvasRect.right;
    let bottom = canvasRect.bottom;
    if (right <= left || bottom <= top) return null;

    let el = this.canvas.parentElement;
    while (el && el !== document.body && el !== document.documentElement) {
      const { overflow, overflowX, overflowY } = getComputedStyle(el);
      if (
        overflow !== "visible" ||
        overflowX !== "visible" ||
        overflowY !== "visible"
      ) {
        const cr = el.getBoundingClientRect();
        if (cr.width > 0 && cr.height > 0) {
          left = Math.max(left, cr.left);
          top = Math.max(top, cr.top);
          right = Math.min(right, cr.right);
          bottom = Math.min(bottom, cr.bottom);
          if (right <= left || bottom <= top) return null;
        }
      }
      el = el.parentElement;
    }
    return { left, top, right, bottom };
  }

  onPointerMove(e) {
    if (!this.visible) return;
    const vis = this.visibleHoverRect();
    if (!vis) return;
    if (
      e.clientX < vis.left ||
      e.clientX > vis.right ||
      e.clientY < vis.top ||
      e.clientY > vis.bottom
    )
      return;
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.mouse.set(
      (x / rect.width) * this.width,
      (y / rect.height) * this.height,
    );
    if (!this.hasMouse) {
      this.prevMouse.copy(this.mouse);
      this.hasMouse = true;
    }
    this.visible = true;
    this.strength = 1;
    this.trailFrames = 120;
    this.animate();
  }

  animate() {
    if (this.raf) return;
    const orderedAnim =
      this.mode === "ordered" && this.settings.biasAnimationStrength !== 0;
    const needLoop =
      (this.mode === "diffusion" && this.strength > 0) ||
      (this.mode === "ordered" && (orderedAnim || this.trailFrames > 0));
    if (!needLoop) {
      this.render();
      return;
    }
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!this.visible) {
        this.raf = 0;
        return;
      }
      if (this.mode === "diffusion") {

        this.time += dt;
        this.strength *= Math.exp(-dt * 2.5);
        this.render();
        if (this.strength > 0.02) {
          this.raf = requestAnimationFrame(tick);
        } else {
          this.strength = 0;
          this.raf = 0;
          this.render();
        }
      } else {

        this.time += dt;
        if (this.trailFrames > 0) this.trailFrames -= 1;
        this.render();
        const running =
          this.settings.biasAnimationStrength !== 0 ||
          this.trailFrames > 0;
        if (running) {
          this.raf = requestAnimationFrame(tick);
        } else {
          this.raf = 0;
          this.render();
        }
      }
    };
    this.raf = requestAnimationFrame(tick);
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.visible = false;
    this.texture?.dispose();
    this.material?.dispose();
    this.trailMaterial?.dispose();
    this.trailMesh?.geometry.dispose();
    this.disposeTargets();
    this.mesh.geometry.dispose();
  }
}

const instances = new Set();
let gui = null;
let debugSettings = null;
const STORAGE_KEY = "ditherImageDebug";

function isDebug() {
  return (
    new URLSearchParams(window.location.search).get("debugDitherImage") ===
    "true"
  );
}

function formatDefaults(s) {
  return `const DEFAULTS = {
  mode: "${s.mode}",
  pixelSize: ${s.pixelSize},
  gridSize: ${s.gridSize},
  threshold: ${s.threshold},
  brightness: ${s.brightness},
  contrast: ${s.contrast},
  darkColor: "${s.darkColor}",
  lightColor: "${s.lightColor}",
  matrixSize: ${s.matrixSize},
  lumPixelSize: ${s.lumPixelSize},
  pixelSizeMultiplier: ${s.pixelSizeMultiplier},
  scaleResolution: ${s.scaleResolution},
  ditherAmount: ${s.ditherAmount},
  bias: ${s.bias},
  biasNoiseScale: ${s.biasNoiseScale},
  biasNoiseSpeed: ${s.biasNoiseSpeed},
  biasPulseSpeed: ${s.biasPulseSpeed},
  biasNoiseWeight: ${s.biasNoiseWeight},
  biasPulseWeight: ${s.biasPulseWeight},
  biasAnimationStrength: ${s.biasAnimationStrength},
  trailDecay: ${s.trailDecay},
  trailRadius: ${s.trailRadius},
  trailIntensityMultiplier: ${s.trailIntensityMultiplier},
};`;
}

async function ensureGui() {
  if (gui) return;
  gui = {};
  const saved = localStorage.getItem(STORAGE_KEY);
  debugSettings = { ...DEFAULTS, ...(saved ? JSON.parse(saved) : {}) };

  const { GUI } = await import("lil-gui");
  gui = new GUI({ title: "DitherImage" });

  const onChange = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(debugSettings));
    instances.forEach((i) => i.redraw());
  };

  const general = gui.addFolder("General");
  general.add(debugSettings, "mode", ["diffusion", "ordered"]).onChange(() => {
    updateFolders();
    onChange();
  });
  general.add(debugSettings, "pixelSize", 1, 16, 1).onChange(onChange);
  general.add(debugSettings, "brightness", -1, 1).onChange(onChange);
  general.add(debugSettings, "contrast", 0, 3).onChange(onChange);
  general.addColor(debugSettings, "darkColor").onChange(onChange);
  general.addColor(debugSettings, "lightColor").onChange(onChange);

  const dither = gui.addFolder("Dither");
  const cThresh = dither
    .add(debugSettings, "threshold", 0, 1)
    .onChange(onChange);
  const cGrid = dither
    .add(debugSettings, "gridSize", 2, 8, 1)
    .onChange(onChange);
  const cMatrix = dither
    .add(debugSettings, "matrixSize", { "2x2": 2, "4x4": 4 })
    .onChange(onChange);
  const cLumPx = dither
    .add(debugSettings, "lumPixelSize", 1, 8, 1)
    .onChange(onChange);
  const cPxMul = dither
    .add(debugSettings, "pixelSizeMultiplier", 1, 8, 0.1)
    .onChange(onChange);
  const cScale = dither
    .add(debugSettings, "scaleResolution", 1, 8, 1)
    .onChange(onChange);
  const cAmt = dither
    .add(debugSettings, "ditherAmount", 0, 1, 0.01)
    .onChange(onChange);
  const cBias = dither
    .add(debugSettings, "bias", -1, 1, 0.01)
    .onChange(onChange);

  const biasF = gui.addFolder("Bias animation");
  biasF.add(debugSettings, "biasNoiseScale", 0, 10, 0.1).onChange(onChange);
  biasF.add(debugSettings, "biasNoiseSpeed", 0, 2, 0.01).onChange(onChange);
  biasF.add(debugSettings, "biasPulseSpeed", 0, 5, 0.01).onChange(onChange);
  biasF.add(debugSettings, "biasNoiseWeight", 0, 1, 0.01).onChange(onChange);
  biasF.add(debugSettings, "biasPulseWeight", 0, 1, 0.01).onChange(onChange);
  biasF
    .add(debugSettings, "biasAnimationStrength", 0, 2, 0.01)
    .onChange(onChange);

  const trailF = gui.addFolder("Trail");
  trailF.add(debugSettings, "trailDecay", 0.8, 0.995, 0.001).onChange(onChange);
  trailF.add(debugSettings, "trailRadius", 0.01, 0.3, 0.005).onChange(onChange);
  trailF
    .add(debugSettings, "trailIntensityMultiplier", 0, 3, 0.05)
    .onChange(onChange);

  function updateFolders() {
    const ordered = debugSettings.mode === "ordered";
    cGrid.show(!ordered);
    cMatrix.show(ordered);
    cLumPx.show(ordered);
    cPxMul.show(ordered);
    cScale.show(ordered);
    cAmt.show(ordered);
    cBias.show(ordered);
    cThresh.show(true);
    ordered ? biasF.show() : biasF.hide();
    ordered ? trailF.show() : trailF.hide();
  }
  updateFolders();

  const actions = {
    showOriginal: false,
    copyDefaults: () =>
      navigator.clipboard.writeText(formatDefaults(debugSettings)),
    reset: () => {
      Object.assign(debugSettings, DEFAULTS);
      gui.controllersRecursive().forEach((c) => c.updateDisplay());
      updateFolders();
      onChange();
    },
  };
  gui
    .add(actions, "showOriginal")
    .name("show original")
    .onChange((v) => instances.forEach((i) => i.showOriginal(v)));
  gui.add(actions, "copyDefaults").name("copy defaults");
  gui.add(actions, "reset");

  instances.forEach((i) => i.redraw());
}

const DitherImage = forwardRef(function DitherImage(
  { src, alt = "", className, style, onReady, ...props },
  ref,
) {
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const instanceRef = useRef(null);

  const propsRef = useRef(props);
  const onReadyRef = useRef(onReady);
  const onReadyFired = useRef(false);
  const srcReady = useRef(false);
  propsRef.current = props;
  onReadyRef.current = onReady;

  useImperativeHandle(ref, () => ({
    setSrc(next) {
      next = withBase(next);
      const img = imgRef.current;
      if (!img || img.getAttribute("src") === next) return;
      img.src = next;
      instanceRef.current?.reload();
    },
    redraw: () => instanceRef.current?.redraw(),
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const effect = new DitherEffect(canvas, img);

    const showOriginal = (show) => {
      canvas.style.visibility = show ? "hidden" : "";
      img.style.opacity = show ? "1" : "0";
    };
    let ready = false;

    function applySettings() {
      effect.settings = { ...DEFAULTS, ...propsRef.current };
      if (debugSettings)
        effect.settings = { ...effect.settings, ...debugSettings };
    }

    function draw() {
      if (!ready) return;
      applySettings();
      effect.resize();
      effect.render();
      effect.animate();
      canvas.classList.add(styles.ready);
      img.style.opacity = "0";
      if (!onReadyFired.current) {
        onReadyFired.current = true;
        onReadyRef.current?.();
      }
    }

    function reload() {
      effect.load(() => {
        ready = true;
        draw();
      });
    }

    instanceRef.current = { redraw: draw, showOriginal, reload };
    reload();

    const observer = new ResizeObserver(() => {
      if (!ready) return;
      applySettings();
      if (effect.resize()) {
        effect.render();
        effect.animate();
      }
    });
    observer.observe(canvas);

    const io = new IntersectionObserver(
      (entries) => {
        effect.visible = entries[0].isIntersecting;
        if (effect.visible && ready) draw();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    watchPointer(effect);

    instances.add(instanceRef.current);
    if (isDebug()) ensureGui();

    return () => {
      observer.disconnect();
      io.disconnect();
      unwatchPointer(effect);
      instances.delete(instanceRef.current);
      effect.dispose();
    };
  }, []);

  useEffect(() => {
    if (!srcReady.current) {
      srcReady.current = true;
      return;
    }
    instanceRef.current?.reload?.();
  }, [src]);

  useEffect(() => {
    instanceRef.current?.redraw();
  }, [JSON.stringify(props)]);

  return (
    <div
      className={className ? `${styles.wrapper} ${className}` : styles.wrapper}
      style={style}
    >
      <img ref={imgRef} src={withBase(src)} alt={alt} className={styles.img} />
      <canvas ref={canvasRef} aria-hidden="true" className={styles.canvas} />
    </div>
  );
});

export default DitherImage;
