(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,49019,e=>{"use strict";function t(e,t,i){return Math.max(e,Math.min(t,i))}var i=class{isRunning=!1;value=0;from=0;to=0;currentTime=0;lerp;duration;easing;onUpdate;advance(e){if(!this.isRunning)return;let i=!1;if(this.duration&&this.easing){this.currentTime+=e;let r=t(0,this.currentTime/this.duration,1),s=(i=r>=1)?1:this.easing(r);this.value=this.from+(this.to-this.from)*s}else if(this.lerp){var r,s,o,n;this.value=(r=this.value,s=this.to,o=60*this.lerp,(1-(n=1-Math.exp(-o*e)))*r+n*s),Math.round(this.value)===this.to&&(this.value=this.to,i=!0)}else this.value=this.to,i=!0;i&&this.stop(),this.onUpdate?.(this.value,i)}stop(){this.isRunning=!1}fromTo(e,t,{lerp:i,duration:r,easing:s,onStart:o,onUpdate:n}){this.from=this.value=e,this.to=t,this.lerp=i,this.duration=r,this.easing=s,this.currentTime=0,this.isRunning=!0,o?.(),this.onUpdate=n}},r=class{constructor(e,t,{autoResize:i=!0,debounce:r=250}={}){this.wrapper=e,this.content=t,i&&(this.debouncedResize=function(e,t){let i;return function(...r){let s=this;clearTimeout(i),i=setTimeout(()=>{i=void 0,e.apply(s,r)},t)}}(this.resize,r),this.wrapper instanceof Window?window.addEventListener("resize",this.debouncedResize,!1):(this.wrapperResizeObserver=new ResizeObserver(this.debouncedResize),this.wrapperResizeObserver.observe(this.wrapper)),this.contentResizeObserver=new ResizeObserver(this.debouncedResize),this.contentResizeObserver.observe(this.content)),this.resize()}width=0;height=0;scrollHeight=0;scrollWidth=0;debouncedResize;wrapperResizeObserver;contentResizeObserver;destroy(){this.wrapperResizeObserver?.disconnect(),this.contentResizeObserver?.disconnect(),this.wrapper===window&&this.debouncedResize&&window.removeEventListener("resize",this.debouncedResize,!1)}resize=()=>{this.onWrapperResize(),this.onContentResize()};onWrapperResize=()=>{this.wrapper instanceof Window?(this.width=window.innerWidth,this.height=window.innerHeight):(this.width=this.wrapper.clientWidth,this.height=this.wrapper.clientHeight)};onContentResize=()=>{this.wrapper instanceof Window?(this.scrollHeight=this.content.scrollHeight,this.scrollWidth=this.content.scrollWidth):(this.scrollHeight=this.wrapper.scrollHeight,this.scrollWidth=this.wrapper.scrollWidth)};get limit(){return{x:this.scrollWidth-this.width,y:this.scrollHeight-this.height}}},s=class{events={};emit(e,...t){let i=this.events[e]||[];for(let e=0,r=i.length;e<r;e++)i[e]?.(...t)}on(e,t){return this.events[e]?.push(t)||(this.events[e]=[t]),()=>{this.events[e]=this.events[e]?.filter(e=>t!==e)}}off(e,t){this.events[e]=this.events[e]?.filter(e=>t!==e)}destroy(){this.events={}}},o=100/6,n={passive:!1},l=class{constructor(e,t={wheelMultiplier:1,touchMultiplier:1}){this.element=e,this.options=t,window.addEventListener("resize",this.onWindowResize,!1),this.onWindowResize(),this.element.addEventListener("wheel",this.onWheel,n),this.element.addEventListener("touchstart",this.onTouchStart,n),this.element.addEventListener("touchmove",this.onTouchMove,n),this.element.addEventListener("touchend",this.onTouchEnd,n)}touchStart={x:0,y:0};lastDelta={x:0,y:0};window={width:0,height:0};emitter=new s;on(e,t){return this.emitter.on(e,t)}destroy(){this.emitter.destroy(),window.removeEventListener("resize",this.onWindowResize,!1),this.element.removeEventListener("wheel",this.onWheel,n),this.element.removeEventListener("touchstart",this.onTouchStart,n),this.element.removeEventListener("touchmove",this.onTouchMove,n),this.element.removeEventListener("touchend",this.onTouchEnd,n)}onTouchStart=e=>{let{clientX:t,clientY:i}=e.targetTouches?e.targetTouches[0]:e;this.touchStart.x=t,this.touchStart.y=i,this.lastDelta={x:0,y:0},this.emitter.emit("scroll",{deltaX:0,deltaY:0,event:e})};onTouchMove=e=>{let{clientX:t,clientY:i}=e.targetTouches?e.targetTouches[0]:e,r=-(t-this.touchStart.x)*this.options.touchMultiplier,s=-(i-this.touchStart.y)*this.options.touchMultiplier;this.touchStart.x=t,this.touchStart.y=i,this.lastDelta={x:r,y:s},this.emitter.emit("scroll",{deltaX:r,deltaY:s,event:e})};onTouchEnd=e=>{this.emitter.emit("scroll",{deltaX:this.lastDelta.x,deltaY:this.lastDelta.y,event:e})};onWheel=e=>{let{deltaX:t,deltaY:i,deltaMode:r}=e,s=1===r?o:2===r?this.window.width:1,n=1===r?o:2===r?this.window.height:1;t*=s,i*=n,t*=this.options.wheelMultiplier,i*=this.options.wheelMultiplier,this.emitter.emit("scroll",{deltaX:t,deltaY:i,event:e})};onWindowResize=()=>{this.window={width:window.innerWidth,height:window.innerHeight}}},a=e=>Math.min(1,1.001-Math.pow(2,-10*e)),h=class{_isScrolling=!1;_isStopped=!1;_isLocked=!1;_preventNextNativeScrollEvent=!1;_resetVelocityTimeout=null;__rafID=null;isTouching;time=0;userData={};lastVelocity=0;velocity=0;direction=0;options;targetScroll;animatedScroll;animate=new i;emitter=new s;dimensions;virtualScroll;constructor({wrapper:e=window,content:t=document.documentElement,eventsTarget:i=e,smoothWheel:s=!0,syncTouch:o=!1,syncTouchLerp:n=.075,touchInertiaExponent:h=1.7,duration:u,easing:c,lerp:d=.1,infinite:p=!1,orientation:f="vertical",gestureOrientation:g="vertical",touchMultiplier:m=1,wheelMultiplier:v=1,autoResize:S=!0,prevent:y,virtualScroll:w,overscroll:x=!0,autoRaf:b=!1,anchors:z=!1,autoToggle:T=!1,allowNestedScroll:C=!1,__experimental__naiveDimensions:P=!1}={}){window.lenisVersion="1.3.8",e&&e!==document.documentElement||(e=window),"number"==typeof u&&"function"!=typeof c?c=a:"function"==typeof c&&"number"!=typeof u&&(u=1),this.options={wrapper:e,content:t,eventsTarget:i,smoothWheel:s,syncTouch:o,syncTouchLerp:n,touchInertiaExponent:h,duration:u,easing:c,lerp:d,infinite:p,gestureOrientation:g,orientation:f,touchMultiplier:m,wheelMultiplier:v,autoResize:S,prevent:y,virtualScroll:w,overscroll:x,autoRaf:b,anchors:z,autoToggle:T,allowNestedScroll:C,__experimental__naiveDimensions:P},this.dimensions=new r(e,t,{autoResize:S}),this.updateClassName(),this.targetScroll=this.animatedScroll=this.actualScroll,this.options.wrapper.addEventListener("scroll",this.onNativeScroll,!1),this.options.wrapper.addEventListener("scrollend",this.onScrollEnd,{capture:!0}),this.options.anchors&&this.options.wrapper===window&&this.options.wrapper.addEventListener("click",this.onClick,!1),this.options.wrapper.addEventListener("pointerdown",this.onPointerDown,!1),this.virtualScroll=new l(i,{touchMultiplier:m,wheelMultiplier:v}),this.virtualScroll.on("scroll",this.onVirtualScroll),this.options.autoToggle&&this.rootElement.addEventListener("transitionend",this.onTransitionEnd,{passive:!0}),this.options.autoRaf&&(this.__rafID=requestAnimationFrame(this.raf))}destroy(){this.emitter.destroy(),this.options.wrapper.removeEventListener("scroll",this.onNativeScroll,!1),this.options.wrapper.removeEventListener("scrollend",this.onScrollEnd,{capture:!0}),this.options.wrapper.removeEventListener("pointerdown",this.onPointerDown,!1),this.options.anchors&&this.options.wrapper===window&&this.options.wrapper.removeEventListener("click",this.onClick,!1),this.virtualScroll.destroy(),this.dimensions.destroy(),this.cleanUpClassName(),this.__rafID&&cancelAnimationFrame(this.__rafID)}on(e,t){return this.emitter.on(e,t)}off(e,t){return this.emitter.off(e,t)}onScrollEnd=e=>{e instanceof CustomEvent||"smooth"!==this.isScrolling&&!1!==this.isScrolling||e.stopPropagation()};dispatchScrollendEvent=()=>{this.options.wrapper.dispatchEvent(new CustomEvent("scrollend",{bubbles:this.options.wrapper===window,detail:{lenisScrollEnd:!0}}))};onTransitionEnd=e=>{if(e.propertyName.includes("overflow")){let e=this.isHorizontal?"overflow-x":"overflow-y";["hidden","clip"].includes(getComputedStyle(this.rootElement)[e])?this.internalStop():this.internalStart()}};setScroll(e){this.isHorizontal?this.options.wrapper.scrollTo({left:e,behavior:"instant"}):this.options.wrapper.scrollTo({top:e,behavior:"instant"})}onClick=e=>{let t=e.composedPath().find(e=>e instanceof HTMLAnchorElement&&(e.getAttribute("href")?.startsWith("#")||e.getAttribute("href")?.startsWith("/#")||e.getAttribute("href")?.startsWith("./#")));if(t){let e=t.getAttribute("href");if(e){let t="object"==typeof this.options.anchors&&this.options.anchors?this.options.anchors:void 0,i=`#${e.split("#")[1]}`;["#","/#","./#","#top","/#top","./#top"].includes(e)&&(i=0),this.scrollTo(i,t)}}};onPointerDown=e=>{1===e.button&&this.reset()};onVirtualScroll=e=>{if("function"==typeof this.options.virtualScroll&&!1===this.options.virtualScroll(e))return;let{deltaX:t,deltaY:i,event:r}=e;if(this.emitter.emit("virtual-scroll",{deltaX:t,deltaY:i,event:r}),r.ctrlKey||r.lenisStopPropagation)return;let s=r.type.includes("touch"),o=r.type.includes("wheel");this.isTouching="touchstart"===r.type||"touchmove"===r.type;let n=0===t&&0===i;if(this.options.syncTouch&&s&&"touchstart"===r.type&&n&&!this.isStopped&&!this.isLocked)return void this.reset();let l="vertical"===this.options.gestureOrientation&&0===i||"horizontal"===this.options.gestureOrientation&&0===t;if(n||l)return;let a=r.composedPath();a=a.slice(0,a.indexOf(this.rootElement));let h=this.options.prevent;if(a.find(e=>e instanceof HTMLElement&&("function"==typeof h&&h?.(e)||e.hasAttribute?.("data-lenis-prevent")||s&&e.hasAttribute?.("data-lenis-prevent-touch")||o&&e.hasAttribute?.("data-lenis-prevent-wheel")||this.options.allowNestedScroll&&this.checkNestedScroll(e,{deltaX:t,deltaY:i}))))return;if(this.isStopped||this.isLocked){r.cancelable&&r.preventDefault();return}if(!(this.options.syncTouch&&s||this.options.smoothWheel&&o)){this.isScrolling="native",this.animate.stop(),r.lenisStopPropagation=!0;return}let u=i;"both"===this.options.gestureOrientation?u=Math.abs(i)>Math.abs(t)?i:t:"horizontal"===this.options.gestureOrientation&&(u=t),(!this.options.overscroll||this.options.infinite||this.options.wrapper!==window&&(this.animatedScroll>0&&this.animatedScroll<this.limit||0===this.animatedScroll&&i>0||this.animatedScroll===this.limit&&i<0))&&(r.lenisStopPropagation=!0),r.cancelable&&r.preventDefault();let c=s&&this.options.syncTouch,d=s&&"touchend"===r.type;d&&(u=Math.sign(this.velocity)*Math.pow(Math.abs(this.velocity),this.options.touchInertiaExponent)),this.scrollTo(this.targetScroll+u,{programmatic:!1,...c?{lerp:d?this.options.syncTouchLerp:1}:{lerp:this.options.lerp,duration:this.options.duration,easing:this.options.easing}})};resize(){this.dimensions.resize(),this.animatedScroll=this.targetScroll=this.actualScroll,this.emit()}emit(){this.emitter.emit("scroll",this)}onNativeScroll=()=>{if(null!==this._resetVelocityTimeout&&(clearTimeout(this._resetVelocityTimeout),this._resetVelocityTimeout=null),this._preventNextNativeScrollEvent){this._preventNextNativeScrollEvent=!1;return}if(!1===this.isScrolling||"native"===this.isScrolling){let e=this.animatedScroll;this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity,this.velocity=this.animatedScroll-e,this.direction=Math.sign(this.animatedScroll-e),this.isStopped||(this.isScrolling="native"),this.emit(),0!==this.velocity&&(this._resetVelocityTimeout=setTimeout(()=>{this.lastVelocity=this.velocity,this.velocity=0,this.isScrolling=!1,this.emit()},400))}};reset(){this.isLocked=!1,this.isScrolling=!1,this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity=0,this.animate.stop()}start(){if(this.isStopped){if(this.options.autoToggle)return void this.rootElement.style.removeProperty("overflow");this.internalStart()}}internalStart(){this.isStopped&&(this.reset(),this.isStopped=!1,this.emit())}stop(){if(!this.isStopped){if(this.options.autoToggle)return void this.rootElement.style.setProperty("overflow","clip");this.internalStop()}}internalStop(){this.isStopped||(this.reset(),this.isStopped=!0,this.emit())}raf=e=>{let t=e-(this.time||e);this.time=e,this.animate.advance(.001*t),this.options.autoRaf&&(this.__rafID=requestAnimationFrame(this.raf))};scrollTo(e,{offset:i=0,immediate:r=!1,lock:s=!1,duration:o=this.options.duration,easing:n=this.options.easing,lerp:l=this.options.lerp,onStart:h,onComplete:u,force:c=!1,programmatic:d=!0,userData:p}={}){if(!this.isStopped&&!this.isLocked||c){if("string"==typeof e&&["top","left","start"].includes(e))e=0;else if("string"==typeof e&&["bottom","right","end"].includes(e))e=this.limit;else{let t;if("string"==typeof e?t=document.querySelector(e):e instanceof HTMLElement&&e?.nodeType&&(t=e),t){if(this.options.wrapper!==window){let e=this.rootElement.getBoundingClientRect();i-=this.isHorizontal?e.left:e.top}let r=t.getBoundingClientRect();e=(this.isHorizontal?r.left:r.top)+this.animatedScroll}}if("number"==typeof e){if(e+=i,e=Math.round(e),this.options.infinite){if(d){this.targetScroll=this.animatedScroll=this.scroll;let t=e-this.animatedScroll;t>this.limit/2?e-=this.limit:t<-this.limit/2&&(e+=this.limit)}}else e=t(0,e,this.limit);if(e===this.targetScroll){h?.(this),u?.(this);return}if(this.userData=p??{},r){this.animatedScroll=this.targetScroll=e,this.setScroll(this.scroll),this.reset(),this.preventNextNativeScrollEvent(),this.emit(),u?.(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()});return}d||(this.targetScroll=e),"number"==typeof o&&"function"!=typeof n?n=a:"function"==typeof n&&"number"!=typeof o&&(o=1),this.animate.fromTo(this.animatedScroll,e,{duration:o,easing:n,lerp:l,onStart:()=>{s&&(this.isLocked=!0),this.isScrolling="smooth",h?.(this)},onUpdate:(e,t)=>{this.isScrolling="smooth",this.lastVelocity=this.velocity,this.velocity=e-this.animatedScroll,this.direction=Math.sign(this.velocity),this.animatedScroll=e,this.setScroll(this.scroll),d&&(this.targetScroll=e),t||this.emit(),t&&(this.reset(),this.emit(),u?.(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()}),this.preventNextNativeScrollEvent())}})}}}preventNextNativeScrollEvent(){this._preventNextNativeScrollEvent=!0,requestAnimationFrame(()=>{this._preventNextNativeScrollEvent=!1})}checkNestedScroll(e,{deltaX:t,deltaY:i}){let r,s,o,n,l,a,h,u,c,d,p,f,g,m,v=Date.now(),S=e._lenis??={},y=this.options.gestureOrientation;if(v-(S.time??0)>2e3){S.time=Date.now();let t=window.getComputedStyle(e);S.computedStyle=t;let i=t.overflowX,c=t.overflowY;if(r=["auto","overlay","scroll"].includes(i),s=["auto","overlay","scroll"].includes(c),S.hasOverflowX=r,S.hasOverflowY=s,!r&&!s||"vertical"===y&&!s||"horizontal"===y&&!r)return!1;l=e.scrollWidth,a=e.scrollHeight,h=e.clientWidth,u=e.clientHeight,o=l>h,n=a>u,S.isScrollableX=o,S.isScrollableY=n,S.scrollWidth=l,S.scrollHeight=a,S.clientWidth=h,S.clientHeight=u}else o=S.isScrollableX,n=S.isScrollableY,r=S.hasOverflowX,s=S.hasOverflowY,l=S.scrollWidth,a=S.scrollHeight,h=S.clientWidth,u=S.clientHeight;if(!r&&!s||!o&&!n||"vertical"===y&&(!s||!n)||"horizontal"===y&&(!r||!o)||("horizontal"===y?c="x":"vertical"===y?c="y":(0!==t&&r&&o&&(c="x"),0!==i&&s&&n&&(c="y")),!c))return!1;if("x"===c)d=e.scrollLeft,p=l-h,f=t,g=r,m=o;else{if("y"!==c)return!1;d=e.scrollTop,p=a-u,f=i,g=s,m=n}return(f>0?d<p:d>0)&&g&&m}get rootElement(){return this.options.wrapper===window?document.documentElement:this.options.wrapper}get limit(){return this.options.__experimental__naiveDimensions?this.isHorizontal?this.rootElement.scrollWidth-this.rootElement.clientWidth:this.rootElement.scrollHeight-this.rootElement.clientHeight:this.dimensions.limit[this.isHorizontal?"x":"y"]}get isHorizontal(){return"horizontal"===this.options.orientation}get actualScroll(){let e=this.options.wrapper;return this.isHorizontal?e.scrollX??e.scrollLeft:e.scrollY??e.scrollTop}get scroll(){var e;return this.options.infinite?(this.animatedScroll%(e=this.limit)+e)%e:this.animatedScroll}get progress(){return 0===this.limit?1:this.scroll/this.limit}get isScrolling(){return this._isScrolling}set isScrolling(e){this._isScrolling!==e&&(this._isScrolling=e,this.updateClassName())}get isStopped(){return this._isStopped}set isStopped(e){this._isStopped!==e&&(this._isStopped=e,this.updateClassName())}get isLocked(){return this._isLocked}set isLocked(e){this._isLocked!==e&&(this._isLocked=e,this.updateClassName())}get isSmooth(){return"smooth"===this.isScrolling}get className(){let e="lenis";return this.options.autoToggle&&(e+=" lenis-autoToggle"),this.isStopped&&(e+=" lenis-stopped"),this.isLocked&&(e+=" lenis-locked"),this.isScrolling&&(e+=" lenis-scrolling"),"smooth"===this.isScrolling&&(e+=" lenis-smooth"),e}updateClassName(){this.cleanUpClassName(),this.rootElement.className=`${this.rootElement.className} ${this.className}`.trim()}cleanUpClassName(){this.rootElement.className=this.rootElement.className.replace(/lenis(-\w+)?/g,"").trim()}},u=e.i(87125),c=e.i(11003),d=(0,u.createContext)(null),p=new class{constructor(e){this.state=e}listeners=[];set(e){for(let t of(this.state=e,this.listeners))t(this.state)}subscribe(e){return this.listeners=[...this.listeners,e],()=>{this.listeners=this.listeners.filter(t=>t!==e)}}get(){return this.state}}(null),f=(0,u.forwardRef)(({children:e,root:t=!1,options:i={},className:r,autoRaf:s=!0,style:o,props:n},l)=>{let a=(0,u.useRef)(null),f=(0,u.useRef)(null),[g,m]=(0,u.useState)(void 0);(0,u.useImperativeHandle)(l,()=>({wrapper:a.current,content:f.current,lenis:g}),[g]),(0,u.useEffect)(()=>{let e=new h({...i,...!t&&{wrapper:a.current,content:f.current},autoRaf:i?.autoRaf??s});return m(e),()=>{e.destroy(),m(void 0)}},[t,JSON.stringify(i)]);let v=(0,u.useRef)([]),S=(0,u.useCallback)((e,t)=>{v.current.push({callback:e,priority:t}),v.current.sort((e,t)=>e.priority-t.priority)},[]),y=(0,u.useCallback)(e=>{v.current=v.current.filter(t=>t.callback!==e)},[]);return(0,u.useEffect)(()=>{if(t&&g)return p.set({lenis:g,addCallback:S,removeCallback:y}),()=>p.set(null)},[t,g,S,y]),(0,u.useEffect)(()=>{if(!g)return;let e=e=>{for(let t=0;t<v.current.length;t++)v.current[t]?.callback(e)};return g.on("scroll",e),()=>{g.off("scroll",e)}},[g]),(0,c.jsx)(d.Provider,{value:{lenis:g,addCallback:S,removeCallback:y},children:t?e:(0,c.jsx)("div",{ref:a,className:r,style:o,...n,children:(0,c.jsx)("div",{ref:f,children:e})})})}),g={};e.s(["ReactLenis",0,f,"useLenis",0,function(e,t=[],i=0){let r=(0,u.useContext)(d),s=function(e){let[t,i]=(0,u.useState)(e.get());return(0,u.useEffect)(()=>e.subscribe(e=>i(e)),[e]),t}(p),{lenis:o,addCallback:n,removeCallback:l}=r??s??g;return(0,u.useEffect)(()=>{if(e&&n&&l&&o)return n(e,i),e(o),()=>{l(e)}},[o,n,l,i,...t]),o}],49019)},39259,(e,t,i)=>{"use strict";e.i(25218),Object.defineProperty(i,"__esModule",{value:!0});var r={default:function(){return v},useLinkStatus:function(){return y}};for(var s in r)Object.defineProperty(i,s,{enumerable:!0,get:r[s]});let o=e.r(35391),n=e.r(11003),l=o._(e.r(87125)),a=e.r(54077),h=e.r(85882),u=e.r(27098),c=e.r(35754),d=e.r(3631),p=e.r(21293),f=e.r(71561),g=e.r(82996),m=e.r(1990);function v(t){var i;let r,s,o,[v,y]=(0,l.useOptimistic)(f.IDLE_LINK_STATUS),w=(0,l.useRef)(null),{href:x,as:b,children:z,prefetch:T=null,passHref:C,replace:P,shallow:R,scroll:M,onClick:E,onMouseEnter:_,onTouchStart:N,legacyBehavior:L=!1,onNavigate:A,transitionTypes:D,ref:B,unstable_dynamicOnHover:I,...O}=t;r=z,L&&("string"==typeof r||"number"==typeof r)&&(r=(0,n.jsx)("a",{children:r}));let W=l.default.useContext(h.AppRouterContext),k=!1!==T,$=!1===T?"none":!0===T?"full":"auto",F="none"!==$?"auto"===$?m.FetchStrategy.PPR:m.FetchStrategy.Full:m.FetchStrategy.PPR,j="string"==typeof(i=b||x)?i:(0,a.formatUrl)(i);if(L){if(r?.$$typeof===Symbol.for("react.lazy"))throw Object.defineProperty(Error("`<Link legacyBehavior>` received a direct child that is either a Server Component, or JSX that was loaded with React.lazy(). This is not supported. Either remove legacyBehavior, or make the direct child a Client Component that renders the Link's `<a>` tag."),"__NEXT_ERROR_CODE",{value:"E863",enumerable:!1,configurable:!0});s=l.default.Children.only(r)}let H=L?s&&"object"==typeof s&&s.ref:B,V,G=l.default.useCallback(e=>(null!==W&&(w.current=(0,f.mountLinkInstance)(e,j,W,F,k,y,V)),()=>{w.current&&((0,f.unmountLinkForCurrentNavigation)(w.current),w.current=null),(0,f.unmountPrefetchableInstance)(e)}),[k,j,W,F,y,V]),U={ref:(0,u.useMergedRef)(G,H),onClick(t){L||"function"!=typeof E||E(t),L&&s.props&&"function"==typeof s.props.onClick&&s.props.onClick(t),!W||t.defaultPrevented||function(t,i,r,s,o,n,a,h="none"){if("u">typeof window){let u,{nodeName:c}=t.currentTarget;if("A"===c.toUpperCase()&&((u=t.currentTarget.getAttribute("target"))&&"_self"!==u||t.metaKey||t.ctrlKey||t.shiftKey||t.altKey||t.nativeEvent&&2===t.nativeEvent.which)||t.currentTarget.hasAttribute("download"))return;if(!(0,g.isLocalURL)(i)){s&&(t.preventDefault(),location.replace(i));return}if(t.preventDefault(),n){let e=!1;if(n({preventDefault:()=>{e=!0}}),e)return}let{dispatchNavigateAction:d}=e.r(48726);l.default.startTransition(()=>{d(i,s?"replace":"push",!1===o?p.ScrollBehavior.NoScroll:p.ScrollBehavior.Default,r.current,a,h)})}}(t,j,w,P,M,A,D,$)},onMouseEnter(e){L||"function"!=typeof _||_(e),L&&s.props&&"function"==typeof s.props.onMouseEnter&&s.props.onMouseEnter(e),W&&k&&(0,f.onNavigationIntent)(e.currentTarget,!0===I)},onTouchStart:function(e){L||"function"!=typeof N||N(e),L&&s.props&&"function"==typeof s.props.onTouchStart&&s.props.onTouchStart(e),W&&k&&(0,f.onNavigationIntent)(e.currentTarget,!0===I)}};return(0,c.isAbsoluteUrl)(j)?U.href=j:L&&!C&&("a"!==s.type||"href"in s.props)||(U.href=(0,d.addBasePath)(j)),o=L?l.default.cloneElement(s,U):(0,n.jsx)("a",{...O,...U,children:r}),(0,n.jsx)(S.Provider,{value:v,children:o})}let S=(0,l.createContext)(f.IDLE_LINK_STATUS),y=()=>(0,l.useContext)(S);("function"==typeof i.default||"object"==typeof i.default&&null!==i.default)&&void 0===i.default.__esModule&&(Object.defineProperty(i.default,"__esModule",{value:!0}),Object.assign(i.default,i),t.exports=i.default)},27098,(e,t,i)=>{"use strict";Object.defineProperty(i,"__esModule",{value:!0}),Object.defineProperty(i,"useMergedRef",{enumerable:!0,get:function(){return s}});let r=e.r(87125);function s(e,t){let i=(0,r.useRef)(null),s=(0,r.useRef)(null);return(0,r.useCallback)(r=>{if(null===r){let e=i.current;e&&(i.current=null,e());let t=s.current;t&&(s.current=null,t())}else e&&(i.current=o(e,r)),t&&(s.current=o(t,r))},[e,t])}function o(e,t){if("function"!=typeof e)return e.current=t,()=>{e.current=null};{let i=e(t);return"function"==typeof i?i:()=>e(null)}}("function"==typeof i.default||"object"==typeof i.default&&null!==i.default)&&void 0===i.default.__esModule&&(Object.defineProperty(i.default,"__esModule",{value:!0}),Object.assign(i.default,i),t.exports=i.default)},35754,(e,t,i)=>{"use strict";e.i(25218),Object.defineProperty(i,"__esModule",{value:!0});var r={DecodeError:function(){return v},MiddlewareNotFoundError:function(){return x},MissingStaticPage:function(){return w},NormalizeError:function(){return S},PageNotFoundError:function(){return y},SP:function(){return g},ST:function(){return m},WEB_VITALS:function(){return o},execOnce:function(){return n},getDisplayName:function(){return c},getLocationOrigin:function(){return h},getURL:function(){return u},isAbsoluteUrl:function(){return a},isResSent:function(){return d},loadGetInitialProps:function(){return f},normalizeRepeatedSlashes:function(){return p},stringifyError:function(){return b}};for(var s in r)Object.defineProperty(i,s,{enumerable:!0,get:r[s]});let o=["CLS","FCP","FID","INP","LCP","TTFB"];function n(e){let t,i=!1;return(...r)=>(i||(i=!0,t=e(...r)),t)}let l=/^[a-zA-Z][a-zA-Z\d+\-.]*?:/,a=e=>{let t=e.charCodeAt(0);return!!(t>=65&&t<=90||t>=97&&t<=122)&&l.test(e)};function h(){let{protocol:e,hostname:t,port:i}=window.location;return`${e}//${t}${i?":"+i:""}`}function u(){let{href:e}=window.location,t=h();return e.substring(t.length)}function c(e){return"string"==typeof e?e:e.displayName||e.name||"Unknown"}function d(e){return e.finished||e.headersSent}function p(e){let t=e.split("?");return t[0].replace(/\\/g,"/").replace(/\/\/+/g,"/")+(t[1]?`?${t.slice(1).join("?")}`:"")}async function f(e,t){let i=t.res||t.ctx&&t.ctx.res;if(!e.getInitialProps)return t.ctx&&t.Component?{pageProps:await f(t.Component,t.ctx)}:{};let r=await e.getInitialProps(t);if(i&&d(i))return r;if(!r)throw Object.defineProperty(Error(`"${c(e)}.getInitialProps()" should resolve to an object. But found "${r}" instead.`),"__NEXT_ERROR_CODE",{value:"E1025",enumerable:!1,configurable:!0});return r}let g="u">typeof performance,m=g&&["mark","measure","getEntriesByName"].every(e=>"function"==typeof performance[e]);class v extends Error{}class S extends Error{}class y extends Error{constructor(e){super(),this.code="ENOENT",this.name="PageNotFoundError",this.message=`Cannot find module for page: ${e}`}}class w extends Error{constructor(e,t){super(),this.message=`Failed to load static file for page: ${e} ${t}`}}class x extends Error{constructor(){super(),this.code="ENOENT",this.message="Cannot find the middleware module"}}function b(e){return JSON.stringify({message:e.message,stack:e.stack})}},82996,(e,t,i)=>{"use strict";Object.defineProperty(i,"__esModule",{value:!0}),Object.defineProperty(i,"isLocalURL",{enumerable:!0,get:function(){return o}});let r=e.r(35754),s=e.r(16991);function o(e){if(!(0,r.isAbsoluteUrl)(e))return!0;try{let t=(0,r.getLocationOrigin)(),i=new URL(e,t);return i.origin===t&&(0,s.hasBasePath)(i.pathname)}catch(e){return!1}}},77772,(e,t,i)=>{"use strict";Object.defineProperty(i,"__esModule",{value:!0});var r={assign:function(){return a},searchParamsToUrlQuery:function(){return o},urlQueryToSearchParams:function(){return l}};for(var s in r)Object.defineProperty(i,s,{enumerable:!0,get:r[s]});function o(e){let t={};for(let[i,r]of e.entries()){let e=t[i];void 0===e?t[i]=r:Array.isArray(e)?e.push(r):t[i]=[e,r]}return t}function n(e){return"string"==typeof e?e:("number"!=typeof e||isNaN(e))&&"boolean"!=typeof e?"":String(e)}function l(e){let t=new URLSearchParams;for(let[i,r]of Object.entries(e))if(Array.isArray(r))for(let e of r)t.append(i,n(e));else t.set(i,n(r));return t}function a(e,...t){for(let i of t){for(let t of i.keys())e.delete(t);for(let[t,r]of i.entries())e.append(t,r)}return e}},54077,(e,t,i)=>{"use strict";e.i(25218),Object.defineProperty(i,"__esModule",{value:!0});var r={formatUrl:function(){return l},formatWithValidation:function(){return h},urlObjectKeys:function(){return a}};for(var s in r)Object.defineProperty(i,s,{enumerable:!0,get:r[s]});let o=e.r(35391)._(e.r(77772)),n=/https?|ftp|gopher|file/;function l(e){let{auth:t,hostname:i}=e,r=e.protocol||"",s=e.pathname||"",l=e.hash||"",a=e.query||"",h=!1;t=t?encodeURIComponent(t).replace(/%3A/i,":")+"@":"",e.host?h=t+e.host:i&&(h=t+(~i.indexOf(":")?`[${i}]`:i),e.port&&(h+=":"+e.port)),a&&"object"==typeof a&&(a=String(o.urlQueryToSearchParams(a)));let u=e.search||a&&`?${a}`||"";return r&&!r.endsWith(":")&&(r+=":"),e.slashes||(!r||n.test(r))&&!1!==h?(h="//"+(h||""),s&&"/"!==s[0]&&(s="/"+s)):h||(h=""),l&&"#"!==l[0]&&(l="#"+l),u&&"?"!==u[0]&&(u="?"+u),s=s.replace(/[?#]/g,encodeURIComponent),u=u.replace("#","%23"),`${r}${h}${s}${u}${l}`}let a=["auth","hash","host","hostname","href","path","pathname","port","protocol","query","search","slashes"];function h(e){return l(e)}},31516,e=>{"use strict";var t=e.i(11003),i=e.i(76146),r=e.i(87125),s=e.i(18546),o=e.i(35045),n=e.i(17349);let l=e=>n.BASE&&e?.startsWith("/")&&!e.startsWith(`${n.BASE}/`)?`${n.BASE}${e}`:e,a={mode:"ordered",pixelSize:2,gridSize:3,threshold:.5,brightness:0,contrast:1,darkColor:"#0d0d0d",lightColor:"#f3f1ec",matrixSize:4,lumPixelSize:1,pixelSizeMultiplier:5,scaleResolution:1,ditherAmount:1,bias:0,biasNoiseScale:10,biasNoiseSpeed:.75,biasPulseSpeed:.5,biasNoiseWeight:.5,biasPulseWeight:.05,biasAnimationStrength:1.25,trailDecay:.85,trailRadius:.15,trailIntensityMultiplier:5},h=null,u=new Set,c=!1;function d(e){u.forEach(t=>{t.visible&&t.onPointerMove(e)})}let p=null;function f(){return h||(h=new s.WebGLRenderer({antialias:!1,alpha:!0,premultipliedAlpha:!1})).setPixelRatio(1),h}let g=`
void main() {
  gl_Position = vec4(position, 1.0);
}
`,m=`
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
`;class S{constructor(e,t){this.canvas=e,this.img=t,this.ctx=e.getContext("2d"),this.settings={...a},this.width=0,this.height=0,this.texture=null,this.mode=null,this.grid=null,this.matrix=null,this.time=0,this.raf=0,this.visible=!0,this.mouse=new o.Vector2,this.strength=0,this.prevMouse=new o.Vector2,this.hasMouse=!1,this.trailFrames=0,this.trailA=null,this.trailB=null,this.trailMaterial=null,this.trailMesh=null,this.scene=new o.Scene,this.trailScene=new o.Scene,this.camera=new o.Camera,this.mesh=new o.Mesh(new o.PlaneGeometry(2,2),null),this.mesh.frustumCulled=!1,this.scene.add(this.mesh),this.createMaterial()}createMaterial(){var e,t;this.mode!==this.settings.mode&&(cancelAnimationFrame(this.raf),this.raf=0),this.material?.dispose(),this.mode=this.settings.mode;let i={uTexture:{value:this.texture},uResolution:{value:new o.Vector2(this.width,this.height)},uCoverScale:{value:new o.Vector2(1,1)},uBrightness:{value:this.settings.brightness},uContrast:{value:this.settings.contrast},uThreshold:{value:this.settings.threshold},uDarkColor:{value:new o.Color().setStyle(this.settings.darkColor,o.NoColorSpace)},uLightColor:{value:new o.Color().setStyle(this.settings.lightColor,o.NoColorSpace)},uTime:{value:this.time}};"ordered"===this.mode?(this.matrix=this.settings.matrixSize,this.material=new o.ShaderMaterial({glslVersion:o.GLSL3,uniforms:{...i,uTrail:{value:null},uTrailIntensityMultiplier:{value:1},uPixelSize:{value:1},uPixelSizeMultiplier:{value:3},uScaleResolution:{value:1},uDitherAmount:{value:1},uBias:{value:0},uBiasNoiseScale:{value:3},uBiasNoiseSpeed:{value:.3},uBiasPulseSpeed:{value:1},uBiasNoiseWeight:{value:.15},uBiasPulseWeight:{value:.05},uBiasAnimationStrength:{value:1}},vertexShader:g,fragmentShader:(e=this.matrix,`
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
`)})),this.mesh.material=this.material}ensureTrailMaterial(){this.trailMaterial||(this.trailMaterial=new o.ShaderMaterial({glslVersion:o.GLSL3,uniforms:{uPrev:{value:null},uResolution:{value:new o.Vector2},uMouse:{value:new o.Vector2},uPrevMouse:{value:new o.Vector2},uTrailDecay:{value:.94},uTrailRadius:{value:1},uBrushStrength:{value:0}},vertexShader:g,fragmentShader:m}),this.trailMesh=new o.Mesh(new o.PlaneGeometry(2,2),this.trailMaterial),this.trailMesh.frustumCulled=!1,this.trailScene.add(this.trailMesh))}load(e){let t=()=>{this.texture?.dispose();let t=new o.Texture(this.img);t.flipY=!1,t.premultiplyAlpha=!1,t.minFilter=o.LinearMipmapLinearFilter,t.magFilter=o.LinearFilter,t.generateMipmaps=!0,t.needsUpdate=!0,this.texture=t,this.material.uniforms.uTexture.value=t,e()};this.img.complete&&this.img.naturalWidth>0?t():this.img.addEventListener("load",t,{once:!0})}resize(){let e=this.settings.pixelSize,t=Math.max(1,Math.round(this.canvas.clientWidth/e)),i=Math.max(1,Math.round(this.canvas.clientHeight/e));return(t!==this.width||i!==this.height||this.canvas.width!==t)&&(this.width=t,this.height=i,this.canvas.width=t,this.canvas.height=i,"ordered"===this.mode&&this.ensureTargets(),!0)}coverScale(){let e=(this.img.naturalWidth||1)/(this.img.naturalHeight||1),t=this.width/this.height;return e>t?new o.Vector2(t/e,1):new o.Vector2(1,e/t)}makeTarget(){let e=f().capabilities.isWebGL2?o.HalfFloatType:o.UnsignedByteType;return new o.WebGLRenderTarget(this.width,this.height,{type:e,minFilter:o.LinearFilter,magFilter:o.LinearFilter,wrapS:o.ClampToEdgeWrapping,wrapT:o.ClampToEdgeWrapping,depthBuffer:!1,stencilBuffer:!1})}ensureTargets(){if(this.trailA&&this.trailA.width===this.width&&this.trailA.height===this.height)return;this.disposeTargets(),this.trailA=this.makeTarget(),this.trailB=this.makeTarget();let e=f();e.setRenderTarget(this.trailA),e.setClearColor(0,1),e.clear(),e.setRenderTarget(this.trailB),e.clear(),e.setRenderTarget(null)}disposeTargets(){this.trailA?.dispose(),this.trailB?.dispose(),this.trailA=null,this.trailB=null}renderTrail(e){let t=this.trailMaterial.uniforms;t.uResolution.value.set(this.width,this.height),t.uPrev.value=this.trailA.texture,t.uMouse.value.set(this.mouse.x,this.height-this.mouse.y),t.uPrevMouse.value.set(this.prevMouse.x,this.height-this.prevMouse.y),t.uTrailDecay.value=this.settings.trailDecay,t.uTrailRadius.value=Math.min(this.width,this.height)*this.settings.trailRadius;let i=Math.min(1,this.mouse.distanceTo(this.prevMouse)/(.05*Math.min(this.width,this.height)));t.uBrushStrength.value=i,e.setRenderTarget(this.trailB),e.render(this.trailScene,this.camera);let r=this.trailA;this.trailA=this.trailB,this.trailB=r,this.prevMouse.copy(this.mouse)}needsRebuild(){return this.mode!==this.settings.mode||("diffusion"===this.settings.mode?this.grid!==this.settings.gridSize:this.matrix!==this.settings.matrixSize)}render(){if(!this.texture)return;this.needsRebuild()&&this.createMaterial();let e=f();e.setSize(this.width,this.height,!1);let t=this.material.uniforms;t.uResolution.value.set(this.width,this.height),t.uCoverScale.value.copy(this.coverScale()),t.uBrightness.value=this.settings.brightness,t.uContrast.value=this.settings.contrast,t.uThreshold.value=this.settings.threshold,t.uDarkColor.value.setStyle(this.settings.darkColor,o.NoColorSpace),t.uLightColor.value.setStyle(this.settings.lightColor,o.NoColorSpace),t.uTime.value=this.time,"ordered"===this.mode?(this.ensureTargets(),this.renderTrail(e),t.uTrail.value=this.trailA.texture,t.uTrailIntensityMultiplier.value=this.settings.trailIntensityMultiplier,t.uPixelSize.value=this.settings.lumPixelSize,t.uPixelSizeMultiplier.value=this.settings.pixelSizeMultiplier,t.uScaleResolution.value=this.settings.scaleResolution,t.uDitherAmount.value=this.settings.ditherAmount,t.uBias.value=this.settings.bias,t.uBiasNoiseScale.value=this.settings.biasNoiseScale,t.uBiasNoiseSpeed.value=this.settings.biasNoiseSpeed,t.uBiasPulseSpeed.value=this.settings.biasPulseSpeed,t.uBiasNoiseWeight.value=this.settings.biasNoiseWeight,t.uBiasPulseWeight.value=this.settings.biasPulseWeight,t.uBiasAnimationStrength.value=this.settings.biasAnimationStrength):(t.uMouse.value.copy(this.mouse),t.uMouseStrength.value=this.strength,t.uMouseRadius.value=.35*Math.min(this.width,this.height)),e.setClearColor(0,0),e.setRenderTarget(null),e.render(this.scene,this.camera),this.ctx.clearRect(0,0,this.width,this.height),this.ctx.drawImage(e.domElement,0,0)}visibleHoverRect(){let e=this.canvas.getBoundingClientRect(),t=e.left,i=e.top,r=e.right,s=e.bottom;if(r<=t||s<=i)return null;let o=this.canvas.parentElement;for(;o&&o!==document.body&&o!==document.documentElement;){let{overflow:e,overflowX:n,overflowY:l}=getComputedStyle(o);if("visible"!==e||"visible"!==n||"visible"!==l){let e=o.getBoundingClientRect();if(e.width>0&&e.height>0&&(t=Math.max(t,e.left),i=Math.max(i,e.top),r=Math.min(r,e.right),s=Math.min(s,e.bottom),r<=t||s<=i))return null}o=o.parentElement}return{left:t,top:i,right:r,bottom:s}}onPointerMove(e){if(!this.visible)return;let t=this.visibleHoverRect();if(!t||e.clientX<t.left||e.clientX>t.right||e.clientY<t.top||e.clientY>t.bottom)return;let i=this.canvas.getBoundingClientRect();if(!i.width||!i.height)return;let r=e.clientX-i.left,s=e.clientY-i.top;this.mouse.set(r/i.width*this.width,s/i.height*this.height),this.hasMouse||(this.prevMouse.copy(this.mouse),this.hasMouse=!0),this.visible=!0,this.strength=1,this.trailFrames=120,this.animate()}animate(){if(this.raf)return;let e="ordered"===this.mode&&0!==this.settings.biasAnimationStrength;if(!("diffusion"===this.mode&&this.strength>0||"ordered"===this.mode&&(e||this.trailFrames>0)))return void this.render();let t=performance.now(),i=e=>{let r=Math.min(.05,(e-t)/1e3);if(t=e,!this.visible){this.raf=0;return}"diffusion"===this.mode?(this.time+=r,this.strength*=Math.exp(-(2.5*r)),this.render(),this.strength>.02?this.raf=requestAnimationFrame(i):(this.strength=0,this.raf=0,this.render())):(this.time+=r,this.trailFrames>0&&(this.trailFrames-=1),this.render(),0!==this.settings.biasAnimationStrength||this.trailFrames>0?this.raf=requestAnimationFrame(i):(this.raf=0,this.render()))};this.raf=requestAnimationFrame(i)}dispose(){cancelAnimationFrame(this.raf),this.raf=0,this.visible=!1,this.texture?.dispose(),this.material?.dispose(),this.trailMaterial?.dispose(),this.trailMesh?.geometry.dispose(),this.disposeTargets(),this.mesh.geometry.dispose()}}let y=new Set,w=null,x=null,b="ditherImageDebug";async function z(){if(w)return;w={};let t=localStorage.getItem(b);x={...a,...t?JSON.parse(t):{}};let{GUI:i}=await e.A(62127);w=new i({title:"DitherImage"});let r=()=>{localStorage.setItem(b,JSON.stringify(x)),y.forEach(e=>e.redraw())},s=w.addFolder("General");s.add(x,"mode",["diffusion","ordered"]).onChange(()=>{v(),r()}),s.add(x,"pixelSize",1,16,1).onChange(r),s.add(x,"brightness",-1,1).onChange(r),s.add(x,"contrast",0,3).onChange(r),s.addColor(x,"darkColor").onChange(r),s.addColor(x,"lightColor").onChange(r);let o=w.addFolder("Dither"),n=o.add(x,"threshold",0,1).onChange(r),l=o.add(x,"gridSize",2,8,1).onChange(r),h=o.add(x,"matrixSize",{"2x2":2,"4x4":4}).onChange(r),u=o.add(x,"lumPixelSize",1,8,1).onChange(r),c=o.add(x,"pixelSizeMultiplier",1,8,.1).onChange(r),d=o.add(x,"scaleResolution",1,8,1).onChange(r),p=o.add(x,"ditherAmount",0,1,.01).onChange(r),f=o.add(x,"bias",-1,1,.01).onChange(r),g=w.addFolder("Bias animation");g.add(x,"biasNoiseScale",0,10,.1).onChange(r),g.add(x,"biasNoiseSpeed",0,2,.01).onChange(r),g.add(x,"biasPulseSpeed",0,5,.01).onChange(r),g.add(x,"biasNoiseWeight",0,1,.01).onChange(r),g.add(x,"biasPulseWeight",0,1,.01).onChange(r),g.add(x,"biasAnimationStrength",0,2,.01).onChange(r);let m=w.addFolder("Trail");function v(){let e="ordered"===x.mode;l.show(!e),h.show(e),u.show(e),c.show(e),d.show(e),p.show(e),f.show(e),n.show(!0),e?g.show():g.hide(),e?m.show():m.hide()}m.add(x,"trailDecay",.8,.995,.001).onChange(r),m.add(x,"trailRadius",.01,.3,.005).onChange(r),m.add(x,"trailIntensityMultiplier",0,3,.05).onChange(r),v();let S={showOriginal:!1,copyDefaults:()=>{var e;return navigator.clipboard.writeText((e=x,`const DEFAULTS = {
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
};`))},reset:()=>{Object.assign(x,a),w.controllersRecursive().forEach(e=>e.updateDisplay()),v(),r()}};w.add(S,"showOriginal").name("show original").onChange(e=>y.forEach(t=>t.showOriginal(e))),w.add(S,"copyDefaults").name("copy defaults"),w.add(S,"reset"),y.forEach(e=>e.redraw())}let T=(0,r.forwardRef)(function({src:e,alt:s="",className:o,style:n,onReady:h,...f},g){let m=(0,r.useRef)(null),v=(0,r.useRef)(null),w=(0,r.useRef)(null),b=(0,r.useRef)(f),T=(0,r.useRef)(h),C=(0,r.useRef)(!1),P=(0,r.useRef)(!1);return b.current=f,T.current=h,(0,r.useImperativeHandle)(g,()=>({setSrc(e){e=l(e);let t=m.current;t&&t.getAttribute("src")!==e&&(t.src=e,w.current?.reload())},redraw:()=>w.current?.redraw()})),(0,r.useEffect)(()=>{let e=v.current,t=m.current;if(!function(){if(null!==p)return p;try{p=!!document.createElement("canvas").getContext("webgl2")}catch{p=!1}return p}()){t.style.opacity="1",e.style.display="none",w.current={redraw(){},showOriginal(){},reload(){}},C.current||(C.current=!0,T.current?.());return}let r=new S(e,t),s=!1;function o(){r.settings={...a,...b.current},x&&(r.settings={...r.settings,...x})}function n(){s&&(o(),r.resize(),r.render(),r.animate(),e.classList.add(i.default.ready),t.style.opacity="0",C.current||(C.current=!0,T.current?.()))}function l(){r.load(()=>{s=!0,n()})}w.current={redraw:n,showOriginal:i=>{e.style.visibility=i?"hidden":"",t.style.opacity=i?"1":"0"},reload:l},l();let h=new ResizeObserver(()=>{s&&(o(),r.resize()&&(r.render(),r.animate()))});h.observe(e);let f=new IntersectionObserver(e=>{r.visible=e[0].isIntersecting,r.visible&&s&&n()},{threshold:0});return f.observe(e),u.add(r),c||(c=!0,window.addEventListener("pointermove",d,{passive:!0})),y.add(w.current),"true"===new URLSearchParams(window.location.search).get("debugDitherImage")&&z(),()=>{h.disconnect(),f.disconnect(),u.delete(r),!u.size&&c&&(c=!1,window.removeEventListener("pointermove",d)),y.delete(w.current),r.dispose()}},[]),(0,r.useEffect)(()=>{if(!P.current){P.current=!0;return}w.current?.reload?.()},[e]),(0,r.useEffect)(()=>{w.current?.redraw()},[JSON.stringify(f)]),(0,t.jsxs)("div",{className:o?`${i.default.wrapper} ${o}`:i.default.wrapper,style:n,children:[(0,t.jsx)("img",{ref:m,src:l(e),alt:s,className:i.default.img}),(0,t.jsx)("canvas",{ref:v,"aria-hidden":"true",className:i.default.canvas})]})});e.s(["default",0,T])},76146,e=>{e.v({canvas:"DitherImage-module__MV5TGG__canvas",img:"DitherImage-module__MV5TGG__img",ready:"DitherImage-module__MV5TGG__ready",wrapper:"DitherImage-module__MV5TGG__wrapper"})}]);