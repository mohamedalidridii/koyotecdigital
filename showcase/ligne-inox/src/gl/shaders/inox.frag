// Brushed stainless steel. Ripples from the pointer bend the reflections; the light sweeps slowly.
#include "./noise.glsl"

uniform sampler2D uRipple;
uniform vec2 uRippleTexel;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uTime;
uniform float uIntro;
uniform float uDim;
uniform float uLight;
uniform float uGrid;
uniform float uVel;
uniform float uHeat;
uniform float uScroll;
varying vec2 vUv;

float gridLine(vec2 px, float cell) {
  vec2 g = abs(fract(px / cell - 0.5) - 0.5) * cell;
  return 1.0 - smoothstep(0.0, 1.0, min(g.x, g.y));
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y);

  // Ripple normal from the height field.
  float hL = texture2D(uRipple, uv - vec2(uRippleTexel.x, 0.0)).r;
  float hR = texture2D(uRipple, uv + vec2(uRippleTexel.x, 0.0)).r;
  float hD = texture2D(uRipple, uv - vec2(0.0, uRippleTexel.y)).r;
  float hU = texture2D(uRipple, uv + vec2(0.0, uRippleTexel.y)).r;
  vec2 grad = vec2(hR - hL, hU - hD);
  vec3 n = normalize(vec3(-grad * 2.2, 1.0));

  // Brushing: long horizontal grain, a finer layer on top. Scroll speed stretches it.
  float stretch = 1.0 + abs(uVel) * 0.04;
  vec2 bp = p + n.xy * 0.02;
  float grain = vnoise(vec2(bp.x * 1.6 / stretch, bp.y * 520.0)) * 0.55 + vnoise(vec2(bp.x * 6.0 / stretch, bp.y * 1500.0)) * 0.45;
  float cloud = fbm(p * 1.4 + vec2(uTime * 0.01, 0.0));

  // Environment: broad soft bands, bent by the ripple normals, drifting with time and scroll.
  vec2 q = p + n.xy * 0.45;
  float bands = 0.5 + 0.5 * sin((q.x * 0.8 - q.y * 1.7) * 2.4 + uTime * 0.11 + uScroll * 0.9 + cloud * 1.6);
  bands = pow(bands, 2.6);
  // A slow diagonal sheen crossing the sheet.
  float sweep = fract(uTime * 0.035);
  float sheen = exp(-pow((q.x / aspect) * 0.7 - q.y * 0.5 - (sweep * 3.0 - 1.2), 2.0) * 22.0);

  // Brushed metal stretches a highlight across the grain: a tall soft streak under the pointer.
  vec2 m = vec2(uMouse.x * aspect, uMouse.y);
  vec2 dm = p - m;
  float aniso = exp(-dm.x * dm.x * 22.0) * exp(-dm.y * dm.y * 1.4);

  // Direct light on the ripples.
  float lit = dot(n, normalize(vec3(-0.5, 0.65, 0.6)));
  float rip = (lit - 0.6) * 1.6;

  float base = mix(0.07, 0.69, uLight);
  float range = mix(0.13, 0.2, uLight);
  float lum = base + range * (bands * 0.9 + (grain - 0.5) * 0.55 + cloud * 0.25 - 0.25);
  lum += sheen * mix(0.06, 0.09, uLight) + aniso * mix(0.1, 0.07, uLight) + rip * mix(0.32, 0.22, uLight);
  lum = mix(lum, lum * 0.32, uDim);

  // Cool steel tint, warmer when light.
  vec3 col = lum * mix(vec3(0.93, 0.97, 1.03), vec3(1.0, 0.995, 0.985), uLight);

  // Plan grid (drafting paper) for the plan sections.
  vec2 px = uv * uRes;
  float g = max(gridLine(px, 80.0) * 0.6, gridLine(px, 16.0) * 0.18);
  float gridMask = smoothstep(1.1, 0.2, length((uv - vec2(0.62, 0.5)) * vec2(aspect * 0.8, 1.0)));
  col += g * uGrid * gridMask * mix(0.06, -0.08, uLight);

  // Heat from the bottom: the red of service, very faint.
  col += vec3(0.89, 0.14, 0.1) * uHeat * smoothstep(0.55, 0.0, uv.y) * 0.12;

  // Vignette.
  vec2 v = uv - 0.5;
  col *= 1.0 - dot(v, v) * mix(0.9, 0.35, uLight);

  // Intro: the sheet lights up from the left.
  float reveal = smoothstep(uIntro * 1.6 - 0.6, uIntro * 1.6 - 0.1, (uv.x * 0.8 + (1.0 - uv.y) * 0.2));
  col *= mix(1.0, 0.0, reveal);

  // Dither against banding.
  col += (hash12(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
