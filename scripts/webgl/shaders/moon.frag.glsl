// A moon with a soft halo; fades with the dune terrain.
uniform vec3 uMoon;
uniform vec3 uBone;
uniform float uAlpha;
uniform float uTime;
varying vec2 vUv;

void main() {
  vec2 c = vUv - 0.5;
  float r = length(c);
  float disc = smoothstep(0.105, 0.098, r);
  float shade = 0.82 + 0.18 * smoothstep(0.1, -0.1, c.x + c.y);
  float halo = exp(-r * 9.0) * 0.55 + exp(-r * 3.2) * 0.12;
  float pulse = 0.92 + 0.08 * sin(uTime * 0.7);
  vec3 col = mix(uMoon, uBone, disc * shade);
  float a = (disc * 0.95 + halo * pulse) * uAlpha;
  gl_FragColor = vec4(col, a);
}
