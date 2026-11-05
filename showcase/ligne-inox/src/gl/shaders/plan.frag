uniform float uDraw;
uniform float uOpacity;
uniform float uZone;
uniform float uZoneMix;
uniform float uLight;
uniform vec3 uAccent;
varying float vS;
varying float vZone;
varying float vKind;

void main() {
  if (vS > uDraw) discard;
  // kind: 0 wall, 1 door, 2 equipment, 3 dimension
  float a = vKind < 0.5 ? 0.95 : (vKind < 1.5 ? 0.42 : (vKind < 2.5 ? 0.62 : 0.34));
  float isOn = vZone > -0.5 && abs(vZone - uZone) < 0.5 ? 1.0 : 0.0;
  // Other zones step back while one is highlighted; walls stay.
  float isEquip = vZone > -0.5 ? 1.0 : 0.0;
  a *= mix(1.0, mix(0.32, 1.25, isOn), uZoneMix * isEquip);
  vec3 ink = mix(vec3(0.925, 0.92, 0.9), vec3(0.08, 0.085, 0.09), uLight);
  vec3 col = mix(ink, uAccent, isOn * uZoneMix * 0.85);
  // The freshly drawn tip glows a moment.
  float tip = smoothstep(uDraw - 0.025, uDraw, vS) * step(uDraw, 0.999);
  col = mix(col, uAccent, tip * 0.8);
  gl_FragColor = vec4(col, min(a, 1.0) * uOpacity);
}
