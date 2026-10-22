// An engraved moon: a fine outline with diagonal hatching on its shadow side; fades with the dunes.
uniform vec3 uInk;
uniform float uAlpha;
uniform float uTime;
varying vec2 vUv;

void main() {
  vec2 c = vUv - 0.5;
  float r = length(c);
  float ring = smoothstep(0.004, 0.0, abs(r - 0.1));
  float inside = step(r, 0.1);
  // shadow crescent, hatched
  float shade = smoothstep(-0.02, 0.06, length(c - vec2(0.035, 0.02)) - 0.085) * inside;
  float hatch = step(0.55, fract((c.x + c.y) * 140.0));
  float halo = smoothstep(0.2, 0.1, r) * (1.0 - inside) * 0.04;
  float a = (ring * 0.85 + shade * hatch * 0.5 + halo) * uAlpha;
  gl_FragColor = vec4(uInk, a);
}
