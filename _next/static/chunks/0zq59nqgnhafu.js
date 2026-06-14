(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,98443,e=>{"use strict";var t=e.i(55350);e.s(["extend",()=>t.e])},71320,e=>{"use strict";var t=e.i(55350);e.s(["createPortal",()=>t.o])},318,e=>{"use strict";var t=e.i(55350);e.s(["useLoader",()=>t.G])},14714,e=>{"use strict";var t=e.i(55350);e.s(["applyProps",()=>t.s])},43059,e=>{"use strict";var t=e.i(44180),o=e.i(1529),r=e.i(46648),i=e.i(26843),a=e.i(79867),n=e.i(43050),l=e.i(64556),s=e.i(21348);let u=`
  precision highp float;

  // Per-particle morph targets (positions for each named shape)
  attribute vec3 aFace;
  attribute vec3 aLeaf;
  attribute vec3 aRibbon;
  attribute vec3 aCloud;
  attribute float aSeed;     // 0..1 random per particle
  attribute float aScale;    // base point size multiplier

  uniform float uTime;
  uniform float uMorph;      // 0..3 continuous morph phase
  uniform float uDpr;
  uniform float uSize;       // global point-size scale
  uniform vec2  uPointer;    // -1..1 cursor in clip-ish space
  uniform float uPointerStr; // 0..1 strength (eased on enter/leave)
  uniform float uIntro;      // 0..1 reveal on mount

  varying float vLife;       // 0..1 used for color/alpha
  varying float vDepth;      // view-space depth term for color
  varying float vGlow;       // cursor proximity glow

  // Cheap hash-based 3D noise (curl-ish drift, no textures).
  vec3 hash3(vec3 p) {
    p = vec3(
      dot(p, vec3(127.1, 311.7, 74.7)),
      dot(p, vec3(269.5, 183.3, 246.1)),
      dot(p, vec3(113.5, 271.9, 124.6))
    );
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  // Smooth interpolation between the 4 morph targets along uMorph (0..3),
  // looping back to face. Uses smoothstep windows for organic dissolve.
  vec3 morphPosition(float phase) {
    // phase in [0,4); 3->4 returns to face
    vec3 a = aFace;
    vec3 b = aLeaf;
    vec3 c = aRibbon;
    vec3 d = aCloud;

    float f01 = smoothstep(0.0, 1.0, clamp(phase, 0.0, 1.0));
    float f12 = smoothstep(0.0, 1.0, clamp(phase - 1.0, 0.0, 1.0));
    float f23 = smoothstep(0.0, 1.0, clamp(phase - 2.0, 0.0, 1.0));
    float f34 = smoothstep(0.0, 1.0, clamp(phase - 3.0, 0.0, 1.0));

    vec3 p = mix(a, b, f01);
    p = mix(p, c, f12);
    p = mix(p, d, f23);
    p = mix(p, a, f34);
    return p;
  }

  void main() {
    // Continuous looping phase 0..4
    float phase = mod(uMorph, 4.0);
    vec3 pos = morphPosition(phase);

    // Organic drift — particles never sit perfectly still ("alive skin").
    float t = uTime * 0.18;
    vec3 n = hash3(pos * 0.7 + aSeed * 13.0 + t);
    float driftAmt = 0.06 + 0.04 * sin(uTime * 0.5 + aSeed * 6.2831);
    pos += n * driftAmt;

    // Dissolve burst near morph transitions (when fract(phase) ~ 0.5).
    float transition = abs(fract(phase) - 0.5); // 0 at mid-transition
    float burst = smoothstep(0.5, 0.0, transition); // 1 mid-transition
    pos += n * burst * (0.25 + 0.5 * aSeed);

    // --- Cursor flow field: gentle attraction + swirl around the pointer ---
    // Project a pointer position into the particle plane (z~0).
    vec3 pointer3 = vec3(uPointer * 1.6, 0.0);
    vec3 toP = pos - pointer3;
    float d = length(toP.xy) + 0.0001;
    float influence = uPointerStr * smoothstep(1.3, 0.0, d);
    // Swirl: rotate the in-plane offset, push slightly outward (repel).
    vec2 swirl = vec2(-toP.y, toP.x) / d;
    pos.xy += swirl * influence * 0.22;
    pos.xy += (toP.xy / d) * influence * 0.12;
    pos.z += influence * 0.25 * sin(uTime * 1.4 + aSeed * 6.2831);

    // Intro reveal — particles fly in from a dispersed cloud.
    pos = mix(aCloud * 1.4, pos, smoothstep(0.0, 1.0, uIntro));

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Point size: perspective attenuation + per-particle scale + dpr.
    float size = uSize * aScale * (0.6 + 0.7 * aSeed);
    gl_PointSize = size * uDpr * (300.0 / -mvPosition.z);
    gl_PointSize = clamp(gl_PointSize, 0.0, 14.0 * uDpr);

    // Varyings for the fragment shader.
    vLife = 0.35 + 0.65 * aSeed + burst * 0.4;
    vDepth = clamp((-mvPosition.z - 3.0) / 5.0, 0.0, 1.0);
    vGlow = influence;
  }
`,c=`
  precision highp float;

  uniform float uTime;
  uniform vec3  uColorRose;
  uniform vec3  uColorBronze;
  uniform vec3  uColorGold;
  uniform vec3  uColorDeep;

  varying float vLife;
  varying float vDepth;
  varying float vGlow;

  void main() {
    // Soft round sprite (no texture): radial falloff -> feathered dot.
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv);
    float alpha = smoothstep(0.5, 0.06, r);
    if (alpha <= 0.001) discard;

    // Brand-tinted color: depth blends deep->bronze, life lifts toward gold,
    // cursor proximity flares rose. Reads as luminous skin/light.
    vec3 col = mix(uColorDeep, uColorBronze, smoothstep(0.0, 1.0, vDepth));
    col = mix(col, uColorRose, smoothstep(0.3, 1.0, vLife));
    col = mix(col, uColorGold, vGlow * 0.8);

    // Gentle core hotspot for additive bloom pickup.
    float core = smoothstep(0.32, 0.0, r);
    col += core * 0.35 * (0.6 + 0.6 * vLife);

    float a = alpha * (0.5 + 0.5 * vLife);
    gl_FragColor = vec4(col, a);
  }
`;function f(e){let t=e;return function(){t|=0;let e=Math.imul((t=t+0x6d2b79f5|0)^t>>>15,1|t);return(((e=e+Math.imul(e^e>>>7,61|e)^e)^e>>>14)>>>0)/0x100000000}}function p({pointer:e,lite:o}){let a=(0,l.useRef)(null),n=(0,l.useRef)(0),h=(0,l.useRef)(0),m=(0,l.useRef)({x:0,y:0,s:0}),{geometry:v,uniforms:d}=(0,l.useMemo)(()=>{let e=o?Math.floor(4950):9e3,t=f(20231),r=function(e){let t=[[.34,1.18],[-.02,1.12],[-.34,.86],[-.46,.58],[-.4,.44],[-.56,.3],[-.72,.12],[-.58,0],[-.62,-.1],[-.6,-.2],[-.6,-.3],[-.5,-.46],[-.34,-.62],[-.1,-.78],[.18,-.86],[.34,-1.05],[.5,-1.05],[.5,.2],[.46,.7],[.34,1.18]],o=new Float32Array(27e3);for(let r=0;r<9e3;r++){let i,a;if(.62>e()){let o=Math.floor(e()*(t.length-1)),r=e(),n=t[o],l=t[o+1];i=n[0]+(l[0]-n[0])*r,a=n[1]+(l[1]-n[1])*r,i+=(e()-.5)*.05,a+=(e()-.5)*.05}else{let t=-.1+(e()-.5)*.7,o=.25+(e()-.5)*1.1;i=t,a=o}let n=(e()-.5)*.16;o[3*r]=1.25*i,o[3*r+1]=1.05*a,o[3*r+2]=n}return o}(f(11)),i=function(e){let t=new Float32Array(27e3);for(let o=0;o<9e3;o++){let r,i=e(),a=(i-.5)*2.4,n=.62*Math.sin(Math.PI*i)*(.85+.3*i);r=.22>e()?(e()-.5)*.04:(.5>e()?-1:1)*n*(.55>e()?1:Math.pow(e(),.6));let l=.18*Math.sin(i*Math.PI)*.9+(e()-.5)*.08;t[3*o]=1.05*r+.12*a,t[3*o+1]=a,t[3*o+2]=l}return t}(f(22)),a=function(e){let t=new Float32Array(27e3);for(let o=0;o<9e3;o++){let r=e(),i=(r-.5)*2.8,a=.55*Math.sin(r*Math.PI*2.2),n=.5*Math.cos(r*Math.PI*2.6),l=.42*Math.sin(Math.PI*r),s=(e()-.5)*2,u=a+s*l,c=n+s*l*Math.sin(r*Math.PI*3)*.8;t[3*o]=i,t[3*o+1]=u,t[3*o+2]=c+(e()-.5)*.04}return t}(f(33)),n=function(e){let t=new Float32Array(27e3);for(let o=0;o<9e3;o++){let r=1.7*Math.pow(e(),.5),i=e()*Math.PI*2,a=Math.acos(2*e()-1);t[3*o]=r*Math.sin(a)*Math.cos(i)*1.25,t[3*o+1]=r*Math.sin(a)*Math.sin(i),t[3*o+2]=r*Math.cos(a)*.5}return t}(f(44)),l=new Float32Array(e),u=new Float32Array(e);for(let o=0;o<e;o++)l[o]=t(),u[o]=.7+.9*t();let c=t=>t.subarray(0,3*e),p=new s.BufferGeometry;return p.setAttribute("position",new s.BufferAttribute(c(r),3)),p.setAttribute("aFace",new s.BufferAttribute(c(r),3)),p.setAttribute("aLeaf",new s.BufferAttribute(c(i),3)),p.setAttribute("aRibbon",new s.BufferAttribute(c(a),3)),p.setAttribute("aCloud",new s.BufferAttribute(c(n),3)),p.setAttribute("aSeed",new s.BufferAttribute(l,1)),p.setAttribute("aScale",new s.BufferAttribute(u,1)),{geometry:p,uniforms:{uTime:{value:0},uMorph:{value:0},uDpr:{value:1},uSize:{value:o?4:4.6},uPointer:{value:new s.Vector2(0,0)},uPointerStr:{value:0},uIntro:{value:0},uColorRose:{value:new s.Color("#e58a73")},uColorBronze:{value:new s.Color("#d6a878")},uColorGold:{value:new s.Color("#ecc98f")},uColorDeep:{value:new s.Color("#3a2a28")}}}},[o]),{gl:g}=(0,i.useThree)();return(0,r.useFrame)(({clock:t},o)=>{let r=a.current;if(!r)return;let i=Math.min(o,1/30),l=t.getElapsedTime();r.uniforms.uTime.value=l,r.uniforms.uDpr.value=Math.min(g.getPixelRatio(),2),n.current+=(1-n.current)*Math.min(1,.9*i),r.uniforms.uIntro.value=n.current,h.current+=.14*i,r.uniforms.uMorph.value=h.current;let s=e.current??{x:0,y:0,active:0},u=1-Math.pow(.0019,i);m.current.x+=(s.x-m.current.x)*u,m.current.y+=(s.y-m.current.y)*u,m.current.s+=(s.active-m.current.s)*Math.min(1,3*i),r.uniforms.uPointer.value.set(m.current.x,m.current.y),r.uniforms.uPointerStr.value=m.current.s}),(0,t.jsx)("points",{geometry:v,frustumCulled:!1,children:(0,t.jsx)("shaderMaterial",{ref:a,vertexShader:u,fragmentShader:c,uniforms:d,transparent:!0,depthWrite:!1,depthTest:!1,blending:s.AdditiveBlending})})}function h({children:e}){let o=(0,l.useRef)(null);return(0,r.useFrame)(({clock:e})=>{let t=o.current;if(!t)return;let r=e.getElapsedTime();t.rotation.y=.18*Math.sin(.16*r),t.rotation.x=.06*Math.sin(.12*r)}),(0,t.jsx)("group",{ref:o,children:e})}e.s(["default",0,function({lite:e=!1}){let r=(0,l.useRef)({x:0,y:0,active:0});return(0,t.jsx)("div",{className:"absolute inset-0",onPointerMove:e=>{let t=e.currentTarget.getBoundingClientRect();r.current.x=(e.clientX-t.left)/t.width*2-1,r.current.y=-((e.clientY-t.top)/t.height*2-1),r.current.active=1},onPointerLeave:()=>{r.current.active=0},children:(0,t.jsxs)(o.Canvas,{camera:{position:[0,0,4.4],fov:42},dpr:[1,2],gl:{antialias:!1,alpha:!0,powerPreference:"high-performance"},style:{position:"absolute",inset:0},children:[(0,t.jsx)(h,{children:(0,t.jsx)(p,{pointer:r,lite:e})}),(0,t.jsx)(a.EffectComposer,{enableNormalPass:!1,children:(0,t.jsx)(a.Bloom,{intensity:e?.85:1.25,luminanceThreshold:.18,luminanceSmoothing:.22,mipmapBlur:!0,kernelSize:e?n.KernelSize.MEDIUM:n.KernelSize.LARGE})})]})})}],43059)},71156,e=>{e.n(e.i(43059))}]);