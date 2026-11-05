// Height-field water: r = current height, g = previous height (Hugo Elias' two-buffer wave).
uniform sampler2D uState;
uniform vec2 uTexel;
uniform vec2 uMouse;
uniform vec2 uPrev;
uniform float uForce;
uniform float uRadius;
uniform float uAspect;
varying vec2 vUv;

float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  return length(pa - ba * h);
}

void main() {
  vec4 s = texture2D(uState, vUv);
  float n = (texture2D(uState, vUv + vec2(uTexel.x, 0.0)).r + texture2D(uState, vUv - vec2(uTexel.x, 0.0)).r +
             texture2D(uState, vUv + vec2(0.0, uTexel.y)).r + texture2D(uState, vUv - vec2(0.0, uTexel.y)).r) * 0.5 - s.g;
  n *= 0.982;
  vec2 a = vec2(uAspect, 1.0);
  float d = segDist(vUv * a, uPrev * a, uMouse * a);
  n += uForce * smoothstep(uRadius, 0.0, d);
  // Fade out at the borders so waves don't bounce back off the frame.
  vec2 e = smoothstep(0.0, 0.03, vUv) * smoothstep(1.0, 0.97, vUv);
  gl_FragColor = vec4(n * e.x * e.y, s.r, 0.0, 1.0);
}
