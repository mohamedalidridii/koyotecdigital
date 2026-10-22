// Ink stipple on paper: hard-edged dots, darker and bigger where a howl ring passes.
uniform vec3 uInk;
uniform float uAlpha;

varying float vAlpha;
varying float vEmber;
varying float vMoon;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;
  float dot = smoothstep(0.5, 0.36, r);
  float a = dot * vAlpha * uAlpha * (0.42 + vEmber * 0.5) * (1.0 - vMoon * 0.45);
  gl_FragColor = vec4(uInk, a);
}
