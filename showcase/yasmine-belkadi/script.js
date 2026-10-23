import * as THREE from "three";
import { lenis } from "./common.js";
import { reduceMotion } from "./effects/env.js";
import { vertexShader, fragmentShader } from "./shaders.js";

// Yasmine's photos mixed in with the food photos, one panel each
const IMAGES = [
  "img1.jpg",
  "portrait.jpg",
  "img2.jpg",
  "img3.jpg",
  "portrait3.jpg",
  "img5.jpg",
  "img7.jpg",
  "portrait2.jpg",
  "img8.jpg",
  "img11.jpg",
  "portrait5.jpg",
  "img12.jpg",
];

const CONFIG = {
  radius: 7,
  mobileRadius: 5,
  panelGap: 0.08, // share of each slot left empty between panels
  panelHeightRatio: 1.5, // portrait panels
  tileSegments: 24,
  tilt: 0.32,
  tiltOnScroll: 0.35,
  sideTilt: -0.12,
  cameraZ: 15.5,
  mobileCameraZ: 16,
  cameraPullOnScroll: 3,
  dropOnScroll: 1.5,
  cameraSmoothing: 0.075,
  baseRotationSpeed: 0.002,
  scrollRotationMultiplier: 0.0035,
  rotationDecay: 0.9,
  scrollMultiplier: 1.25,
  parallaxStrength: 0.1,
};

const heroSection = document.querySelector(".hero");

let isMobile = window.innerWidth < 1000;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  heroSection.clientWidth / heroSection.clientHeight,
  0.1,
  1000,
);
camera.position.z = isMobile ? CONFIG.mobileCameraZ : CONFIG.cameraZ;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(heroSection.clientWidth, heroSection.clientHeight);
heroSection.appendChild(renderer.domElement);

const cameraPositionUniform = {
  value: new THREE.Vector3(0, 0, camera.position.z),
};
// Raw sRGB page background (#e6ebdf): the shader writes its output without
// colour conversion, so a THREE.Color (linear) would come out too dark
const backgroundUniform = {
  value: new THREE.Vector3(0xe6 / 255, 0xeb / 255, 0xdf / 255),
};
// Smoothed scroll velocity, bends the panels while scrolling
const velocityUniform = { value: 0 };

const ring = new THREE.Group();
ring.rotation.x = CONFIG.tilt;
ring.rotation.z = CONFIG.sideTilt;
scene.add(ring);

const textureLoader = new THREE.TextureLoader();
const panelCount = IMAGES.length;
const angleStep = (Math.PI * 2) / panelCount;

// Each panel is a slice of a cylinder, so the ring reads as one curved band
function buildPanel(radius) {
  const arcAngle = angleStep * (1 - CONFIG.panelGap);
  const arcWidth = arcAngle * radius;
  const height = arcWidth * CONFIG.panelHeightRatio;
  const segments = CONFIG.tileSegments;

  const positions = [];
  const uvCoords = [];
  const indices = [];

  for (let row = 0; row <= 1; row++) {
    for (let col = 0; col <= segments; col++) {
      const angle = (col / segments - 0.5) * arcAngle;
      positions.push(
        Math.sin(angle) * radius,
        (row - 0.5) * height,
        Math.cos(angle) * radius,
      );
      uvCoords.push(col / segments, row);
    }
  }

  for (let col = 0; col < segments; col++) {
    const current = col;
    const below = current + segments + 1;
    indices.push(current, below, current + 1, below, below + 1, current + 1);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvCoords, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return { geometry, aspect: arcWidth / height };
}

const materials = [];

function buildRing() {
  ring.children.forEach((panel) => panel.children[0].geometry.dispose());
  ring.clear();

  const { geometry, aspect } = buildPanel(
    isMobile ? CONFIG.mobileRadius : CONFIG.radius,
  );

  materials.forEach((material, i) => {
    material.uniforms.uPlaneAspect.value = aspect;
    const panel = new THREE.Group();
    panel.rotation.y = i * angleStep;
    panel.add(new THREE.Mesh(i === 0 ? geometry : geometry.clone(), material));
    ring.add(panel);
  });
}

IMAGES.forEach((src) => {
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uMap: { value: null },
      uImageAspect: { value: 1 },
      uPlaneAspect: { value: 1 },
      uCameraPosition: cameraPositionUniform,
      uBackground: backgroundUniform,
      uVelocity: velocityUniform,
    },
    side: THREE.DoubleSide,
  });
  material.uniforms.uMap.value = textureLoader.load(src, (t) => {
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    // Lets the shader crop the photo instead of stretching it
    material.uniforms.uImageAspect.value = t.image.width / t.image.height;
  });
  materials.push(material);
});

buildRing();

let scrollY = 0;
let spinVelocity = 0;
let scrollVelocity = 0;
let smoothVelocity = 0;

lenis.on("scroll", (e) => {
  scrollY = window.pageYOffset;
  if (reduceMotion) return;
  spinVelocity = e.velocity * CONFIG.scrollRotationMultiplier;
  scrollVelocity = e.velocity;
});

let mouseX = 0,
  mouseY = 0,
  smoothX = 0,
  smoothY = 0;

window.addEventListener("mousemove", (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

function animate() {
  requestAnimationFrame(animate);

  // The ring tips forward, sinks and recedes as the hero scrolls away
  const progress = Math.min(
    scrollY / (window.innerHeight * CONFIG.scrollMultiplier),
    1,
  );
  const baseZ = isMobile ? CONFIG.mobileCameraZ : CONFIG.cameraZ;
  camera.position.z +=
    (baseZ + progress * CONFIG.cameraPullOnScroll - camera.position.z) *
    CONFIG.cameraSmoothing;
  ring.position.y +=
    (-progress * CONFIG.dropOnScroll - ring.position.y) *
    CONFIG.cameraSmoothing;

  if (!isMobile) {
    smoothX += (mouseX - smoothX) * 0.02;
    smoothY += (mouseY - smoothY) * 0.02;
  }
  ring.rotation.x =
    CONFIG.tilt +
    progress * CONFIG.tiltOnScroll +
    smoothY * CONFIG.parallaxStrength;
  ring.rotation.z = CONFIG.sideTilt - smoothX * CONFIG.parallaxStrength * 0.5;

  cameraPositionUniform.value.copy(camera.position);

  ring.rotation.y +=
    CONFIG.baseRotationSpeed * (reduceMotion ? 0.25 : 1) + spinVelocity;
  spinVelocity *= CONFIG.rotationDecay;

  smoothVelocity += (scrollVelocity - smoothVelocity) * 0.1;
  scrollVelocity *= CONFIG.rotationDecay;
  velocityUniform.value = THREE.MathUtils.clamp(smoothVelocity * 0.02, -1, 1);

  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  const wasMobile = isMobile;
  isMobile = window.innerWidth < 1000;
  if (wasMobile !== isMobile) buildRing();
  camera.aspect = heroSection.clientWidth / heroSection.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(heroSection.clientWidth, heroSection.clientHeight);
});
