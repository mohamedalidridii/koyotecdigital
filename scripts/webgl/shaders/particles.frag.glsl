uniform vec3 uBone;
uniform vec3 uEmber;
uniform vec3 uMoon;
uniform float uAlpha;

varying float vAlpha;
varying float vEmber;
varying float vMoon;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;
  float disc = smoothstep(0.5, 0.0, r);
  disc *= disc;

  vec3 col = mix(uBone, uMoon, vMoon * 0.7);
  col = mix(col, uEmber, vEmber);
  gl_FragColor = vec4(col, disc * vAlpha * uAlpha * (0.75 + vEmber * 0.6));
}
