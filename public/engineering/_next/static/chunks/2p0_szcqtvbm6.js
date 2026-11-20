(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,55796,e=>{"use strict";var t=e.i(35045),o=e.i(18546);let a=new t.Color("#0d0d0d"),r=new t.Color("#ff0000"),i=new t.Color("#8c8c88"),n=`
  attribute vec3 posB;
  attribute vec3 aColor;
  attribute float aOffset;
  attribute float aKind;   // 0 dot, 1 packet trail, 2 pin
  attribute float aT;      // position along an arc, for packets
  uniform float uTime;
  uniform float uProgress;
  uniform float uPixel;
  uniform float uGrid;
  uniform float uDepthFade;
  uniform float uRadius;
  uniform vec2 uRes;
  uniform vec3 uRed;
  varying vec3 vColor;
  varying float vAlpha;

  float easeInOut(float x) { return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0; }

  void main() {
    // morph from position to posB; each particle leaves at its own time (aOffset), so the move happens in waves
    float p = easeInOut(clamp(uProgress * 1.7 - aOffset * 0.7, 0.0, 1.0));
    vec3 dir = vec3(sin(aOffset * 91.7 + 1.3), cos(aOffset * 57.3), sin(aOffset * 33.1 + 2.1));
    vec3 pos = mix(position, posB, p) + dir * sin(p * 3.14159) * 0.9;
    pos += dir * 0.012 * sin(uTime * 1.4 + aOffset * 40.0);

    vColor = aColor;
    vAlpha = 1.0;
    float size = uPixel;

    if (aKind > 0.5 && aKind < 1.5) {
      float head = fract(uTime * 0.22 + aOffset);
      float d = abs(aT - head);
      float glow = smoothstep(0.09, 0.0, d);
      vAlpha = 0.22 + glow * 0.78;
      vColor = mix(aColor, uRed, glow);
    } else if (aKind > 1.5) {
      size = uPixel * 2.4;
    }

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    if (uDepthFade > 0.5) {
      float zc = (modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).z;
      float facing = (mv.z - zc) / uRadius;
      vAlpha *= mix(0.08, 1.0, smoothstep(-0.25, 0.55, facing));
    }

    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / clip.w;
    vec2 screen = (ndc * 0.5 + 0.5) * uRes;
    screen = (floor(screen / uGrid) + 0.5) * uGrid;
    clip.xy = ((screen / uRes) * 2.0 - 1.0) * clip.w;
    gl_Position = clip;
    gl_PointSize = size;
  }
`,l=`
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    if (vAlpha < 0.02) discard;
    gl_FragColor = vec4(vColor, vAlpha);
  }
`;class s{constructor(){this.a=[],this.b=[],this.c=[],this.o=[],this.k=[],this.t=[]}add(e,t=e,o=a,r=Math.random(),i=0,n=0){this.a.push(e.x,e.y,e.z),this.b.push(t.x,t.y,t.z),this.c.push(o.r,o.g,o.b),this.o.push(r),this.k.push(i),this.t.push(n)}geometry(){let e=new t.BufferGeometry;return e.setAttribute("position",new t.Float32BufferAttribute(this.a,3)),e.setAttribute("posB",new t.Float32BufferAttribute(this.b,3)),e.setAttribute("aColor",new t.Float32BufferAttribute(this.c,3)),e.setAttribute("aOffset",new t.Float32BufferAttribute(this.o,1)),e.setAttribute("aKind",new t.Float32BufferAttribute(this.k,1)),e.setAttribute("aT",new t.Float32BufferAttribute(this.t,1)),e}}let d=e=>e*Math.PI/180,c=(e,o,a)=>new t.Vector3(a*Math.cos(d(e))*Math.sin(d(o)),a*Math.sin(d(e)),a*Math.cos(d(e))*Math.cos(d(o))),u={tunis:{lat:36.81,lon:10.18},paris:{lat:48.86,lon:2.35},frankfurt:{lat:50.11,lon:8.68},bahrain:{lat:26.07,lon:50.56},uae:{lat:24.45,lon:54.38}};function h(){let e=new s,o=Math.PI*(3-Math.sqrt(5));for(let a=0;a<4200;a++){let r=1-a/4199*2,n=Math.sqrt(1-r*r),l=o*a,s=new t.Vector3(Math.cos(l)*n,r,Math.sin(l)*n).multiplyScalar(2.35);e.add(s,s,i,.2*Math.random())}for(let t=-60;t<=60;t+=30)for(let o=0;o<360;o+=2.2){let r=c(t,o,2.35);e.add(r,r,a,.2*Math.random())}let n={},l=c(u.tunis.lat,u.tunis.lon,2.35);n.tunis=l.clone().multiplyScalar(1.02),e.add(l,l,r,0,2),["paris","frankfurt","bahrain","uae"].forEach((o,r)=>{let i=u[o],s=c(i.lat,i.lon,2.35);n[o]=s.clone().multiplyScalar(1.02),e.add(s,s,a,0,2);let d=l.clone().normalize(),h=s.clone().normalize(),f=d.angleTo(h);for(let o=0;o<=140;o++){let i=o/140,n=new t.Vector3().copy(d).multiplyScalar(Math.sin((1-i)*f)/Math.sin(f)).add(h.clone().multiplyScalar(Math.sin(i*f)/Math.sin(f))).multiplyScalar(2.35*(1+Math.sin(Math.PI*i)*(.06+.35*f)));e.add(n,n,a,.27*r,1,i)}});let h=new t.Points(e.geometry()),f=new t.Group;f.add(h);let p={x:d(37),y:-d(27)};return f.rotation.set(p.x,p.y,0),{object:f,mesh:h,labels:n,radius:2.35,depthFade:!0,update(e,t){let o=Math.sin(.18*e)*d(9);f.rotation.y+=(p.y+o+t.pointer.x*d(18)-f.rotation.y)*.05,f.rotation.x+=(p.x+t.pointer.y*d(8)-f.rotation.x)*.05}}}let f={globe:h,migration:function(){let e=new s,o=[],n=[];for(let e of[-1.3/2,.65])for(let o of[-2.3/2,1.15])for(let a of[-.85/2,.425])n.push(new t.Vector3(e,o,a));[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]].forEach(([e,r])=>{for(let i=0;i<=60;i++)o.push({v:new t.Vector3().lerpVectors(n[e],n[r],i/60),c:a})});for(let e=0;e<6;e++){let n=1.15-2.3/6*(e+.5);for(let r=-1;r<=1;r++)for(let l=0;l<=50;l++){let s=-1.3/2+.12+l/50*.9;o.push({v:new t.Vector3(s,n+.06*r,.425),c:0===r?a:i,u:e})}for(let a=0;a<3;a++)o.push({v:new t.Vector3(.51+.04*a,n,.425),c:r,u:e});for(let a=0;a<120;a++)o.push({v:new t.Vector3((Math.random()-.5)*1.3*.9,n+2.3/6*(Math.random()-.5)*.7,(Math.random()-.5)*.765),c:i,u:e})}let l=[[0,.15,0,.95],[-.95,-.15,.1,.7],[.95,-.12,-.05,.75],[-.4,.55,-.1,.62],[.45,.5,.1,.6],[1.55,-.32,0,.45],[-1.5,-.35,0,.42]],c=(e,o)=>l.some((a,r)=>r!==o&&e.distanceTo(new t.Vector3(a[0],a[1],a[2]))<.995*a[3]),u=()=>{for(;;){let e=Math.floor(Math.random()*l.length),o=l[e],a=2*Math.random()-1,r=Math.random()*Math.PI*2,i=Math.sqrt(1-a*a),n=new t.Vector3(o[0]+i*Math.cos(r)*o[3],o[1]+a*o[3],o[2]+i*Math.sin(r)*o[3]*.8);if(!(n.y<-.62)&&!c(n,e))return n}};o.forEach((o,a)=>{let n=u().multiplyScalar(1.05).add(new t.Vector3(0,.15,0)),l=void 0===o.u?Math.random():o.u/6;e.add(o.v,n,o.c,Math.min(1,.85*l+.15*Math.random()),2*(o.c===r)),a%3==0&&e.add(new t.Vector3(0,0,0),u().multiplyScalar(1.05).add(new t.Vector3(0,.15,0)),i,.6+.4*Math.random())});let h=new t.Points(e.geometry()),f=new t.Group;return f.add(h),f.rotation.set(d(8),-d(28),0),{object:f,mesh:h,labels:{},radius:2,depthFade:!1,morph:!0,update(e,t){f.rotation.y+=(-d(28)+Math.sin(.25*e)*d(10)+t.pointer.x*d(12)-f.rotation.y)*.05,f.rotation.x+=(d(8)+t.pointer.y*d(6)-f.rotation.x)*.05}}},bridge:function(){let e=new s;for(let o=-3.2;o<=3.2;o+=.13)for(let a=-2.4;a<=2.4;a+=.13){let r=new t.Vector3(o,0,a);e.add(r,r,i,.2*Math.random())}let o=new t.Vector3(-1.1,0,-1.25),n=new t.Vector3(1,0,1.15),l=(o,a,r)=>{for(let i=0;i<9;i++){let n=o.x+(i%3-1)*.22+.03*Math.sin(r+i),l=o.z+(Math.floor(i/3)-1)*.22,s=.25+(Math.sin(3*r+1.7*i)+1)/2*.75;for(let o=0;o<=s;o+=.05)for(let[r,i]of[[-.06,-.06],[.06,-.06],[-.06,.06],[.06,.06]]){let s=new t.Vector3(n+r,o,l+i);e.add(s,s,a,.2*Math.random())}}};l(o,a,1),l(n,r,4);let c=(o,r,i)=>{for(let n=0;n<=160;n++){let l=n/160,s=new t.Vector3().lerpVectors(o,r,l);s.y=1.05+.7*Math.sin(Math.PI*l),e.add(s,s,a,i,1,l)}};c(n,o,0),c(o.clone().add(new t.Vector3(.15,0,.1)),n.clone().add(new t.Vector3(.15,0,.1)),.5);let u=new t.Points(e.geometry()),h=new t.Group;return h.add(u),h.rotation.set(d(28),-d(18),0),{object:h,mesh:u,labels:{paris:o.clone().add(new t.Vector3(0,1.1,0)),tunis:n.clone().add(new t.Vector3(0,1.1,0))},radius:3,depthFade:!1,update(e,t){h.rotation.y+=(-d(18)+Math.sin(.2*e)*d(6)+t.pointer.x*d(10)-h.rotation.y)*.05,h.rotation.x+=(d(28)+t.pointer.y*d(5)-h.rotation.x)*.05}}}};e.s(["mountScene",0,function(e,{scene:a,labels:i={},getProgress:s,still:d=!1}){let c=Math.min(window.devicePixelRatio||1,2),u=new o.WebGLRenderer({antialias:!1,alpha:!0,powerPreference:"low-power"});u.setClearColor(0xffffff,0),u.setPixelRatio(c),e.appendChild(u.domElement),u.domElement.setAttribute("aria-hidden","true");let p=new t.PerspectiveCamera("bridge"===a?38:40,1,.1,100);p.position.set(0,.6*("bridge"===a),{bridge:8.2,globe:7.6,migration:6.4}[a]??6),"bridge"===a&&p.lookAt(0,.9,0);let m=(f[a]||h)(),w=new t.ShaderMaterial({vertexShader:n,fragmentShader:l,transparent:!0,depthWrite:!1,uniforms:{uTime:{value:0},uProgress:{value:0},uPixel:{value:3*c},uGrid:{value:3*c},uDepthFade:{value:+!!m.depthFade},uRadius:{value:m.radius},uRes:{value:new t.Vector2(1,1)},uRed:{value:r}}});m.mesh.material=w;let v=new t.Scene;v.add(m.object);let M={pointer:{x:0,y:0},progress:0},y=e=>{M.pointer.x=e.clientX/window.innerWidth*2-1,M.pointer.y=e.clientY/window.innerHeight*2-1};window.addEventListener("pointermove",y,{passive:!0});let g=()=>{let t=e.clientWidth||1,o=e.clientHeight||1;u.setSize(t,o,!1),u.domElement.style.width="100%",u.domElement.style.height="100%",p.aspect=t/o,p.zoom=t/o<.8?.72:1,p.updateProjectionMatrix(),w.uniforms.uRes.value.set(t*c,o*c)},b=new ResizeObserver(g);b.observe(e),g();let x=new t.Vector3,A=0,V=!1,P=new t.Clock,F=()=>{let o=P.getElapsedTime();w.uniforms.uTime.value=o,m.morph&&s&&(M.progress=d?s():M.progress+(s()-M.progress)*.08,w.uniforms.uProgress.value=M.progress),m.update(o,M),u.render(v,p);let a=e.clientWidth,r=e.clientHeight;for(let[e,o]of Object.entries(i)){let i=m.labels[e];if(!o||!i)continue;x.copy(i).applyMatrix4(m.mesh.matrixWorld);let n=m.depthFade?x.clone().sub(new t.Vector3().setFromMatrixPosition(m.mesh.matrixWorld)).dot(p.position.clone().normalize()):1;x.project(p),o.style.transform=`translate3d(${(x.x+1)/2*a}px, ${(1-x.y)/2*r}px, 0)${"left"===o.dataset.side?" translateX(-100%)":""}`,o.style.opacity=n>.15?"1":"0"}V&&!d&&(A=requestAnimationFrame(F))};return d&&requestAnimationFrame(F),{setActive(e){e!==V&&(V=e,cancelAnimationFrame(A),(e||d)&&(A=requestAnimationFrame(F)))},destroy(){V=!1,cancelAnimationFrame(A),b.disconnect(),window.removeEventListener("pointermove",y),m.mesh.geometry.dispose(),w.dispose(),u.dispose(),u.domElement.remove()}}}])}]);