(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,26543,e=>{"use strict";var a=e.i(11003),l=e.i(45878),t=e.i(87125),o=e.i(49268);let s=`
  precision highp float;
  uniform vec2 uRes;
  uniform vec2 uC;
  uniform float uR;
  uniform float uPix;
  uniform float uSweep;
  uniform float uShield;
  uniform float uTime;
  uniform vec4 uB[32];
  const float BAYER[16] = float[16](0., 8., 2., 10., 12., 4., 14., 6., 3., 11., 1., 9., 15., 7., 13., 5.);

  float ring(float r, float at, float w) { return 1. - smoothstep(0., w, abs(r - at)); }

  void main() {
    vec2 cell = floor(gl_FragCoord.xy / uPix);
    vec2 uv = ((cell + 0.5) * uPix - uC) / uR;
    float r = length(uv);
    float a = atan(uv.y, uv.x);
    float px = uPix / uR;
    float ink = 0.;
    float solid = 0.;

    // range rings and cross-hair
    for (int k = 1; k <= 4; k++) solid = max(solid, ring(r, float(k) * 0.25, px * 0.9) * (k == 4 ? 1. : 0.75));
    float inside = step(r, 1.);
    solid = max(solid, (1. - smoothstep(0., px * 0.9, abs(uv.x))) * inside * 0.55);
    solid = max(solid, (1. - smoothstep(0., px * 0.9, abs(uv.y))) * inside * 0.55);

    // the sweep and its fading trail
    float behind = mod(uSweep - a, 6.28318);
    ink = max(ink, exp(-behind * 2.4) * inside * 0.9);
    solid = max(solid, (1. - smoothstep(0., px * 1.2, behind * r)) * inside);

    // the shield, slightly alive
    float wob = 0.012 * sin(a * 9. + uTime * 2.) * uShield;
    solid = max(solid, ring(r, 0.60 + wob, px * 1.6) * step(0.5, uShield) * uShield);
    ink = max(ink, ring(r, 0.60 + wob, px * 7.) * uShield * 0.55);

    // blips: z = kind (0 flaw, 1 fixed, 2 attack, 3 burst), w = strength / size
    for (int i = 0; i < 32; i++) {
      vec4 b = uB[i];
      if (b.w <= 0.001) continue;
      vec2 d = uv - b.xy;
      float box = max(abs(d.x), abs(d.y));
      float len = length(d);
      if (b.z < 0.5) {
        float s = 0.03 + 0.015 * b.w;
        solid = max(solid, step(box, s));
        ink = max(ink, exp(-len * 18.) * 0.7);
      } else if (b.z < 1.5) {
        solid = max(solid, (step(box, 0.04) - step(box, 0.026)) * b.w);
      } else if (b.z < 2.5) {
        solid = max(solid, step(len, 0.022));
        ink = max(ink, exp(-len * 30.) * 0.8);
      } else {
        solid = max(solid, ring(len, (1. - b.w) * 0.14 + 0.02, px * 1.4) * b.w);
        ink = max(ink, exp(-len * 22.) * b.w * 0.8);
      }
    }

    ivec2 ip = ivec2(mod(cell, 4.));
    float threshold = (BAYER[ip.x + ip.y * 4] + 0.5) / 16.;
    float on = max(solid > 0.5 ? 1. : 0., step(threshold, ink));
    vec3 red = vec3(1., 0., 0.);
    vec3 dark = vec3(0.051);
    gl_FragColor = vec4(mix(red, dark, on), 1.);
  }
`;e.s(["default",0,function({progress:e,content:i,reduced:u,near:r}){let n=(0,t.useRef)(null),d=(0,t.useRef)(null),c=(0,t.useRef)(null),_=(0,t.useRef)([]),m=(0,t.useRef)(null),f=(0,t.useRef)(null),h=(0,t.useRef)(null),x=(0,t.useRef)(null),p=(0,t.useRef)(null);(0,o.useStage)(n,r,{camera:e=>new e.OrthographicCamera(-1,1,1,-1,0,1),alpha:!1,setup:({THREE:e,scene:a})=>{let l=(0,o.rng)(9),t={uRes:{value:new e.Vector2(1,1)},uC:{value:new e.Vector2(0,0)},uR:{value:100},uPix:{value:3},uSweep:{value:0},uShield:{value:0},uTime:{value:0},uB:{value:Array.from({length:32},()=>new e.Vector4(0,0,0,0))}},i=new e.ShaderMaterial({vertexShader:"void main() { gl_Position = vec4(position.xy, 0., 1.); }",fragmentShader:s,uniforms:t});a.add(new e.Mesh(new e.PlaneGeometry(2,2),i));let u=[2,2,1,1,1,1,0,0,0,0,0,0],r=Array.from({length:12},(e,a)=>{let t=a/12*Math.PI*2+.4*l(),o=.22+.68*l();return{x:Math.cos(t)*o,y:Math.sin(t)*o,sev:u[5*a%12]}}),n=Math.min(window.devicePixelRatio,2);return{uniforms:t,vulns:r,attacks:[],R:l,dpr:n,nextAttack:0,logs:[],resize(e,a){t.uRes.value.set(e*n,a*n);t.uC.value.set(e/2*n,.5*a*n),t.uR.value=Math.min(e,a)*(e<700?.4:.42)*n,t.uPix.value=Math.round(3*n)}}},frame:({time:a},l,t)=>{let s=(0,o.follow)(e,u),r=u?1.2:a,n=l.uniforms;n.uTime.value=r,n.uSweep.value=1.6*r%(2*Math.PI),n.uShield.value=(0,o.band)(s,.46,.6);let v=Math.round(12*(0,o.band)(s,.03,.18)),b=Math.round(12*(0,o.band)(s,.44,.58)),g=0;l.vulns.forEach((e,a)=>{let l=n.uB.value[g++];if(a>=v)return l.set(0,0,0,0);a<b?l.set(e.x,e.y,1,1-.6*(0,o.band)(s,.62,.8)):l.set(e.x,e.y,0,e.sev)});let A=s>.6;if(A&&!u&&a>l.nextAttack){l.nextAttack=a+.55+.6*l.R();let e=l.R()*Math.PI*2;l.attacks.push({ang:e,born:a}),l.attacks.length>20&&l.attacks.shift();let t=`${45+Math.floor(180*l.R())}.${Math.floor(255*l.R())}.${Math.floor(255*l.R())}.x`,o=i.attacks[Math.floor(l.R()*i.attacks.length)];l.logs.unshift(`${i.blocked} \xb7 ${t} \xb7 ${o}`),l.logs.length=Math.min(l.logs.length,5),m.current&&(m.current.innerHTML=l.logs.map(e=>`<p>${e}</p>`).join(""))}for(l.attacks.forEach(e=>{let l=n.uB.value[g++];if(!l)return;let t=a-e.born;if(t<1.5){let a=1.15-t/1.5*.5299999999999999;l.set(Math.cos(e.ang)*a,Math.sin(e.ang)*a,2,1)}else t<2.2?l.set(.62*Math.cos(e.ang),.62*Math.sin(e.ang),3,1-(t-1.5)/.7):l.set(0,0,0,0)}),A||(l.attacks.length=0),u&&A&&!l.stillLog&&m.current&&(l.stillLog=!0,m.current.innerHTML=["185.220.101.x","45.155.205.x","103.75.190.x"].map((e,a)=>`<p>${i.blocked} \xb7 ${e} \xb7 ${i.attacks[a]}</p>`).join("")),u&&A&&[.6,2.4,4.3].forEach(e=>{let a=n.uB.value[g++];a?.set(.62*Math.cos(e),.62*Math.sin(e),3,.8)});g<32;g++)n.uB.value[g].set(0,0,0,0);let y=s<.44;p.current.textContent=y?i.found:i.fixed,d.current.textContent=String(y?v:b).padStart(2,"0"),x.current.style.opacity=String((0,o.band)(s,0,.03)*(1-(0,o.band)(s,.6,.64))),c.current.style.opacity=String((0,o.band)(s,.2,.25)*(1-(0,o.band)(s,.42,.46)));let k=(0,o.band)(s,.22,.34);_.current.forEach((e,a)=>e&&(e.style.transform=`scaleX(${(0,o.band)(k,.2*a,.5+.2*a)})`)),m.current.parentElement.style.opacity=String((0,o.band)(s,.62,.66)),f.current.style.opacity=String((0,o.band)(s,.78,.82)),h.current.textContent=String(Math.round(42+49*(0,o.band)(s,.8,.96)))}});let v=i.report.reduce((e,[,a])=>e+a,0);return(0,a.jsx)("div",{ref:n,className:`${l.default.host} ${l.default.sec}`,children:(0,a.jsxs)("div",{className:l.default.layer,"aria-hidden":"true",children:[(0,a.jsxs)("div",{ref:x,className:`${l.default.card} ${l.default.counter}`,style:{opacity:0},children:[(0,a.jsx)("span",{ref:p,className:l.default.mono,children:i.found}),(0,a.jsx)("span",{ref:d,className:l.default.counterNum,children:"00"})]}),(0,a.jsx)("div",{ref:c,className:`${l.default.card} ${l.default.report}`,style:{opacity:0},children:i.report.map(([e,t],o)=>(0,a.jsxs)("div",{className:l.default.reportRow,children:[(0,a.jsx)("span",{children:e}),(0,a.jsxs)("span",{children:["×",t]}),(0,a.jsx)("span",{className:l.default.reportBar,children:(0,a.jsx)("i",{ref:e=>_.current[o]=e,style:{width:`${t/v*200}%`,maxWidth:"100%",transform:"scaleX(0)"}})})]},e))}),(0,a.jsx)("div",{className:`${l.default.card} ${l.default.log}`,style:{opacity:0},children:(0,a.jsx)("div",{ref:m})}),(0,a.jsxs)("div",{ref:f,className:`${l.default.card} ${l.default.score}`,style:{opacity:0},children:[(0,a.jsx)("span",{className:l.default.mono,children:i.score}),(0,a.jsxs)("span",{className:l.default.counterNum,children:[(0,a.jsx)("span",{ref:h,children:"42"}),(0,a.jsx)("span",{style:{fontSize:"0.4em"},children:"/100"})]})]})]})})}])},88085,function(e){e.n(e.i(26543))},45878,e=>{e.v({ai:"Visual-module__JUA5oG__ai",answer:"Visual-module__JUA5oG__answer",blink:"Visual-module__JUA5oG__blink",bubble:"Visual-module__JUA5oG__bubble",card:"Visual-module__JUA5oG__card",caret:"Visual-module__JUA5oG__caret",cloud:"Visual-module__JUA5oG__cloud",clusterTag:"Visual-module__JUA5oG__clusterTag",code:"Visual-module__JUA5oG__code",counter:"Visual-module__JUA5oG__counter",counterNum:"Visual-module__JUA5oG__counterNum",data:"Visual-module__JUA5oG__data",host:"Visual-module__JUA5oG__host",layer:"Visual-module__JUA5oG__layer",log:"Visual-module__JUA5oG__log",meter:"Visual-module__JUA5oG__meter",metric:"Visual-module__JUA5oG__metric",metrics:"Visual-module__JUA5oG__metrics",mono:"Visual-module__JUA5oG__mono",monoText:"Visual-module__JUA5oG__monoText",report:"Visual-module__JUA5oG__report",reportBar:"Visual-module__JUA5oG__reportBar",reportRow:"Visual-module__JUA5oG__reportRow",score:"Visual-module__JUA5oG__score",sec:"Visual-module__JUA5oG__sec",sources:"Visual-module__JUA5oG__sources",statusLine:"Visual-module__JUA5oG__statusLine",svg:"Visual-module__JUA5oG__svg",tag:"Visual-module__JUA5oG__tag",terminal:"Visual-module__JUA5oG__terminal",terminalBar:"Visual-module__JUA5oG__terminalBar",terminalBody:"Visual-module__JUA5oG__terminalBody"})}]);