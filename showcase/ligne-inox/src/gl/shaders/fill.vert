attribute float aZone;
varying float vZone;
varying vec2 vP;
void main() {
  vZone = aZone;
  vP = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
