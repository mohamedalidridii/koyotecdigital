"use client";

import styles from "./Hypercube.module.css";

import { useEffect, useRef } from "react";
import * as THREE from "three";

class HypercubeScene {
  constructor(
    container = document.body,
    color = "#000000",
    pixelSize = 10,
    density = 500,
    spinStrength = 1,
  ) {
    this.foreground = color;
    this.pixelSize = pixelSize;
    this.density = density;
    this.duration = 16000;
    this.rafId = 0;
    this.container = container;

    this.spinStrength = spinStrength;
    this.angleY = 0;
    this.angleX = Math.sin((45 * Math.PI) / 180);
    this.spinBoostY = 0;
    this.spinBoostX = 0;
    this.lastFrameTime = null;
    this.lastPointer = null;
    this.onPointerMoveBound = this.onPointerMove.bind(this);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      50,
      innerWidth / innerHeight,
      0.1,
      2000,
    );
    this.camera.position.set(0, 0, 6);

    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(innerWidth, innerHeight);

    container.insertBefore(this.renderer.domElement, container.firstChild);

    this.onResizeBound = this.onResize.bind(this);
  }

  init() {
    const particlesPerEdge = this.density;
    const sizeOut = 1;
    const sizeIn = 0.5;
    const cubeEdges = [
      [0, 1],
      [1, 3],
      [3, 2],
      [2, 0],
      [4, 5],
      [5, 7],
      [7, 6],
      [6, 4],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
    ];
    const unitCorners = [];
    const geo = new THREE.BufferGeometry();
    const totalParticles = (cubeEdges.length + 8) * particlesPerEdge;
    const posStart = new Float32Array(totalParticles * 3);
    const posEnd = new Float32Array(totalParticles * 3);
    const offsets = new Float32Array(totalParticles);
    let pIdx = 0;

    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        for (let z = -1; z <= 1; z += 2) {
          unitCorners.push(new THREE.Vector3(x, y, z));
        }
      }
    }

    cubeEdges.forEach((edge) => {
      const [cornerA, cornerB] = edge;
      const vA = unitCorners[cornerA];
      const vB = unitCorners[cornerB];

      for (let p = 0; p < particlesPerEdge; p++) {
        const t = p / particlesPerEdge;
        const edgePoint = new THREE.Vector3().lerpVectors(vA, vB, t);
        const start = edgePoint.clone().multiplyScalar(sizeOut);
        const end = edgePoint.clone().multiplyScalar(sizeIn);

        const inward = pIdx % 2 === 0;

        this.setParticleData(
          pIdx,
          inward ? start : end,
          inward ? end : start,
          posStart,
          posEnd,
          offsets,
        );
        pIdx++;
      }
    });

    geo.setAttribute("position", new THREE.BufferAttribute(posStart, 3));
    geo.setAttribute("targetPos", new THREE.BufferAttribute(posEnd, 3));
    geo.setAttribute("offset", new THREE.BufferAttribute(offsets, 1));

    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(this.foreground) },

        uPixelSize: {
          value: (this.pixelSize / 4) * Math.min(devicePixelRatio, 2),
        },

        uGridSize: {
          value: this.pixelSize * 0.8 * Math.min(devicePixelRatio, 2),
        },
        uResolution: {
          value: new THREE.Vector2(
            innerWidth * Math.min(devicePixelRatio, 2),
            innerHeight * Math.min(devicePixelRatio, 2),
          ),
        },
      },
      vertexShader: `
				uniform float uTime;
				uniform float uPixelSize;
				uniform float uGridSize;
				uniform vec2 uResolution;
				attribute vec3 targetPos;
				attribute float offset;

				float cubicBezierX(float t, float x1, float x2) {
					return 3.0 * (1.0 - t) * (1.0 - t) * t * x1 + 3.0 * (1.0 - t) * t * t * x2 + t * t * t;
				}
				float cubicBezierDX(float t, float x1, float x2) {
					return 3.0 * (1.0 - t) * (1.0 - t) * x1 + 6.0 * (1.0 - t) * t * (x2 - x1) + 3.0 * t * t * (1.0 - x2);
				}
				float cubicBezierEase(float x) {
					float x1 = 0.37;
					float y1 = 0.0;
					float x2 = 0.63;
					float y2 = 1.0;

					float t = x;
					for (int i = 0; i < 8; i++) {
						float err = cubicBezierX(t, x1, x2) - x;
						float dt = cubicBezierDX(t, x1, x2);
						if (abs(dt) < 1e-6) break;
						t -= err / dt;
						t = clamp(t, 0.0, 1.0);
					}

					return 3.0 * (1.0 - t) * (1.0 - t) * t * y1 + 3.0 * (1.0 - t) * t * t * y2 + t * t * t;
				}
				void main() {
					float raw = mod(uTime * 0.5 + offset, 2.0);

					float leg = raw < 1.0 ? cubicBezierEase(raw) : 1.0 - cubicBezierEase(raw - 1.0);
					float easedProgress = leg;

					vec3 midDir = normalize(position + targetPos);
					float bulge = sin(easedProgress * 3.14159265) * 0.1;
					vec3 currentPos = mix(position, targetPos, easedProgress) + midDir * bulge;
					vec4 mvPosition = modelViewMatrix * vec4(currentPos, 1.0);

					gl_PointSize = max(2.0, 1.65 * floor(uPixelSize * 0.5 + 0.5));
					vec4 clip = projectionMatrix * mvPosition;

					vec2 ndc = clip.xy / clip.w;
					vec2 screen = (ndc * 0.5 + 0.5) * uResolution;
					screen = (floor(screen / uGridSize) + 0.5) * uGridSize;

					screen = floor(screen + 0.5);
					ndc = (screen / uResolution) * 2.0 - 1.0;
					clip.xy = ndc * clip.w;
					gl_Position = clip;
				}
			`,
      fragmentShader: `
				uniform vec3 uColor;
				void main() {

					gl_FragColor = vec4(uColor, 1.0);
				}
			`,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.tesseract = new THREE.Points(geo, this.mat);

    this.tesseract.rotation.x = this.angleX;
    this.scene.add(this.tesseract);
    this.updateScale();

    window.addEventListener("resize", this.onResizeBound);
    window.addEventListener("pointermove", this.onPointerMoveBound);
    this.animate(0);
  }

  onPointerMove(event) {
    const x = event.clientX;
    const y = event.clientY;

    if (this.lastPointer) {
      const dx = x - this.lastPointer.x;
      const dy = y - this.lastPointer.y;

      const cx = innerWidth / 2;
      const cy = innerHeight / 2;
      const dist = Math.hypot(x - cx, y - cy);
      const radius = Math.min(innerWidth, innerHeight) * 0.4;
      const proximity = Math.max(0, 1 - dist / radius);

      const kick = 0.045 * this.spinStrength * proximity;
      const maxBoost = 25 * this.spinStrength;
      this.spinBoostY += dx * kick;
      this.spinBoostX += dy * kick;
      this.spinBoostY = Math.max(
        -maxBoost,
        Math.min(maxBoost, this.spinBoostY),
      );
      this.spinBoostX = Math.max(
        -maxBoost,
        Math.min(maxBoost, this.spinBoostX),
      );
    }

    this.lastPointer = { x, y };
  }

  animate(time) {

    if (this.lastFrameTime === null) this.lastFrameTime = time;
    const dt = Math.min(0.05, (time - this.lastFrameTime) / 1e3);
    this.lastFrameTime = time;

    if (this.tesseract) {
      const msToSeconds = this.duration / 1e3;
      const baseVelocity = (Math.PI * 2) / msToSeconds;

      this.angleY += (baseVelocity + this.spinBoostY) * dt;
      this.angleX += this.spinBoostX * dt;
      this.angleY %= Math.PI * 2;
      this.angleX %= Math.PI * 2;
      this.tesseract.rotation.y = this.angleY;
      this.tesseract.rotation.x = this.angleX;

      const decay = Math.exp(-dt * 3.5);
      this.spinBoostY *= decay;
      this.spinBoostX *= decay;
    }
    if (this.mat) {
      this.mat.uniforms.uTime.value = time / 1e3;
    }

    this.renderer.render(this.scene, this.camera);
    this.rafId = requestAnimationFrame(this.animate.bind(this));
  }

  updateScale() {
    if (!this.tesseract) return;

    const minDim = Math.min(innerWidth, innerHeight);
    const scale = Math.max(0.5, Math.min(1, minDim / 800));
    this.tesseract.scale.setScalar(scale);
  }

  onResize() {
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight);
    this.updateScale();

    if (this.mat) {
      const dpr = Math.min(devicePixelRatio, 2);
      this.mat.uniforms.uPixelSize.value = (this.pixelSize / 4) * dpr;
      this.mat.uniforms.uGridSize.value = this.pixelSize * 0.8 * dpr;
      this.mat.uniforms.uResolution.value.set(
        innerWidth * dpr,
        innerHeight * dpr,
      );
    }
  }

  setParticleData(i, start, end, posStart, posEnd, offsets) {
    const index = i * 3;

    posStart[index] = start.x;
    posStart[index + 1] = start.y;
    posStart[index + 2] = start.z;
    posEnd[index] = end.x;
    posEnd[index + 1] = end.y;
    posEnd[index + 2] = end.z;
    offsets[i] = Utils.random();
  }

  dispose() {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener("resize", this.onResizeBound);
    window.removeEventListener("pointermove", this.onPointerMoveBound);

    if (this.tesseract) {
      this.scene.remove(this.tesseract);
      this.tesseract.geometry.dispose();
    }
    this.mat?.dispose();
    this.renderer.dispose();

    const canvas = this.renderer.domElement;
    if (canvas.parentNode === this.container) {
      this.container.removeChild(canvas);
    }
  }
}

class Utils {
  static random() {
    return crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
  }
}

export default function Hypercube({
  color = "#000000",
  pixelSize = 10,
  density = 550,
  spinStrength = 1,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const instance = new HypercubeScene(
      container,
      color,
      pixelSize,
      density,
      spinStrength,
    );
    instance.init();

    return () => {
      instance.dispose();
    };
  }, [color, pixelSize, density, spinStrength]);

  return (
    <div ref={containerRef} className={styles.hypercube} aria-hidden="true" />
  );
}
