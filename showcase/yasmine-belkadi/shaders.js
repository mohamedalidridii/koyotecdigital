export const vertexShader = `
  uniform float uVelocity;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  void main() {
    vUv = uv;
    // Tiles bow vertically with the scroll speed
    vec3 p = position;
    p.y += sin(uv.x * 3.14159) * uVelocity * 0.35;
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vWorldPosition = (modelMatrix * vec4(p, 1.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(p, 1.0);
  }
`;

// Tiles facing the camera show their photo; those turning away fade into
// the cream background, which gives the spiral its depth on a light page
export const fragmentShader = `
  uniform sampler2D uMap;
  uniform float uImageAspect;
  uniform float uPlaneAspect;
  uniform vec3 uCameraPosition;
  uniform vec3 uBackground;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  void main() {
    // Crop the photo to the panel (like object-fit: cover)
    vec2 uv = vUv;
    float ratio = uPlaneAspect / uImageAspect;
    if (ratio < 1.0) uv.x = (uv.x - 0.5) * ratio + 0.5;
    else uv.y = (uv.y - 0.5) / ratio + 0.5;
    vec4 tex = texture2D(uMap, uv);
    vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
    float facing = max(dot(-normalize(vWorldNormal), viewDir), 0.0);
    float visibility = 0.22 + 0.78 * smoothstep(-0.2, 0.6, facing);
    vec3 color = mix(uBackground, tex.rgb, visibility);
    gl_FragColor = vec4(color, tex.a);
  }
`;
