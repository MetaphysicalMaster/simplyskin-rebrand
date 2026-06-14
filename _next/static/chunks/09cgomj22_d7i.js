(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,75464,e=>{"use strict";var t=e.i(44180),r=e.i(1529),a=e.i(46648),i=e.i(26843),o=e.i(64556),n=e.i(21348);let u=`
  precision highp float;

  // Per-particle data
  attribute float aRadius;   // orbital radius (distance from center)
  attribute float aAngle;    // initial angular position (radians)
  attribute float aSpeed;    // angular velocity multiplier (Keplerian-ish)
  attribute float aTilt;     // ring tilt / eccentricity seed
  attribute float aZ;        // out-of-plane offset for soft volume
  attribute float aSeed;     // 0..1 random per particle
  attribute float aScale;    // base point-size multiplier

  uniform float uTime;
  uniform float uSettle;     // 0 perturbed/eccentric .. 1 settled equilibrium
  uniform float uIntro;      // 0..1 reveal on mount
  uniform float uEase;       // 0..1 scroll-ease: 1 = full flow, 0 = near-still
  uniform float uDpr;
  uniform float uSize;       // global point-size scale
  uniform vec2  uPointer;    // -1..1 cursor in clip-ish space
  uniform float uPointerStr; // 0..1 strength (eased on enter/leave)

  varying float vRadius;     // normalized radius -> color ramp
  varying float vGlow;       // cursor proximity glow
  varying float vBright;     // settle/seed brightness

  void main() {
    // Angular motion: inner motes orbit faster (gentle Keplerian feel). The
    // scroll-ease slows the whole flow toward stillness without stopping it.
    float omega = aSpeed * (0.18 + 0.12 / (aRadius + 0.35));
    float ang = aAngle + uTime * omega * (0.35 + 0.65 * uEase);

    // Equilibrium radius vs. an eccentric/perturbed radius. As uSettle rises,
    // the eccentric wobble eases out and each mote rests on its balanced ring.
    float wobble = sin(ang * 2.0 + aSeed * 6.2831) * 0.16 * aTilt;
    float ecc = mix(wobble + (aSeed - 0.5) * 0.22, 0.0, smoothstep(0.0, 1.0, uSettle));
    float radius = aRadius + ecc;

    // Position on a gently tilted ring (tilt gives soft 3D volume, not a flat
    // disc). aZ + a small breathing term keep it organic.
    float breathe = sin(uTime * 0.5 + aSeed * 6.2831) * 0.04;
    vec3 pos = vec3(
      cos(ang) * radius,
      sin(ang) * radius * (0.62 + aTilt * 0.18),
      aZ + sin(ang * 1.3 + aSeed * 4.0) * 0.18 + breathe
    );

    // --- Cursor perturbation: gently push nearby motes outward, then they
    //     re-balance as the influence fades (handled by eased uPointerStr). ---
    vec3 pointer3 = vec3(uPointer * 1.6, 0.0);
    vec3 toP = pos - pointer3;
    float d = length(toP.xy) + 0.0001;
    float influence = uPointerStr * smoothstep(1.0, 0.0, d);
    pos.xy += (toP.xy / d) * influence * 0.26;
    pos.z += influence * 0.12;

    // Intro reveal — motes ease in from a slightly contracted core.
    pos = mix(pos * 0.7, pos, smoothstep(0.0, 1.0, uIntro));

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Point size: perspective attenuation + per-particle scale + dpr.
    float size = uSize * aScale * (0.7 + 0.5 * aSeed);
    gl_PointSize = size * uDpr * (300.0 / -mvPosition.z);
    gl_PointSize = clamp(gl_PointSize, 0.0, 15.0 * uDpr);

    vRadius = clamp(aRadius / 2.0, 0.0, 1.0);
    vGlow = influence;
    vBright = 0.7 + 0.3 * aSeed;
  }
`,l=`
  precision highp float;

  uniform vec3  uCore;     // sage core
  uniform vec3  uMoss;
  uniform vec3  uTerra;    // terracotta mid-ring
  uniform vec3  uSand;     // warm sand rim
  uniform vec3  uBloom;    // pale sage cursor bloom

  varying float vRadius;
  varying float vGlow;
  varying float vBright;

  void main() {
    // Soft round sprite (no texture), feathered edge.
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv);
    float alpha = smoothstep(0.5, 0.16, r);
    if (alpha <= 0.001) discard;

    // Grounded botanical ramp by orbital radius:
    // sage core -> moss -> terracotta -> warm sand rim.
    vec3 col = mix(uCore, uMoss, smoothstep(0.0, 0.34, vRadius));
    col = mix(col, uTerra, smoothstep(0.32, 0.66, vRadius));
    col = mix(col, uSand, smoothstep(0.62, 1.0, vRadius));

    // Cursor proximity warms a faint pale-sage bloom (serene, restrained).
    col = mix(col, uBloom, vGlow * 0.55);

    col *= vBright;

    float a = alpha * (0.5 + 0.45 * vBright);
    a += vGlow * 0.2; // perturbed motes glint a touch brighter

    gl_FragColor = vec4(col, a);
  }
`;function s({pointer:e,lite:r,easeRef:c}){let f=(0,o.useRef)(null),m=(0,o.useRef)(0),d=(0,o.useRef)(0),p=(0,o.useRef)({x:0,y:0,s:0}),v=(0,o.useRef)(1),{geometry:h,uniforms:g}=(0,o.useMemo)(()=>{let e,t=r?Math.floor(3520.0000000000005):6400,a=function(e,t){let r=new Float32Array(e),a=new Float32Array(e),i=new Float32Array(e),o=new Float32Array(e),n=new Float32Array(e),u=new Float32Array(e),l=new Float32Array(e);for(let s=0;s<e;s++){let e=t();r[s]=.18+1.82*Math.pow(e,.78),a[s]=t()*Math.PI*2,i[s]=(.6+.8*t())*(t()>.12?1:-1),o[s]=.4+.8*t(),n[s]=(t()-.5)*.5*(.4+.3*r[s]),u[s]=t(),l[s]=.7+.85*t()}return{radius:r,angle:a,speed:i,tilt:o,z:n,seed:u,scale:l}}(t,(e=70428,function(){e|=0;let t=Math.imul((e=e+0x6d2b79f5|0)^e>>>15,1|e);return(((t=t+Math.imul(t^t>>>7,61|t)^t)^t>>>14)>>>0)/0x100000000})),i=new n.BufferGeometry;return i.setAttribute("position",new n.BufferAttribute(new Float32Array(3*t),3)),i.setAttribute("aRadius",new n.BufferAttribute(a.radius,1)),i.setAttribute("aAngle",new n.BufferAttribute(a.angle,1)),i.setAttribute("aSpeed",new n.BufferAttribute(a.speed,1)),i.setAttribute("aTilt",new n.BufferAttribute(a.tilt,1)),i.setAttribute("aZ",new n.BufferAttribute(a.z,1)),i.setAttribute("aSeed",new n.BufferAttribute(a.seed,1)),i.setAttribute("aScale",new n.BufferAttribute(a.scale,1)),i.boundingSphere=new n.Sphere(new n.Vector3(0,0,0),4),{geometry:i,uniforms:{uTime:{value:0},uSettle:{value:0},uIntro:{value:0},uEase:{value:1},uDpr:{value:1},uSize:{value:r?3.4:3.9},uPointer:{value:new n.Vector2(0,0)},uPointerStr:{value:0},uCore:{value:new n.Color("#8aa37e")},uMoss:{value:new n.Color("#6f8a5f")},uTerra:{value:new n.Color("#c08457")},uSand:{value:new n.Color("#d8c39a")},uBloom:{value:new n.Color("#cfe0c2")}}}},[r]),{gl:b}=(0,i.useThree)();return(0,a.useFrame)(({clock:t},r)=>{let a=f.current;if(!a)return;let i=Math.min(r,1/30),o=t.getElapsedTime();a.uniforms.uTime.value=o,a.uniforms.uDpr.value=Math.min(b.getPixelRatio(),2),m.current+=(1-m.current)*Math.min(1,1.1*i),a.uniforms.uIntro.value=m.current,d.current+=(1-d.current)*Math.min(1,.36*i),a.uniforms.uSettle.value=d.current;let n=c.current??1;v.current+=(n-v.current)*Math.min(1,2*i),a.uniforms.uEase.value=v.current;let u=e.current??{x:0,y:0,active:0},l=1-Math.pow(.0025,i);p.current.x+=(u.x-p.current.x)*l,p.current.y+=(u.y-p.current.y)*l,p.current.s+=(u.active-p.current.s)*Math.min(1,2.6*i),a.uniforms.uPointer.value.set(p.current.x,p.current.y),a.uniforms.uPointerStr.value=p.current.s}),(0,t.jsx)("points",{geometry:h,frustumCulled:!1,children:(0,t.jsx)("shaderMaterial",{ref:f,vertexShader:u,fragmentShader:l,uniforms:g,transparent:!0,depthWrite:!1,depthTest:!1,blending:n.AdditiveBlending})})}function c({children:e}){let r=(0,o.useRef)(null);return(0,a.useFrame)(({clock:e})=>{let t=r.current;if(!t)return;let a=e.getElapsedTime();t.rotation.z=.06*Math.sin(.05*a),t.rotation.x=.05*Math.sin(.08*a)}),(0,t.jsx)("group",{ref:r,children:e})}e.s(["default",0,function({lite:e=!1,easeRef:a}){let i=(0,o.useRef)({x:0,y:0,active:0}),n=(0,o.useRef)(1);return(0,t.jsx)("div",{className:"absolute inset-0",onPointerMove:e=>{let t=e.currentTarget.getBoundingClientRect();i.current.x=(e.clientX-t.left)/t.width*2-1,i.current.y=-((e.clientY-t.top)/t.height*2-1),i.current.active=1},onPointerLeave:()=>{i.current.active=0},children:(0,t.jsx)(r.Canvas,{camera:{position:[0,0,4.4],fov:42},dpr:[1,2],gl:{antialias:!0,alpha:!0,powerPreference:"high-performance"},style:{position:"absolute",inset:0},children:(0,t.jsx)(c,{children:(0,t.jsx)(s,{pointer:i,lite:e,easeRef:a??n})})})})}],75464)},33327,e=>{e.n(e.i(75464))}]);