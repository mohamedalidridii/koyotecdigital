(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[893],{379:()=>{},1521:(e,t,r)=>{"use strict";r.d(t,{default:()=>m});var n=r(9416);r(3284);var o=r(404),i=r(9940);let a=[1,1,1];function c(e,t){return e+(t-e)*(1-Math.exp(-.065*i.default.ticker.deltaRatio()))}let l=`
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
`;function m({cubeSize:e=.75,bgColor:t="#0b0b0b",smokeColor:r=a,dpr:m=1,className:f="",children:u}){let d=(0,o.useRef)(null),v=(0,o.useRef)(null),h=(0,o.useRef)(!1),g=(0,o.useRef)({start:()=>{},stop:()=>{}});return(0,o.useEffect)(()=>{let n,o=d.current,a=v.current;if(!o||!a)return;let f=null,u=null,p=null,x=null,_=null,T=null,b=null,R=null,A=null,E=null,P=null,w=null,y={x:0,y:0},L={x:0,y:0},S=!1,I=!1,N=!1,C=null,F=0,j=0,D=performance.now(),U=[parseInt((n=t.replace("#","")).substring(0,2),16)/255,parseInt(n.substring(2,4),16)/255,parseInt(n.substring(4,6),16)/255],z=0,O=0;function M(e,t){let r=f.createShader(e);return(f.shaderSource(r,t),f.compileShader(r),f.getShaderParameter(r,f.COMPILE_STATUS))?r:(console.error(f.getShaderInfoLog(r)),f.deleteShader(r),null)}function k(){if(!f)return;let e=Math.min(m,window.devicePixelRatio||1),t=a.getBoundingClientRect(),r=Math.round(t.width*e),n=Math.round(t.height*e);(r!==z||n!==O)&&(a.width=r,a.height=n,z=r,O=n)}function H(){if(!I||!f||!h.current)return void X();let t=(performance.now()-D-F)/1e3;L.x=c(L.x,y.x),L.y=c(L.y,y.y),f.viewport(0,0,a.width,a.height),f.clearColor(U[0],U[1],U[2],1),f.clear(f.COLOR_BUFFER_BIT),f.uniform1f(b,t),f.uniform2f(R,a.width,a.height),f.uniform2f(A,L.x,L.y),f.uniform1f(E,e),f.uniform3f(P,U[0],U[1],U[2]),f.uniform3f(w,r[0],r[1],r[2]),f.drawArrays(f.TRIANGLES,0,6)}function B(){!C&&I&&(j&&(F+=performance.now()-j,j=0),C=H,i.default.ticker.add(C))}function X(){C&&(i.default.ticker.remove(C),C=null,j=performance.now())}g.current={start:B,stop:X};let W=new ResizeObserver(()=>{k()});W.observe(a);let Y=new IntersectionObserver(([e])=>{h.current=e.isIntersecting,e.isIntersecting?I?B():I||N||(N=!0,requestAnimationFrame(()=>{N=!1,function(){if(I)return!0;if(I=!0,!(f=a.getContext("webgl",{alpha:!1,antialias:!1,preserveDrawingBuffer:!1,powerPreference:"low-power",desynchronized:!0})))return console.warn("WebGL not supported"),!1;if(p=M(f.VERTEX_SHADER,l),x=M(f.FRAGMENT_SHADER,s),!p||!x)return!1;if(u=f.createProgram(),f.attachShader(u,p),f.attachShader(u,x),f.linkProgram(u),!f.getProgramParameter(u,f.LINK_STATUS))return console.error(f.getProgramInfoLog(u)),!1;f.useProgram(u),_=f.createBuffer(),f.bindBuffer(f.ARRAY_BUFFER,_),f.bufferData(f.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),f.STATIC_DRAW);let e=f.getAttribLocation(u,"a_position");f.enableVertexAttribArray(e),f.vertexAttribPointer(e,2,f.FLOAT,!1,0,0),T=f.createTexture();let t=new Uint8Array(262144);for(let e=0;e<t.length;e++)t[e]=256*Math.random()|0;f.bindTexture(f.TEXTURE_2D,T),f.texImage2D(f.TEXTURE_2D,0,f.RGBA,256,256,0,f.RGBA,f.UNSIGNED_BYTE,t),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_WRAP_S,f.REPEAT),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_WRAP_T,f.REPEAT),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_MIN_FILTER,f.LINEAR),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_MAG_FILTER,f.LINEAR),b=f.getUniformLocation(u,"u_time"),R=f.getUniformLocation(u,"u_resolution"),A=f.getUniformLocation(u,"u_camOffset");let r=f.getUniformLocation(u,"u_noise");return E=f.getUniformLocation(u,"u_cubeSize"),P=f.getUniformLocation(u,"u_bgColor"),w=f.getUniformLocation(u,"u_smokeColor"),f.activeTexture(f.TEXTURE0),f.bindTexture(f.TEXTURE_2D,T),f.uniform1i(r,0),k(),!0}()&&h.current&&B()})):X()},{rootMargin:"0px 0px 100% 0px",threshold:0});function V(e){var t,r;let n;if(t=e.clientX,r=e.clientY,!(t>=(n=o.getBoundingClientRect()).left)||!(t<=n.right)||!(r>=n.top)||!(r<=n.bottom)){S&&(S=!1,y.x=0,y.y=0);return}S=!0,function(e,t){let r=o.getBoundingClientRect();if(!r.width||!r.height)return;let n=(e-r.left)/r.width*2-1,i=(t-r.top)/r.height*2-1;y.x=.58*n,y.y=-(.42*i)}(e.clientX,e.clientY)}return Y.observe(a),document.addEventListener("pointermove",V,{passive:!0}),()=>{X(),document.removeEventListener("pointermove",V),Y.disconnect(),W.disconnect(),g.current={start:()=>{},stop:()=>{}},f&&(u&&f.deleteProgram(u),p&&f.deleteShader(p),x&&f.deleteShader(x),_&&f.deleteBuffer(_),T&&f.deleteTexture(T))}},[e,t,r,m]),(0,n.jsxs)("footer",{ref:d,className:`smoke-footer ${f}`,children:[(0,n.jsx)("canvas",{ref:v}),u,(0,n.jsx)("div",{className:"footer-content",children:(0,n.jsx)("div",{className:"container",children:(0,n.jsxs)("div",{className:"footer-heading",children:[(0,n.jsx)("p",{className:"mono",children:"Establish Contact"}),(0,n.jsx)("h2",{className:"type-2",children:"Let's Make Something They Can't Walk Away From"})]})})}),(0,n.jsx)("div",{className:"footer-bar",children:(0,n.jsxs)("div",{className:"container",children:[(0,n.jsx)("div",{className:"footer-bar-left",children:(0,n.jsx)("p",{className:"mono",children:"\xa9 2025 Ironfang Inc."})}),(0,n.jsx)("div",{className:"footer-bar-right",children:(0,n.jsx)("p",{className:"mono",children:"Developed by KOYOTEC"})})]})})]})}},2485:(e,t,r)=>{"use strict";r.d(t,{default:()=>s});var n=r(9416);r(379);var o=r(404),i=r(9940),a=r(2961),c=r(2285);i.default.registerPlugin(a.ScrollTrigger);let l=[{name:"Kai Tanaka",role:"Creative Director",img:"/art-de-la-difference/ironfang-games/team/team-1.jpg"},{name:"Lena Voss",role:"Lead Sound Designer",img:"/art-de-la-difference/ironfang-games/team/team-2.jpg"},{name:"Erik Holm",role:"Systems Architect",img:"/art-de-la-difference/ironfang-games/team/team-3.jpg"},{name:"Mara Chen",role:"Art Director",img:"/art-de-la-difference/ironfang-games/team/team-4.jpg"},{name:"Sol Rieve",role:"Narrative Designer",img:"/art-de-la-difference/ironfang-games/team/team-5.jpg"}];function s(){let e=(0,o.useRef)(null),t=(0,o.useRef)([]);return(0,o.useLayoutEffect)(()=>{let r=e.current,n=t.current;if(!r||!n.length)return;let o=7*window.innerHeight,c=n.length,l=.4*Math.PI,s=Math.PI/2-l/2;function m(e=0){let t=window.innerWidth<900?7.5*window.innerWidth:2.5*window.innerWidth,r=-.15*(c-1),o=r+e*(1-r);n.forEach((e,r)=>{if(!e)return;let n=s+l*((c-1-r)*.15+o),a=Math.cos(n)*t,m=Math.sin(n)*t,f=180/Math.PI*(n-Math.PI/2);i.default.set(e,{x:a,y:-m+t,rotation:-f,transformOrigin:"center center"})})}m(0);let f=a.ScrollTrigger.create({trigger:r,start:"top top",end:`+=${o}px`,pin:!0,pinSpacing:!0,scrub:!0,invalidateOnRefresh:!0,refreshPriority:-1,onUpdate:e=>{m(e.progress)}}),u=()=>{m(0)};return window.addEventListener("resize",u),()=>{f.kill(),window.removeEventListener("resize",u)}},[]),(0,n.jsxs)("section",{className:"team",ref:e,children:[(0,n.jsxs)("div",{className:"team-header",children:[(0,n.jsx)(c.default,{variant:"flicker",children:(0,n.jsx)("p",{className:"mono",children:"The Collective"})}),(0,n.jsx)(c.default,{children:(0,n.jsx)("h5",{className:"type-2",children:"Behind The Lock"})})]}),(0,n.jsx)("div",{className:"team-footer",children:(0,n.jsxs)("div",{className:"container",children:[(0,n.jsx)("p",{className:"mono",children:"Roster Verified"}),(0,n.jsx)("p",{className:"mono",children:"Defectors: None"})]})}),(0,n.jsx)("div",{className:"cards",children:l.map((e,r)=>(0,n.jsxs)("div",{className:"card",ref:e=>t.current[r]=e,children:[(0,n.jsx)("div",{className:"card-img",children:(0,n.jsx)("img",{src:e.img,alt:e.name})}),(0,n.jsxs)("div",{className:"card-content",children:[(0,n.jsx)("p",{className:"lg",children:e.name}),(0,n.jsx)("p",{className:"mono",children:e.role})]})]},e.name))})]})}},3284:()=>{}}]);