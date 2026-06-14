(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,98443,e=>{"use strict";var t=e.i(55350);e.s(["extend",()=>t.e])},71320,e=>{"use strict";var t=e.i(55350);e.s(["createPortal",()=>t.o])},14714,e=>{"use strict";var t=e.i(55350);e.s(["applyProps",()=>t.s])},318,e=>{"use strict";var t=e.i(55350);e.s(["useLoader",()=>t.G])},71611,e=>{"use strict";function t(){return(t=Object.assign.bind()).apply(null,arguments)}e.s(["default",()=>t])},3782,e=>{"use strict";var t=e.i(64556),r=e.i(46648),o=e.i(21348);let i=t.forwardRef(({children:e,enabled:i=!0,speed:n=1,rotationIntensity:l=1,floatIntensity:a=1,floatingRange:c=[-.1,.1],autoInvalidate:s=!1,...u},m)=>{let x=t.useRef(null);t.useImperativeHandle(m,()=>x.current,[]);let v=t.useRef(1e4*Math.random());return(0,r.useFrame)(e=>{var t,r;if(!i||0===n)return;s&&e.invalidate();let u=v.current+e.clock.elapsedTime;x.current.rotation.x=Math.cos(u/4*n)/8*l,x.current.rotation.y=Math.sin(u/4*n)/8*l,x.current.rotation.z=Math.sin(u/4*n)/20*l;let m=Math.sin(u/4*n)/10;m=o.MathUtils.mapLinear(m,-.1,.1,null!=(t=null==c?void 0:c[0])?t:-.1,null!=(r=null==c?void 0:c[1])?r:.1),x.current.position.y=m*a,x.current.updateMatrix()}),t.createElement("group",u,t.createElement("group",{ref:x,matrixAutoUpdate:!1},e))});e.s(["Float",0,i])},84938,e=>{"use strict";var t=e.i(44180),r=e.i(1529),o=e.i(46648),i=e.i(92958),n=e.i(44803),l=e.i(3782),a=e.i(79867),c=e.i(43050),s=e.i(64556),u=e.i(21348);let m=`
vec4 luxe_permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
vec4 luxe_taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float luxeSnoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = luxe_permute(luxe_permute(luxe_permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = luxe_taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

/* Layered fbm for richer, molten-looking flow. */
float luxeFbm(vec3 p){
  float f = 0.0;
  f += 0.55 * luxeSnoise(p);
  f += 0.30 * luxeSnoise(p * 2.03 + 11.7);
  f += 0.15 * luxeSnoise(p * 4.11 + 3.1);
  return f;
}
`,x=`
uniform float uTime;
uniform float uAmp;
uniform float uPointerStr;
uniform vec3  uPointer;     // object-space target on the unit sphere
varying float vDisp;        // displacement amount → fragment tint
varying vec3  vObjNormal;   // object normal → fresnel rim

float luxeDisplace(vec3 p){
  float t = uTime * 0.28;
  float n = luxeFbm(normalize(p) * 1.65 + vec3(0.0, 0.0, t));
  float swell = luxeSnoise(normalize(p) * 0.9 - vec3(t * 0.6));
  float pd = distance(normalize(p), normalize(uPointer));
  float impulse = exp(-pd * pd * 3.4) * uPointerStr;
  return (n * 0.62 + swell * 0.30) * uAmp + impulse * 0.42;
}
`,v=`
  float luxeE = 0.12;
  vec3 luxeT1 = normalize(cross(objectNormal, vec3(0.0, 1.0, 0.0) + 1e-4));
  vec3 luxeT2 = normalize(cross(objectNormal, luxeT1));
  float d0 = luxeDisplace(position);
  float dA = luxeDisplace(position + luxeT1 * luxeE);
  float dB = luxeDisplace(position + luxeT2 * luxeE);
  vec3 luxePert = normalize(
    objectNormal - luxeT1 * (dA - d0) / luxeE - luxeT2 * (dB - d0) / luxeE
  );
  objectNormal = normalize(mix(objectNormal, luxePert, 0.85));
  vObjNormal = objectNormal;
`,p=`
  float luxeDisp = luxeDisplace(position);
  vDisp = luxeDisp;
  transformed += normal * luxeDisp;
`,f=`
uniform vec3 uGoldDeep;
uniform vec3 uGoldMid;
uniform vec3 uGoldBright;
varying float vDisp;
varying vec3  vObjNormal;
`,d=`
  float ramp = smoothstep(-0.35, 0.45, vDisp);
  vec3 molten = mix(uGoldDeep, uGoldMid, ramp);
  molten = mix(molten, uGoldBright, smoothstep(0.25, 0.6, vDisp));

  // fresnel rim toward champagne for that liquid-metal edge glow
  vec3 V = normalize(vViewPosition);
  float fres = pow(1.0 - clamp(dot(normalize(vObjNormal), V), 0.0, 1.0), 2.4);
  molten = mix(molten, uGoldBright, fres * 0.55);

  // blend the molten tint over the env-mapped PBR color (keep reflections)
  gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * molten * 1.18, 0.62);
  gl_FragColor.rgb += uGoldBright * fres * 0.12; // subtle additive rim
`,h={deep:new u.Color("#7a5a1e"),mid:new u.Color("#d9a84e"),bright:new u.Color("#f6e4b0")};function y({pointer:e,lite:r}){let i=(0,s.useRef)(null),n=(0,s.useRef)(null),a=(0,s.useRef)({uTime:{value:0},uAmp:{value:0},uPointer:{value:new u.Vector3(0,0,1)},uPointerStr:{value:0},uGoldDeep:{value:h.deep},uGoldMid:{value:h.mid},uGoldBright:{value:h.bright}}),c=(0,s.useRef)({x:0,y:0,s:0}),g=(0,s.useMemo)(()=>e=>{Object.assign(e.uniforms,a.current),e.vertexShader=e.vertexShader.replace("#include <common>",`#include <common>
${m}
${x}`).replace("#include <beginnormal_vertex>",`#include <beginnormal_vertex>
${v}`).replace("#include <begin_vertex>",`#include <begin_vertex>
${p}`),e.fragmentShader=e.fragmentShader.replace("#include <common>",`#include <common>
${f}`).replace("#include <dithering_fragment>",`${d}
#include <dithering_fragment>`)},[]);return(0,o.useFrame)(({clock:t},r)=>{let o=a.current,i=Math.min(r,1/30);o.uTime.value=t.getElapsedTime(),o.uAmp.value+=(.4-o.uAmp.value)*Math.min(1,.9*i);let l=e.current??{x:0,y:0,active:0},s=1-Math.pow(.0018,i);c.current.x+=(l.x-c.current.x)*s,c.current.y+=(l.y-c.current.y)*s,c.current.s+=(l.active-c.current.s)*Math.min(1,2.6*i);let u=c.current.x,m=c.current.y,x=Math.sqrt(Math.max(.02,1-u*u-m*m));o.uPointer.value.set(u,m,x),o.uPointerStr.value=c.current.s;let v=n.current;v&&(v.rotation.y+=.12*i,v.rotation.x=.12*Math.sin(.18*t.getElapsedTime()))}),(0,t.jsx)(l.Float,{speed:.8,rotationIntensity:.12,floatIntensity:.4,children:(0,t.jsxs)("mesh",{ref:n,scale:1.55,children:[(0,t.jsx)("icosahedronGeometry",{args:[1,r?24:48]}),(0,t.jsx)("meshStandardMaterial",{ref:i,metalness:1,roughness:.16,envMapIntensity:1.5,color:"#caa45a",onBeforeCompile:g})]})})}function g({lite:e}){return(0,t.jsxs)(i.Environment,{resolution:e?128:256,frames:1,children:[(0,t.jsx)(n.Lightformer,{form:"rect",intensity:4,color:"#fff0cf",position:[-3.5,3.6,2.2],rotation:[-Math.PI/5,0,0],scale:[6,10,1]}),(0,t.jsx)(n.Lightformer,{form:"rect",intensity:3,color:"#f2c46a",position:[4,.5,1.5],rotation:[0,-Math.PI/2.3,0],scale:[7,7,1]}),(0,t.jsx)(n.Lightformer,{form:"circle",intensity:1.4,color:"#1f6b54",position:[-2.5,-3,-3],scale:[8,8,1]}),(0,t.jsx)(n.Lightformer,{form:"ring",intensity:2.2,color:"#ffffff",position:[1.5,2.2,-4],scale:[4,4,1]}),(0,t.jsx)(n.Lightformer,{form:"circle",intensity:1.8,color:"#caa45a",position:[0,-2.4,2.5],scale:[5,5,1]})]})}e.s(["default",0,function({lite:e=!1}){let o=(0,s.useRef)({x:0,y:0,active:0});return(0,t.jsx)("div",{className:"absolute inset-0",onPointerMove:e=>{let t=e.currentTarget.getBoundingClientRect();o.current.x=(e.clientX-t.left)/t.width*2-1,o.current.y=-((e.clientY-t.top)/t.height*2-1),o.current.active=1},onPointerLeave:()=>{o.current.active=0},children:(0,t.jsxs)(r.Canvas,{camera:{position:[0,0,4.6],fov:40},dpr:[1,2],gl:{antialias:!0,alpha:!0,powerPreference:"high-performance",toneMapping:u.ACESFilmicToneMapping},style:{position:"absolute",inset:0},children:[(0,t.jsx)("ambientLight",{intensity:.25}),(0,t.jsx)("directionalLight",{position:[-4,5,3],intensity:1.1,color:"#fff4d8"}),(0,t.jsx)(g,{lite:e}),(0,t.jsx)(y,{pointer:o,lite:e}),(0,t.jsxs)(a.EffectComposer,{enableNormalPass:!1,children:[(0,t.jsx)(a.Bloom,{intensity:e?.7:1.05,luminanceThreshold:.6,luminanceSmoothing:.2,mipmapBlur:!0,kernelSize:e?c.KernelSize.MEDIUM:c.KernelSize.LARGE}),(0,t.jsx)(a.Vignette,{eskil:!1,offset:.3,darkness:.72})]})]})})}],84938)},94002,e=>{e.n(e.i(84938))}]);