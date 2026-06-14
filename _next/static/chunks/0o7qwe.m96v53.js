(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,98443,e=>{"use strict";var t=e.i(55350);e.s(["extend",()=>t.e])},71320,e=>{"use strict";var t=e.i(55350);e.s(["createPortal",()=>t.o])},318,e=>{"use strict";var t=e.i(55350);e.s(["useLoader",()=>t.G])},14714,e=>{"use strict";var t=e.i(55350);e.s(["applyProps",()=>t.s])},2787,e=>{"use strict";var t=e.i(44180),i=e.i(1529),o=e.i(46648),r=e.i(26843),a=e.i(79867),n=e.i(43050),s=e.i(64556),l=e.i(21348);let u=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,c=`
  precision highp float;

  varying vec2 vUv;

  uniform float u_time;
  uniform vec2  u_resolution;
  uniform vec2  u_pointer;     // -1..1, gentle parallax of the key light
  uniform float u_intensity;   // 0..1 reveal — the drape settles as hero loads
  uniform vec3  u_ink;         // deepest near-black (shadow troughs)
  uniform vec3  u_charcoal;    // raised charcoal (mid drape)
  uniform vec3  u_silver;      // soft silver highlight (lit folds)
  uniform vec3  u_pink;        // the single controlled magenta light-edge

  // Smooth value noise — kept low-octave for soft, satin folds (not plasma).
  float hash(vec2 p) {
    p = fract(p * vec2(127.31, 311.7));
    p += dot(p, p + 34.21);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  // Two-octave flow — enough for graceful satin undulation, no storm.
  float flow(vec2 p) {
    return noise(p) * 0.62 + noise(p * 2.03 + 7.1) * 0.30;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = u_resolution.x / max(u_resolution.y, 1.0);
    vec2 p = (uv - 0.5);
    p.x *= aspect;

    float t = u_time * 0.06; // unhurried — the drape breathes slowly

    // Gentle diagonal drape coordinate. The folds run on a slow incline so the
    // silk reads as hung fabric catching an upper-left key light.
    vec2 q = vec2(p.x * 0.9 + p.y * 0.22, p.y * 1.15);
    // Domain warp the fold field a touch for organic, hand-draped softness.
    vec2 w = vec2(flow(q * 1.1 + vec2(0.0, t)), flow(q * 1.1 + vec2(4.3, -t)));
    float folds = flow(q * 1.6 + w * 0.6 + vec2(t * 0.5, 0.0));

    // Convert the fold field into a smooth satin shading term: a soft sine of
    // the height gives bright crests and dark troughs without harsh edges.
    float drape = folds + p.y * 0.10; // a slow vertical fall of light
    float sheen = 0.5 + 0.5 * sin(drape * 6.2831 * 1.6 + t * 2.0);
    sheen = pow(sheen, 1.6); // tighten highlights, keep troughs soft

    // Key-light pool — upper-left, parallaxes a hair toward the cursor. Folds
    // near the key are brighter (more silver lift), far folds fall to ink.
    vec2 key = vec2(-0.34 + u_pointer.x * 0.10, 0.30 + u_pointer.y * 0.06);
    float keyDist = length(p - key);
    float pool = smoothstep(1.5, 0.0, keyDist);

    // Greyscale satin: ink troughs -> charcoal body -> silver lit crests.
    vec3 col = mix(u_ink, u_charcoal, smoothstep(0.0, 0.55, sheen));
    col = mix(col, u_silver, smoothstep(0.5, 1.0, sheen) * (0.35 + pool * 0.55));

    // THE ONE PINK: a single thin specular light-edge riding ONE slow level set
    // of the drape — a razor of magenta light glancing off a single fold crest.
    // Controlled: a narrow band (the abs() ridge), gated to the lit side near
    // the key so it never scatters across the whole field.
    float edgeField = drape * 1.0 - t * 0.6;             // the travelling crest
    float ridge = 1.0 - abs(fract(edgeField) - 0.5) * 2.0;
    ridge = pow(clamp(ridge, 0.0, 1.0), 22.0);            // VERY thin, precise
    float pinkGate = smoothstep(0.15, 0.75, pool) * smoothstep(0.62, 0.95, sheen);
    float pink = ridge * pinkGate;
    col += u_pink * pink * 1.7;                            // luminance-additive

    // A whisper of pink bloom-seed just inside the edge for a soft halo (still
    // controlled — scaled by the same gate so it can't wash the field).
    col += u_pink * pow(ridge, 0.5) * pinkGate * 0.10;

    // Soft frame vignette — seats the editorial drape on a dark studio.
    float vig = smoothstep(1.45, 0.30, length(p));
    col *= mix(0.70, 1.0, vig);

    // Fine dither to kill banding on the smooth dark gradient.
    float grain = (hash(uv * u_resolution + t) - 0.5) * 0.010;
    col += grain;

    // Reveal — the drape settles/brightens as the hero loads.
    col *= mix(0.32, 1.0, u_intensity);

    gl_FragColor = vec4(col, 1.0);
  }
`;function h({pointer:e}){let i=(0,s.useRef)(null),{size:a,viewport:n}=(0,r.useThree)(),f=(0,s.useRef)({x:0,y:0}),d=(0,s.useMemo)(()=>({u_time:{value:0},u_resolution:{value:new l.Vector2(a.width,a.height)},u_pointer:{value:new l.Vector2(0,0)},u_intensity:{value:0},u_ink:{value:new l.Color("#0c0c0c")},u_charcoal:{value:new l.Color("#242424")},u_silver:{value:new l.Color("#d7d7d7")},u_pink:{value:new l.Color("#f0338f")}}),[]);return(0,o.useFrame)(({clock:t},o)=>{let r=i.current;if(!r)return;r.uniforms.u_time.value=t.getElapsedTime(),r.uniforms.u_resolution.value.set(a.width,a.height);let n=e.current??{x:0,y:0},s=1-Math.pow(.0018,o);f.current.x+=(n.x-f.current.x)*s,f.current.y+=(n.y-f.current.y)*s,r.uniforms.u_pointer.value.set(f.current.x,f.current.y);let l=r.uniforms.u_intensity.value;r.uniforms.u_intensity.value=l+(1-l)*Math.min(1,.8*o)}),(0,t.jsxs)("mesh",{scale:[n.width,n.height,1],children:[(0,t.jsx)("planeGeometry",{args:[1,1]}),(0,t.jsx)("shaderMaterial",{ref:i,vertexShader:u,fragmentShader:c,uniforms:d,depthWrite:!1})]})}e.s(["default",0,function({lite:e=!1}){let o=(0,s.useRef)({x:0,y:0}),r=(0,s.useRef)(null),[l,u]=(0,s.useState)(!0);return(0,s.useEffect)(()=>{let e,t=r.current,i=!0,o=()=>u(i&&"visible"===document.visibilityState);return t&&"u">typeof IntersectionObserver&&(e=new IntersectionObserver(([e])=>{i=e.isIntersecting,o()},{rootMargin:"120px"})).observe(t),document.addEventListener("visibilitychange",o),()=>{e?.disconnect(),document.removeEventListener("visibilitychange",o)}},[]),(0,t.jsx)("div",{ref:r,className:"absolute inset-0",onPointerMove:e=>{let t=e.currentTarget.getBoundingClientRect();o.current.x=(e.clientX-t.left)/t.width*2-1,o.current.y=-((e.clientY-t.top)/t.height*2-1)},onPointerLeave:()=>{o.current.x=0,o.current.y=0},children:(0,t.jsxs)(i.Canvas,{orthographic:!0,frameloop:l?"always":"never",camera:{zoom:1,position:[0,0,1]},dpr:[1,e?1.5:2],gl:{antialias:!1,alpha:!1,powerPreference:"high-performance"},style:{position:"absolute",inset:0},children:[(0,t.jsx)(h,{pointer:o}),(0,t.jsx)(a.EffectComposer,{enableNormalPass:!1,children:(0,t.jsx)(a.Bloom,{intensity:e?.55:.85,luminanceThreshold:.72,luminanceSmoothing:.22,mipmapBlur:!0,kernelSize:e?n.KernelSize.MEDIUM:n.KernelSize.LARGE})})]})})}],2787)},58965,e=>{e.n(e.i(2787))}]);