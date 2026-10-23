(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[581],{1521:(e,t,o)=>{"use strict";o.d(t,{default:()=>m});var n=o(9416);o(3284);var r=o(404),i=o(9940);let a=[1,1,1];function c(e,t){return e+(t-e)*(1-Math.exp(-.065*i.default.ticker.deltaRatio()))}let l=`
attribute vec2 a_position;
void main(){
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`,s=`
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_camOffset;
uniform sampler2D u_noise;
uniform float u_cubeSize;
uniform vec3 u_bgColor;
uniform vec3 u_smokeColor;

#define PI 3.141592653589793
#define TWOPI 6.283185307179586
#define HALFPI 1.570796326794896

#define POLAR(theta) vec3(cos(theta), 0.0, sin(theta))
#define SPHERICAL(theta, phi) (sin(phi)*POLAR(theta) + vec3(0.0, cos(phi), 0.0))

#define MAX_ALPHA_PER_UNIT_DIST 10.0
#define QUIT_ALPHA 0.99
#define RAY_STEP 0.025

#define TAN_HALF_FOVY 0.5773502691896257

float len2Inf(vec2 v){
  vec2 d = abs(v);
  return max(d.x, d.y);
}

void boxClip(
  in vec3 boxMin, in vec3 boxMax,
  in vec3 p, in vec3 v,
  out vec2 tRange, out float didHit
){
  vec3 tb0 = (boxMin - p) / v;
  vec3 tb1 = (boxMax - p) / v;
  vec3 tmin = min(tb0, tb1);
  vec3 tmax = max(tb0, tb1);
  tRange = vec2(
    max(max(tmin.x, tmin.y), tmin.z),
    min(min(tmax.x, tmax.y), tmax.z)
  );
  didHit = step(tRange.x, tRange.y);
}

float hash12(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 colormap(float t){
  return 0.5 + 0.5 * cos(TWOPI * (t + vec3(0.0, 0.1, 0.2)));
}

vec4 blendOnto(vec4 cFront, vec4 cBehind){
  return cFront + (1.0 - cFront.a) * cBehind;
}

float noise(vec3 x){
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  vec2 uv = (i.xy + vec2(37.0, 17.0) * i.z) + f.xy;
  vec2 rg = texture2D(u_noise, (uv + 0.5) / 256.0).yx;
  return mix(rg.x, rg.y, f.z);
}

float fbm(vec3 p){
  p *= 0.6;
  float v = noise(p);
  p *= 0.3;
  v = mix(v, noise(p), 0.7);
  p *= 0.3;
  v = mix(v, noise(p), 0.7);
  return v;
}

float fDensity(vec3 lmn, float t){
  t += 32.0;
  vec3 uvw = (lmn - vec3(63.5)) / 63.5;
  float d2 = fbm(
    vec3(0.6, 0.3, 0.6) * lmn +
    vec3(0.0, 8.0 * t, 0.0)
  );
  float d1 = fbm(
    0.3 * lmn +
    vec3(0.0, 4.0 * t, 0.0) +
    5.0 * vec3(cos(d2 * TWOPI), 2.0 * d2, sin(d2 * TWOPI))
  );
  d1 = pow(d1, mix(4.0, 12.0, smoothstep(0.6, 1.0, len2Inf(uvw.xz))));
  float a = 0.02;
  float b = 0.08;
  float raw = 0.02 + 0.2 * smoothstep(0.0, a, d1) + 0.5 * smoothstep(a, b, d1) + 0.18 * smoothstep(b, 1.0, d1);
  float edgeDist = 1.0 - len2Inf(uvw.xz);
  float edgeFade = smoothstep(0.0, 0.08, edgeDist) * smoothstep(0.0, 0.08, 1.0 - abs(uvw.y));
  return raw * edgeFade;
}

float BOX_N = 128.0;

vec3 lmnFromWorldPos(vec3 p, float cubeSize){
  vec3 bmin = vec3(-cubeSize);
  vec3 bmax = vec3(cubeSize);
  vec3 uvw = (p - bmin) / (bmax - bmin);
  return uvw * (BOX_N - 1.0);
}

float estimateLight(vec3 lmn, vec3 nvToLight, float cubeSize, float time){
  float s1 = fDensity(lmn + nvToLight * 3.0, time);
  float s2 = fDensity(lmn + nvToLight * 8.0, time);
  float occlusion = s1 * 0.5 + s2 * 0.5;
  return exp(-occlusion * 12.0);
}

vec4 marchVolume(vec3 p, vec3 nv, vec2 fragCoord, float cubeSize, float time){
  vec3 bmin = vec3(-cubeSize);
  vec3 bmax = vec3(cubeSize);
  vec2 tRange;
  float didHit;
  boxClip(bmin, bmax, p, nv, tRange, didHit);
  tRange.x = max(0.0, tRange.x);
  vec4 color = vec4(0.0);
  if(didHit < 0.5) return color;

  float camTheta = 0.2 * time + u_camOffset.x;
  vec3 lightPos = 0.9 * POLAR(camTheta + PI * 0.15) + vec3(0.0, 2.0, 0.0);

  float t = tRange.x + min(tRange.y - tRange.x, RAY_STEP) * 0.5 * hash12(fragCoord);
  for(int i = 0; i < 90; i++){
    if(t > tRange.y || color.a > QUIT_ALPHA) break;
    vec3 rayPos = p + t * nv;
    vec3 lmn = lmnFromWorldPos(rayPos, cubeSize);
    float density = fDensity(lmn, time);
    vec3 nvToLight = normalize(lmnFromWorldPos(lightPos, cubeSize) - lmn);
    float lightAmount = estimateLight(lmn, nvToLight, cubeSize, time);
    lightAmount = mix(lightAmount, 1.0, 0.05);

    vec3 cfrag = u_smokeColor * colormap(0.7 * density + 0.8);
    float calpha = density * MAX_ALPHA_PER_UNIT_DIST * RAY_STEP;
    vec4 ci = clamp(vec4(cfrag * lightAmount, 1.0) * calpha, 0.0, 1.0);
    color = blendOnto(color, ci);
    t += RAY_STEP;
  }
  float finalA = clamp(color.a / QUIT_ALPHA, 0.0, 1.0);
  color *= (finalA / (color.a + 1e-5));
  return color;
}

vec3 nvCamDirFromClip(vec3 nvFw, vec2 clip, vec2 res){
  vec3 nvRt = normalize(cross(nvFw, vec3(0.0, 1.0, 0.0)));
  vec3 nvUp = cross(nvRt, nvFw);
  return normalize(TAN_HALF_FOVY * (clip.x * (res.x / res.y) * nvRt + clip.y * nvUp) + nvFw);
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float camTheta = 0.2 * u_time + u_camOffset.x;
  float camPhi = HALFPI - 0.2 + u_camOffset.y;

  vec3 camPos = 2.5 * SPHERICAL(camTheta, camPhi);
  vec3 lookTarget = vec3(0.0);
  vec3 nvCamFw = normalize(lookTarget - camPos);
  vec3 nvCamDir = nvCamDirFromClip(nvCamFw, uv * 2.0 - 1.0, u_resolution);

  vec4 fgColor = marchVolume(camPos, nvCamDir, gl_FragCoord.xy, u_cubeSize, u_time);
  vec3 finalColor = blendOnto(fgColor, vec4(u_bgColor, 1.0)).rgb;

  gl_FragColor = vec4(finalColor, 1.0);
}
`;function m({cubeSize:e=.75,bgColor:t="#0b0b0b",smokeColor:o=a,dpr:m=1,className:f="",children:u}){let v=(0,r.useRef)(null),d=(0,r.useRef)(null),h=(0,r.useRef)(!1),g=(0,r.useRef)({start:()=>{},stop:()=>{}});return(0,r.useEffect)(()=>{let n,r=v.current,a=d.current;if(!r||!a)return;let f=null,u=null,x=null,p=null,_=null,b=null,T=null,R=null,A=null,E=null,P=null,y=null,L={x:0,y:0},w={x:0,y:0},I=!1,S=!1,C=!1,F=null,U=0,D=0,N=performance.now(),O=[parseInt((n=t.replace("#","")).substring(0,2),16)/255,parseInt(n.substring(2,4),16)/255,parseInt(n.substring(4,6),16)/255],z=0,X=0;function B(e,t){let o=f.createShader(e);return(f.shaderSource(o,t),f.compileShader(o),f.getShaderParameter(o,f.COMPILE_STATUS))?o:(console.error(f.getShaderInfoLog(o)),f.deleteShader(o),null)}function H(){if(!f)return;let e=Math.min(m,window.devicePixelRatio||1),t=a.getBoundingClientRect(),o=Math.round(t.width*e),n=Math.round(t.height*e);(o!==z||n!==X)&&(a.width=o,a.height=n,z=o,X=n)}function k(){if(!S||!f||!h.current)return void j();let t=(performance.now()-N-U)/1e3;w.x=c(w.x,L.x),w.y=c(w.y,L.y),f.viewport(0,0,a.width,a.height),f.clearColor(O[0],O[1],O[2],1),f.clear(f.COLOR_BUFFER_BIT),f.uniform1f(T,t),f.uniform2f(R,a.width,a.height),f.uniform2f(A,w.x,w.y),f.uniform1f(E,e),f.uniform3f(P,O[0],O[1],O[2]),f.uniform3f(y,o[0],o[1],o[2]),f.drawArrays(f.TRIANGLES,0,6)}function M(){!F&&S&&(D&&(U+=performance.now()-D,D=0),F=k,i.default.ticker.add(F))}function j(){F&&(i.default.ticker.remove(F),F=null,D=performance.now())}g.current={start:M,stop:j};let W=new ResizeObserver(()=>{H()});W.observe(a);let Y=new IntersectionObserver(([e])=>{h.current=e.isIntersecting,e.isIntersecting?S?M():S||C||(C=!0,requestAnimationFrame(()=>{C=!1,function(){if(S)return!0;if(S=!0,!(f=a.getContext("webgl",{alpha:!1,antialias:!1,preserveDrawingBuffer:!1,powerPreference:"low-power",desynchronized:!0})))return console.warn("WebGL not supported"),!1;if(x=B(f.VERTEX_SHADER,l),p=B(f.FRAGMENT_SHADER,s),!x||!p)return!1;if(u=f.createProgram(),f.attachShader(u,x),f.attachShader(u,p),f.linkProgram(u),!f.getProgramParameter(u,f.LINK_STATUS))return console.error(f.getProgramInfoLog(u)),!1;f.useProgram(u),_=f.createBuffer(),f.bindBuffer(f.ARRAY_BUFFER,_),f.bufferData(f.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),f.STATIC_DRAW);let e=f.getAttribLocation(u,"a_position");f.enableVertexAttribArray(e),f.vertexAttribPointer(e,2,f.FLOAT,!1,0,0),b=f.createTexture();let t=new Uint8Array(262144);for(let e=0;e<t.length;e++)t[e]=256*Math.random()|0;f.bindTexture(f.TEXTURE_2D,b),f.texImage2D(f.TEXTURE_2D,0,f.RGBA,256,256,0,f.RGBA,f.UNSIGNED_BYTE,t),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_WRAP_S,f.REPEAT),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_WRAP_T,f.REPEAT),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_MIN_FILTER,f.LINEAR),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_MAG_FILTER,f.LINEAR),T=f.getUniformLocation(u,"u_time"),R=f.getUniformLocation(u,"u_resolution"),A=f.getUniformLocation(u,"u_camOffset");let o=f.getUniformLocation(u,"u_noise");return E=f.getUniformLocation(u,"u_cubeSize"),P=f.getUniformLocation(u,"u_bgColor"),y=f.getUniformLocation(u,"u_smokeColor"),f.activeTexture(f.TEXTURE0),f.bindTexture(f.TEXTURE_2D,b),f.uniform1i(o,0),H(),!0}()&&h.current&&M()})):j()},{rootMargin:"0px 0px 100% 0px",threshold:0});function G(e){var t,o;let n;if(t=e.clientX,o=e.clientY,!(t>=(n=r.getBoundingClientRect()).left)||!(t<=n.right)||!(o>=n.top)||!(o<=n.bottom)){I&&(I=!1,L.x=0,L.y=0);return}I=!0,function(e,t){let o=r.getBoundingClientRect();if(!o.width||!o.height)return;let n=(e-o.left)/o.width*2-1,i=(t-o.top)/o.height*2-1;L.x=.58*n,L.y=-(.42*i)}(e.clientX,e.clientY)}return Y.observe(a),document.addEventListener("pointermove",G,{passive:!0}),()=>{j(),document.removeEventListener("pointermove",G),Y.disconnect(),W.disconnect(),g.current={start:()=>{},stop:()=>{}},f&&(u&&f.deleteProgram(u),x&&f.deleteShader(x),p&&f.deleteShader(p),_&&f.deleteBuffer(_),b&&f.deleteTexture(b))}},[e,t,o,m]),(0,n.jsxs)("footer",{ref:v,className:`smoke-footer ${f}`,children:[(0,n.jsx)("canvas",{ref:d}),u,(0,n.jsx)("div",{className:"footer-content",children:(0,n.jsx)("div",{className:"container",children:(0,n.jsxs)("div",{className:"footer-heading",children:[(0,n.jsx)("p",{className:"mono",children:"Establish Contact"}),(0,n.jsx)("h2",{className:"type-2",children:"Let's Make Something They Can't Walk Away From"})]})})}),(0,n.jsx)("div",{className:"footer-bar",children:(0,n.jsxs)("div",{className:"container",children:[(0,n.jsx)("div",{className:"footer-bar-left",children:(0,n.jsx)("p",{className:"mono",children:"\xa9 2025 Ironfang Inc."})}),(0,n.jsx)("div",{className:"footer-bar-right",children:(0,n.jsx)("p",{className:"mono",children:"Developed by KOYOTEC"})})]})})]})}},2817:(e,t,o)=>{Promise.resolve().then(o.t.bind(o,5632,23)),Promise.resolve().then(o.bind(o,2285)),Promise.resolve().then(o.bind(o,1521))},3284:()=>{},5632:()=>{}},e=>{e.O(0,[427,0,468,483,318,961,285,213,582,358],()=>e(e.s=2817)),_N_E=e.O()}]);