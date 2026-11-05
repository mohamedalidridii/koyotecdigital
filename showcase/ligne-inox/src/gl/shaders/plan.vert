attribute float aS;
attribute float aZone;
attribute float aKind;
varying float vS;
varying float vZone;
varying float vKind;
void main() {
  vS = aS;
  vZone = aZone;
  vKind = aKind;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
