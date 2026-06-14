(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,98443,e=>{"use strict";var t=e.i(55350);e.s(["extend",()=>t.e])},71320,e=>{"use strict";var t=e.i(55350);e.s(["createPortal",()=>t.o])},318,e=>{"use strict";var t=e.i(55350);e.s(["useLoader",()=>t.G])},14714,e=>{"use strict";var t=e.i(55350);e.s(["applyProps",()=>t.s])},26720,e=>{"use strict";var t=e.i(44180),r=e.i(1529),o=e.i(46648),n=e.i(26843),a=e.i(79867),i=e.i(43050),s=e.i(64556),l=e.i(21348);let u=`
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
  uniform float u_speed;       // scroll-velocity drive 0..1
  uniform float u_intensity;   // mount fade-in 0..1
  uniform vec3  u_graphite0;
  uniform vec3  u_graphite1;
  uniform vec3  u_streakCore;
  uniform vec3  u_streakCool;

  // Cheap hash + value noise
  float hash(float n){ return fract(sin(n) * 43758.5453123); }
  float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f*f*(3.0-2.0*f);
    float n = i.x + i.y*57.0;
    return mix(mix(hash(n), hash(n+1.0), f.x),
               mix(hash(n+57.0), hash(n+58.0), f.x), f.y);
  }

  void main() {
    vec2 uv = vUv;
    float aspect = u_resolution.x / max(u_resolution.y, 1.0);

    // Graphite base — diagonal gradient with a soft cursor-led brightening.
    vec2 pc = (uv - 0.5) * vec2(aspect, 1.0);
    vec2 ptr = u_pointer * 0.5 * vec2(aspect, 1.0);
    float toCursor = 1.0 - smoothstep(0.0, 1.1, length(pc - ptr));
    vec3 base = mix(u_graphite0, u_graphite1, uv.x * 0.7 + uv.y * 0.3);
    base += u_streakCool * 0.10 * toCursor;

    // Slipstream coordinate: rotate uv ~24deg so streaks rake diagonally,
    // then scroll along that axis. Speed scales travel + sharpness.
    float a = -0.42;
    vec2 r = vec2(uv.x * cos(a) - uv.y * sin(a),
                  uv.x * sin(a) + uv.y * cos(a));
    float travel = u_time * (0.25 + u_speed * 1.9);
    // cursor nudges the streak lanes laterally (drift to cursor)
    float lane = r.y * 26.0 + u_pointer.x * 0.9;
    float along = r.x * 3.0 + travel;

    // Lane mask — thin bright cores with soft falloff, modulated by noise so
    // lanes feel organic (some hot, some faint).
    float laneId = floor(lane);
    float laneF = fract(lane);
    float core = smoothstep(0.5, 0.0, abs(laneF - 0.5)); // 1 at lane center
    core = pow(core, 5.0);
    float life = noise(vec2(laneId * 0.37, floor(along * 0.5)));
    float trail = fract(along * 0.5 + life);
    // comet head: bright leading edge fading back
    float comet = pow(1.0 - trail, 3.0) * (0.4 + life * 0.6);

    float streak = core * comet;
    // base velocity ambient streaks even at rest
    streak *= (0.35 + u_speed * 1.4);
    streak *= u_intensity;

    // Color the streak from cool edge to hot core toward the cursor.
    vec3 streakCol = mix(u_streakCool, u_streakCore, core * (0.5 + 0.5 * toCursor));
    vec3 col = base + streakCol * streak * 1.6;

    // faint grain to avoid banding on the gradient
    col += (noise(uv * u_resolution.xy * 0.5 + u_time) - 0.5) * 0.012;

    // subtle vignette to seat copy
    float vig = smoothstep(1.35, 0.25, length((uv - 0.5) * vec2(aspect, 1.0)));
    col *= mix(0.72, 1.0, vig);

    gl_FragColor = vec4(col, 1.0);
  }
`;function d({drive:e}){let r=(0,s.useRef)(null),{size:a}=(0,n.useThree)(),i=(0,s.useRef)({x:0,y:0}),v=(0,s.useMemo)(()=>({u_time:{value:0},u_resolution:{value:new l.Vector2(a.width,a.height)},u_pointer:{value:new l.Vector2(0,0)},u_speed:{value:0},u_intensity:{value:0},u_graphite0:{value:new l.Color("#1a2233")},u_graphite1:{value:new l.Color("#222d42")},u_streakCore:{value:new l.Color("#7aa2ff")},u_streakCool:{value:new l.Color("#3552d6")}}),[]);return(0,o.useFrame)(({clock:t},o)=>{let n=r.current;if(!n)return;n.uniforms.u_time.value=t.getElapsedTime(),n.uniforms.u_resolution.value.set(a.width,a.height);let s=e.current??{pointer:{x:0,y:0},speed:0},l=1-Math.pow(.0016,o);i.current.x+=(s.pointer.x-i.current.x)*l,i.current.y+=(s.pointer.y-i.current.y)*l,n.uniforms.u_pointer.value.set(i.current.x,i.current.y),n.uniforms.u_speed.value=s.speed;let u=n.uniforms.u_intensity.value;n.uniforms.u_intensity.value=u+(1-u)*Math.min(1,1.2*o)}),(0,t.jsxs)("mesh",{frustumCulled:!1,children:[(0,t.jsx)("planeGeometry",{args:[2,2]}),(0,t.jsx)("shaderMaterial",{ref:r,vertexShader:u,fragmentShader:c,uniforms:v,depthWrite:!1,depthTest:!1})]})}function v({drive:e,count:r}){let a=(0,s.useRef)(null),i=(0,s.useMemo)(()=>new l.Object3D,[]),{viewport:u}=(0,n.useThree)(),c=(0,s.useMemo)(()=>{let e=[];for(let t=0;t<r;t++)e.push({y:(Math.random()-.5)*2.4,z:(Math.random()-.5)*2.2,x:(Math.random()-.5)*7,baseSpeed:.5+1.4*Math.random(),len:.35+1.35*Math.random(),thin:.012+.02*Math.random(),bright:.4+.6*Math.random()});return e},[r]),d=(0,s.useMemo)(()=>new l.Color,[]);return(0,o.useFrame)((t,r)=>{let o=a.current;if(!o)return;let n=e.current??{pointer:{x:0,y:0},speed:0},s=Math.min(r,.05),l=.62*Math.max(u.width,6);for(let e=0;e<c.length;e++){let t=c[e];t.x+=s*t.baseSpeed*(.6+6.5*n.speed),t.x>l&&(t.x=-l);let r=t.y+.5*n.pointer.y,a=t.z+.4*n.pointer.x,u=t.len*(.6+5*n.speed);i.position.set(t.x,r,a),i.scale.set(u,t.thin,1),i.rotation.z=-.36+.05*n.pointer.y,i.updateMatrix(),o.setMatrixAt(e,i.matrix);let v=t.bright*(.35+1.6*n.speed);d.setRGB(.42*v+.1,.55*v+.12,+v+.18),o.setColorAt(e,d)}o.instanceMatrix.needsUpdate=!0,o.instanceColor&&(o.instanceColor.needsUpdate=!0)}),(0,t.jsxs)("instancedMesh",{ref:a,args:[void 0,void 0,r],frustumCulled:!1,children:[(0,t.jsx)("planeGeometry",{args:[1,1]}),(0,t.jsx)("meshBasicMaterial",{transparent:!0,blending:l.AdditiveBlending,depthWrite:!1,depthTest:!1,opacity:.9,toneMapped:!1})]})}e.s(["default",0,function({lite:e=!1}){let o=(0,s.useRef)({pointer:{x:0,y:0},speed:0}),n=(0,s.useRef)(null),[l,u]=(0,s.useState)(!0);return(0,s.useEffect)(()=>{let e,t=n.current,r=window.scrollY,a=performance.now(),i=0,s=()=>{o.current.speed*=.92,o.current.speed<.001&&(o.current.speed=0),i=requestAnimationFrame(s)};i=requestAnimationFrame(s);let l=()=>{let e=performance.now(),t=Math.min(1,Math.abs(window.scrollY-r)/Math.max(e-a,16)*.5);o.current.speed=Math.max(o.current.speed,t),r=window.scrollY,a=e};window.addEventListener("scroll",l,{passive:!0}),t&&"u">typeof IntersectionObserver&&(e=new IntersectionObserver(([e])=>u(e.isIntersecting),{rootMargin:"120px"})).observe(t);let c=()=>u("visible"===document.visibilityState);return document.addEventListener("visibilitychange",c),()=>{cancelAnimationFrame(i),window.removeEventListener("scroll",l),e?.disconnect(),document.removeEventListener("visibilitychange",c)}},[]),(0,t.jsx)("div",{ref:n,className:"absolute inset-0",onPointerMove:e=>{let t=e.currentTarget.getBoundingClientRect();o.current.pointer.x=(e.clientX-t.left)/t.width*2-1,o.current.pointer.y=-((e.clientY-t.top)/t.height*2-1)},onPointerLeave:()=>{o.current.pointer.x=0,o.current.pointer.y=0},children:(0,t.jsxs)(r.Canvas,{frameloop:l?"always":"never",camera:{position:[0,0,5],fov:42},dpr:[1,2],gl:{antialias:!1,alpha:!1,powerPreference:"high-performance"},style:{position:"absolute",inset:0},children:[(0,t.jsx)(d,{drive:o}),(0,t.jsx)(v,{drive:o,count:e?120:220}),(0,t.jsx)(a.EffectComposer,{enableNormalPass:!1,children:(0,t.jsx)(a.Bloom,{intensity:e?.85:1.25,luminanceThreshold:.25,luminanceSmoothing:.3,mipmapBlur:!0,kernelSize:e?i.KernelSize.MEDIUM:i.KernelSize.LARGE})})]})})}],26720)},49148,e=>{e.n(e.i(26720))}]);