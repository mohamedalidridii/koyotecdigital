uniform float uOpacity;
uniform float uLight;
varying float vLife;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = exp(-d * d * 4.0) * smoothstep(0.0, 0.15, vLife) * (1.0 - vLife);
  vec3 col = mix(vec3(0.95), vec3(0.2), uLight);
  gl_FragColor = vec4(col, a * uOpacity * 0.1);
}
