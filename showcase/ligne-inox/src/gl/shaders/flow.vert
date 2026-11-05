attribute float aU;
attribute float aSide;
varying float vU;
varying float vSide;
void main() {
  vU = aU;
  vSide = aSide;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
