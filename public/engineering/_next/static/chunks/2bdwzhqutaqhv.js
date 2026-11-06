(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,40854,(e,t,s)=>{t.exports=e.r(61286)},31516,e=>{"use strict";var t=e.i(11003),s=e.i(76146),i=e.i(87125),r=e.i(18546),o=e.i(35045),n=e.i(17349);let a=e=>n.BASE&&e?.startsWith("/")&&!e.startsWith(`${n.BASE}/`)?`${n.BASE}${e}`:e,l={mode:"ordered",pixelSize:2,gridSize:3,threshold:.5,brightness:0,contrast:1,darkColor:"#0d0d0d",lightColor:"#f3f1ec",matrixSize:4,lumPixelSize:1,pixelSizeMultiplier:5,scaleResolution:1,ditherAmount:1,bias:0,biasNoiseScale:10,biasNoiseSpeed:.75,biasPulseSpeed:.5,biasNoiseWeight:.5,biasPulseWeight:.05,biasAnimationStrength:1.25,trailDecay:.85,trailRadius:.15,trailIntensityMultiplier:5},u=null,c=new Set,d=!1;function h(e){c.forEach(t=>{t.visible&&t.onPointerMove(e)})}function p(){return u||(u=new r.WebGLRenderer({antialias:!1,alpha:!0,premultipliedAlpha:!1})).setPixelRatio(1),u}let m=`
void main() {
  gl_Position = vec4(position, 1.0);
}
`,g=`
precision highp float;

uniform sampler2D uPrev;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec2 uPrevMouse;
uniform float uTrailDecay;
uniform float uTrailRadius;
uniform float uBrushStrength;

out vec4 fragColor;

float distToSegment(vec2 p, vec2 a, vec2 b) {
  vec2 ab = b - a;
  float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-4), 0.0, 1.0);
  return length(p - (a + ab * t));
}

void main() {
  vec2 p = gl_FragCoord.xy;

  float prev = texture(uPrev, p / uResolution).r * uTrailDecay;

  float d = distToSegment(p, uPrevMouse, uMouse);
  float brush = smoothstep(uTrailRadius, 0.0, d) * uBrushStrength;
  fragColor = vec4(clamp(prev + brush, 0.0, 1.0), 0.0, 0.0, 1.0);
}
`,v=`
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

float cnoise(vec3 P) {
  vec3 Pi0 = floor(P);
  vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
  vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
  vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
  vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
  vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}
`;class f{constructor(e,t){this.canvas=e,this.img=t,this.ctx=e.getContext("2d"),this.settings={...l},this.width=0,this.height=0,this.texture=null,this.mode=null,this.grid=null,this.matrix=null,this.time=0,this.raf=0,this.visible=!0,this.mouse=new o.Vector2,this.strength=0,this.prevMouse=new o.Vector2,this.hasMouse=!1,this.trailFrames=0,this.trailA=null,this.trailB=null,this.trailMaterial=null,this.trailMesh=null,this.scene=new o.Scene,this.trailScene=new o.Scene,this.camera=new o.Camera,this.mesh=new o.Mesh(new o.PlaneGeometry(2,2),null),this.mesh.frustumCulled=!1,this.scene.add(this.mesh),this.createMaterial()}createMaterial(){var e,t;this.mode!==this.settings.mode&&(cancelAnimationFrame(this.raf),this.raf=0),this.material?.dispose(),this.mode=this.settings.mode;let s={uTexture:{value:this.texture},uResolution:{value:new o.Vector2(this.width,this.height)},uCoverScale:{value:new o.Vector2(1,1)},uBrightness:{value:this.settings.brightness},uContrast:{value:this.settings.contrast},uThreshold:{value:this.settings.threshold},uDarkColor:{value:new o.Color().setStyle(this.settings.darkColor,o.NoColorSpace)},uLightColor:{value:new o.Color().setStyle(this.settings.lightColor,o.NoColorSpace)},uTime:{value:this.time}};"ordered"===this.mode?(this.matrix=this.settings.matrixSize,this.material=new o.ShaderMaterial({glslVersion:o.GLSL3,uniforms:{...s,uTrail:{value:null},uTrailIntensityMultiplier:{value:1},uPixelSize:{value:1},uPixelSizeMultiplier:{value:3},uScaleResolution:{value:1},uDitherAmount:{value:1},uBias:{value:0},uBiasNoiseScale:{value:3},uBiasNoiseSpeed:{value:.3},uBiasPulseSpeed:{value:1},uBiasNoiseWeight:{value:.15},uBiasPulseWeight:{value:.05},uBiasAnimationStrength:{value:1}},vertexShader:m,fragmentShader:(e=this.matrix,`
precision highp float;

#define MATRIX_SIZE ${e}

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uCoverScale;
uniform float uBrightness;
uniform float uContrast;
uniform float uThreshold;
uniform vec3 uDarkColor;
uniform vec3 uLightColor;
uniform float uTime;
uniform sampler2D uTrail;
uniform float uTrailIntensityMultiplier;
uniform float uPixelSize;
uniform float uPixelSizeMultiplier;
uniform float uScaleResolution;
uniform float uDitherAmount;
uniform float uBias;
uniform float uBiasNoiseScale;
uniform float uBiasNoiseSpeed;
uniform float uBiasPulseSpeed;
uniform float uBiasNoiseWeight;
uniform float uBiasPulseWeight;
uniform float uBiasAnimationStrength;

out vec4 fragColor;

${v}

const float bayer2[4] = float[4](0.0, 2.0, 3.0, 1.0);
const float bayer4[16] = float[16](
  0.0, 8.0, 2.0, 10.0,
  12.0, 4.0, 14.0, 6.0,
  3.0, 11.0, 1.0, 9.0,
  15.0, 7.0, 13.0, 5.0
);
const float bayer8[64] = float[64](
  0.0, 32.0, 8.0, 40.0, 2.0, 34.0, 10.0, 42.0,
  48.0, 16.0, 56.0, 24.0, 50.0, 18.0, 58.0, 26.0,
  12.0, 44.0, 4.0, 36.0, 14.0, 46.0, 6.0, 38.0,
  60.0, 28.0, 52.0, 20.0, 62.0, 30.0, 54.0, 22.0,
  3.0, 35.0, 11.0, 43.0, 1.0, 33.0, 9.0, 41.0,
  51.0, 19.0, 59.0, 27.0, 49.0, 17.0, 57.0, 25.0,
  15.0, 47.0, 7.0, 39.0, 13.0, 45.0, 5.0, 37.0,
  63.0, 31.0, 55.0, 23.0, 61.0, 29.0, 53.0, 21.0
);

float bayerThreshold(vec2 p, int size) {
  int x = int(mod(p.x, float(size)));
  int y = int(mod(p.y, float(size)));
  int idx = y * size + x;
  if (size == 2) return (bayer2[idx] + 0.5) / 4.0;
  if (size == 4) return (bayer4[idx] + 0.5) / 16.0;
  return (bayer8[idx] + 0.5) / 64.0;
}

vec4 sampleTex(vec2 centerPix) {
  vec2 uv = centerPix / uResolution;
  uv = (uv - 0.5) * uCoverScale + 0.5;
  return texture(uTexture, uv);
}

vec3 adjust(vec3 c) {
  c += uBrightness;
  return (c - 0.5) * uContrast + 0.5;
}

void main() {
  vec2 frag = gl_FragCoord.xy;

  float trail = clamp(texture(uTrail, frag / uResolution).r * uTrailIntensityMultiplier, 0.0, 1.0);

  vec2 up = vec2(frag.x, uResolution.y - frag.y);

  vec2 colorCenter = (floor(up / uPixelSize) + 0.5) * uPixelSize;
  vec4 src = sampleTex(colorCenter);
  vec3 sourceColor = adjust(src.rgb);

  float dynPx = mix(uPixelSize, uPixelSize * uPixelSizeMultiplier, trail);
  vec2 lumCenter = (floor(up / dynPx) + 0.5) * dynPx;
  vec4 ls = sampleTex(lumCenter);
  float lum = dot(ls.rgb, vec3(0.2126, 0.7152, 0.0722));
  lum += uBrightness;
  lum = (lum - 0.5) * uContrast + 0.5;

  vec2 uvN = up / uResolution;
  float n = cnoise(vec3(uvN * uBiasNoiseScale, uTime * uBiasNoiseSpeed));
  float pulse = sin(uTime * uBiasPulseSpeed) * 0.5 + 0.5;
  float bias = uBias + (n * uBiasNoiseWeight + pulse * uBiasPulseWeight) * uBiasAnimationStrength;

  int size = trail >= 0.5 ? 8 : MATRIX_SIZE;
  float threshold = bayerThreshold(floor(frag / uScaleResolution), size);

  float value = threshold + bias * (1.0 + 2.0 * trail) + (uThreshold - 0.5);
  vec3 dithered = mix(uDarkColor, uLightColor, step(value, lum));

  fragColor = vec4(mix(sourceColor, dithered, uDitherAmount), src.a);
}
`)}),this.ensureTrailMaterial()):(this.grid=this.settings.gridSize,this.material=new o.ShaderMaterial({glslVersion:o.GLSL3,uniforms:{...s,uMouse:{value:new o.Vector2},uMouseStrength:{value:0},uMouseRadius:{value:1}},vertexShader:m,fragmentShader:(t=this.grid,`
precision highp float;

#define GRID_X ${t}.0
#define GRID_Y ${t}.0

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uCoverScale;
uniform float uThreshold;
uniform float uBrightness;
uniform float uContrast;
uniform vec3 uDarkColor;
uniform vec3 uLightColor;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform float uMouseRadius;
uniform float uTime;

out vec4 fragColor;

const vec2 gridSize = vec2(GRID_X, GRID_Y);
const int arrSize = int(GRID_X * GRID_Y);
float errAcc[arrSize];

int getIndex(vec2 p) {
  int x = int(p.x);
  int y = int(p.y);
  if (x < 0 || y < 0 || x >= int(GRID_X) || y >= int(GRID_Y)) return -1;
  return x + y * int(GRID_X);
}

vec4 sampleTex(vec2 pix) {
  vec2 uv = (pix + 0.5) / uResolution;
  uv = (uv - 0.5) * uCoverScale + 0.5;
  return texture(uTexture, uv);
}

float sampleLuma(vec2 pix) {
  vec3 c = sampleTex(pix).rgb;
  float g = dot(c, vec3(0.2126, 0.7152, 0.0722));
  g += uBrightness;
  g = (g - 0.5) * uContrast + 0.5;
  return g;
}

vec2 dispersion(vec2 p) {
  vec2 toP = p - uMouse;
  float d = length(toP);
  vec2 dir = d > 1e-4 ? toP / d : vec2(0.0);
  float falloff = exp(-(d * d) / (uMouseRadius * uMouseRadius));
  float ripple = 0.85 + 0.15 * sin(d * 0.18 - uTime * 5.0);

  return -dir * falloff * uMouseStrength * uMouseRadius * 0.3 * ripple;
}

void main() {

  vec2 pix = floor(vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y));
  vec2 topLeft = floor(pix / gridSize) * gridSize;
  vec2 myPos = pix - topLeft;

  for (int i = 0; i < arrSize; i++) errAcc[i] = 0.0;

  vec2 disp = dispersion(topLeft + gridSize * 0.5);

  float outColor = 0.0;
  for (float y = 0.0; y < GRID_Y; y += 1.0) {
    for (float x = 0.0; x < GRID_X; x += 1.0) {
      vec2 cell = vec2(x, y);
      vec2 srcPix = topLeft + cell + disp;

      if (sampleTex(srcPix).a < 0.01) continue;
      float ideal = sampleLuma(srcPix) + errAcc[int(x) + int(y) * int(GRID_X)];
      float value = step(uThreshold, ideal);
      float err = ideal - value;

      int r = getIndex(cell + vec2(1.0, 0.0));  if (r >= 0) errAcc[r] += err * (7.0 / 16.0);
      int bl = getIndex(cell + vec2(-1.0, 1.0)); if (bl >= 0) errAcc[bl] += err * (3.0 / 16.0);
      int b = getIndex(cell + vec2(0.0, 1.0));  if (b >= 0) errAcc[b] += err * (5.0 / 16.0);
      int br = getIndex(cell + vec2(1.0, 1.0));  if (br >= 0) errAcc[br] += err * (1.0 / 16.0);
      if (cell == myPos) outColor = value;
    }
  }

  fragColor = vec4(mix(uDarkColor, uLightColor, outColor), sampleTex(pix + disp).a);
}
`)})),this.mesh.material=this.material}ensureTrailMaterial(){this.trailMaterial||(this.trailMaterial=new o.ShaderMaterial({glslVersion:o.GLSL3,uniforms:{uPrev:{value:null},uResolution:{value:new o.Vector2},uMouse:{value:new o.Vector2},uPrevMouse:{value:new o.Vector2},uTrailDecay:{value:.94},uTrailRadius:{value:1},uBrushStrength:{value:0}},vertexShader:m,fragmentShader:g}),this.trailMesh=new o.Mesh(new o.PlaneGeometry(2,2),this.trailMaterial),this.trailMesh.frustumCulled=!1,this.trailScene.add(this.trailMesh))}load(e){let t=()=>{this.texture?.dispose();let t=new o.Texture(this.img);t.flipY=!1,t.premultiplyAlpha=!1,t.minFilter=o.LinearMipmapLinearFilter,t.magFilter=o.LinearFilter,t.generateMipmaps=!0,t.needsUpdate=!0,this.texture=t,this.material.uniforms.uTexture.value=t,e()};this.img.complete&&this.img.naturalWidth>0?t():this.img.addEventListener("load",t,{once:!0})}resize(){let e=this.settings.pixelSize,t=Math.max(1,Math.round(this.canvas.clientWidth/e)),s=Math.max(1,Math.round(this.canvas.clientHeight/e));return(t!==this.width||s!==this.height||this.canvas.width!==t)&&(this.width=t,this.height=s,this.canvas.width=t,this.canvas.height=s,"ordered"===this.mode&&this.ensureTargets(),!0)}coverScale(){let e=(this.img.naturalWidth||1)/(this.img.naturalHeight||1),t=this.width/this.height;return e>t?new o.Vector2(t/e,1):new o.Vector2(1,e/t)}makeTarget(){let e=p().capabilities.isWebGL2?o.HalfFloatType:o.UnsignedByteType;return new o.WebGLRenderTarget(this.width,this.height,{type:e,minFilter:o.LinearFilter,magFilter:o.LinearFilter,wrapS:o.ClampToEdgeWrapping,wrapT:o.ClampToEdgeWrapping,depthBuffer:!1,stencilBuffer:!1})}ensureTargets(){if(this.trailA&&this.trailA.width===this.width&&this.trailA.height===this.height)return;this.disposeTargets(),this.trailA=this.makeTarget(),this.trailB=this.makeTarget();let e=p();e.setRenderTarget(this.trailA),e.setClearColor(0,1),e.clear(),e.setRenderTarget(this.trailB),e.clear(),e.setRenderTarget(null)}disposeTargets(){this.trailA?.dispose(),this.trailB?.dispose(),this.trailA=null,this.trailB=null}renderTrail(e){let t=this.trailMaterial.uniforms;t.uResolution.value.set(this.width,this.height),t.uPrev.value=this.trailA.texture,t.uMouse.value.set(this.mouse.x,this.height-this.mouse.y),t.uPrevMouse.value.set(this.prevMouse.x,this.height-this.prevMouse.y),t.uTrailDecay.value=this.settings.trailDecay,t.uTrailRadius.value=Math.min(this.width,this.height)*this.settings.trailRadius;let s=Math.min(1,this.mouse.distanceTo(this.prevMouse)/(.05*Math.min(this.width,this.height)));t.uBrushStrength.value=s,e.setRenderTarget(this.trailB),e.render(this.trailScene,this.camera);let i=this.trailA;this.trailA=this.trailB,this.trailB=i,this.prevMouse.copy(this.mouse)}needsRebuild(){return this.mode!==this.settings.mode||("diffusion"===this.settings.mode?this.grid!==this.settings.gridSize:this.matrix!==this.settings.matrixSize)}render(){if(!this.texture)return;this.needsRebuild()&&this.createMaterial();let e=p();e.setSize(this.width,this.height,!1);let t=this.material.uniforms;t.uResolution.value.set(this.width,this.height),t.uCoverScale.value.copy(this.coverScale()),t.uBrightness.value=this.settings.brightness,t.uContrast.value=this.settings.contrast,t.uThreshold.value=this.settings.threshold,t.uDarkColor.value.setStyle(this.settings.darkColor,o.NoColorSpace),t.uLightColor.value.setStyle(this.settings.lightColor,o.NoColorSpace),t.uTime.value=this.time,"ordered"===this.mode?(this.ensureTargets(),this.renderTrail(e),t.uTrail.value=this.trailA.texture,t.uTrailIntensityMultiplier.value=this.settings.trailIntensityMultiplier,t.uPixelSize.value=this.settings.lumPixelSize,t.uPixelSizeMultiplier.value=this.settings.pixelSizeMultiplier,t.uScaleResolution.value=this.settings.scaleResolution,t.uDitherAmount.value=this.settings.ditherAmount,t.uBias.value=this.settings.bias,t.uBiasNoiseScale.value=this.settings.biasNoiseScale,t.uBiasNoiseSpeed.value=this.settings.biasNoiseSpeed,t.uBiasPulseSpeed.value=this.settings.biasPulseSpeed,t.uBiasNoiseWeight.value=this.settings.biasNoiseWeight,t.uBiasPulseWeight.value=this.settings.biasPulseWeight,t.uBiasAnimationStrength.value=this.settings.biasAnimationStrength):(t.uMouse.value.copy(this.mouse),t.uMouseStrength.value=this.strength,t.uMouseRadius.value=.35*Math.min(this.width,this.height)),e.setClearColor(0,0),e.setRenderTarget(null),e.render(this.scene,this.camera),this.ctx.clearRect(0,0,this.width,this.height),this.ctx.drawImage(e.domElement,0,0)}visibleHoverRect(){let e=this.canvas.getBoundingClientRect(),t=e.left,s=e.top,i=e.right,r=e.bottom;if(i<=t||r<=s)return null;let o=this.canvas.parentElement;for(;o&&o!==document.body&&o!==document.documentElement;){let{overflow:e,overflowX:n,overflowY:a}=getComputedStyle(o);if("visible"!==e||"visible"!==n||"visible"!==a){let e=o.getBoundingClientRect();if(e.width>0&&e.height>0&&(t=Math.max(t,e.left),s=Math.max(s,e.top),i=Math.min(i,e.right),r=Math.min(r,e.bottom),i<=t||r<=s))return null}o=o.parentElement}return{left:t,top:s,right:i,bottom:r}}onPointerMove(e){if(!this.visible)return;let t=this.visibleHoverRect();if(!t||e.clientX<t.left||e.clientX>t.right||e.clientY<t.top||e.clientY>t.bottom)return;let s=this.canvas.getBoundingClientRect();if(!s.width||!s.height)return;let i=e.clientX-s.left,r=e.clientY-s.top;this.mouse.set(i/s.width*this.width,r/s.height*this.height),this.hasMouse||(this.prevMouse.copy(this.mouse),this.hasMouse=!0),this.visible=!0,this.strength=1,this.trailFrames=120,this.animate()}animate(){if(this.raf)return;let e="ordered"===this.mode&&0!==this.settings.biasAnimationStrength;if(!("diffusion"===this.mode&&this.strength>0||"ordered"===this.mode&&(e||this.trailFrames>0)))return void this.render();let t=performance.now(),s=e=>{let i=Math.min(.05,(e-t)/1e3);if(t=e,!this.visible){this.raf=0;return}"diffusion"===this.mode?(this.time+=i,this.strength*=Math.exp(-(2.5*i)),this.render(),this.strength>.02?this.raf=requestAnimationFrame(s):(this.strength=0,this.raf=0,this.render())):(this.time+=i,this.trailFrames>0&&(this.trailFrames-=1),this.render(),0!==this.settings.biasAnimationStrength||this.trailFrames>0?this.raf=requestAnimationFrame(s):(this.raf=0,this.render()))};this.raf=requestAnimationFrame(s)}dispose(){cancelAnimationFrame(this.raf),this.raf=0,this.visible=!1,this.texture?.dispose(),this.material?.dispose(),this.trailMaterial?.dispose(),this.trailMesh?.geometry.dispose(),this.disposeTargets(),this.mesh.geometry.dispose()}}let y=new Set,b=null,x=null,w="ditherImageDebug";async function S(){if(b)return;b={};let t=localStorage.getItem(w);x={...l,...t?JSON.parse(t):{}};let{GUI:s}=await e.A(62127);b=new s({title:"DitherImage"});let i=()=>{localStorage.setItem(w,JSON.stringify(x)),y.forEach(e=>e.redraw())},r=b.addFolder("General");r.add(x,"mode",["diffusion","ordered"]).onChange(()=>{f(),i()}),r.add(x,"pixelSize",1,16,1).onChange(i),r.add(x,"brightness",-1,1).onChange(i),r.add(x,"contrast",0,3).onChange(i),r.addColor(x,"darkColor").onChange(i),r.addColor(x,"lightColor").onChange(i);let o=b.addFolder("Dither"),n=o.add(x,"threshold",0,1).onChange(i),a=o.add(x,"gridSize",2,8,1).onChange(i),u=o.add(x,"matrixSize",{"2x2":2,"4x4":4}).onChange(i),c=o.add(x,"lumPixelSize",1,8,1).onChange(i),d=o.add(x,"pixelSizeMultiplier",1,8,.1).onChange(i),h=o.add(x,"scaleResolution",1,8,1).onChange(i),p=o.add(x,"ditherAmount",0,1,.01).onChange(i),m=o.add(x,"bias",-1,1,.01).onChange(i),g=b.addFolder("Bias animation");g.add(x,"biasNoiseScale",0,10,.1).onChange(i),g.add(x,"biasNoiseSpeed",0,2,.01).onChange(i),g.add(x,"biasPulseSpeed",0,5,.01).onChange(i),g.add(x,"biasNoiseWeight",0,1,.01).onChange(i),g.add(x,"biasPulseWeight",0,1,.01).onChange(i),g.add(x,"biasAnimationStrength",0,2,.01).onChange(i);let v=b.addFolder("Trail");function f(){let e="ordered"===x.mode;a.show(!e),u.show(e),c.show(e),d.show(e),h.show(e),p.show(e),m.show(e),n.show(!0),e?g.show():g.hide(),e?v.show():v.hide()}v.add(x,"trailDecay",.8,.995,.001).onChange(i),v.add(x,"trailRadius",.01,.3,.005).onChange(i),v.add(x,"trailIntensityMultiplier",0,3,.05).onChange(i),f();let S={showOriginal:!1,copyDefaults:()=>{var e;return navigator.clipboard.writeText((e=x,`const DEFAULTS = {
  mode: "${e.mode}",
  pixelSize: ${e.pixelSize},
  gridSize: ${e.gridSize},
  threshold: ${e.threshold},
  brightness: ${e.brightness},
  contrast: ${e.contrast},
  darkColor: "${e.darkColor}",
  lightColor: "${e.lightColor}",
  matrixSize: ${e.matrixSize},
  lumPixelSize: ${e.lumPixelSize},
  pixelSizeMultiplier: ${e.pixelSizeMultiplier},
  scaleResolution: ${e.scaleResolution},
  ditherAmount: ${e.ditherAmount},
  bias: ${e.bias},
  biasNoiseScale: ${e.biasNoiseScale},
  biasNoiseSpeed: ${e.biasNoiseSpeed},
  biasPulseSpeed: ${e.biasPulseSpeed},
  biasNoiseWeight: ${e.biasNoiseWeight},
  biasPulseWeight: ${e.biasPulseWeight},
  biasAnimationStrength: ${e.biasAnimationStrength},
  trailDecay: ${e.trailDecay},
  trailRadius: ${e.trailRadius},
  trailIntensityMultiplier: ${e.trailIntensityMultiplier},
};`))},reset:()=>{Object.assign(x,l),b.controllersRecursive().forEach(e=>e.updateDisplay()),f(),i()}};b.add(S,"showOriginal").name("show original").onChange(e=>y.forEach(t=>t.showOriginal(e))),b.add(S,"copyDefaults").name("copy defaults"),b.add(S,"reset"),y.forEach(e=>e.redraw())}let C=(0,i.forwardRef)(function({src:e,alt:r="",className:o,style:n,onReady:u,...p},m){let g=(0,i.useRef)(null),v=(0,i.useRef)(null),b=(0,i.useRef)(null),w=(0,i.useRef)(p),C=(0,i.useRef)(u),A=(0,i.useRef)(!1),P=(0,i.useRef)(!1);return w.current=p,C.current=u,(0,i.useImperativeHandle)(m,()=>({setSrc(e){e=a(e);let t=g.current;t&&t.getAttribute("src")!==e&&(t.src=e,b.current?.reload())},redraw:()=>b.current?.redraw()})),(0,i.useEffect)(()=>{let e=v.current,t=g.current,i=new f(e,t),r=!1;function o(){i.settings={...l,...w.current},x&&(i.settings={...i.settings,...x})}function n(){r&&(o(),i.resize(),i.render(),i.animate(),e.classList.add(s.default.ready),t.style.opacity="0",A.current||(A.current=!0,C.current?.()))}function a(){i.load(()=>{r=!0,n()})}b.current={redraw:n,showOriginal:s=>{e.style.visibility=s?"hidden":"",t.style.opacity=s?"1":"0"},reload:a},a();let u=new ResizeObserver(()=>{r&&(o(),i.resize()&&(i.render(),i.animate()))});u.observe(e);let p=new IntersectionObserver(e=>{i.visible=e[0].isIntersecting,i.visible&&r&&n()},{threshold:0});return p.observe(e),c.add(i),d||(d=!0,window.addEventListener("pointermove",h,{passive:!0})),y.add(b.current),"true"===new URLSearchParams(window.location.search).get("debugDitherImage")&&S(),()=>{u.disconnect(),p.disconnect(),c.delete(i),!c.size&&d&&(d=!1,window.removeEventListener("pointermove",h)),y.delete(b.current),i.dispose()}},[]),(0,i.useEffect)(()=>{if(!P.current){P.current=!0;return}b.current?.reload?.()},[e]),(0,i.useEffect)(()=>{b.current?.redraw()},[JSON.stringify(p)]),(0,t.jsxs)("div",{className:o?`${s.default.wrapper} ${o}`:s.default.wrapper,style:n,children:[(0,t.jsx)("img",{ref:g,src:a(e),alt:r,className:s.default.img}),(0,t.jsx)("canvas",{ref:v,"aria-hidden":"true",className:s.default.canvas})]})});e.s(["default",0,C])},76146,e=>{e.v({canvas:"DitherImage-module__MV5TGG__canvas",img:"DitherImage-module__MV5TGG__img",ready:"DitherImage-module__MV5TGG__ready",wrapper:"DitherImage-module__MV5TGG__wrapper"})},17349,e=>{"use strict";let t={lang:"fr",meta:{title:"Koyotec Engineering — IA, Cloud, DevOps, Cybersécurité & BI à Tunis",description:"Koyotec Engineering conçoit, déploie et sécurise vos systèmes : intelligence artificielle, cloud, DevOps, cybersécurité et business intelligence. Basés à Tunis.",pages:{expertise:"Expertise — Koyotec Engineering",systems:"Ce que nous construisons — Koyotec Engineering",work:"Blueprints — Koyotec Engineering",studio:"Le studio — Koyotec Engineering",engagements:"Engagements — Koyotec Engineering",contact:"Contact — Koyotec Engineering"}},brand:{name:"Koyotec",line:["Engineering","Tunis"]},nav:[{route:"/",label:"Accueil"},{route:"/expertise",label:"Expertise"},{route:"/systems",label:"Systèmes"},{route:"/work",label:"Blueprints"},{route:"/studio",label:"Le studio"},{route:"/engagements",label:"Engagements"}],navContact:{title:"Parlons-en",code:"Contact"},menu:{open:"Ouvrir le menu",close:"Fermer le menu",home:"Koyotec Engineering — accueil",back:"← koyotec.digital",backHref:"/",careers:"Carrières",careersHref:"/carrieres",switchLabel:"EN",switchName:"English"},transition:{"/":"Accueil","/expertise":"Expertise","/systems":"Systèmes","/work":"Blueprints","/studio":"Le studio","/engagements":"Engagements","/contact":"Parlons-en"},preloader:"Chargement",scrollToContent:"Aller au contenu",home:{header:["IA · Cloud · DevOps · Sécurité · Data","Tunis, Tunisie"],title:"Des systèmes qui tiennent.",ctaPrimary:"Démarrer un projet",ctaSecondary:"Notre expertise",aboutHeader:["Qui nous sommes","Le pôle technique"],about:"Koyotec Engineering est le pôle technique de Koyotec. Nous concevons, déployons et sécurisons les systèmes qui font tourner une entreprise : modèles d’IA, infrastructures cloud, chaînes de livraison, données et tableaux de bord."},focus:[{title:"Intelligence",copy:"IA appliquée et business intelligence : des modèles et des tableaux de bord branchés sur vos vraies données, pas sur une démo."},{title:"Infrastructure",copy:"Cloud et DevOps : une plateforme automatisée, observable et documentée, qui se déploie sans cérémonie."},{title:"Sécurité",copy:"Cybersécurité : audits, durcissement et contrôle d’accès, pour que vos systèmes restent les vôtres."}],marquee:"Intelligence artificielle, cloud, DevOps, cybersécurité et données, de l’audit à la production.",process:{steps:["On audite l’existant.","On dessine l’architecture.","On construit et on teste."],cta:"On met en production, et on reste.",headline:"Comment un besoin devient un système en production, en quatre étapes.",footer:["De l’audit au run","Méthode Koyotec"]},statement:{topLeft:"Un système fiable ne se remarque pas.",bottomRight:"C’est exactement ce que nous construisons."},pages:{expertise:{title:"Notre",subtitle:"expertise",description:"Cinq disciplines, une seule équipe, et des systèmes pensés pour durer."},studio:{title:"Le",subtitle:"studio",description:"Comment nous travaillons, ce qui compte pour nous, et qui nous cherchons."},engagements:{title:"Modes",subtitle:"d’engagement",description:"Un audit, un projet ou un accompagnement continu : vous choisissez le format."},contact:{title:"Construisons",subtitle:"ensemble",description:"Une question, un projet, un système à remettre d’aplomb : écrivez-nous."}},researchStatement:{header:["La fiabilité d’abord","En chiffres"],statement:"Le plus dur n’est pas de faire marcher un système, c’est qu’il marche encore dans six mois. Nous construisons pour ce moment-là.",copy:"Notre travail couvre cinq disciplines qui se parlent : l’IA, le cloud, le DevOps, la cybersécurité et la BI. Un seul interlocuteur, de l’audit au run.",stats:[{label:"Disciplines",value:"05"},{label:"Étapes de méthode",value:"04"},{label:"Clouds publics",value:"03"},{label:"Langues de travail",value:"02"}]},areas:[{title:"Intelligence artificielle",label:"IA",description:"Assistants LLM et RAG sur vos documents, automatisation de traitements, modèles de prédiction et MLOps pour les garder fiables en production."},{title:"Cloud",label:"Cloud",description:"Migration vers AWS, Azure ou GCP, architectures haute disponibilité et optimisation des coûts, sans enfermement chez un fournisseur."},{title:"DevOps",label:"DevOps",description:"Pipelines CI/CD, conteneurs et Kubernetes, infrastructure as code avec Terraform, supervision et alertes qui réveillent les bonnes personnes."},{title:"Cybersécurité",label:"Sécurité",description:"Audits et tests d’intrusion, durcissement des serveurs et du cloud, gestion des identités et préparation à l’ISO 27001."},{title:"Business intelligence",label:"Data",description:"Entrepôt de données, pipelines ETL et tableaux de bord Power BI ou Metabase que vos équipes ouvrent vraiment."}],outcomes:{header:["Ce que vous gardez","Des livrables, pas des promesses"],title:["Ce qui","reste"],copy:"Un projet qui s’arrête à une démo ne sert à personne. Chaque mission laisse derrière elle quelque chose de concret, que votre équipe comprend et peut faire évoluer.",items:["Une infrastructure documentée qui vous appartient","Des déploiements automatisés et réversibles","Des modèles d’IA évalués sur vos propres données","Une supervision qui alerte avant vos clients","Des accès et des secrets sous contrôle","Des tableaux de bord que vos équipes ouvrent","Un rapport de sécurité priorisé et actionnable","Une passation complète à vos équipes"]},work:[{title:"Assistant RAG interne",category:"IA"},{title:"Migration cloud sans coupure",category:"Cloud"},{title:"Pipeline CI/CD & Kubernetes",category:"DevOps"},{title:"Audit & durcissement",category:"Sécurité"},{title:"Tableau de bord décisionnel",category:"BI"}],workYear:"2026",workLabels:{header:"Solutions types",footer:["Index des blueprints","Faites défiler"]},firmIntro:{short:"Une petite équipe d’ingénieurs seniors. Nous construisons les systèmes.",long:"Une petite équipe d’ingénieurs seniors. Nous construisons les systèmes, nous les documentons, et nous les confions à vos équipes en état de marche."},systems:{header:{title:"Ce que nous",subtitle:"construisons",description:"Cinq projets types, de l’idée à la mise en production. Faites défiler : chaque schéma se construit sous vos yeux."},intro:{kicker:["Projets types","Expliqués simplement"],title:"Cinq systèmes que nous livrons, du problème à la solution.",text:"Pas de jargon : pour chaque domaine, un cas concret, ce qui change pour vous, et comment nous le construisons étape par étape.",disclaimer:"Projets types : des démonstrations construites à partir de besoins que nous rencontrons souvent. Les noms sont fictifs et les chiffres indiquent des objectifs habituels, pas des résultats garantis."},labels:{forWho:"Pour qui",problem:"Le problème",build:"Ce que nous construisons",outcomes:"Concrètement, pour vous",stack:"Technologies",timeline:"Délai typique",cta:"Un besoin similaire ? Parlons-en",project:"Projet type"},chapters:[{id:"ia",discipline:"IA",code:"Atlas",title:"Un assistant qui connaît tous vos documents",forWho:"Une entreprise de 200 personnes dont les procédures, contrats et notes internes dorment dans des milliers de fichiers.",problem:"Trouver la bonne information prend des heures, et les nouveaux arrivants posent toujours les mêmes questions.",steps:[["Vos documents","PDF, Word, e-mails, wiki : nous les rassemblons sans les sortir de votre infrastructure."],["Indexés par le sens","Chaque passage devient un point dans un espace où les idées proches se regroupent."],["Une question, en langage courant","Vos équipes posent leur question comme à un collègue."],["Les bons passages","L’assistant retrouve les extraits les plus pertinents, pas seulement des mots-clés."],["Une réponse sourcée","La réponse cite ses sources : on peut toujours vérifier."]],outcomes:[["Quelques secondes","au lieu de longues recherches dans les dossiers partagés"],["Sources citées","à chaque réponse, pour garder la confiance"],["Vos données restent chez vous","hébergement sur vos serveurs ou en Europe"]],stack:["Python","LangChain","PostgreSQL + pgvector","LLM open source ou API","Docker"],timeline:"6 à 10 semaines",visual:{files:["contrats.pdf","rh_2025.docx","procedures.pdf","factures.xlsx","emails.mbox","wiki.html"],clusters:["Contrats","RH","Procédures","Factures","E-mails","Wiki"],question:"Combien de jours de congé après une naissance ?",answer:"Le congé de naissance est de 7 jours ouvrés, à poser dans les 30 jours suivant la naissance.",sources:["Règlement RH 2025, art. 14","Procédure congés v3, p. 2"],you:"Vous",assistant:"Atlas"}},{id:"devops",discipline:"DevOps",code:"Relay",title:"Du code à la production, sans coupure ni stress",forWho:"Une équipe produit qui met en ligne à la main, un vendredi soir, en croisant les doigts.",problem:"Chaque mise en production est lente, risquée, et dépend d’une seule personne.",steps:[["Le code est poussé","Chaque modification déclenche la chaîne, sans intervention humaine."],["Construit, testé, analysé","Compilation, tests automatiques et analyse de sécurité, à chaque fois."],["Empaqueté une fois pour toutes","L’application devient une image conteneur versionnée, identique partout."],["Déployé sans coupure","Kubernetes remplace les anciennes versions une à une : vos utilisateurs ne voient rien."],["Surveillé en continu","Métriques et alertes en temps réel, retour arrière automatique si besoin."]],outcomes:[["En minutes","des mises en production plusieurs fois par jour"],["Zéro coupure","pendant les déploiements"],["Retour arrière","en un clic, ou automatique"]],stack:["GitHub Actions","GitLab CI","Docker","Kubernetes","Terraform","Prometheus","Grafana"],timeline:"4 à 8 semaines",visual:{nodes:["Commit","Build","Tests","Sécurité","Image","Registre","Staging","Production","Supervision"],logs:["$ git push origin main","pipeline #1284 démarré","build      ✓  38 s","tests      ✓  214 réussis","sécurité   ✓  0 faille critique","image      ✓  app:1.8.2","registre   ✓  image publiée","staging    ✓  tests de fumée OK","production ✓  3/3 pods à jour, 0 coupure","supervision ✓ latence p95 120 ms"],terminal:"pipeline",pods:"pods"}},{id:"cloud",discipline:"Cloud",code:"Harbor",title:"Une infrastructure qui tient la charge",forWho:"Une boutique en ligne hébergée sur un seul serveur, qui tombe à chaque promotion.",problem:"Au moindre pic de visites, le site ralentit puis s’arrête, et chaque minute coûte des ventes.",steps:[["Aujourd’hui : un seul serveur","Tout repose sur une machine : si elle tombe, tout s’arrête."],["Décrite en code","Toute l’infrastructure est écrite en Terraform : reproductible, versionnée, vérifiable."],["Répartie sur trois zones","Serveurs et base de données sont dupliqués dans des datacenters distincts."],["Elle s’adapte au trafic","Pendant un pic, de nouveaux serveurs démarrent seuls, puis s’éteignent."],["Sauvegardée, coûts maîtrisés","Sauvegardes automatiques et budget suivi chaque mois."]],outcomes:[["99,9 %","de disponibilité visée"],["Automatique","la montée en charge pendant les pics"],["Facture suivie","et optimisée chaque mois"]],stack:["AWS","Azure","Google Cloud","Terraform","Kubernetes","PostgreSQL managé","CDN"],timeline:"6 à 12 semaines",visual:{monolith:"serveur unique",zones:["zone A","zone B","zone C"],lb:"répartiteur",cdn:"CDN",db:"base de données",vault:"sauvegardes",users:"visiteurs",load:"Charge",servers:"Serveurs",cost:"Budget mensuel",overload:"surcharge"}},{id:"security",discipline:"Cybersécurité",code:"Bastion",title:"Trouver les failles avant les pirates",forWho:"Une PME qui gère des données clients sans savoir où sont ses points faibles.",problem:"Une seule faille peut suffire : vol de données, rançongiciel, plusieurs jours d’arrêt.",steps:[["On cherche les failles","Nous testons votre système comme le ferait un attaquant, avec votre accord."],["Un rapport clair","Chaque faille classée par gravité, expliquée simplement, avec sa correction."],["On ferme les portes","Mises à jour, accès, mots de passe, pare-feu : la surface d’attaque se réduit."],["Surveillance 24 h/24","Les tentatives d’intrusion sont détectées et bloquées en temps réel."],["Vos équipes formées","Sensibilisation au phishing : le premier rempart, ce sont vos collaborateurs."]],outcomes:[["Priorités claires","les failles critiques corrigées en premier"],["Alertes en temps réel","au lieu de découvrir l’attaque des semaines plus tard"],["Conformité facilitée","ISO 27001, RGPD, loi tunisienne sur les données"]],stack:["OWASP ZAP","Nmap","Burp Suite","Wazuh","CrowdSec","MFA"],timeline:"Audit en 2 à 3 semaines, puis suivi mensuel",visual:{found:"Failles trouvées",report:[["Critique",2],["Élevée",4],["Moyenne",6]],fixed:"Corrigées",blocked:"Bloqué",attacks:["force brute SSH","injection SQL","scan de ports","phishing","XSS"],score:"Score de sécurité"}},{id:"data",discipline:"Data & BI",code:"Prism",title:"Toutes vos données, un seul tableau de bord",forWho:"Un distributeur dont les chiffres vivent dans l’ERP, trois fichiers Excel et le CRM.",problem:"Chaque lundi, une journée entière passe à copier des exports pour obtenir des chiffres déjà dépassés.",steps:[["Des données éparpillées","Ventes dans l’ERP, stocks dans Excel, clients dans le CRM : rien ne se parle."],["Collectées chaque nuit","Des flux automatiques extraient, nettoient et rapprochent les données."],["Un entrepôt unique","Une seule source de vérité, historisée et sécurisée."],["Des tableaux de bord vivants","Chiffre d’affaires, marges, stocks : à jour chaque matin, sur ordinateur ou mobile."],["Des alertes utiles","L’information arrive avant que le problème ne coûte."]],outcomes:[["Fini les exports","Excel copiés à la main"],["À jour chaque matin","sans intervention"],["Des décisions","prises sur des chiffres fiables"]],stack:["Python","Airbyte","dbt","PostgreSQL","BigQuery","Power BI","Metabase"],timeline:"6 à 10 semaines",visual:{sources:["ERP","Excel","CRM","Boutique"],warehouse:"Entrepôt",kpis:[["Chiffre d’affaires","1,24 M DT"],["Marge","31,8 %"],["Commandes","8 412"]],chart:"Ventes par mois",regions:["Tunis","Sfax","Sousse","Nabeul"],alert:"Stock bas à Sfax : 12 unités",dashboard:"Tableau de bord"}}]},positions:{meta:"Candidatures spontanées /",title:["Nous","rejoindre"],careers:"/carrieres",roles:[{title:"Ingénieur DevOps",tag:"DevOps",location:"Tunis",role:"devops"},{title:"Ingénieur cloud",tag:"Cloud",location:"Hybride",role:"cloud"},{title:"Ingénieur IA / ML",tag:"IA",location:"Tunis",role:"ai"},{title:"Data engineer",tag:"Data",location:"Remote",role:"data"},{title:"Analyste cybersécurité",tag:"Sécurité",location:"Tunis",role:"security"},{title:"Stage de fin d’études",tag:"Tous pôles",location:"Tunis",contract:"stage"}]},studioStatement:{topLeft:"Les bons systèmes sont ennuyeux à regarder.",bottomRight:"Ils tournent, ils préviennent, et ils se laissent réparer."},engagements:[{title:"Audit",copy:"Deux à trois semaines pour faire l’état des lieux de votre infrastructure, de votre sécurité ou de vos données, avec un plan d’action priorisé."},{title:"Projet",copy:"Un périmètre, un calendrier et des livrables clairs : une migration, une plateforme, un assistant IA ou un entrepôt de données."},{title:"Run",copy:"Un accompagnement mensuel : supervision, maintenance, mises à jour de sécurité et évolutions, avec un interlocuteur dédié."}],partners:{header:["Notre outillage","Sans dogme"],copy:"Des outils éprouvés, choisis pour votre contexte et non pour notre confort. Voici ceux que nous utilisons au quotidien.",footer:["Technologies","Choisies au cas par cas"]},contact:{title:"Écrivez-nous",copy:"Décrivez votre contexte, même en deux lignes. Nous revenons vers vous avec des questions précises, puis une proposition.",labels:{address:"Adresse",comms:"Contact",form:"Formulaire",social:"Réseaux"},address:["Ennasr","Tunis","Tunisie"],form:{text:"Formulaire de devis",href:"https://www.koyotec.digital/contact"},formNote:"Réponse sous 24 h ouvrées"},faq:{header:["FAQ / 01","Questions fréquentes"],title:"Vos questions, nos réponses",items:[{question:"Sur quels types de projets intervenez-vous ?",answer:["IA appliquée, cloud, DevOps, cybersécurité et business intelligence.","Cela va d’un assistant IA branché sur vos documents à la migration complète d’une infrastructure, en passant par un audit de sécurité ou un entrepôt de données."]},{question:"Comment chiffrez-vous une mission ?",answer:["Après un premier échange gratuit, nous proposons un périmètre et un prix fixe pour les audits et les projets.","L’accompagnement continu (run) est facturé au mois, avec un volume d’heures défini."]},{question:"Avec quels fournisseurs cloud travaillez-vous ?",answer:["AWS, Microsoft Azure et Google Cloud, ainsi que les hébergeurs locaux et les serveurs on-premise.","Nous recommandons ce qui convient à votre budget et à vos contraintes, pas un fournisseur en particulier."]},{question:"Comment protégez-vous nos données ?",answer:["Nous signons un accord de confidentialité avant tout accès, travaillons avec le principe du moindre privilège et documentons chaque accès.","Vos données restent dans votre environnement autant que possible."]},{question:"Que se passe-t-il après la livraison ?",answer:["Chaque projet se termine par une documentation complète et une passation à vos équipes.","Si vous le souhaitez, nous continuons à superviser et à faire évoluer le système dans le cadre d’un contrat de run."]}]},footer:{copy:"Le pôle technique de Koyotec : intelligence artificielle, cloud, DevOps, cybersécurité et business intelligence, conçus pour tenir longtemps après la mise en ligne.",words:["Koyotec","Eng."]}},s={lang:"en",meta:{title:"Koyotec Engineering — AI, Cloud, DevOps, Cybersecurity & BI in Tunis",description:"Koyotec Engineering designs, ships and secures your systems: artificial intelligence, cloud, DevOps, cybersecurity and business intelligence. Based in Tunis.",pages:{expertise:"Expertise — Koyotec Engineering",systems:"What we build — Koyotec Engineering",work:"Blueprints — Koyotec Engineering",studio:"The studio — Koyotec Engineering",engagements:"Engagements — Koyotec Engineering",contact:"Contact — Koyotec Engineering"}},brand:{name:"Koyotec",line:["Engineering","Tunis"]},nav:[{route:"/",label:"Home"},{route:"/expertise",label:"Expertise"},{route:"/systems",label:"Systems"},{route:"/work",label:"Blueprints"},{route:"/studio",label:"The studio"},{route:"/engagements",label:"Engagements"}],navContact:{title:"Let’s talk",code:"Contact"},menu:{open:"Open menu",close:"Close menu",home:"Koyotec Engineering — home",back:"← koyotec.digital",backHref:"/en/",careers:"Careers",careersHref:"/en/careers",switchLabel:"FR",switchName:"Français"},transition:{"/":"Home","/expertise":"Expertise","/systems":"Systems","/work":"Blueprints","/studio":"The studio","/engagements":"Engagements","/contact":"Let’s talk"},preloader:"Loading",scrollToContent:"Scroll to content",home:{header:["AI · Cloud · DevOps · Security · Data","Tunis, Tunisia"],title:"Systems that hold.",ctaPrimary:"Start a project",ctaSecondary:"Our expertise",aboutHeader:["Who we are","The technical arm"],about:"Koyotec Engineering is the technical arm of Koyotec. We design, ship and secure the systems a business runs on: AI models, cloud infrastructure, delivery pipelines, data and dashboards."},focus:[{title:"Intelligence",copy:"Applied AI and business intelligence: models and dashboards wired to your real data, not to a demo."},{title:"Infrastructure",copy:"Cloud and DevOps: an automated, observable, documented platform that deploys without ceremony."},{title:"Security",copy:"Cybersecurity: audits, hardening and access control, so your systems stay yours."}],marquee:"Artificial intelligence, cloud, DevOps, cybersecurity and data, from the first audit to production.",process:{steps:["We audit what you have.","We design the architecture.","We build and test."],cta:"We ship it, and we stay.",headline:"How a need becomes a system in production, in four steps.",footer:["Audit to run","The Koyotec method"]},statement:{topLeft:"A reliable system goes unnoticed.",bottomRight:"That is exactly what we build."},pages:{expertise:{title:"Our",subtitle:"expertise",description:"Five disciplines, one team, and systems built to last."},studio:{title:"The",subtitle:"studio",description:"How we work, what matters to us, and who we are looking for."},engagements:{title:"Ways",subtitle:"to engage",description:"An audit, a project or ongoing support: you pick the format."},contact:{title:"Let’s build",subtitle:"together",description:"A question, a project, a system that needs fixing: write to us."}},researchStatement:{header:["Reliability first","By the numbers"],statement:"The hard part is not making a system work. It is making sure it still works six months later. We build for that moment.",copy:"Our work spans five disciplines that talk to each other: AI, cloud, DevOps, cybersecurity and BI. One partner, from the first audit to day-to-day operations.",stats:[{label:"Disciplines",value:"05"},{label:"Method steps",value:"04"},{label:"Public clouds",value:"03"},{label:"Working languages",value:"02"}]},areas:[{title:"Artificial intelligence",label:"AI",description:"LLM assistants and RAG over your documents, process automation, predictive models, and MLOps to keep them reliable in production."},{title:"Cloud",label:"Cloud",description:"Migration to AWS, Azure or GCP, high-availability architectures and cost optimisation, without vendor lock-in."},{title:"DevOps",label:"DevOps",description:"CI/CD pipelines, containers and Kubernetes, infrastructure as code with Terraform, and monitoring that pages the right people."},{title:"Cybersecurity",label:"Security",description:"Audits and penetration tests, server and cloud hardening, identity management and ISO 27001 readiness."},{title:"Business intelligence",label:"Data",description:"Data warehouses, ETL pipelines and Power BI or Metabase dashboards your teams actually open."}],outcomes:{header:["What you keep","Deliverables, not promises"],title:["What","stays"],copy:"A project that ends at a demo helps no one. Every engagement leaves something concrete behind, something your team understands and can build on.",items:["Documented infrastructure that you own","Automated, reversible deployments","AI models evaluated on your own data","Monitoring that alerts before your customers do","Access and secrets under control","Dashboards your teams actually open","A prioritised, actionable security report","A full handover to your teams"]},work:[{title:"Internal RAG assistant",category:"AI"},{title:"Zero-downtime cloud migration",category:"Cloud"},{title:"CI/CD & Kubernetes pipeline",category:"DevOps"},{title:"Audit & hardening",category:"Security"},{title:"Decision dashboard",category:"BI"}],workYear:"2026",workLabels:{header:"Solution blueprints",footer:["Blueprint index","Scroll through"]},firmIntro:{short:"A small team of senior engineers. We build the systems.",long:"A small team of senior engineers. We build the systems, document them, and hand them to your teams in working order."},systems:{header:{title:"What we",subtitle:"build",description:"Five typical projects, from the idea to production. Scroll: each diagram builds itself before your eyes."},intro:{kicker:["Typical projects","Explained simply"],title:"Five systems we deliver, from the problem to the solution.",text:"No jargon: for each field, a concrete case, what changes for you, and how we build it step by step.",disclaimer:"Typical projects: demonstrations built from needs we meet often. Names are fictional and figures show usual targets, not guaranteed results."},labels:{forWho:"For whom",problem:"The problem",build:"What we build",outcomes:"What it means for you",stack:"Technologies",timeline:"Typical timeline",cta:"A similar need? Let’s talk",project:"Typical project"},chapters:[{id:"ia",discipline:"AI",code:"Atlas",title:"An assistant that knows all your documents",forWho:"A 200-person company whose procedures, contracts and internal notes sleep in thousands of files.",problem:"Finding the right information takes hours, and newcomers keep asking the same questions.",steps:[["Your documents","PDFs, Word files, emails, wiki: we gather them without taking them out of your infrastructure."],["Indexed by meaning","Each passage becomes a point in a space where related ideas cluster together."],["A question, in plain words","Your teams ask their question as they would ask a colleague."],["The right passages","The assistant finds the most relevant excerpts, not just keywords."],["An answer with sources","The answer cites its sources: you can always check."]],outcomes:[["A few seconds","instead of long searches through shared folders"],["Sources cited","in every answer, so trust stays"],["Your data stays yours","hosted on your servers or in Europe"]],stack:["Python","LangChain","PostgreSQL + pgvector","Open-source LLM or API","Docker"],timeline:"6 to 10 weeks",visual:{files:["contracts.pdf","hr_2025.docx","procedures.pdf","invoices.xlsx","emails.mbox","wiki.html"],clusters:["Contracts","HR","Procedures","Invoices","Emails","Wiki"],question:"How many days of leave after a birth?",answer:"Birth leave is 7 working days, to be taken within 30 days of the birth.",sources:["HR rules 2025, art. 14","Leave procedure v3, p. 2"],you:"You",assistant:"Atlas"}},{id:"devops",discipline:"DevOps",code:"Relay",title:"From code to production, no downtime, no stress",forWho:"A product team that deploys by hand, on a Friday night, fingers crossed.",problem:"Every release is slow, risky, and depends on a single person.",steps:[["Code is pushed","Every change triggers the chain, with no human step."],["Built, tested, scanned","Compilation, automated tests and security scan, every single time."],["Packaged once and for all","The app becomes a versioned container image, identical everywhere."],["Deployed with no downtime","Kubernetes replaces old versions one by one: your users notice nothing."],["Watched continuously","Real-time metrics and alerts, automatic rollback when needed."]],outcomes:[["In minutes","releases several times a day"],["Zero downtime","during deployments"],["Rollback","in one click, or automatic"]],stack:["GitHub Actions","GitLab CI","Docker","Kubernetes","Terraform","Prometheus","Grafana"],timeline:"4 to 8 weeks",visual:{nodes:["Commit","Build","Tests","Security","Image","Registry","Staging","Production","Monitoring"],logs:["$ git push origin main","pipeline #1284 started","build      ✓  38 s","tests      ✓  214 passed","security   ✓  0 critical issue","image      ✓  app:1.8.2","registry   ✓  image published","staging    ✓  smoke tests OK","production ✓  3/3 pods updated, 0 downtime","monitoring ✓  p95 latency 120 ms"],terminal:"pipeline",pods:"pods"}},{id:"cloud",discipline:"Cloud",code:"Harbor",title:"An infrastructure that holds the load",forWho:"An online shop hosted on a single server that goes down at every sale.",problem:"At the slightest traffic peak, the site slows down then stops, and every minute costs sales.",steps:[["Today: a single server","Everything relies on one machine: if it falls, everything stops."],["Described as code","The whole infrastructure is written in Terraform: reproducible, versioned, reviewable."],["Spread over three zones","Servers and database are duplicated in separate data centres."],["It follows the traffic","During a peak, new servers start on their own, then shut down."],["Backed up, costs under control","Automatic backups and a budget tracked every month."]],outcomes:[["99.9%","target availability"],["Automatic","scaling during peaks"],["Tracked bill","optimised every month"]],stack:["AWS","Azure","Google Cloud","Terraform","Kubernetes","Managed PostgreSQL","CDN"],timeline:"6 to 12 weeks",visual:{monolith:"single server",zones:["zone A","zone B","zone C"],lb:"load balancer",cdn:"CDN",db:"database",vault:"backups",users:"visitors",load:"Load",servers:"Servers",cost:"Monthly budget",overload:"overload"}},{id:"security",discipline:"Cybersecurity",code:"Bastion",title:"Find the flaws before attackers do",forWho:"An SME handling customer data without knowing where its weak spots are.",problem:"One flaw can be enough: data theft, ransomware, days of downtime.",steps:[["We look for the flaws","We test your system the way an attacker would, with your consent."],["A clear report","Every flaw ranked by severity, explained simply, with its fix."],["We close the doors","Updates, access, passwords, firewall: the attack surface shrinks."],["24/7 monitoring","Intrusion attempts are detected and blocked in real time."],["Your teams trained","Phishing awareness: your people are the first line of defence."]],outcomes:[["Clear priorities","critical flaws fixed first"],["Real-time alerts","instead of finding out weeks later"],["Easier compliance","ISO 27001, GDPR, Tunisian data law"]],stack:["OWASP ZAP","Nmap","Burp Suite","Wazuh","CrowdSec","MFA"],timeline:"Audit in 2 to 3 weeks, then monthly follow-up",visual:{found:"Flaws found",report:[["Critical",2],["High",4],["Medium",6]],fixed:"Fixed",blocked:"Blocked",attacks:["SSH brute force","SQL injection","port scan","phishing","XSS"],score:"Security score"}},{id:"data",discipline:"Data & BI",code:"Prism",title:"All your data, one dashboard",forWho:"A distributor whose figures live in the ERP, three Excel files and the CRM.",problem:"Every Monday, a whole day goes into copying exports to get figures that are already out of date.",steps:[["Scattered data","Sales in the ERP, stock in Excel, customers in the CRM: nothing talks."],["Collected every night","Automated pipelines extract, clean and match the data."],["One warehouse","A single source of truth, historised and secured."],["Live dashboards","Revenue, margins, stock: up to date every morning, on desktop or mobile."],["Useful alerts","The information arrives before the problem costs money."]],outcomes:[["No more exports","copied by hand into Excel"],["Fresh every morning","with no one involved"],["Decisions","made on reliable figures"]],stack:["Python","Airbyte","dbt","PostgreSQL","BigQuery","Power BI","Metabase"],timeline:"6 to 10 weeks",visual:{sources:["ERP","Excel","CRM","Shop"],warehouse:"Warehouse",kpis:[["Revenue","TND 1.24M"],["Margin","31.8%"],["Orders","8,412"]],chart:"Sales per month",regions:["Tunis","Sfax","Sousse","Nabeul"],alert:"Low stock in Sfax: 12 units",dashboard:"Dashboard"}}]},positions:{meta:"Open applications /",title:["Join","us"],careers:"/en/careers",roles:[{title:"DevOps engineer",tag:"DevOps",location:"Tunis",role:"devops"},{title:"Cloud engineer",tag:"Cloud",location:"Hybrid",role:"cloud"},{title:"AI / ML engineer",tag:"AI",location:"Tunis",role:"ai"},{title:"Data engineer",tag:"Data",location:"Remote",role:"data"},{title:"Security analyst",tag:"Security",location:"Tunis",role:"security"},{title:"Final-year internship",tag:"All teams",location:"Tunis",contract:"stage"}]},studioStatement:{topLeft:"Good systems are boring to watch.",bottomRight:"They run, they warn you, and they let you fix them."},engagements:[{title:"Audit",copy:"Two to three weeks to assess your infrastructure, security or data, ending with a prioritised action plan."},{title:"Project",copy:"A clear scope, timeline and deliverables: a migration, a platform, an AI assistant or a data warehouse."},{title:"Run",copy:"Monthly support: monitoring, maintenance, security updates and improvements, with a dedicated contact."}],partners:{header:["Our toolkit","No dogma"],copy:"Proven tools, chosen for your context rather than our comfort. These are the ones we use every day.",footer:["Technologies","Chosen case by case"]},contact:{title:"Write to us",copy:"Describe your context, even in two lines. We come back with precise questions, then a proposal.",labels:{address:"Address",comms:"Contact",form:"Form",social:"Social"},address:["Ennasr","Tunis","Tunisia"],form:{text:"Quote form",href:"https://www.koyotec.digital/en/contact"},formNote:"Reply within 24 business hours"},faq:{header:["FAQ / 01","Common questions"],title:"Your questions answered",items:[{question:"What kind of projects do you take on?",answer:["Applied AI, cloud, DevOps, cybersecurity and business intelligence.","That ranges from an AI assistant wired to your documents to a full infrastructure migration, a security audit or a data warehouse."]},{question:"How do you price an engagement?",answer:["After a free first call, we propose a scope and a fixed price for audits and projects.","Ongoing support (run) is billed monthly, with a set number of hours."]},{question:"Which cloud providers do you work with?",answer:["AWS, Microsoft Azure and Google Cloud, as well as local hosting providers and on-premise servers.","We recommend what fits your budget and constraints, not a particular vendor."]},{question:"How do you protect our data?",answer:["We sign an NDA before any access, work on least privilege, and log every access we are given.","Your data stays in your environment whenever possible."]},{question:"What happens after delivery?",answer:["Every project ends with full documentation and a handover to your teams.","If you want, we keep monitoring and improving the system under a run contract."]}]},footer:{copy:"The technical arm of Koyotec: artificial intelligence, cloud, DevOps, cybersecurity and business intelligence, built to hold long after launch.",words:["Koyotec","Eng."]}},i="/engineering";e.s(["BASE",0,i,"DICTS",0,{fr:t,en:s},"localize",0,(e,t)=>"en"===e?"/"===t?"/en":`/en${t}`:t,"splitPath",0,function(e="/"){let t=e.startsWith(i)?e.slice(i.length):e;return"/en"===(t=t.replace(/\/+$/,"")||"/")||t.startsWith("/en/")?{lang:"en",route:t.slice(3)||"/"}:{lang:"fr",route:t}}],17349)},85386,e=>{"use strict";var t=e.i(40854),s=e.i(17349);e.s(["useLang",0,function(){let{lang:e,route:i}=(0,s.splitPath)((0,t.usePathname)());return{lang:e,route:i,t:s.DICTS[e],href:t=>(0,s.localize)(e,t),isHome:"/"===i}}])}]);