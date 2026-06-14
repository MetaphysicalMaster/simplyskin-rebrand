(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,98443,e=>{"use strict";var t=e.i(55350);e.s(["extend",()=>t.e])},71320,e=>{"use strict";var t=e.i(55350);e.s(["createPortal",()=>t.o])},318,e=>{"use strict";var t=e.i(55350);e.s(["useLoader",()=>t.G])},14714,e=>{"use strict";var t=e.i(55350);e.s(["applyProps",()=>t.s])},45621,e=>{"use strict";var t=e.i(44180),a=e.i(1529),o=e.i(46648),r=e.i(26843),n=e.i(79867),i=e.i(43050),s=e.i(64556),l=e.i(21348);let u=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,c=`
  precision highp float;

  varying vec2 vUv;

  uniform float u_time;
  uniform vec2  u_resolution;
  uniform vec2  u_pointer;     // -1..1
  uniform float u_scroll;      // 0..1 hero scroll progress (parallax)
  uniform float u_intensity;   // mount fade-in 0..1
  uniform float u_dawn;        // 0 night → 1 pre-dawn warmth (page scrub)
  uniform vec3  u_night0;       // top of sky
  uniform vec3  u_night1;       // horizon sky
  uniform vec3  u_dawnSky;      // lifted pre-dawn twilight blue
  uniform vec3  u_dawnWarm;     // warm pale-yellow dawn light
  uniform vec3  u_violet;
  uniform vec3  u_magenta;
  uniform vec3  u_teal;
  uniform vec3  u_cyan;
  uniform vec3  u_ridge;

  // ---- noise toolkit ----
  float hash(vec2 p){
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  float fbm(vec2 p){
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 5; i++){
      v += amp * noise(p);
      p *= 2.02;
      amp *= 0.5;
    }
    return v;
  }

  // Abstract horizon line at horizontal coord x (0..1).
  // Deliberately NOT a jagged mountain ridge — a near-flat, gently undulating
  // navy horizon so the hero reads as "luminous calm" (a female-luxury medspa),
  // never a ski-resort silhouette. Just a whisper of low-frequency motion.
  float ridgeHeight(float x){
    float h = 0.012 * noise(vec2(x * 1.6, 7.0));
    h += 0.008 * noise(vec2(x * 2.4, 13.0));
    return h + 0.05;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = u_resolution.x / max(u_resolution.y, 1.0);

    // ---- night sky base (vertical) ----
    vec3 col = mix(u_night1, u_night0, smoothstep(0.0, 1.0, uv.y));

    // ---- dawn resolve (scroll-choreographed): the sky lifts toward a
    // pre-dawn twilight blue while warmth pools low at the horizon. Kept
    // deliberately PRE-dawn (never daylight) so white copy in the night
    // sections stays AA over their navy veils.
    float dawn = clamp(u_dawn, 0.0, 1.0);
    vec3 dawnCol = mix(u_dawnWarm, u_dawnSky, smoothstep(0.03, 0.7, uv.y));
    col = mix(col, dawnCol, dawn * 0.6);

    // faint star dusting in the upper sky — stars dissolve as dawn rises
    float stars = step(0.9975, hash(floor(uv * vec2(420.0, 320.0))));
    col += stars * smoothstep(0.35, 1.0, uv.y) * 0.5 * (1.0 - 0.85 * dawn);

    // ---- aurora curtains ----
    // parallax: scroll pushes the aurora up + softens it; cursor sways it.
    float par = u_scroll * 0.22;
    vec2 ap = vec2(uv.x * aspect, uv.y);
    ap.x += u_pointer.x * 0.06;

    // domain-warp the sampling coords so curtains ripple like real aurora.
    float t = u_time * 0.06;
    vec2 warp = vec2(
      fbm(ap * vec2(1.6, 2.2) + vec2(t, t * 0.5)),
      fbm(ap * vec2(2.0, 1.4) + vec2(-t * 0.7, t))
    );
    float bands = fbm(ap * vec2(2.4, 3.4) + warp * 1.4 + vec2(t * 1.5, 0.0));

    // vertical envelope: aurora lives in the mid-upper sky, fading at top/bottom
    float baseY = 0.40 + par + bands * 0.18;
    float curtain = smoothstep(0.34, 0.0, abs(uv.y - baseY - 0.12))
                  + 0.6 * smoothstep(0.5, 0.0, abs(uv.y - baseY + 0.06));
    curtain *= (0.55 + 0.45 * bands);

    // vertical streaking (the rays that hang down from a curtain)
    float rays = fbm(vec2(ap.x * 14.0 + warp.x * 2.0, uv.y * 2.0 - t));
    curtain *= mix(0.7, 1.25, rays);

    // the aurora softly dissolves into the brightening sky
    curtain *= (1.0 - 0.5 * dawn);

    // ---- aurora color ramp: violet → magenta → teal → cyan across x + noise --
    float hueMix = clamp(uv.x * 0.8 + bands * 0.5 + u_pointer.x * 0.1, 0.0, 1.0);
    vec3 aur = mix(u_violet, u_magenta, smoothstep(0.0, 0.35, hueMix));
    aur = mix(aur, u_teal, smoothstep(0.35, 0.72, hueMix));
    aur = mix(aur, u_cyan, smoothstep(0.72, 1.0, hueMix));
    // ...and what remains of it warms toward the dawn light
    aur = mix(aur, u_dawnWarm, 0.45 * dawn);

    // brighten the lower edge of the curtain (classic aurora glow) — kept
    // restrained so the navy night sky stays dominant (no grey wash).
    float glow = smoothstep(0.0, 0.3, curtain);
    col += aur * curtain * 0.95 * glow;

    // soft cyan ground-glow just above the ridge
    float horizonGlow = smoothstep(0.32, 0.12, uv.y) * smoothstep(0.04, 0.18, uv.y);
    col += u_cyan * horizonGlow * 0.18;
    // dawn warmth pools at the horizon — the sun is coming, never arrived
    col += u_dawnWarm * horizonGlow * 0.62 * dawn;
    float dawnBloom = smoothstep(0.55, 0.05, uv.y);
    col += u_dawnWarm * dawnBloom * dawnBloom * 0.26 * dawn;

    // ---- abstract navy horizon (soft light-pooling, not a mountain ridge) ----
    float rh = ridgeHeight(uv.x + 0.02 * sin(u_time * 0.05));
    // a soft, wide mask edge so the base reads as pooled navy light, not a cutout
    float ridgeMask = smoothstep(rh + 0.05, rh - 0.02, uv.y);
    vec3 ridgeCol = mix(u_ridge, u_night0, 0.25);
    // first light brushes the horizon floor
    ridgeCol = mix(ridgeCol, u_dawnSky * 0.55, 0.35 * dawn);
    col = mix(col, ridgeCol, ridgeMask);
    // a soft teal/yellow horizon shimmer where the aurora meets the base
    float rim = smoothstep(0.05, 0.0, abs(uv.y - rh)) * 0.5;
    col += aur * rim * (0.4 + 0.6 * bands);

    // faint grain to avoid banding
    col += (noise(uv * u_resolution.xy * 0.5 + u_time) - 0.5) * 0.012;

    // gentle vignette to seat copy
    float vig = smoothstep(1.4, 0.3, length((uv - 0.5) * vec2(aspect, 1.0)));
    col *= mix(0.78, 1.0, vig);

    col *= u_intensity;

    gl_FragColor = vec4(col, 1.0);
  }
`,h="#5fd8c4",m="#ffe9a0",d="#ffe2a6";function v({drive:e}){let a=(0,s.useRef)(null),{size:n}=(0,r.useThree)(),i=(0,s.useRef)({x:0,y:0,scroll:0,dawn:0}),p=(0,s.useMemo)(()=>({u_time:{value:0},u_resolution:{value:new l.Vector2(n.width,n.height)},u_pointer:{value:new l.Vector2(0,0)},u_scroll:{value:0},u_intensity:{value:0},u_dawn:{value:0},u_night0:{value:new l.Color("#08172a")},u_night1:{value:new l.Color("#0a2a4a")},u_violet:{value:new l.Color("#3f7fd6")},u_magenta:{value:new l.Color("#2f9c86")},u_teal:{value:new l.Color(h)},u_cyan:{value:new l.Color(m)},u_ridge:{value:new l.Color("#0c2138")},u_dawnSky:{value:new l.Color("#33608f")},u_dawnWarm:{value:new l.Color(d)}}),[]);return(0,o.useFrame)(({clock:t},o)=>{let r=a.current;if(!r)return;r.uniforms.u_time.value=t.getElapsedTime(),r.uniforms.u_resolution.value.set(n.width,n.height);let s=e.current??{pointer:{x:0,y:0},scroll:0,dawn:0},l=1-Math.pow(.0016,o);i.current.x+=(s.pointer.x-i.current.x)*l,i.current.y+=(s.pointer.y-i.current.y)*l,i.current.scroll+=(s.scroll-i.current.scroll)*l;let u=1-Math.pow(5e-4,o);i.current.dawn+=(s.dawn-i.current.dawn)*u,r.uniforms.u_pointer.value.set(i.current.x,i.current.y),r.uniforms.u_scroll.value=i.current.scroll,r.uniforms.u_dawn.value=i.current.dawn;let c=r.uniforms.u_intensity.value;r.uniforms.u_intensity.value=c+(1-c)*Math.min(1,1.1*o)}),(0,t.jsxs)("mesh",{frustumCulled:!1,children:[(0,t.jsx)("planeGeometry",{args:[2,2]}),(0,t.jsx)("shaderMaterial",{ref:a,vertexShader:u,fragmentShader:c,uniforms:p,depthWrite:!1,depthTest:!1})]})}function p({drive:e,count:a}){let n=(0,s.useRef)(null),i=(0,s.useMemo)(()=>new l.Object3D,[]),{viewport:u}=(0,r.useThree)(),c=(0,s.useMemo)(()=>{let e=[];for(let t=0;t<a;t++)e.push({x:(Math.random()-.5)*8,y:(Math.random()-.5)*4,z:(Math.random()-.5)*2,rise:.1+.5*Math.random(),size:.015+.05*Math.random(),sway:Math.random()*Math.PI*2,hue:Math.random(),bright:.3+.7*Math.random()});return e},[a]),v=(0,s.useMemo)(()=>new l.Color,[]),f=(0,s.useMemo)(()=>new l.Color(h),[]),w=(0,s.useMemo)(()=>new l.Color(m),[]),g=(0,s.useMemo)(()=>new l.Color(d),[]);return(0,o.useFrame)(({clock:t},a)=>{let o=n.current;if(!o)return;let r=e.current??{pointer:{x:0,y:0},scroll:0,dawn:0},s=Math.min(a,.05),l=t.getElapsedTime(),h=.6*Math.max(u.height,4);for(let e=0;e<c.length;e++){let t=c[e];t.y+=s*t.rise,t.y>h&&(t.y=-h);let a=t.x+.25*Math.sin(.3*l+t.sway)+.3*r.pointer.x,n=(1-.6*r.scroll)*(1-.45*r.dawn);i.position.set(a,t.y,t.z);let u=t.size*(.8+.2*Math.sin(l+t.sway));i.scale.set(u,u,u),i.updateMatrix(),o.setMatrixAt(e,i.matrix),v.copy(f).lerp(w,t.hue),v.lerp(g,.5*r.dawn),v.multiplyScalar(t.bright*n),o.setColorAt(e,v)}o.instanceMatrix.needsUpdate=!0,o.instanceColor&&(o.instanceColor.needsUpdate=!0)}),(0,t.jsxs)("instancedMesh",{ref:n,args:[void 0,void 0,a],frustumCulled:!1,children:[(0,t.jsx)("circleGeometry",{args:[1,12]}),(0,t.jsx)("meshBasicMaterial",{transparent:!0,blending:l.AdditiveBlending,depthWrite:!1,depthTest:!1,opacity:.85,toneMapped:!1})]})}function f({onFirstFrame:e}){let t=(0,s.useRef)(!1);return(0,o.useFrame)(()=>{t.current||(t.current=!0,e?.())}),null}e.s(["default",0,function({drive:e,lite:o=!1,paused:r=!1,onFirstFrame:s}){return(0,t.jsxs)(a.Canvas,{frameloop:r?"never":"always",camera:{position:[0,0,5],fov:42},dpr:[1,2],gl:{antialias:!1,alpha:!1,powerPreference:"high-performance"},style:{position:"absolute",inset:0},children:[(0,t.jsx)(f,{onFirstFrame:s}),(0,t.jsx)(v,{drive:e}),(0,t.jsx)(p,{drive:e,count:o?80:150}),(0,t.jsx)(n.EffectComposer,{enableNormalPass:!1,children:(0,t.jsx)(n.Bloom,{intensity:o?.5:.75,luminanceThreshold:.42,luminanceSmoothing:.3,mipmapBlur:!0,kernelSize:o?i.KernelSize.MEDIUM:i.KernelSize.LARGE})})]})}],45621)},4965,e=>{e.n(e.i(45621))}]);