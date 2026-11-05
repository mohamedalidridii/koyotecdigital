attribute vec3 aSeed;
uniform float uTime;
uniform float uSize;
varying float vLife;
void main() {
  float life = fract(uTime * (0.12 + aSeed.z * 0.1) + aSeed.x);
  vec3 p = position;
  // Plan y points down, so rising = towards the top wall and slightly towards the camera.
  p.x += sin(uTime * 0.9 + aSeed.y * 6.28 + life * 4.0) * 0.18 * life;
  p.y += life * 1.3;
  p.z += life * 0.6;
  vLife = life;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (0.4 + life * 1.4);
}
