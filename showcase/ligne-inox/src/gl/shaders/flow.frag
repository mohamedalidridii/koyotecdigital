// The marche-en-avant line: a red core, chevrons running forward, a hot head.
uniform float uProgress;
uniform float uOpacity;
uniform float uTime;
uniform float uLength;
uniform vec3 uAccent;
varying float vU;
varying float vSide;
void main() {
  if (vU > uProgress) discard;
  float core = 1.0 - smoothstep(0.25, 1.0, abs(vSide));
  float dist = vU * uLength;
  // Chevrons pointing along the flow.
  float chev = fract((dist + abs(vSide) * 0.12) * 2.4 - uTime * 0.9);
  float arrows = smoothstep(0.0, 0.08, chev) * smoothstep(0.32, 0.22, chev);
  float behind = (uProgress - vU) * uLength;
  float head = exp(-behind * 1.4);
  float a = core * (0.55 + 0.45 * arrows) + head * 0.4;
  vec3 col = mix(uAccent, vec3(1.0, 0.86, 0.8), head * 0.55 + arrows * 0.15);
  gl_FragColor = vec4(col, a * uOpacity);
}
