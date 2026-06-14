(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,38835,e=>{"use strict";var t=e.i(44180),a=e.i(1529),o=e.i(46648),r=e.i(26843),s=e.i(64556),i=e.i(21348),l=e.i(88287);let n=`
  uniform float uTime;
  uniform float uFlow;     // 1 = full storm, eases toward calm as you scroll
  uniform vec2  uPointer;  // -1..1, gentle breeze deflection
  uniform float uPointerStr;
  uniform float uGust;     // 0..1 scroll-wind strength (fast scroll = gust)
  uniform float uSweep;    // signed scroll-wind impulse (direction of travel)

  attribute vec3 aOffset;   // base position in the field
  attribute vec3 aAxis;     // tumble axis (normalized)
  attribute float aPhase;   // per-petal time offset
  attribute float aSpeed;   // per-petal fall speed
  attribute float aScale;   // per-petal size
  attribute float aDepth;   // 0 = far, 1 = near (depth layer)
  attribute float aColorMix;// 0..1 along the sakura ramp
  attribute float aFlutter; // 0..1 per-petal flutter amplitude/character

  varying vec2  vUv;
  varying float vDepth;
  varying float vColorMix;
  varying float vFade;
  varying float vFacing;    // |n\xb7view| — how broadside the petal faces us (light)

  // cheap rotation matrix about an arbitrary axis
  mat3 rotAxis(vec3 a, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    return mat3(
      oc*a.x*a.x + c,      oc*a.x*a.y - a.z*s, oc*a.z*a.x + a.y*s,
      oc*a.x*a.y + a.z*s,  oc*a.y*a.y + c,     oc*a.y*a.z - a.x*s,
      oc*a.z*a.x - a.y*s,  oc*a.y*a.z + a.x*s, oc*a.z*a.z + c
    );
  }

  // Euler rotation (pitch X, yaw Y, roll Z) — composed for a true 3D tumble.
  mat3 rotXYZ(vec3 e) {
    float cx = cos(e.x), sx = sin(e.x);
    float cy = cos(e.y), sy = sin(e.y);
    float cz = cos(e.z), sz = sin(e.z);
    mat3 rx = mat3(1.0,0.0,0.0, 0.0,cx,-sx, 0.0,sx,cx);
    mat3 ry = mat3(cy,0.0,sy, 0.0,1.0,0.0, -sy,0.0,cy);
    mat3 rz = mat3(cz,-sz,0.0, sz,cz,0.0, 0.0,0.0,1.0);
    return rz * ry * rx;
  }

  void main() {
    vUv = uv;
    vDepth = aDepth;
    vColorMix = aColorMix;

    // --- wind field: down-and-across drift, eased by uFlow ---
    float t = uTime * (0.35 + aSpeed * 0.55) * mix(0.45, 1.0, uFlow) + aPhase * 6.2831;

    // parallax: near petals fall faster + travel further across
    float par = mix(0.55, 1.4, aDepth);

    // vertical fall wraps within the field height (~ 16 units), so it loops.
    float fallH = 16.0;
    float fall = mod(aOffset.y - t * aSpeed * par, fallH) - fallH * 0.5;

    // lateral sway — a breeze that gusts; near petals sway wider, and the
    // scroll-gust widens everyone's arc (the wind leaning into the field).
    float sway = (sin(t * 0.6 + aPhase * 10.0) * (0.6 * par)
               + cos(t * 0.27 + aOffset.x) * 0.35 * par)
               * (1.0 + uGust * 1.4);

    // pointer breeze — a soft, eased push in the cursor direction.
    vec2 breeze = uPointer * uPointerStr * (0.9 * par);

    vec3 pos = aOffset;
    pos.y = fall;
    pos.x += sway + breeze.x;
    pos.y += breeze.y * 0.5;
    pos.z += sin(t * 0.4 + aPhase * 4.0) * 0.4 * par; // depth wobble

    // scroll-wind sweep — the visitor's own motion is the wind. Scrolling down
    // lifts the field past the eye and shears it across (a diagonal gust);
    // scrolling up reverses it. Near petals travel furthest, so the parallax
    // depth holds even mid-gust. Per-petal phase keeps the sweep organic.
    float swayBias = 0.85 + 0.3 * sin(aPhase * 12.566);
    pos.y += uSweep * (1.5 * par) * swayBias;
    pos.x -= uSweep * (0.7 * par) * swayBias;

    // --- FLUTTER: a real cherry-blossom tumble, NOT a 2D sliver spin ---
    // A falling sakura petal does not spin flat on one axis — it flutters: it
    // PITCHES (rocks forward/back over its width), ROLLS (rocks side to side),
    // and YAWS (turns to face you, then away) on three INDEPENDENT slow waves at
    // incommensurate rates, with a slow continuous base tumble underneath. The
    // gust deepens the rocking. This is what makes it read as a 3D petal on air.
    float fl = 0.6 + aFlutter * 0.9;                 // per-petal flutter character
    float gustFl = 1.0 + uGust * 1.1;                // wind deepens the rocking
    // base slow tumble about the petal's own axis — keeps motion non-repeating
    float baseSpin = t * (0.28 + aSpeed * 0.42) + aPhase * 9.0;
    vec3 euler = vec3(
      // pitch: the dominant rocking, broadside ↔ edge-on (the "flutter")
      sin(t * (0.9 * fl) + aPhase * 6.0) * (1.15 * gustFl),
      // yaw: turns the face toward / away from the eye
      baseSpin + sin(t * (0.55 * fl) + aPhase * 3.7) * 0.7,
      // roll: gentle side-to-side rock
      sin(t * (0.7 * fl) + aPhase * 11.0) * (0.85 * gustFl)
    );
    mat3 rot = rotXYZ(euler);

    // petal billows: a faint membrane flex as it rocks; a gust deepens it.
    vec3 local = position;
    local.x *= 1.0 + (0.08 + 0.08 * uGust) * sin(t * 1.3 + aPhase * 7.0);

    vec3 vtx = rot * (local * aScale * mix(0.62, 1.22, aDepth));
    vec3 world = pos + vtx;

    // Light-catching: how broadside the petal faces the camera (+z view dir).
    // The cupped, tessellated surface gives a real normal; we read its facing so
    // the fragment can flash the petal brighter when it turns flat to the eye and
    // dim it toward translucency when it tips edge-on — that catch-the-light beat.
    vec3 n = normalize(rot * normalize(normal));
    vFacing = abs(n.z);

    // soft-focus fade for the far layer (bokeh) + edge fade near field bounds.
    float edge = smoothstep(8.0, 5.5, abs(fall));
    vFade = edge * mix(0.5, 1.0, aDepth);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(world, 1.0);
  }
`,u=`
  precision highp float;

  uniform vec3  uPale;
  uniform vec3  uSakura;
  uniform vec3  uDeep;
  uniform vec3  uPlum;
  uniform float uFlow;
  uniform bool  uBokeh;

  varying vec2  vUv;
  varying float vDepth;
  varying float vColorMix;
  varying float vFade;
  varying float vFacing;

  // ── A REAL cherry-blossom (sakura) petal silhouette in UV space ──
  // The single-petal sakura shape: a soft, broad ROUNDED OVAL (widest in the
  // upper-mid body, gently tapering to a soft rounded base), with the
  // characteristic small NOTCH / CLEFT cut into the outer tip. NOT a teardrop
  // blade. Returns a soft-edged 0..1 coverage mask. Also writes the signed
  // distance-ish edge proximity into edgeOut for the translucent rim.
  float petalMask(vec2 uv, out float edgeOut, out float tipNotch) {
    float x = uv.x - 0.5;          // -0.5..0.5 across
    float y = clamp(uv.y, 0.0, 1.0); // 0 (base) .. 1 (tip)

    // WIDTH PROFILE — a rounded ovate petal:
    //  \xb7 base (y→0): soft, rounded, fairly narrow shoulder (not a point)
    //  \xb7 body (y~0.45..0.7): widest — the broad sakura body
    //  \xb7 tip  (y→1): eases back in so the outer end is a rounded lobe, ready
    //                for the notch to be cut into it.
    // A skewed sine swell gives the asymmetric ovate profile; a base floor keeps
    // the bottom rounded rather than pinched to a spike.
    float swell = sin(pow(y, 0.82) * 3.14159);            // 0 at ends, 1 mid
    float w = 0.085 + swell * 0.30;                        // half-width envelope
    // widen the upper body slightly more than the base (ovate, not symmetric)
    w += smoothstep(0.25, 0.85, y) * 0.05;

    // soft-edged coverage inside the outline (antialiased band)
    float aa = 0.045;
    float body = smoothstep(w + aa, w - aa, abs(x));

    // THE SAKURA NOTCH — a small smooth V/cleft cut DOWN into the outer tip.
    // Real sakura petals have a shallow rounded cleft, not a deep gash.
    float cleftW = 0.13;                                   // notch half-width
    float cleftD = 0.16;                                   // notch depth
    // parabolic notch floor: deepest at center, rising to the rim at \xb1cleftW
    float floorY = 1.0 - cleftD + cleftD * (abs(x) / cleftW) * (abs(x) / cleftW);
    float topCut = (abs(x) < cleftW)
      ? smoothstep(floorY + 0.035, floorY, y)             // carve the cleft
      : smoothstep(1.005, 0.97, y);                        // round the lobes
    // a global soft cap on the very tip so the two lobes read rounded
    float tipSoft = smoothstep(1.02, 0.95, y);

    float mask = clamp(body * topCut * tipSoft, 0.0, 1.0);

    // edge proximity (1 at the silhouette outline → 0 in the interior) for the
    // translucent catching-light rim.
    edgeOut = smoothstep(0.0, 0.16, mask) * (1.0 - smoothstep(0.16, 0.5, mask));
    // how close we are to the tip-notch region (for a faint cleft shadow line)
    tipNotch = (abs(x) < cleftW) ? smoothstep(floorY - 0.06, floorY, y) : 0.0;
    return mask;
  }

  void main() {
    float edge; float tipNotch;
    float mask = petalMask(vUv, edge, tipNotch);
    if (mask < 0.02) discard;

    // ── COLOR: a translucent SOFT-PINK sakura petal ──
    // Length-wise ramp: the cupped base sits in a slightly deeper rose, the broad
    // body is sakura-pink, and the tip eases to a near-white pale rim — exactly
    // how light reads through a real petal (thin translucent edge, denser heart).
    vec3 col = mix(uDeep, uSakura, smoothstep(0.0, 0.34, vUv.y));
    col = mix(col, uPale, smoothstep(0.46, 1.0, vUv.y));

    // a soft central vein-line keeps it from looking like a flat decal
    float vein = 1.0 - smoothstep(0.0, 0.05, abs(vUv.x - 0.5));
    col = mix(col, uDeep, vein * 0.10 * smoothstep(0.1, 0.7, vUv.y));

    // per-petal heart accent toward the rose tone — MINORITY of petals (colorMix
    // is cubed at generation) and only near the cupped base. Never coral-red.
    col = mix(col, uPlum, vColorMix * 0.34 * (1.0 - smoothstep(0.0, 0.5, vUv.y)));

    // translucent catching-light RIM: lift the silhouette edge toward the pale
    // near-white so the petal glows softly over the sumi-black field — the way a
    // thin petal edge catches light. Modulated by facing so the rim is brightest
    // when the petal turns broadside to the eye.
    float lightCatch = mix(0.72, 1.18, vFacing);          // broadside = brighter
    col += uPale * edge * 0.30 * lightCatch;

    // gentle broadside sheen across the whole petal as it flutters flat to us
    col += uSakura * smoothstep(0.55, 1.0, vFacing) * 0.10;

    // a faint cool shadow inside the tip notch so the cleft reads
    col -= uDeep * tipNotch * 0.05;

    // ── ALPHA: translucent, depth- & facing-aware ──
    float depthDim = mix(0.84, 1.0, vDepth);
    float alpha = mask * vFade * depthDim;

    // edge-on petals go MORE translucent (you see through the thin membrane),
    // broadside petals stay more opaque — the realistic flutter shimmer.
    alpha *= mix(0.55, 1.0, smoothstep(0.05, 0.85, vFacing));

    // far-layer soft focus (bokeh): soften far-petal alpha.
    if (uBokeh) {
      float soft = mix(0.45, 1.0, vDepth);
      alpha *= mix(0.74, 1.0, soft);
    }

    // near petals stay denser; keep a tasteful translucency throughout.
    alpha *= mix(0.80, 0.96, vDepth);

    gl_FragColor = vec4(col, alpha);
  }
`;function c({pointer:e,flowRef:a,lite:r}){let h=(0,s.useRef)(null),f=(0,s.useRef)({x:0,y:0,s:0}),d=(0,s.useRef)(1),p=(0,s.useRef)(0),m=(0,s.useRef)(0),v=(0,s.useRef)(0),b=r?1100:2400,{geometry:g,uniforms:w}=(0,s.useMemo)(()=>{let e=new i.InstancedBufferGeometry,t=function(){let e=new i.PlaneGeometry(1,1.18,6,6),t=e.attributes.position;for(let e=0;e<t.count;e++){let a=t.getX(e),o=(t.getY(e)+.59)/1.18,r=a*a*.62*(.35+.65*o),s=.12*Math.sin(o*Math.PI);t.setZ(e,r-s)}return t.needsUpdate=!0,e.computeVertexNormals(),e}();e.index=t.index,e.attributes.position=t.attributes.position,e.attributes.uv=t.attributes.uv,e.attributes.normal=t.attributes.normal;let a=new Float32Array(3*b),o=new Float32Array(3*b),s=new Float32Array(b),l=new Float32Array(b),n=new Float32Array(b),u=new Float32Array(b),c=new Float32Array(b),h=new Float32Array(b),f=1337,d=()=>{f|=0;let e=Math.imul((f=f+0x6d2b79f5|0)^f>>>15,1|f);return(((e=e+Math.imul(e^e>>>7,61|e)^e)^e>>>14)>>>0)/0x100000000};for(let e=0;e<b;e++){let t=d(),r=t<.34?.33*d():t<.7?.33+.34*d():.67+.33*d();u[e]=r;let i=9+7*r;a[3*e]=(d()-.5)*i,a[3*e+1]=(d()-.5)*16,a[3*e+2]=-4+7*r+(d()-.5)*1.5;let f=d()-.5,p=d()-.5,m=d()-.5,v=Math.hypot(f,p,m)||1;o[3*e]=f/v,o[3*e+1]=p/v,o[3*e+2]=m/v,s[e]=d();let b=d();l[e]=b<.7?.32+.4*d():.9+.7*d(),n[e]=.14+.34*Math.pow(d(),1.7),h[e]=d(),c[e]=Math.pow(d(),3)}return e.setAttribute("aOffset",new i.InstancedBufferAttribute(a,3)),e.setAttribute("aAxis",new i.InstancedBufferAttribute(o,3)),e.setAttribute("aPhase",new i.InstancedBufferAttribute(s,1)),e.setAttribute("aSpeed",new i.InstancedBufferAttribute(l,1)),e.setAttribute("aScale",new i.InstancedBufferAttribute(n,1)),e.setAttribute("aDepth",new i.InstancedBufferAttribute(u,1)),e.setAttribute("aColorMix",new i.InstancedBufferAttribute(c,1)),e.setAttribute("aFlutter",new i.InstancedBufferAttribute(h,1)),e.instanceCount=b,{geometry:e,uniforms:{uTime:{value:0},uFlow:{value:1},uGust:{value:0},uSweep:{value:0},uPointer:{value:new i.Vector2(0,0)},uPointerStr:{value:0},uPale:{value:new i.Color("#fdeef0")},uSakura:{value:new i.Color("#f7c2cf")},uDeep:{value:new i.Color("#f09bb0")},uPlum:{value:new i.Color("#e87a96")},uBokeh:{value:!r}}}},[b,r]);return(0,o.useFrame)((t,o)=>{let r=h.current;if(!r)return;let s=Math.min(o,1/30),i=l.windBus.velocity,n=Math.min(1,Math.abs(i)/55),u=n>m.current?Math.min(1,7*s):Math.min(1,1.15*s);m.current+=(n-m.current)*u;let c=Math.max(-1,Math.min(1,i/70));v.current+=(c-v.current)*Math.min(1,4.5*s),p.current+=s*(1+2.4*m.current),l.windBus.velocity*=Math.exp(-(3.2*s)),l.windBus.gust=m.current,r.uniforms.uTime.value=p.current,r.uniforms.uGust.value=m.current,r.uniforms.uSweep.value=v.current;let b=e.current??{x:0,y:0,active:0},g=1-Math.pow(.0022,s);f.current.x+=(b.x-f.current.x)*g,f.current.y+=(b.y-f.current.y)*g,f.current.s+=(b.active-f.current.s)*Math.min(1,2.5*s),r.uniforms.uPointer.value.set(f.current.x,f.current.y),r.uniforms.uPointerStr.value=f.current.s;let w=a.current??1;d.current+=(w-d.current)*Math.min(1,1.6*s),r.uniforms.uFlow.value=d.current}),(0,t.jsx)("mesh",{geometry:g,frustumCulled:!1,children:(0,t.jsx)("shaderMaterial",{ref:h,vertexShader:n,fragmentShader:u,uniforms:w,transparent:!0,depthWrite:!1,depthTest:!0,side:i.DoubleSide,blending:i.NormalBlending})})}function h({children:e}){let a=(0,s.useRef)(null),r=(0,s.useRef)(0);return(0,o.useFrame)(({clock:e},t)=>{let o=a.current;if(!o)return;let s=e.getElapsedTime(),i=Math.min(t,1/30);r.current+=(l.windBus.gust-r.current)*Math.min(1,2.5*i),o.rotation.z=.03*Math.sin(.08*s)-.055*r.current,o.position.x=.3*Math.sin(.05*s)}),(0,t.jsx)("group",{ref:a,children:e})}function f({lite:e}){let{gl:t}=(0,r.useThree)();return(0,s.useEffect)(()=>{t.setPixelRatio(Math.min(window.devicePixelRatio,e?1.5:2))},[t,e]),null}e.s(["default",0,function({lite:e=!1,flowRef:o}){let r=(0,s.useRef)({x:0,y:0,active:0}),i=(0,s.useRef)(null),[l,n]=(0,s.useState)(!0);return(0,s.useEffect)(()=>{let e=i.current;if(!e||"u"<typeof IntersectionObserver)return;let t=new IntersectionObserver(([e])=>n(e.isIntersecting),{rootMargin:"140px"});t.observe(e);let a=()=>n("visible"===document.visibilityState);return document.addEventListener("visibilitychange",a),()=>{t.disconnect(),document.removeEventListener("visibilitychange",a)}},[]),(0,t.jsx)("div",{ref:i,className:"absolute inset-0",onPointerMove:e=>{let t=e.currentTarget.getBoundingClientRect();r.current.x=(e.clientX-t.left)/t.width*2-1,r.current.y=-((e.clientY-t.top)/t.height*2-1),r.current.active=1},onPointerLeave:()=>{r.current.active=0},children:(0,t.jsxs)(a.Canvas,{frameloop:l?"always":"never",camera:{position:[0,0,9],fov:46},dpr:[1,2],gl:{antialias:!0,alpha:!0,powerPreference:"high-performance"},style:{position:"absolute",inset:0},children:[(0,t.jsx)(f,{lite:e}),(0,t.jsx)(h,{children:(0,t.jsx)(c,{pointer:r,flowRef:o,lite:e})})]})})}])},15922,e=>{e.n(e.i(38835))}]);