uniform float uOpacity;
uniform float uPulse;
uniform float uTime;
uniform vec3 uAccent;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  // Point size grows with the pulse; keep the dot itself the same size.
  float k = 1.0 + uPulse * 2.2;
  float dd = d * k;
  float dot_ = smoothstep(0.32, 0.22, dd);
  float glow = exp(-dd * dd * 3.0) * 0.55;
  float ringT = fract(uTime * 0.6);
  float ring = uPulse * smoothstep(0.035, 0.0, abs(d - ringT)) * (1.0 - ringT);
  vec3 col = mix(uAccent, vec3(1.0, 0.93, 0.9), smoothstep(0.2, 0.0, dd));
  float a = max(dot_, glow) + ring;
  gl_FragColor = vec4(col, a * uOpacity);
}
