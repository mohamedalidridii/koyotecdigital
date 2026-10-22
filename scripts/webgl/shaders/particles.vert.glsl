// Particle morph: every point lives on two shapes at once ("from" and "to") and travels between
// them through a noise field. A shape is either the dune terrain (world space, animated height)
// or an object (local space, spun and placed by uniforms).
#define PULSES 6
#define PI 3.141592653589793

attribute vec3 aFrom;
attribute vec3 aTo;
attribute vec4 aRand; // xyz in [-1,1], w in [0,1]

uniform float uTime;
uniform float uMorph;
uniform float uChaos;
uniform float uScatter;
uniform float uSpin;
uniform float uSize;
uniform float uPixelRatio;
uniform float uFlow;

uniform float uFromTerrain;
uniform float uToTerrain;
uniform vec4 uFromXform; // xyz offset, w scale
uniform vec4 uToXform;

uniform vec3 uMouse;
uniform float uMouseForce;
uniform vec3 uPulsePos[PULSES];
uniform vec2 uPulseData[PULSES]; // x start time, y strength

varying float vAlpha;
varying float vEmber;
varying float vMoon;

// include: noise

vec3 rotY(vec3 p, float a) {
  float c = cos(a), s = sin(a);
  return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}

// wind-carved ridges that drift toward the camera
float dune(vec2 xz) {
  vec2 q = vec2(xz.x * 0.16, (xz.y - uTime * uFlow) * 0.11);
  float ridge = 1.0 - abs(snoise(q));
  ridge = ridge * ridge;
  float swell = snoise(q * 0.45 + 7.3) * 0.5 + 0.5;
  float ripple = sin(xz.x * 2.6 + snoise(q * 3.0) * 2.0 + uTime * 0.6) * 0.025;
  return ridge * (0.25 + swell * 0.75) * 1.15 + ripple;
}

vec3 place(vec3 p, float terrain, vec4 xform) {
  vec3 obj = rotY(p * xform.w, uSpin) + xform.xyz;
  vec3 ground = vec3(p.x, -1.35 + dune(p.xz), p.z);
  return mix(obj, ground, terrain);
}

void main() {
  // each particle starts its trip a little later than the previous ones
  float delay = (aRand.w * 0.55);
  float m = clamp((uMorph - delay) / (1.0 - 0.55), 0.0, 1.0);
  m = m * m * (3.0 - 2.0 * m);

  vec3 a = place(aFrom, uFromTerrain, uFromXform);
  vec3 b = place(aTo, uToTerrain, uToXform);
  vec3 p = mix(a, b, m);

  // turbulence peaks mid-flight, plus a calm idle breath
  float flight = sin(m * PI) + uChaos;
  vec3 np = p * 0.55 + vec3(0.0, 0.0, uTime * 0.12);
  vec3 swirl = vec3(snoise(np), snoise(np + 31.4), snoise(np + 71.7));
  float terrain = mix(uFromTerrain, uToTerrain, m);
  p += swirl * (flight * 1.1 + 0.035 * (1.0 - terrain));

  // transition dissolve: particles blow outward
  p += aRand.xyz * uScatter * 6.0;

  // cursor: soft repulsion
  vec3 toMouse = p - uMouse;
  float md = length(toMouse);
  float push = smoothstep(1.1, 0.0, md) * uMouseForce;
  p += normalize(toMouse + 0.0001) * push * 0.35 * (1.0 - terrain * 0.5);

  // the howl: expanding shock rings
  float glow = 0.0;
  for (int i = 0; i < PULSES; i++) {
    vec2 data = uPulseData[i];
    float age = uTime - data.x;
    if (data.y <= 0.0 || age < 0.0 || age > 4.0) continue;
    vec3 d = p - uPulsePos[i];
    float dist = mix(length(d), length(d.xz), terrain);
    float ring = exp(-pow((dist - age * 3.4) * 2.4, 2.0)) * data.y * exp(-age * 0.85);
    p.y += ring * 0.32 * terrain;
    p += normalize(d + 0.0001) * ring * 0.22 * (1.0 - terrain);
    glow += ring;
  }

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  float depth = -mv.z;
  float sizeJitter = 0.55 + aRand.w * 0.9;
  gl_PointSize = uSize * uPixelRatio * sizeJitter * (1.0 + glow * 1.4) / depth;

  // fade far terrain into the night and points too close to the lens
  float far = smoothstep(26.0, 9.0, depth);
  float near = smoothstep(0.6, 2.2, depth);
  vAlpha = far * near * (0.55 + aRand.w * 0.45);
  vEmber = clamp(glow * 1.6 + step(0.972, aRand.w) * 0.85 + push * 0.6, 0.0, 1.0);
  vMoon = terrain * smoothstep(6.0, 18.0, depth);
}
