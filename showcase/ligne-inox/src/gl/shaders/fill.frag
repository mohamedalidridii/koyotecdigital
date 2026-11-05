// Diagonal hatching on the zone the flow is crossing.
uniform float uZone;
uniform float uZoneMix;
uniform float uOpacity;
uniform vec3 uAccent;
varying float vZone;
varying vec2 vP;
void main() {
  float isOn = abs(vZone - uZone) < 0.5 ? 1.0 : 0.0;
  float h = step(0.82, fract((vP.x + vP.y) * 4.0));
  float a = isOn * uZoneMix * uOpacity * (0.05 + h * 0.13);
  if (a < 0.002) discard;
  gl_FragColor = vec4(uAccent, a);
}
