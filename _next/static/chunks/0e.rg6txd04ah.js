(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,98443,e=>{"use strict";var t=e.i(55350);e.s(["extend",()=>t.e])},71320,e=>{"use strict";var t=e.i(55350);e.s(["createPortal",()=>t.o])},14714,e=>{"use strict";var t=e.i(55350);e.s(["applyProps",()=>t.s])},318,e=>{"use strict";var t=e.i(55350);e.s(["useLoader",()=>t.G])},71611,e=>{"use strict";function t(){return(t=Object.assign.bind()).apply(null,arguments)}e.s(["default",()=>t])},3782,e=>{"use strict";var t=e.i(64556),r=e.i(46648),i=e.i(21348);let n=t.forwardRef(({children:e,enabled:n=!0,speed:o=1,rotationIntensity:l=1,floatIntensity:s=1,floatingRange:a=[-.1,.1],autoInvalidate:c=!1,...u},f)=>{let m=t.useRef(null);t.useImperativeHandle(f,()=>m.current,[]);let h=t.useRef(1e4*Math.random());return(0,r.useFrame)(e=>{var t,r;if(!n||0===o)return;c&&e.invalidate();let u=h.current+e.clock.elapsedTime;m.current.rotation.x=Math.cos(u/4*o)/8*l,m.current.rotation.y=Math.sin(u/4*o)/8*l,m.current.rotation.z=Math.sin(u/4*o)/20*l;let f=Math.sin(u/4*o)/10;f=i.MathUtils.mapLinear(f,-.1,.1,null!=(t=null==a?void 0:a[0])?t:-.1,null!=(r=null==a?void 0:a[1])?r:.1),m.current.position.y=f*s,m.current.updateMatrix()}),t.createElement("group",u,t.createElement("group",{ref:m,matrixAutoUpdate:!1},e))});e.s(["Float",0,n])},96729,e=>{"use strict";var t=e.i(44180),r=e.i(1529),i=e.i(46648),n=e.i(92958),o=e.i(44803),l=e.i(3782),s=e.i(79867),a=e.i(43050),c=e.i(64556),u=e.i(21348);let f=`
varying vec2  vEtUv;
varying vec3  vEtObjNormal;
`,m=`
  vEtUv = uv;
  vEtObjNormal = normalize(normal);
`,h=`
uniform float uTime;
uniform float uFlow;        // 0..1 scroll-ease: 1 = full flow, low = near-still
uniform vec3  uCrest;       // mirror highlight silver
uniform vec3  uAmethyst;    // cool jewel rim glint
uniform vec3  uShadow;      // plum shadow trough
varying vec2  vEtUv;
varying vec3  vEtObjNormal;
`,d=`
  // Along-ribbon coordinate (tube UV.x runs the length of the path).
  float along = vEtUv.x;

  // A soft sheen band travelling endlessly along the loop. Two offset bands so
  // the highlight feels continuous as it wraps the figure-eight.
  float t = uTime * (0.04 + 0.10 * uFlow);
  float band1 = pow(0.5 + 0.5 * sin((along - t) * 6.2831 * 3.0), 6.0);
  float band2 = pow(0.5 + 0.5 * sin((along - t * 0.6 + 0.33) * 6.2831 * 2.0), 8.0);
  float sheen = clamp(band1 * 0.7 + band2 * 0.5, 0.0, 1.0);

  // Cool fresnel rim → amethyst at grazing angles.
  vec3 V = normalize(vViewPosition);
  float fres = pow(1.0 - clamp(dot(normalize(vEtObjNormal), V), 0.0, 1.0), 2.6);

  // Compose: lift crests with the silver sheen, deepen troughs to plum, glint
  // the rim amethyst. Multiply-blend over the PBR env color to keep reflections.
  vec3 base = gl_FragColor.rgb;
  vec3 lifted = mix(base, base * 1.35 + uCrest * 0.5, sheen);
  lifted = mix(lifted, lifted * mix(uShadow, vec3(1.0), 0.65), (1.0 - sheen) * 0.18);
  lifted = mix(lifted, mix(lifted, uAmethyst, 0.7), fres * 0.55);
  lifted += uCrest * sheen * 0.12;        // subtle additive crest glow
  lifted += uAmethyst * fres * 0.1;       // subtle additive amethyst rim

  gl_FragColor.rgb = lifted;
`,v={crest:new u.Color("#f3f1f6"),amethyst:new u.Color("#9a7bd6"),shadow:new u.Color("#3a2f4d")};class g extends u.Curve{scale;constructor(e=1){super(),this.scale=e}getPoint(e,t=new u.Vector3){let r=e*Math.PI*2,i=Math.sin(r),n=Math.sin(r)*Math.cos(r),o=.55*Math.cos(r);return t.set(1.35*i,1.6*n,o).multiplyScalar(this.scale)}}function p({pointer:e,lite:r,flowRef:n}){let o=(0,c.useRef)(null),s=(0,c.useRef)(null),a=(0,c.useRef)({uTime:{value:0},uFlow:{value:1},uCrest:{value:v.crest},uAmethyst:{value:v.amethyst},uShadow:{value:v.shadow}}),y=(0,c.useRef)({x:0,y:0,s:0}),x=(0,c.useRef)(1),b=(0,c.useMemo)(()=>{let e=new g(1),t=r?220:420,i=r?18:32;return new u.TubeGeometry(e,t,.14,i,!0)},[r]),w=(0,c.useMemo)(()=>e=>{Object.assign(e.uniforms,a.current),e.vertexShader=e.vertexShader.replace("#include <common>",`#include <common>
${f}`).replace("#include <begin_vertex>",`#include <begin_vertex>
${m}`),e.fragmentShader=e.fragmentShader.replace("#include <common>",`#include <common>
${h}`).replace("#include <dithering_fragment>",`${d}
#include <dithering_fragment>`)},[]);return(0,i.useFrame)(({clock:t},r)=>{let i=Math.min(r,1/30);a.current.uTime.value=t.getElapsedTime();let l=n.current??1;x.current+=(l-x.current)*Math.min(1,2*i),a.current.uFlow.value=x.current;let s=e.current??{x:0,y:0,active:0},c=1-Math.pow(.0022,i);y.current.x+=(s.x-y.current.x)*c,y.current.y+=(s.y-y.current.y)*c,y.current.s+=(s.active-y.current.s)*Math.min(1,2.6*i);let u=o.current;if(u){let e=x.current;u.rotation.y+=.16*i*(.4+.6*e),u.rotation.z=.08*Math.sin(.1*t.getElapsedTime()),u.rotation.x=.07*Math.sin(.13*t.getElapsedTime())+.5*y.current.y*y.current.s,u.rotation.y+=.012*y.current.x*y.current.s}}),(0,t.jsx)(l.Float,{speed:.7,rotationIntensity:.1,floatIntensity:.4,children:(0,t.jsx)("mesh",{ref:o,geometry:b,scale:1.55,children:(0,t.jsx)("meshPhysicalMaterial",{ref:s,metalness:1,roughness:.08,envMapIntensity:1.7,clearcoat:1,clearcoatRoughness:.12,transmission:.12*!r,thickness:.6,ior:1.4,color:"#cfcad8",onBeforeCompile:w})})})}function y({lite:e}){return(0,t.jsxs)(n.Environment,{resolution:e?128:256,frames:1,children:[(0,t.jsx)(o.Lightformer,{form:"rect",intensity:4,color:"#eef0f6",position:[-3.5,3.6,2.2],rotation:[-Math.PI/5,0,0],scale:[7,10,1]}),(0,t.jsx)(o.Lightformer,{form:"rect",intensity:2.6,color:"#9a7bd6",position:[4,.5,1.5],rotation:[0,-Math.PI/2.3,0],scale:[7,7,1]}),(0,t.jsx)(o.Lightformer,{form:"circle",intensity:1.3,color:"#5b3f8a",position:[-2.5,-3,-3],scale:[8,8,1]}),(0,t.jsx)(o.Lightformer,{form:"ring",intensity:2.6,color:"#ffffff",position:[1.5,2.4,-4],scale:[4,4,1]}),(0,t.jsx)(o.Lightformer,{form:"circle",intensity:1.6,color:"#b9bcc8",position:[0,-2.4,2.5],scale:[5,5,1]})]})}e.s(["default",0,function({lite:e=!1,flowRef:i}){let n=(0,c.useRef)({x:0,y:0,active:0}),o=(0,c.useRef)(1);return(0,t.jsx)("div",{className:"absolute inset-0",onPointerMove:e=>{let t=e.currentTarget.getBoundingClientRect();n.current.x=(e.clientX-t.left)/t.width*2-1,n.current.y=-((e.clientY-t.top)/t.height*2-1),n.current.active=1},onPointerLeave:()=>{n.current.active=0},children:(0,t.jsxs)(r.Canvas,{camera:{position:[0,0,4.8],fov:40},dpr:[1,2],gl:{antialias:!0,alpha:!0,powerPreference:"high-performance",toneMapping:u.ACESFilmicToneMapping},style:{position:"absolute",inset:0},children:[(0,t.jsx)("ambientLight",{intensity:.3}),(0,t.jsx)("directionalLight",{position:[-4,5,3],intensity:1.1,color:"#eef0f8"}),(0,t.jsx)(y,{lite:e}),(0,t.jsx)(p,{pointer:n,lite:e,flowRef:i??o}),(0,t.jsxs)(s.EffectComposer,{enableNormalPass:!1,children:[(0,t.jsx)(s.Bloom,{intensity:e?.7:1,luminanceThreshold:.62,luminanceSmoothing:.2,mipmapBlur:!0,kernelSize:e?a.KernelSize.MEDIUM:a.KernelSize.LARGE}),(0,t.jsx)(s.Vignette,{eskil:!1,offset:.3,darkness:.7})]})]})})}],96729)},55191,e=>{e.n(e.i(96729))}]);