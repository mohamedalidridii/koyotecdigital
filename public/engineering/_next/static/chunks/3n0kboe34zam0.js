(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,49019,e=>{"use strict";function t(e,t,i){return Math.max(e,Math.min(t,i))}var i=class{isRunning=!1;value=0;from=0;to=0;currentTime=0;lerp;duration;easing;onUpdate;advance(e){if(!this.isRunning)return;let i=!1;if(this.duration&&this.easing){this.currentTime+=e;let s=t(0,this.currentTime/this.duration,1),r=(i=s>=1)?1:this.easing(s);this.value=this.from+(this.to-this.from)*r}else if(this.lerp){var s,r,o,a;this.value=(s=this.value,r=this.to,o=60*this.lerp,(1-(a=1-Math.exp(-o*e)))*s+a*r),Math.round(this.value)===this.to&&(this.value=this.to,i=!0)}else this.value=this.to,i=!0;i&&this.stop(),this.onUpdate?.(this.value,i)}stop(){this.isRunning=!1}fromTo(e,t,{lerp:i,duration:s,easing:r,onStart:o,onUpdate:a}){this.from=this.value=e,this.to=t,this.lerp=i,this.duration=s,this.easing=r,this.currentTime=0,this.isRunning=!0,o?.(),this.onUpdate=a}},s=class{constructor(e,t,{autoResize:i=!0,debounce:s=250}={}){this.wrapper=e,this.content=t,i&&(this.debouncedResize=function(e,t){let i;return function(...s){let r=this;clearTimeout(i),i=setTimeout(()=>{i=void 0,e.apply(r,s)},t)}}(this.resize,s),this.wrapper instanceof Window?window.addEventListener("resize",this.debouncedResize,!1):(this.wrapperResizeObserver=new ResizeObserver(this.debouncedResize),this.wrapperResizeObserver.observe(this.wrapper)),this.contentResizeObserver=new ResizeObserver(this.debouncedResize),this.contentResizeObserver.observe(this.content)),this.resize()}width=0;height=0;scrollHeight=0;scrollWidth=0;debouncedResize;wrapperResizeObserver;contentResizeObserver;destroy(){this.wrapperResizeObserver?.disconnect(),this.contentResizeObserver?.disconnect(),this.wrapper===window&&this.debouncedResize&&window.removeEventListener("resize",this.debouncedResize,!1)}resize=()=>{this.onWrapperResize(),this.onContentResize()};onWrapperResize=()=>{this.wrapper instanceof Window?(this.width=window.innerWidth,this.height=window.innerHeight):(this.width=this.wrapper.clientWidth,this.height=this.wrapper.clientHeight)};onContentResize=()=>{this.wrapper instanceof Window?(this.scrollHeight=this.content.scrollHeight,this.scrollWidth=this.content.scrollWidth):(this.scrollHeight=this.wrapper.scrollHeight,this.scrollWidth=this.wrapper.scrollWidth)};get limit(){return{x:this.scrollWidth-this.width,y:this.scrollHeight-this.height}}},r=class{events={};emit(e,...t){let i=this.events[e]||[];for(let e=0,s=i.length;e<s;e++)i[e]?.(...t)}on(e,t){return this.events[e]?.push(t)||(this.events[e]=[t]),()=>{this.events[e]=this.events[e]?.filter(e=>t!==e)}}off(e,t){this.events[e]=this.events[e]?.filter(e=>t!==e)}destroy(){this.events={}}},o=100/6,a={passive:!1},n=class{constructor(e,t={wheelMultiplier:1,touchMultiplier:1}){this.element=e,this.options=t,window.addEventListener("resize",this.onWindowResize,!1),this.onWindowResize(),this.element.addEventListener("wheel",this.onWheel,a),this.element.addEventListener("touchstart",this.onTouchStart,a),this.element.addEventListener("touchmove",this.onTouchMove,a),this.element.addEventListener("touchend",this.onTouchEnd,a)}touchStart={x:0,y:0};lastDelta={x:0,y:0};window={width:0,height:0};emitter=new r;on(e,t){return this.emitter.on(e,t)}destroy(){this.emitter.destroy(),window.removeEventListener("resize",this.onWindowResize,!1),this.element.removeEventListener("wheel",this.onWheel,a),this.element.removeEventListener("touchstart",this.onTouchStart,a),this.element.removeEventListener("touchmove",this.onTouchMove,a),this.element.removeEventListener("touchend",this.onTouchEnd,a)}onTouchStart=e=>{let{clientX:t,clientY:i}=e.targetTouches?e.targetTouches[0]:e;this.touchStart.x=t,this.touchStart.y=i,this.lastDelta={x:0,y:0},this.emitter.emit("scroll",{deltaX:0,deltaY:0,event:e})};onTouchMove=e=>{let{clientX:t,clientY:i}=e.targetTouches?e.targetTouches[0]:e,s=-(t-this.touchStart.x)*this.options.touchMultiplier,r=-(i-this.touchStart.y)*this.options.touchMultiplier;this.touchStart.x=t,this.touchStart.y=i,this.lastDelta={x:s,y:r},this.emitter.emit("scroll",{deltaX:s,deltaY:r,event:e})};onTouchEnd=e=>{this.emitter.emit("scroll",{deltaX:this.lastDelta.x,deltaY:this.lastDelta.y,event:e})};onWheel=e=>{let{deltaX:t,deltaY:i,deltaMode:s}=e,r=1===s?o:2===s?this.window.width:1,a=1===s?o:2===s?this.window.height:1;t*=r,i*=a,t*=this.options.wheelMultiplier,i*=this.options.wheelMultiplier,this.emitter.emit("scroll",{deltaX:t,deltaY:i,event:e})};onWindowResize=()=>{this.window={width:window.innerWidth,height:window.innerHeight}}},l=e=>Math.min(1,1.001-Math.pow(2,-10*e)),u=class{_isScrolling=!1;_isStopped=!1;_isLocked=!1;_preventNextNativeScrollEvent=!1;_resetVelocityTimeout=null;__rafID=null;isTouching;time=0;userData={};lastVelocity=0;velocity=0;direction=0;options;targetScroll;animatedScroll;animate=new i;emitter=new r;dimensions;virtualScroll;constructor({wrapper:e=window,content:t=document.documentElement,eventsTarget:i=e,smoothWheel:r=!0,syncTouch:o=!1,syncTouchLerp:a=.075,touchInertiaExponent:u=1.7,duration:h,easing:c,lerp:d=.1,infinite:p=!1,orientation:m="vertical",gestureOrientation:g="vertical",touchMultiplier:f=1,wheelMultiplier:v=1,autoResize:S=!0,prevent:y,virtualScroll:w,overscroll:b=!0,autoRaf:x=!1,anchors:z=!1,autoToggle:T=!1,allowNestedScroll:C=!1,__experimental__naiveDimensions:A=!1}={}){window.lenisVersion="1.3.8",e&&e!==document.documentElement||(e=window),"number"==typeof h&&"function"!=typeof c?c=l:"function"==typeof c&&"number"!=typeof h&&(h=1),this.options={wrapper:e,content:t,eventsTarget:i,smoothWheel:r,syncTouch:o,syncTouchLerp:a,touchInertiaExponent:u,duration:h,easing:c,lerp:d,infinite:p,gestureOrientation:g,orientation:m,touchMultiplier:f,wheelMultiplier:v,autoResize:S,prevent:y,virtualScroll:w,overscroll:b,autoRaf:x,anchors:z,autoToggle:T,allowNestedScroll:C,__experimental__naiveDimensions:A},this.dimensions=new s(e,t,{autoResize:S}),this.updateClassName(),this.targetScroll=this.animatedScroll=this.actualScroll,this.options.wrapper.addEventListener("scroll",this.onNativeScroll,!1),this.options.wrapper.addEventListener("scrollend",this.onScrollEnd,{capture:!0}),this.options.anchors&&this.options.wrapper===window&&this.options.wrapper.addEventListener("click",this.onClick,!1),this.options.wrapper.addEventListener("pointerdown",this.onPointerDown,!1),this.virtualScroll=new n(i,{touchMultiplier:f,wheelMultiplier:v}),this.virtualScroll.on("scroll",this.onVirtualScroll),this.options.autoToggle&&this.rootElement.addEventListener("transitionend",this.onTransitionEnd,{passive:!0}),this.options.autoRaf&&(this.__rafID=requestAnimationFrame(this.raf))}destroy(){this.emitter.destroy(),this.options.wrapper.removeEventListener("scroll",this.onNativeScroll,!1),this.options.wrapper.removeEventListener("scrollend",this.onScrollEnd,{capture:!0}),this.options.wrapper.removeEventListener("pointerdown",this.onPointerDown,!1),this.options.anchors&&this.options.wrapper===window&&this.options.wrapper.removeEventListener("click",this.onClick,!1),this.virtualScroll.destroy(),this.dimensions.destroy(),this.cleanUpClassName(),this.__rafID&&cancelAnimationFrame(this.__rafID)}on(e,t){return this.emitter.on(e,t)}off(e,t){return this.emitter.off(e,t)}onScrollEnd=e=>{e instanceof CustomEvent||"smooth"!==this.isScrolling&&!1!==this.isScrolling||e.stopPropagation()};dispatchScrollendEvent=()=>{this.options.wrapper.dispatchEvent(new CustomEvent("scrollend",{bubbles:this.options.wrapper===window,detail:{lenisScrollEnd:!0}}))};onTransitionEnd=e=>{if(e.propertyName.includes("overflow")){let e=this.isHorizontal?"overflow-x":"overflow-y";["hidden","clip"].includes(getComputedStyle(this.rootElement)[e])?this.internalStop():this.internalStart()}};setScroll(e){this.isHorizontal?this.options.wrapper.scrollTo({left:e,behavior:"instant"}):this.options.wrapper.scrollTo({top:e,behavior:"instant"})}onClick=e=>{let t=e.composedPath().find(e=>e instanceof HTMLAnchorElement&&(e.getAttribute("href")?.startsWith("#")||e.getAttribute("href")?.startsWith("/#")||e.getAttribute("href")?.startsWith("./#")));if(t){let e=t.getAttribute("href");if(e){let t="object"==typeof this.options.anchors&&this.options.anchors?this.options.anchors:void 0,i=`#${e.split("#")[1]}`;["#","/#","./#","#top","/#top","./#top"].includes(e)&&(i=0),this.scrollTo(i,t)}}};onPointerDown=e=>{1===e.button&&this.reset()};onVirtualScroll=e=>{if("function"==typeof this.options.virtualScroll&&!1===this.options.virtualScroll(e))return;let{deltaX:t,deltaY:i,event:s}=e;if(this.emitter.emit("virtual-scroll",{deltaX:t,deltaY:i,event:s}),s.ctrlKey||s.lenisStopPropagation)return;let r=s.type.includes("touch"),o=s.type.includes("wheel");this.isTouching="touchstart"===s.type||"touchmove"===s.type;let a=0===t&&0===i;if(this.options.syncTouch&&r&&"touchstart"===s.type&&a&&!this.isStopped&&!this.isLocked)return void this.reset();let n="vertical"===this.options.gestureOrientation&&0===i||"horizontal"===this.options.gestureOrientation&&0===t;if(a||n)return;let l=s.composedPath();l=l.slice(0,l.indexOf(this.rootElement));let u=this.options.prevent;if(l.find(e=>e instanceof HTMLElement&&("function"==typeof u&&u?.(e)||e.hasAttribute?.("data-lenis-prevent")||r&&e.hasAttribute?.("data-lenis-prevent-touch")||o&&e.hasAttribute?.("data-lenis-prevent-wheel")||this.options.allowNestedScroll&&this.checkNestedScroll(e,{deltaX:t,deltaY:i}))))return;if(this.isStopped||this.isLocked){s.cancelable&&s.preventDefault();return}if(!(this.options.syncTouch&&r||this.options.smoothWheel&&o)){this.isScrolling="native",this.animate.stop(),s.lenisStopPropagation=!0;return}let h=i;"both"===this.options.gestureOrientation?h=Math.abs(i)>Math.abs(t)?i:t:"horizontal"===this.options.gestureOrientation&&(h=t),(!this.options.overscroll||this.options.infinite||this.options.wrapper!==window&&(this.animatedScroll>0&&this.animatedScroll<this.limit||0===this.animatedScroll&&i>0||this.animatedScroll===this.limit&&i<0))&&(s.lenisStopPropagation=!0),s.cancelable&&s.preventDefault();let c=r&&this.options.syncTouch,d=r&&"touchend"===s.type;d&&(h=Math.sign(this.velocity)*Math.pow(Math.abs(this.velocity),this.options.touchInertiaExponent)),this.scrollTo(this.targetScroll+h,{programmatic:!1,...c?{lerp:d?this.options.syncTouchLerp:1}:{lerp:this.options.lerp,duration:this.options.duration,easing:this.options.easing}})};resize(){this.dimensions.resize(),this.animatedScroll=this.targetScroll=this.actualScroll,this.emit()}emit(){this.emitter.emit("scroll",this)}onNativeScroll=()=>{if(null!==this._resetVelocityTimeout&&(clearTimeout(this._resetVelocityTimeout),this._resetVelocityTimeout=null),this._preventNextNativeScrollEvent){this._preventNextNativeScrollEvent=!1;return}if(!1===this.isScrolling||"native"===this.isScrolling){let e=this.animatedScroll;this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity,this.velocity=this.animatedScroll-e,this.direction=Math.sign(this.animatedScroll-e),this.isStopped||(this.isScrolling="native"),this.emit(),0!==this.velocity&&(this._resetVelocityTimeout=setTimeout(()=>{this.lastVelocity=this.velocity,this.velocity=0,this.isScrolling=!1,this.emit()},400))}};reset(){this.isLocked=!1,this.isScrolling=!1,this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity=0,this.animate.stop()}start(){if(this.isStopped){if(this.options.autoToggle)return void this.rootElement.style.removeProperty("overflow");this.internalStart()}}internalStart(){this.isStopped&&(this.reset(),this.isStopped=!1,this.emit())}stop(){if(!this.isStopped){if(this.options.autoToggle)return void this.rootElement.style.setProperty("overflow","clip");this.internalStop()}}internalStop(){this.isStopped||(this.reset(),this.isStopped=!0,this.emit())}raf=e=>{let t=e-(this.time||e);this.time=e,this.animate.advance(.001*t),this.options.autoRaf&&(this.__rafID=requestAnimationFrame(this.raf))};scrollTo(e,{offset:i=0,immediate:s=!1,lock:r=!1,duration:o=this.options.duration,easing:a=this.options.easing,lerp:n=this.options.lerp,onStart:u,onComplete:h,force:c=!1,programmatic:d=!0,userData:p}={}){if(!this.isStopped&&!this.isLocked||c){if("string"==typeof e&&["top","left","start"].includes(e))e=0;else if("string"==typeof e&&["bottom","right","end"].includes(e))e=this.limit;else{let t;if("string"==typeof e?t=document.querySelector(e):e instanceof HTMLElement&&e?.nodeType&&(t=e),t){if(this.options.wrapper!==window){let e=this.rootElement.getBoundingClientRect();i-=this.isHorizontal?e.left:e.top}let s=t.getBoundingClientRect();e=(this.isHorizontal?s.left:s.top)+this.animatedScroll}}if("number"==typeof e){if(e+=i,e=Math.round(e),this.options.infinite){if(d){this.targetScroll=this.animatedScroll=this.scroll;let t=e-this.animatedScroll;t>this.limit/2?e-=this.limit:t<-this.limit/2&&(e+=this.limit)}}else e=t(0,e,this.limit);if(e===this.targetScroll){u?.(this),h?.(this);return}if(this.userData=p??{},s){this.animatedScroll=this.targetScroll=e,this.setScroll(this.scroll),this.reset(),this.preventNextNativeScrollEvent(),this.emit(),h?.(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()});return}d||(this.targetScroll=e),"number"==typeof o&&"function"!=typeof a?a=l:"function"==typeof a&&"number"!=typeof o&&(o=1),this.animate.fromTo(this.animatedScroll,e,{duration:o,easing:a,lerp:n,onStart:()=>{r&&(this.isLocked=!0),this.isScrolling="smooth",u?.(this)},onUpdate:(e,t)=>{this.isScrolling="smooth",this.lastVelocity=this.velocity,this.velocity=e-this.animatedScroll,this.direction=Math.sign(this.velocity),this.animatedScroll=e,this.setScroll(this.scroll),d&&(this.targetScroll=e),t||this.emit(),t&&(this.reset(),this.emit(),h?.(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()}),this.preventNextNativeScrollEvent())}})}}}preventNextNativeScrollEvent(){this._preventNextNativeScrollEvent=!0,requestAnimationFrame(()=>{this._preventNextNativeScrollEvent=!1})}checkNestedScroll(e,{deltaX:t,deltaY:i}){let s,r,o,a,n,l,u,h,c,d,p,m,g,f,v=Date.now(),S=e._lenis??={},y=this.options.gestureOrientation;if(v-(S.time??0)>2e3){S.time=Date.now();let t=window.getComputedStyle(e);S.computedStyle=t;let i=t.overflowX,c=t.overflowY;if(s=["auto","overlay","scroll"].includes(i),r=["auto","overlay","scroll"].includes(c),S.hasOverflowX=s,S.hasOverflowY=r,!s&&!r||"vertical"===y&&!r||"horizontal"===y&&!s)return!1;n=e.scrollWidth,l=e.scrollHeight,u=e.clientWidth,h=e.clientHeight,o=n>u,a=l>h,S.isScrollableX=o,S.isScrollableY=a,S.scrollWidth=n,S.scrollHeight=l,S.clientWidth=u,S.clientHeight=h}else o=S.isScrollableX,a=S.isScrollableY,s=S.hasOverflowX,r=S.hasOverflowY,n=S.scrollWidth,l=S.scrollHeight,u=S.clientWidth,h=S.clientHeight;if(!s&&!r||!o&&!a||"vertical"===y&&(!r||!a)||"horizontal"===y&&(!s||!o)||("horizontal"===y?c="x":"vertical"===y?c="y":(0!==t&&s&&o&&(c="x"),0!==i&&r&&a&&(c="y")),!c))return!1;if("x"===c)d=e.scrollLeft,p=n-u,m=t,g=s,f=o;else{if("y"!==c)return!1;d=e.scrollTop,p=l-h,m=i,g=r,f=a}return(m>0?d<p:d>0)&&g&&f}get rootElement(){return this.options.wrapper===window?document.documentElement:this.options.wrapper}get limit(){return this.options.__experimental__naiveDimensions?this.isHorizontal?this.rootElement.scrollWidth-this.rootElement.clientWidth:this.rootElement.scrollHeight-this.rootElement.clientHeight:this.dimensions.limit[this.isHorizontal?"x":"y"]}get isHorizontal(){return"horizontal"===this.options.orientation}get actualScroll(){let e=this.options.wrapper;return this.isHorizontal?e.scrollX??e.scrollLeft:e.scrollY??e.scrollTop}get scroll(){var e;return this.options.infinite?(this.animatedScroll%(e=this.limit)+e)%e:this.animatedScroll}get progress(){return 0===this.limit?1:this.scroll/this.limit}get isScrolling(){return this._isScrolling}set isScrolling(e){this._isScrolling!==e&&(this._isScrolling=e,this.updateClassName())}get isStopped(){return this._isStopped}set isStopped(e){this._isStopped!==e&&(this._isStopped=e,this.updateClassName())}get isLocked(){return this._isLocked}set isLocked(e){this._isLocked!==e&&(this._isLocked=e,this.updateClassName())}get isSmooth(){return"smooth"===this.isScrolling}get className(){let e="lenis";return this.options.autoToggle&&(e+=" lenis-autoToggle"),this.isStopped&&(e+=" lenis-stopped"),this.isLocked&&(e+=" lenis-locked"),this.isScrolling&&(e+=" lenis-scrolling"),"smooth"===this.isScrolling&&(e+=" lenis-smooth"),e}updateClassName(){this.cleanUpClassName(),this.rootElement.className=`${this.rootElement.className} ${this.className}`.trim()}cleanUpClassName(){this.rootElement.className=this.rootElement.className.replace(/lenis(-\w+)?/g,"").trim()}},h=e.i(87125),c=e.i(11003),d=(0,h.createContext)(null),p=new class{constructor(e){this.state=e}listeners=[];set(e){for(let t of(this.state=e,this.listeners))t(this.state)}subscribe(e){return this.listeners=[...this.listeners,e],()=>{this.listeners=this.listeners.filter(t=>t!==e)}}get(){return this.state}}(null),m=(0,h.forwardRef)(({children:e,root:t=!1,options:i={},className:s,autoRaf:r=!0,style:o,props:a},n)=>{let l=(0,h.useRef)(null),m=(0,h.useRef)(null),[g,f]=(0,h.useState)(void 0);(0,h.useImperativeHandle)(n,()=>({wrapper:l.current,content:m.current,lenis:g}),[g]),(0,h.useEffect)(()=>{let e=new u({...i,...!t&&{wrapper:l.current,content:m.current},autoRaf:i?.autoRaf??r});return f(e),()=>{e.destroy(),f(void 0)}},[t,JSON.stringify(i)]);let v=(0,h.useRef)([]),S=(0,h.useCallback)((e,t)=>{v.current.push({callback:e,priority:t}),v.current.sort((e,t)=>e.priority-t.priority)},[]),y=(0,h.useCallback)(e=>{v.current=v.current.filter(t=>t.callback!==e)},[]);return(0,h.useEffect)(()=>{if(t&&g)return p.set({lenis:g,addCallback:S,removeCallback:y}),()=>p.set(null)},[t,g,S,y]),(0,h.useEffect)(()=>{if(!g)return;let e=e=>{for(let t=0;t<v.current.length;t++)v.current[t]?.callback(e)};return g.on("scroll",e),()=>{g.off("scroll",e)}},[g]),(0,c.jsx)(d.Provider,{value:{lenis:g,addCallback:S,removeCallback:y},children:t?e:(0,c.jsx)("div",{ref:l,className:s,style:o,...a,children:(0,c.jsx)("div",{ref:m,children:e})})})}),g={};e.s(["ReactLenis",0,m,"useLenis",0,function(e,t=[],i=0){let s=(0,h.useContext)(d),r=function(e){let[t,i]=(0,h.useState)(e.get());return(0,h.useEffect)(()=>e.subscribe(e=>i(e)),[e]),t}(p),{lenis:o,addCallback:a,removeCallback:n}=s??r??g;return(0,h.useEffect)(()=>{if(e&&a&&n&&o)return a(e,i),e(o),()=>{n(e)}},[o,a,n,i,...t]),o}],49019)},31516,e=>{"use strict";var t=e.i(11003),i=e.i(76146),s=e.i(87125),r=e.i(18546),o=e.i(35045),a=e.i(17349);let n=e=>a.BASE&&e?.startsWith("/")&&!e.startsWith(`${a.BASE}/`)?`${a.BASE}${e}`:e,l={mode:"ordered",pixelSize:2,gridSize:3,threshold:.5,brightness:0,contrast:1,darkColor:"#0d0d0d",lightColor:"#f3f1ec",matrixSize:4,lumPixelSize:1,pixelSizeMultiplier:5,scaleResolution:1,ditherAmount:1,bias:0,biasNoiseScale:10,biasNoiseSpeed:.75,biasPulseSpeed:.5,biasNoiseWeight:.5,biasPulseWeight:.05,biasAnimationStrength:1.25,trailDecay:.85,trailRadius:.15,trailIntensityMultiplier:5},u=null,h=new Set,c=!1;function d(e){h.forEach(t=>{t.visible&&t.onPointerMove(e)})}let p=null;function m(){return u||(u=new r.WebGLRenderer({antialias:!1,alpha:!0,premultipliedAlpha:!1})).setPixelRatio(1),u}let g=`
void main() {
  gl_Position = vec4(position, 1.0);
}
`,f=`
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
`;class S{constructor(e,t){this.canvas=e,this.img=t,this.ctx=e.getContext("2d"),this.settings={...l},this.width=0,this.height=0,this.texture=null,this.mode=null,this.grid=null,this.matrix=null,this.time=0,this.raf=0,this.visible=!0,this.mouse=new o.Vector2,this.strength=0,this.prevMouse=new o.Vector2,this.hasMouse=!1,this.trailFrames=0,this.trailA=null,this.trailB=null,this.trailMaterial=null,this.trailMesh=null,this.scene=new o.Scene,this.trailScene=new o.Scene,this.camera=new o.Camera,this.mesh=new o.Mesh(new o.PlaneGeometry(2,2),null),this.mesh.frustumCulled=!1,this.scene.add(this.mesh),this.createMaterial()}createMaterial(){var e,t;this.mode!==this.settings.mode&&(cancelAnimationFrame(this.raf),this.raf=0),this.material?.dispose(),this.mode=this.settings.mode;let i={uTexture:{value:this.texture},uResolution:{value:new o.Vector2(this.width,this.height)},uCoverScale:{value:new o.Vector2(1,1)},uBrightness:{value:this.settings.brightness},uContrast:{value:this.settings.contrast},uThreshold:{value:this.settings.threshold},uDarkColor:{value:new o.Color().setStyle(this.settings.darkColor,o.NoColorSpace)},uLightColor:{value:new o.Color().setStyle(this.settings.lightColor,o.NoColorSpace)},uTime:{value:this.time}};"ordered"===this.mode?(this.matrix=this.settings.matrixSize,this.material=new o.ShaderMaterial({glslVersion:o.GLSL3,uniforms:{...i,uTrail:{value:null},uTrailIntensityMultiplier:{value:1},uPixelSize:{value:1},uPixelSizeMultiplier:{value:3},uScaleResolution:{value:1},uDitherAmount:{value:1},uBias:{value:0},uBiasNoiseScale:{value:3},uBiasNoiseSpeed:{value:.3},uBiasPulseSpeed:{value:1},uBiasNoiseWeight:{value:.15},uBiasPulseWeight:{value:.05},uBiasAnimationStrength:{value:1}},vertexShader:g,fragmentShader:(e=this.matrix,`
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
`)}),this.ensureTrailMaterial()):(this.grid=this.settings.gridSize,this.material=new o.ShaderMaterial({glslVersion:o.GLSL3,uniforms:{...i,uMouse:{value:new o.Vector2},uMouseStrength:{value:0},uMouseRadius:{value:1}},vertexShader:g,fragmentShader:(t=this.grid,`
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
`)})),this.mesh.material=this.material}ensureTrailMaterial(){this.trailMaterial||(this.trailMaterial=new o.ShaderMaterial({glslVersion:o.GLSL3,uniforms:{uPrev:{value:null},uResolution:{value:new o.Vector2},uMouse:{value:new o.Vector2},uPrevMouse:{value:new o.Vector2},uTrailDecay:{value:.94},uTrailRadius:{value:1},uBrushStrength:{value:0}},vertexShader:g,fragmentShader:f}),this.trailMesh=new o.Mesh(new o.PlaneGeometry(2,2),this.trailMaterial),this.trailMesh.frustumCulled=!1,this.trailScene.add(this.trailMesh))}load(e){let t=()=>{this.texture?.dispose();let t=new o.Texture(this.img);t.flipY=!1,t.premultiplyAlpha=!1,t.minFilter=o.LinearMipmapLinearFilter,t.magFilter=o.LinearFilter,t.generateMipmaps=!0,t.needsUpdate=!0,this.texture=t,this.material.uniforms.uTexture.value=t,e()};this.img.complete&&this.img.naturalWidth>0?t():this.img.addEventListener("load",t,{once:!0})}resize(){let e=this.settings.pixelSize,t=Math.max(1,Math.round(this.canvas.clientWidth/e)),i=Math.max(1,Math.round(this.canvas.clientHeight/e));return(t!==this.width||i!==this.height||this.canvas.width!==t)&&(this.width=t,this.height=i,this.canvas.width=t,this.canvas.height=i,"ordered"===this.mode&&this.ensureTargets(),!0)}coverScale(){let e=(this.img.naturalWidth||1)/(this.img.naturalHeight||1),t=this.width/this.height;return e>t?new o.Vector2(t/e,1):new o.Vector2(1,e/t)}makeTarget(){let e=m().capabilities.isWebGL2?o.HalfFloatType:o.UnsignedByteType;return new o.WebGLRenderTarget(this.width,this.height,{type:e,minFilter:o.LinearFilter,magFilter:o.LinearFilter,wrapS:o.ClampToEdgeWrapping,wrapT:o.ClampToEdgeWrapping,depthBuffer:!1,stencilBuffer:!1})}ensureTargets(){if(this.trailA&&this.trailA.width===this.width&&this.trailA.height===this.height)return;this.disposeTargets(),this.trailA=this.makeTarget(),this.trailB=this.makeTarget();let e=m();e.setRenderTarget(this.trailA),e.setClearColor(0,1),e.clear(),e.setRenderTarget(this.trailB),e.clear(),e.setRenderTarget(null)}disposeTargets(){this.trailA?.dispose(),this.trailB?.dispose(),this.trailA=null,this.trailB=null}renderTrail(e){let t=this.trailMaterial.uniforms;t.uResolution.value.set(this.width,this.height),t.uPrev.value=this.trailA.texture,t.uMouse.value.set(this.mouse.x,this.height-this.mouse.y),t.uPrevMouse.value.set(this.prevMouse.x,this.height-this.prevMouse.y),t.uTrailDecay.value=this.settings.trailDecay,t.uTrailRadius.value=Math.min(this.width,this.height)*this.settings.trailRadius;let i=Math.min(1,this.mouse.distanceTo(this.prevMouse)/(.05*Math.min(this.width,this.height)));t.uBrushStrength.value=i,e.setRenderTarget(this.trailB),e.render(this.trailScene,this.camera);let s=this.trailA;this.trailA=this.trailB,this.trailB=s,this.prevMouse.copy(this.mouse)}needsRebuild(){return this.mode!==this.settings.mode||("diffusion"===this.settings.mode?this.grid!==this.settings.gridSize:this.matrix!==this.settings.matrixSize)}render(){if(!this.texture)return;this.needsRebuild()&&this.createMaterial();let e=m();e.setSize(this.width,this.height,!1);let t=this.material.uniforms;t.uResolution.value.set(this.width,this.height),t.uCoverScale.value.copy(this.coverScale()),t.uBrightness.value=this.settings.brightness,t.uContrast.value=this.settings.contrast,t.uThreshold.value=this.settings.threshold,t.uDarkColor.value.setStyle(this.settings.darkColor,o.NoColorSpace),t.uLightColor.value.setStyle(this.settings.lightColor,o.NoColorSpace),t.uTime.value=this.time,"ordered"===this.mode?(this.ensureTargets(),this.renderTrail(e),t.uTrail.value=this.trailA.texture,t.uTrailIntensityMultiplier.value=this.settings.trailIntensityMultiplier,t.uPixelSize.value=this.settings.lumPixelSize,t.uPixelSizeMultiplier.value=this.settings.pixelSizeMultiplier,t.uScaleResolution.value=this.settings.scaleResolution,t.uDitherAmount.value=this.settings.ditherAmount,t.uBias.value=this.settings.bias,t.uBiasNoiseScale.value=this.settings.biasNoiseScale,t.uBiasNoiseSpeed.value=this.settings.biasNoiseSpeed,t.uBiasPulseSpeed.value=this.settings.biasPulseSpeed,t.uBiasNoiseWeight.value=this.settings.biasNoiseWeight,t.uBiasPulseWeight.value=this.settings.biasPulseWeight,t.uBiasAnimationStrength.value=this.settings.biasAnimationStrength):(t.uMouse.value.copy(this.mouse),t.uMouseStrength.value=this.strength,t.uMouseRadius.value=.35*Math.min(this.width,this.height)),e.setClearColor(0,0),e.setRenderTarget(null),e.render(this.scene,this.camera),this.ctx.clearRect(0,0,this.width,this.height),this.ctx.drawImage(e.domElement,0,0)}visibleHoverRect(){let e=this.canvas.getBoundingClientRect(),t=e.left,i=e.top,s=e.right,r=e.bottom;if(s<=t||r<=i)return null;let o=this.canvas.parentElement;for(;o&&o!==document.body&&o!==document.documentElement;){let{overflow:e,overflowX:a,overflowY:n}=getComputedStyle(o);if("visible"!==e||"visible"!==a||"visible"!==n){let e=o.getBoundingClientRect();if(e.width>0&&e.height>0&&(t=Math.max(t,e.left),i=Math.max(i,e.top),s=Math.min(s,e.right),r=Math.min(r,e.bottom),s<=t||r<=i))return null}o=o.parentElement}return{left:t,top:i,right:s,bottom:r}}onPointerMove(e){if(!this.visible)return;let t=this.visibleHoverRect();if(!t||e.clientX<t.left||e.clientX>t.right||e.clientY<t.top||e.clientY>t.bottom)return;let i=this.canvas.getBoundingClientRect();if(!i.width||!i.height)return;let s=e.clientX-i.left,r=e.clientY-i.top;this.mouse.set(s/i.width*this.width,r/i.height*this.height),this.hasMouse||(this.prevMouse.copy(this.mouse),this.hasMouse=!0),this.visible=!0,this.strength=1,this.trailFrames=120,this.animate()}animate(){if(this.raf)return;let e="ordered"===this.mode&&0!==this.settings.biasAnimationStrength;if(!("diffusion"===this.mode&&this.strength>0||"ordered"===this.mode&&(e||this.trailFrames>0)))return void this.render();let t=performance.now(),i=e=>{let s=Math.min(.05,(e-t)/1e3);if(t=e,!this.visible){this.raf=0;return}"diffusion"===this.mode?(this.time+=s,this.strength*=Math.exp(-(2.5*s)),this.render(),this.strength>.02?this.raf=requestAnimationFrame(i):(this.strength=0,this.raf=0,this.render())):(this.time+=s,this.trailFrames>0&&(this.trailFrames-=1),this.render(),0!==this.settings.biasAnimationStrength||this.trailFrames>0?this.raf=requestAnimationFrame(i):(this.raf=0,this.render()))};this.raf=requestAnimationFrame(i)}dispose(){cancelAnimationFrame(this.raf),this.raf=0,this.visible=!1,this.texture?.dispose(),this.material?.dispose(),this.trailMaterial?.dispose(),this.trailMesh?.geometry.dispose(),this.disposeTargets(),this.mesh.geometry.dispose()}}let y=new Set,w=null,b=null,x="ditherImageDebug";async function z(){if(w)return;w={};let t=localStorage.getItem(x);b={...l,...t?JSON.parse(t):{}};let{GUI:i}=await e.A(62127);w=new i({title:"DitherImage"});let s=()=>{localStorage.setItem(x,JSON.stringify(b)),y.forEach(e=>e.redraw())},r=w.addFolder("General");r.add(b,"mode",["diffusion","ordered"]).onChange(()=>{v(),s()}),r.add(b,"pixelSize",1,16,1).onChange(s),r.add(b,"brightness",-1,1).onChange(s),r.add(b,"contrast",0,3).onChange(s),r.addColor(b,"darkColor").onChange(s),r.addColor(b,"lightColor").onChange(s);let o=w.addFolder("Dither"),a=o.add(b,"threshold",0,1).onChange(s),n=o.add(b,"gridSize",2,8,1).onChange(s),u=o.add(b,"matrixSize",{"2x2":2,"4x4":4}).onChange(s),h=o.add(b,"lumPixelSize",1,8,1).onChange(s),c=o.add(b,"pixelSizeMultiplier",1,8,.1).onChange(s),d=o.add(b,"scaleResolution",1,8,1).onChange(s),p=o.add(b,"ditherAmount",0,1,.01).onChange(s),m=o.add(b,"bias",-1,1,.01).onChange(s),g=w.addFolder("Bias animation");g.add(b,"biasNoiseScale",0,10,.1).onChange(s),g.add(b,"biasNoiseSpeed",0,2,.01).onChange(s),g.add(b,"biasPulseSpeed",0,5,.01).onChange(s),g.add(b,"biasNoiseWeight",0,1,.01).onChange(s),g.add(b,"biasPulseWeight",0,1,.01).onChange(s),g.add(b,"biasAnimationStrength",0,2,.01).onChange(s);let f=w.addFolder("Trail");function v(){let e="ordered"===b.mode;n.show(!e),u.show(e),h.show(e),c.show(e),d.show(e),p.show(e),m.show(e),a.show(!0),e?g.show():g.hide(),e?f.show():f.hide()}f.add(b,"trailDecay",.8,.995,.001).onChange(s),f.add(b,"trailRadius",.01,.3,.005).onChange(s),f.add(b,"trailIntensityMultiplier",0,3,.05).onChange(s),v();let S={showOriginal:!1,copyDefaults:()=>{var e;return navigator.clipboard.writeText((e=b,`const DEFAULTS = {
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
};`))},reset:()=>{Object.assign(b,l),w.controllersRecursive().forEach(e=>e.updateDisplay()),v(),s()}};w.add(S,"showOriginal").name("show original").onChange(e=>y.forEach(t=>t.showOriginal(e))),w.add(S,"copyDefaults").name("copy defaults"),w.add(S,"reset"),y.forEach(e=>e.redraw())}let T=(0,s.forwardRef)(function({src:e,alt:r="",className:o,style:a,onReady:u,priority:m=!1,...g},f){let v=(0,s.useRef)(null),w=(0,s.useRef)(null),x=(0,s.useRef)(null),T=(0,s.useRef)(g),C=(0,s.useRef)(u),A=(0,s.useRef)(!1),P=(0,s.useRef)(!1);return T.current=g,C.current=u,(0,s.useImperativeHandle)(f,()=>({setSrc(e){e=n(e);let t=v.current;t&&t.getAttribute("src")!==e&&(t.src=e,x.current?.reload())},redraw:()=>x.current?.redraw()})),(0,s.useEffect)(()=>{let e=w.current,t=v.current;if(!function(){if(null!==p)return p;try{p=!!document.createElement("canvas").getContext("webgl2")}catch{p=!1}return p}()){t.style.opacity="1",e.style.display="none",x.current={redraw(){},showOriginal(){},reload(){}},A.current||(A.current=!0,C.current?.());return}let s=new S(e,t),r=!1;function o(){s.settings={...l,...T.current},b&&(s.settings={...s.settings,...b})}function a(){r&&(o(),s.resize(),s.render(),s.animate(),e.classList.add(i.default.ready),t.style.opacity="0",A.current||(A.current=!0,C.current?.()))}function n(){s.load(()=>{r=!0,a()})}x.current={redraw:a,showOriginal:i=>{e.style.visibility=i?"hidden":"",t.style.opacity=i?"1":"0"},reload:n},n();let u=new ResizeObserver(()=>{r&&(o(),s.resize()&&(s.render(),s.animate()))});u.observe(e);let m=new IntersectionObserver(e=>{s.visible=e[0].isIntersecting,s.visible&&r&&a()},{threshold:0});return m.observe(e),h.add(s),c||(c=!0,window.addEventListener("pointermove",d,{passive:!0})),y.add(x.current),"true"===new URLSearchParams(window.location.search).get("debugDitherImage")&&z(),()=>{u.disconnect(),m.disconnect(),h.delete(s),!h.size&&c&&(c=!1,window.removeEventListener("pointermove",d)),y.delete(x.current),s.dispose()}},[]),(0,s.useEffect)(()=>{if(!P.current){P.current=!0;return}x.current?.reload?.()},[e]),(0,s.useEffect)(()=>{x.current?.redraw()},[JSON.stringify(g)]),(0,t.jsxs)("div",{className:o?`${i.default.wrapper} ${o}`:i.default.wrapper,style:a,children:[(0,t.jsx)("img",{ref:v,src:n(e),alt:r,className:i.default.img,loading:m?"eager":"lazy",fetchPriority:m?"high":"auto",decoding:"async"}),(0,t.jsx)("canvas",{ref:w,"aria-hidden":"true",className:i.default.canvas})]})});e.s(["default",0,T])},76146,e=>{e.v({canvas:"DitherImage-module__MV5TGG__canvas",img:"DitherImage-module__MV5TGG__img",ready:"DitherImage-module__MV5TGG__ready",wrapper:"DitherImage-module__MV5TGG__wrapper"})},82293,e=>{"use strict";e.s(["CLOUD_COSTS",0,{en:{kicker:"Cloud cost scenarios",regionLabel:"AWS Region",regionNote:"Prices change with the Region: our clients run in Paris, Frankfurt, the UAE and Bahrain.",perMonth:"/ month",perYear:"/ year",before:"Default configuration",after:"Optimised architecture",savings:"Estimated savings",tradeoffs:"Trade-offs to plan for",howTo:"How we implement it",inputs:"Your figures",priceUsed:"Price used",disclaimer:"AWS public list prices in USD, excluding tax, Free Tier and negotiated discounts (Savings Plans, EDP), checked on {date} in the AWS Price List and pricing pages. Spot: lowest price in the Region published by AWS that day; it changes by Availability Zone and over time. Illustrative scenarios, not a client system.",sourcesTitle:"Sources",ctaTitle:"What is your bill hiding?",ctaCopy:"In two weeks, we audit your AWS account (network, compute, storage, data) and hand you a prioritised list of savings with the effort each one takes.",ctaAudit:"Request a cloud cost audit",ctaTalk:"Talk to an engineer",leadCopy:"Try your own figures below, or let us find these leaks in your account: a two-week audit that ends with a prioritised list of savings.",leadJump:"Jump to",jump:{"s3-nat":"S3 through NAT","cross-az":"Cross-AZ traffic","spot-ebs":"Spot for batch",dynamodb:"DynamoDB hot key","nat-instance":"NAT in dev & staging"},moreLabel:"Full guide, worked example and gotchas",scenarioCta:"Check my AWS account for this",stickyCta:"Request a cloud cost audit",scenarios:[{id:"s3-nat",title:"S3 traffic going through a NAT Gateway",problem:"Workloads in private subnets read large volumes from Amazon S3: a data lake, model training, log processing. By default that traffic leaves through the NAT Gateway, which bills every gigabyte it processes.",default:"Private subnet → NAT Gateway → S3. Every GB pays the NAT Gateway data processing fee.",optimised:"An S3 gateway VPC endpoint and one route in the subnet route tables: S3 traffic goes straight to S3 inside the Region. AWS charges nothing extra for gateway endpoints.",how:["Create the S3 gateway endpoint (Terraform) and associate it with the private route tables.","Switch bucket policies that rely on aws:SourceIp to aws:SourceVpce.","Check in Cost Explorer / CUR that NatGateway-Bytes drops."],tradeoffs:["Works for S3 and DynamoDB in the same Region only.","Interface endpoints (PrivateLink) are a different product: billed per hour and per GB.","The NAT Gateway hourly fee remains if other traffic still needs it."],fields:{gb:"Data read from S3 through the NAT Gateway (GB / month)"}},{id:"cross-az",title:"Microservices talking across Availability Zones",problem:"In a Kubernetes (EKS) cluster spread over several Availability Zones, services call each other without regard to zone. AWS bills traffic between instances in different zones $0.01 per GB in each direction, so $0.02 per GB for a call that crosses.",default:"Pods spread evenly over N zones: about (N−1)/N of internal calls cross a zone.",optimised:"Kubernetes Services with trafficDistribution: PreferSameZone (or Istio locality load balancing) keep calls in the caller's zone whenever a healthy endpoint exists there.",how:["Measure cross-zone traffic first (VPC Flow Logs or the CUR line DataTransfer-Regional-Bytes).","Enable PreferSameZone on the chattiest Services and spread replicas per zone (topology spread constraints).","Keep cluster-wide fallback: if a zone has no healthy endpoint, traffic goes elsewhere."],tradeoffs:["Each zone needs enough replicas, otherwise load becomes uneven.","Not every call can stay local; the share depends on your traffic.","AWS App Mesh reached end of support on 30 September 2026: do not start new designs on it."],fields:{gb:"Internal service-to-service traffic (GB / month)",zones:"Availability Zones",local:"Share kept in the same zone after the change (%)"}},{id:"spot-ebs",title:"Stateful batch jobs kept on On-Demand",problem:"CI runners or batch jobs of several hours keep state on disk, so teams avoid Spot Instances, which can be interrupted with a two-minute notice, and pay On-Demand prices around the clock.",default:"A fleet of m5.2xlarge On-Demand instances (Linux), running all month.",optimised:"The same fleet on Spot, with state on EBS or checkpoints on S3. On the two-minute Spot interruption notice, an EventBridge rule triggers automation that saves the job, moves the volume to a replacement instance and resumes.",how:["Checkpoint jobs (or keep their working directory on EBS).","EventBridge rule on EC2 Spot Instance Interruption Warning → Lambda / Step Functions to drain, detach and re-attach.","Several instance types (m5, m6i, m7i) and an On-Demand fallback in the Auto Scaling group."],tradeoffs:["An EBS volume lives in one Availability Zone: the replacement instance must be in the same zone (or use S3 checkpoints to move across zones).","Spot prices change by zone and over time, and capacity is not guaranteed.","Short jobs without state are simpler: just retry them."],fields:{instances:"Number of instances",hours:"Hours per month",spot:"Share of hours on Spot (%)"}},{id:"dynamodb",title:"A DynamoDB table with a hot partition key",problem:"A leaderboard or ad-tech table writes thousands of items per second under one key per day (for example 2026-11-18). A single DynamoDB partition accepts at most 1,000 write units per second: past that, writes are throttled whatever the capacity you pay for. Raising provisioned capacity costs more and does not fix the hot key.",default:"One partition key per day, and capacity over-provisioned to try to absorb the throttling.",optimised:"Write sharding: a suffix 0…N−1 added to the key spreads writes over at least peak ÷ 1,000 partitions, and you provision only the capacity you need (or use on-demand mode).",how:["Choose N with headroom (often 2× the minimum) and a random or hash-based suffix.","Read by querying the N shards in parallel, or maintain a periodic rollup.","Watch WriteThrottleEvents and the CloudWatch Contributor Insights hot keys."],tradeoffs:["Reads become N queries (or a rollup to maintain).","One write unit covers an item up to 1 KB: larger items consume more.","Without sharding, more than 1,000 writes per second on one key is not possible."],fields:{writes:"Peak writes per second",size:"Item size (KB)",factor:"Over-provisioning factor in the default setup (×)",hours:"Hours per month at that capacity"},shardsLabel:"Minimum shards needed"},{id:"nat-instance",page:"/cloud-costs/nat-instance",title:"NAT Gateways in every dev and staging account",problem:'Landing zones often copy the production network into every account: one NAT Gateway per Availability Zone, "for parity". Each one is billed per hour, per GB processed, and for its public IPv4 address, even in a dev account that moves a few hundred gigabytes a month.',default:"One NAT Gateway (with its public IPv4 address) in each zone of every non-production account.",optimised:"One t4g.nano NAT instance per account (8 GB gp3, one public IPv4), in an Auto Scaling group of one. No per-GB processing fee; traffic from the other zones pays cross-AZ transfer. Above about 1.2 TB a month, one instance per zone is cheaper: the calculator picks the cheaper of the two.",how:["A Terraform module with two variants: managed NAT Gateways for production, a NAT instance (fck-nat ARM image or Amazon Linux 2023 with masquerading) for non-production.","Source/destination check disabled, a fixed network interface and Elastic IP attached at boot, so the private route tables stay valid after a replacement.","S3 and DynamoDB gateway endpoints in the same VPC, and a check in Cost Explorer that NatGateway-Hours and NatGateway-Bytes drop to zero."],tradeoffs:["A t4g.nano has 0.032 Gbps of baseline network bandwidth (5 Gbps burst) and 0.5 GiB of memory: fine for dev traffic, not for large data loads.","When the instance is replaced, open connections drop and egress pauses for a few minutes. Keep managed NAT Gateways in production.","It is a server you own: patch it, monitor it, alarm on it. With one or two accounts the saving rarely justifies that work."],fields:{accounts:"Non-production accounts",zones:"Availability Zones per account",gb:"Traffic through NAT per account (GB / month)"},choiceShared:"Cheapest setup here: one shared NAT instance per account.",choicePerZone:"Cheapest setup here: one NAT instance per zone (high traffic)."}]},fr:{kicker:"Scénarios de coûts cloud",regionLabel:"Région AWS",regionNote:"Les prix changent selon la Région : nos clients sont à Paris, Francfort, aux Émirats et à Bahreïn.",perMonth:"/ mois",perYear:"/ an",before:"Configuration par défaut",after:"Architecture optimisée",savings:"Économie estimée",tradeoffs:"Compromis à prévoir",howTo:"Comment nous le mettons en place",inputs:"Vos chiffres",priceUsed:"Prix utilisé",disclaimer:"Prix publics AWS en USD, hors taxes, Free Tier et remises négociées (Savings Plans, EDP), vérifiés le {date} dans l'AWS Price List et les pages de tarifs AWS. Spot : prix le plus bas publié par AWS dans la Région ce jour-là ; il varie selon la zone de disponibilité et dans le temps. Scénarios illustratifs, pas le système d'un client.",sourcesTitle:"Sources",ctaTitle:"Que cache votre facture ?",ctaCopy:"En deux semaines, nous auditons votre compte AWS (réseau, calcul, stockage, données) et vous remettons une liste priorisée d'économies, avec l'effort que chacune demande.",ctaAudit:"Demander un audit des coûts cloud",ctaTalk:"Parler à un ingénieur",leadCopy:"Testez vos chiffres ci-dessous, ou laissez-nous trouver ces fuites dans votre compte AWS : audit en deux semaines, économies priorisées.",leadJump:"Aller à",jump:{"s3-nat":"S3 via NAT","cross-az":"Trafic inter-zones","spot-ebs":"Spot pour le batch",dynamodb:"DynamoDB : clé chaude","nat-instance":"NAT en dev et staging"},moreLabel:"Guide complet, exemple chiffré et pièges",scenarioCta:"Vérifier mon compte AWS",stickyCta:"Demander un audit cloud",scenarios:[{id:"s3-nat",title:"Le trafic S3 qui passe par une NAT Gateway",problem:"Des charges de travail en sous-réseau privé lisent de gros volumes sur Amazon S3 : data lake, entraînement de modèles, traitement de logs. Par défaut, ce trafic sort par la NAT Gateway, qui facture chaque gigaoctet traité.",default:"Sous-réseau privé → NAT Gateway → S3. Chaque Go paie les frais de traitement de la NAT Gateway.",optimised:"Un VPC endpoint de type gateway pour S3 et une route dans les tables de routage privées : le trafic S3 va directement à S3 dans la Région. AWS ne facture rien de plus pour les gateway endpoints.",how:["Créer le gateway endpoint S3 (Terraform) et l'associer aux tables de routage privées.","Remplacer dans les bucket policies les conditions aws:SourceIp par aws:SourceVpce.","Vérifier dans Cost Explorer / CUR la baisse de NatGateway-Bytes."],tradeoffs:["Fonctionne pour S3 et DynamoDB, dans la même Région uniquement.","Les interface endpoints (PrivateLink) sont un autre produit, facturé à l'heure et au Go.","Les frais horaires de la NAT Gateway restent si d'autres flux en ont besoin."],fields:{gb:"Données lues sur S3 via la NAT Gateway (Go / mois)"}},{id:"cross-az",title:"Des microservices qui discutent entre zones de disponibilité",problem:"Dans un cluster Kubernetes (EKS) réparti sur plusieurs zones de disponibilité, les services s'appellent sans tenir compte de la zone. AWS facture le trafic entre instances de zones différentes 0,01 $ par Go dans chaque sens, soit 0,02 $ par Go pour un appel qui traverse.",default:"Pods répartis uniformément sur N zones : environ (N−1)/N des appels internes changent de zone.",optimised:"Des Services Kubernetes avec trafficDistribution: PreferSameZone (ou le load balancing par localité d'Istio) gardent les appels dans la zone de l'appelant dès qu'un endpoint sain y existe.",how:["Mesurer d'abord le trafic inter-zones (VPC Flow Logs ou la ligne DataTransfer-Regional-Bytes du CUR).","Activer PreferSameZone sur les Services les plus bavards et répartir les réplicas par zone (topology spread constraints).","Garder le repli : si une zone n'a pas d'endpoint sain, le trafic part ailleurs."],tradeoffs:["Chaque zone doit avoir assez de réplicas, sinon la charge devient inégale.","Tous les appels ne peuvent pas rester locaux : la part dépend de votre trafic.","AWS App Mesh n'est plus supporté depuis le 30 septembre 2026 : ne pas démarrer de nouvelle architecture dessus."],fields:{gb:"Trafic interne entre services (Go / mois)",zones:"Zones de disponibilité",local:"Part qui reste dans la même zone après le changement (%)"}},{id:"spot-ebs",title:"Des traitements batch avec état laissés en On-Demand",problem:"Des runners CI ou des traitements batch de plusieurs heures gardent un état sur disque : les équipes évitent alors les instances Spot, qui peuvent être interrompues avec un préavis de deux minutes, et paient le prix On-Demand en continu.",default:"Une flotte d'instances m5.2xlarge On-Demand (Linux), allumées tout le mois.",optimised:"La même flotte en Spot, avec l'état sur EBS ou des checkpoints sur S3. Au préavis d'interruption Spot de deux minutes, une règle EventBridge déclenche une automatisation qui sauvegarde le travail, déplace le volume vers une instance de remplacement et reprend.",how:["Prévoir des checkpoints (ou garder le répertoire de travail sur EBS).","Règle EventBridge sur EC2 Spot Instance Interruption Warning → Lambda / Step Functions pour vider, détacher et rattacher.","Plusieurs types d'instances (m5, m6i, m7i) et un repli On-Demand dans le groupe Auto Scaling."],tradeoffs:["Un volume EBS vit dans une seule zone : l'instance de remplacement doit être dans la même zone (ou utiliser des checkpoints S3 pour changer de zone).","Les prix Spot varient selon la zone et dans le temps, et la capacité n'est pas garantie.","Pour des tâches courtes sans état, plus simple : les relancer."],fields:{instances:"Nombre d'instances",hours:"Heures par mois",spot:"Part des heures en Spot (%)"}},{id:"dynamodb",title:"Une table DynamoDB avec une clé de partition « chaude »",problem:"Une table de classement ou d'ad-tech écrit des milliers d'éléments par seconde sous une seule clé par jour (par exemple 2026-11-18). Une partition DynamoDB accepte au maximum 1 000 unités d'écriture par seconde : au-delà, les écritures sont limitées (throttling) quelle que soit la capacité payée. Augmenter la capacité provisionnée coûte plus cher et ne règle pas la clé chaude.",default:"Une clé de partition par jour, et une capacité surdimensionnée pour tenter d'absorber le throttling.",optimised:"Le write sharding : un suffixe 0…N−1 ajouté à la clé répartit les écritures sur au moins pic ÷ 1 000 partitions, et l'on provisionne uniquement la capacité nécessaire (ou le mode à la demande).",how:["Choisir N avec de la marge (souvent 2× le minimum) et un suffixe aléatoire ou calculé (hash).","Lire en interrogeant les N shards en parallèle, ou maintenir un agrégat périodique.","Surveiller WriteThrottleEvents et les clés chaudes avec CloudWatch Contributor Insights."],tradeoffs:["Les lectures deviennent N requêtes (ou un agrégat à maintenir).","Une unité d'écriture couvre un élément jusqu'à 1 Ko : les éléments plus gros en consomment plus.","Sans sharding, plus de 1 000 écritures par seconde sur une même clé est impossible."],fields:{writes:"Pic d'écritures par seconde",size:"Taille d'un élément (Ko)",factor:"Facteur de surdimensionnement par défaut (×)",hours:"Heures par mois à cette capacité"},shardsLabel:"Nombre minimum de shards"},{id:"nat-instance",page:"/cloud-costs/nat-instance",title:"Des NAT Gateways dans chaque compte de dev et de staging",problem:"Les landing zones copient souvent le réseau de production dans chaque compte : une NAT Gateway par zone de disponibilité, « par parité ». Chacune est facturée à l'heure, au Go traité et pour son adresse IPv4 publique, même dans un compte de dev qui fait passer quelques centaines de gigaoctets par mois.",default:"Une NAT Gateway (avec son adresse IPv4 publique) dans chaque zone de chaque compte hors production.",optimised:"Une instance NAT t4g.nano par compte (8 Go gp3, une IPv4 publique), dans un groupe Auto Scaling d'une instance. Aucun frais de traitement au Go ; le trafic des autres zones paie le transfert inter-zones. Au-delà d'environ 1,2 To par mois, une instance par zone revient moins cher : le calculateur retient la moins chère des deux.",how:["Un module Terraform à deux variantes : NAT Gateways managées pour la production, instance NAT (image ARM fck-nat ou Amazon Linux 2023 avec masquerading) hors production.","Contrôle source/destination désactivé, interface réseau et Elastic IP fixes rattachées au démarrage, pour que les tables de routage privées restent valides après un remplacement.","Des gateway endpoints S3 et DynamoDB dans le même VPC, et une vérification dans Cost Explorer que NatGateway-Hours et NatGateway-Bytes tombent à zéro."],tradeoffs:["Une t4g.nano a 0,032 Gbit/s de bande passante réseau de base (5 Gbit/s en rafale) et 0,5 Gio de mémoire : suffisant pour du trafic de dev, pas pour de gros chargements de données.","Quand l'instance est remplacée, les connexions ouvertes tombent et la sortie s'interrompt quelques minutes. Gardez les NAT Gateways managées en production.","C'est un serveur à vous : à patcher, surveiller et alerter. Avec un ou deux comptes, l'économie justifie rarement ce travail."],fields:{accounts:"Comptes hors production",zones:"Zones de disponibilité par compte",gb:"Trafic via NAT par compte (Go / mois)"},choiceShared:"Configuration la moins chère ici : une instance NAT partagée par compte.",choicePerZone:"Configuration la moins chère ici : une instance NAT par zone (trafic élevé)."}]}}])},42313,e=>{"use strict";e.s(["CLOUD_PAGES",0,[{key:"hub",route:"/cloud",meta:"cloud"},{key:"consultantTn",route:"/cloud/consultant-aws-tunisie",meta:"cloud/consultant-aws-tunisie"},{key:"migrationTn",route:"/cloud/migration-cloud-tunisie",meta:"cloud/migration-cloud-tunisie"},{key:"consultantFr",route:"/cloud/consultant-aws-france",meta:"cloud/consultant-aws-france"}]])}]);