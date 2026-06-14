(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,98443,e=>{"use strict";var t=e.i(55350);e.s(["extend",()=>t.e])},71320,e=>{"use strict";var t=e.i(55350);e.s(["createPortal",()=>t.o])},14714,e=>{"use strict";var t=e.i(55350);e.s(["applyProps",()=>t.s])},318,e=>{"use strict";var t=e.i(55350);e.s(["useLoader",()=>t.G])},71611,e=>{"use strict";function t(){return(t=Object.assign.bind()).apply(null,arguments)}e.s(["default",()=>t])},3782,e=>{"use strict";var t=e.i(64556),r=e.i(46648),i=e.i(21348);let a=t.forwardRef(({children:e,enabled:a=!0,speed:n=1,rotationIntensity:o=1,floatIntensity:s=1,floatingRange:l=[-.1,.1],autoInvalidate:c=!1,...u},m)=>{let f=t.useRef(null);t.useImperativeHandle(m,()=>f.current,[]);let d=t.useRef(1e4*Math.random());return(0,r.useFrame)(e=>{var t,r;if(!a||0===n)return;c&&e.invalidate();let u=d.current+e.clock.elapsedTime;f.current.rotation.x=Math.cos(u/4*n)/8*o,f.current.rotation.y=Math.sin(u/4*n)/8*o,f.current.rotation.z=Math.sin(u/4*n)/20*o;let m=Math.sin(u/4*n)/10;m=i.MathUtils.mapLinear(m,-.1,.1,null!=(t=null==l?void 0:l[0])?t:-.1,null!=(r=null==l?void 0:l[1])?r:.1),f.current.position.y=m*s,f.current.updateMatrix()}),t.createElement("group",u,t.createElement("group",{ref:f,matrixAutoUpdate:!1},e))});e.s(["Float",0,a])},75565,e=>{"use strict";var t,r,i,a,n=e.i(71611),o=e.i(21348),s=e.i(64556),l=e.i(98443),c=e.i(46648),u=e.i(26843);function m(e,t,r){let i=(0,u.useThree)(e=>e.size),a=(0,u.useThree)(e=>e.viewport),n="number"==typeof e?e:i.width*a.dpr,l="number"==typeof t?t:i.height*a.dpr,c=("number"==typeof e?r:e)||{},{samples:m=0,depth:f,...d}=c,h=null!=f?f:c.depthBuffer,v=s.useMemo(()=>{let e=new o.WebGLRenderTarget(n,l,{minFilter:o.LinearFilter,magFilter:o.LinearFilter,type:o.HalfFloatType,...d});return h&&(e.depthTexture=new o.DepthTexture(n,l,o.FloatType)),e.samples=m,e},[]);return s.useLayoutEffect(()=>{v.setSize(n,l),m&&(v.samples=m)},[m,v,n,l]),s.useEffect(()=>()=>v.dispose(),[]),v}var f=o;let d=(t={},r="void main() { }",i="void main() { gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); discard;  }",(a=class extends f.ShaderMaterial{constructor(e){for(const a in super({vertexShader:r,fragmentShader:i,...e}),t)this.uniforms[a]=new f.Uniform(t[a]),Object.defineProperty(this,a,{get(){return this.uniforms[a].value},set(e){this.uniforms[a].value=e}});this.uniforms=f.UniformsUtils.clone(this.uniforms)}}).key=f.MathUtils.generateUUID(),a);class h extends o.MeshPhysicalMaterial{constructor(e=6,t=!1){super(),this.uniforms={chromaticAberration:{value:.05},transmission:{value:0},_transmission:{value:1},transmissionMap:{value:null},roughness:{value:0},thickness:{value:0},thicknessMap:{value:null},attenuationDistance:{value:1/0},attenuationColor:{value:new o.Color("white")},anisotropicBlur:{value:.1},time:{value:0},distortion:{value:0},distortionScale:{value:.5},temporalDistortion:{value:0},buffer:{value:null}},this.onBeforeCompile=r=>{r.uniforms={...r.uniforms,...this.uniforms},this.anisotropy>0&&(r.defines.USE_ANISOTROPY=""),t?r.defines.USE_SAMPLER="":r.defines.USE_TRANSMISSION="",r.fragmentShader=`
      uniform float chromaticAberration;         
      uniform float anisotropicBlur;      
      uniform float time;
      uniform float distortion;
      uniform float distortionScale;
      uniform float temporalDistortion;
      uniform sampler2D buffer;

      vec3 random3(vec3 c) {
        float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
        vec3 r;
        r.z = fract(512.0*j);
        j *= .125;
        r.x = fract(512.0*j);
        j *= .125;
        r.y = fract(512.0*j);
        return r-0.5;
      }

      uint hash( uint x ) {
        x += ( x << 10u );
        x ^= ( x >>  6u );
        x += ( x <<  3u );
        x ^= ( x >> 11u );
        x += ( x << 15u );
        return x;
      }

      // Compound versions of the hashing algorithm I whipped together.
      uint hash( uvec2 v ) { return hash( v.x ^ hash(v.y)                         ); }
      uint hash( uvec3 v ) { return hash( v.x ^ hash(v.y) ^ hash(v.z)             ); }
      uint hash( uvec4 v ) { return hash( v.x ^ hash(v.y) ^ hash(v.z) ^ hash(v.w) ); }

      // Construct a float with half-open range [0:1] using low 23 bits.
      // All zeroes yields 0.0, all ones yields the next smallest representable value below 1.0.
      float floatConstruct( uint m ) {
        const uint ieeeMantissa = 0x007FFFFFu; // binary32 mantissa bitmask
        const uint ieeeOne      = 0x3F800000u; // 1.0 in IEEE binary32
        m &= ieeeMantissa;                     // Keep only mantissa bits (fractional part)
        m |= ieeeOne;                          // Add fractional part to 1.0
        float  f = uintBitsToFloat( m );       // Range [1:2]
        return f - 1.0;                        // Range [0:1]
      }

      // Pseudo-random value in half-open range [0:1].
      float randomBase( float x ) { return floatConstruct(hash(floatBitsToUint(x))); }
      float randomBase( vec2  v ) { return floatConstruct(hash(floatBitsToUint(v))); }
      float randomBase( vec3  v ) { return floatConstruct(hash(floatBitsToUint(v))); }
      float randomBase( vec4  v ) { return floatConstruct(hash(floatBitsToUint(v))); }
      float rand(float seed) {
        float result = randomBase(vec3(gl_FragCoord.xy, seed));
        return result;
      }

      const float F3 =  0.3333333;
      const float G3 =  0.1666667;

      float snoise(vec3 p) {
        vec3 s = floor(p + dot(p, vec3(F3)));
        vec3 x = p - s + dot(s, vec3(G3));
        vec3 e = step(vec3(0.0), x - x.yzx);
        vec3 i1 = e*(1.0 - e.zxy);
        vec3 i2 = 1.0 - e.zxy*(1.0 - e);
        vec3 x1 = x - i1 + G3;
        vec3 x2 = x - i2 + 2.0*G3;
        vec3 x3 = x - 1.0 + 3.0*G3;
        vec4 w, d;
        w.x = dot(x, x);
        w.y = dot(x1, x1);
        w.z = dot(x2, x2);
        w.w = dot(x3, x3);
        w = max(0.6 - w, 0.0);
        d.x = dot(random3(s), x);
        d.y = dot(random3(s + i1), x1);
        d.z = dot(random3(s + i2), x2);
        d.w = dot(random3(s + 1.0), x3);
        w *= w;
        w *= w;
        d *= w;
        return dot(d, vec4(52.0));
      }

      float snoiseFractal(vec3 m) {
        return 0.5333333* snoise(m)
              +0.2666667* snoise(2.0*m)
              +0.1333333* snoise(4.0*m)
              +0.0666667* snoise(8.0*m);
      }
`+r.fragmentShader,r.fragmentShader=r.fragmentShader.replace("#include <transmission_pars_fragment>",`
        #ifdef USE_TRANSMISSION
          // Transmission code is based on glTF-Sampler-Viewer
          // https://github.com/KhronosGroup/glTF-Sample-Viewer
          uniform float _transmission;
          uniform float thickness;
          uniform float attenuationDistance;
          uniform vec3 attenuationColor;
          #ifdef USE_TRANSMISSIONMAP
            uniform sampler2D transmissionMap;
          #endif
          #ifdef USE_THICKNESSMAP
            uniform sampler2D thicknessMap;
          #endif
          uniform vec2 transmissionSamplerSize;
          uniform sampler2D transmissionSamplerMap;
          uniform mat4 modelMatrix;
          uniform mat4 projectionMatrix;
          varying vec3 vWorldPosition;
          vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
            // Direction of refracted light.
            vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
            // Compute rotation-independant scaling of the model matrix.
            vec3 modelScale;
            modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
            modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
            modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
            // The thickness is specified in local space.
            return normalize( refractionVector ) * thickness * modelScale;
          }
          float applyIorToRoughness( const in float roughness, const in float ior ) {
            // Scale roughness with IOR so that an IOR of 1.0 results in no microfacet refraction and
            // an IOR of 1.5 results in the default amount of microfacet refraction.
            return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
          }
          vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
            float framebufferLod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );            
            #ifdef USE_SAMPLER
              #ifdef texture2DLodEXT
                return texture2DLodEXT(transmissionSamplerMap, fragCoord.xy, framebufferLod);
              #else
                return texture2D(transmissionSamplerMap, fragCoord.xy, framebufferLod);
              #endif
            #else
              return texture2D(buffer, fragCoord.xy);
            #endif
          }
          vec3 applyVolumeAttenuation( const in vec3 radiance, const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
            if ( isinf( attenuationDistance ) ) {
              // Attenuation distance is +∞, i.e. the transmitted color is not attenuated at all.
              return radiance;
            } else {
              // Compute light attenuation using Beer's law.
              vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
              vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance ); // Beer's law
              return transmittance * radiance;
            }
          }
          vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
            const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
            const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
            const in vec3 attenuationColor, const in float attenuationDistance ) {
            vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
            vec3 refractedRayExit = position + transmissionRay;
            // Project refracted vector on the framebuffer, while mapping to normalized device coordinates.
            vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
            vec2 refractionCoords = ndcPos.xy / ndcPos.w;
            refractionCoords += 1.0;
            refractionCoords /= 2.0;
            // Sample framebuffer to get pixel the refracted ray hits.
            vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
            vec3 attenuatedColor = applyVolumeAttenuation( transmittedLight.rgb, length( transmissionRay ), attenuationColor, attenuationDistance );
            // Get the specular component.
            vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
            return vec4( ( 1.0 - F ) * attenuatedColor * diffuseColor, transmittedLight.a );
          }
        #endif
`),r.fragmentShader=r.fragmentShader.replace("#include <transmission_fragment>",`  
        // Improve the refraction to use the world pos
        material.transmission = _transmission;
        material.transmissionAlpha = 1.0;
        material.thickness = thickness;
        material.attenuationDistance = attenuationDistance;
        material.attenuationColor = attenuationColor;
        #ifdef USE_TRANSMISSIONMAP
          material.transmission *= texture2D( transmissionMap, vUv ).r;
        #endif
        #ifdef USE_THICKNESSMAP
          material.thickness *= texture2D( thicknessMap, vUv ).g;
        #endif
        
        vec3 pos = vWorldPosition;
        float runningSeed = 0.0;
        vec3 v = normalize( cameraPosition - pos );
        vec3 n = inverseTransformDirection( normal, viewMatrix );
        vec3 transmission = vec3(0.0);
        float transmissionR, transmissionB, transmissionG;
        float randomCoords = rand(runningSeed++);
        float thickness_smear = thickness * max(pow(roughnessFactor, 0.33), anisotropicBlur);
        vec3 distortionNormal = vec3(0.0);
        vec3 temporalOffset = vec3(time, -time, -time) * temporalDistortion;
        if (distortion > 0.0) {
          distortionNormal = distortion * vec3(snoiseFractal(vec3((pos * distortionScale + temporalOffset))), snoiseFractal(vec3(pos.zxy * distortionScale - temporalOffset)), snoiseFractal(vec3(pos.yxz * distortionScale + temporalOffset)));
        }
        for (float i = 0.0; i < ${e}.0; i ++) {
          vec3 sampleNorm = normalize(n + roughnessFactor * roughnessFactor * 2.0 * normalize(vec3(rand(runningSeed++) - 0.5, rand(runningSeed++) - 0.5, rand(runningSeed++) - 0.5)) * pow(rand(runningSeed++), 0.33) + distortionNormal);
          transmissionR = getIBLVolumeRefraction(
            sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
            pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness  + thickness_smear * (i + randomCoords) / float(${e}),
            material.attenuationColor, material.attenuationDistance
          ).r;
          transmissionG = getIBLVolumeRefraction(
            sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
            pos, modelMatrix, viewMatrix, projectionMatrix, material.ior  * (1.0 + chromaticAberration * (i + randomCoords) / float(${e})) , material.thickness + thickness_smear * (i + randomCoords) / float(${e}),
            material.attenuationColor, material.attenuationDistance
          ).g;
          transmissionB = getIBLVolumeRefraction(
            sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
            pos, modelMatrix, viewMatrix, projectionMatrix, material.ior * (1.0 + 2.0 * chromaticAberration * (i + randomCoords) / float(${e})), material.thickness + thickness_smear * (i + randomCoords) / float(${e}),
            material.attenuationColor, material.attenuationDistance
          ).b;
          transmission.r += transmissionR;
          transmission.g += transmissionG;
          transmission.b += transmissionB;
        }
        transmission /= ${e}.0;
        totalDiffuse = mix( totalDiffuse, transmission.rgb, material.transmission );
`)},Object.keys(this.uniforms).forEach(e=>Object.defineProperty(this,e,{get:()=>this.uniforms[e].value,set:t=>this.uniforms[e].value=t}))}}let v=s.forwardRef(({buffer:e,transmissionSampler:t=!1,backside:r=!1,side:i=o.FrontSide,transmission:a=1,thickness:u=0,backsideThickness:f=0,backsideEnvMapIntensity:v=1,samples:p=10,resolution:g,backsideResolution:x,background:y,anisotropy:M,anisotropicBlur:b,...w},S)=>{let C,_,T,R;(0,l.extend)({MeshTransmissionMaterial:h});let j=s.useRef(null),[F]=s.useState(()=>new d),k=m(x||g),E=m(g);return(0,c.useFrame)(e=>{if(j.current.time=e.clock.elapsedTime,j.current.buffer===E.texture&&!t){var a;(R=null==(a=j.current.__r3f.parent)?void 0:a.object)&&(T=e.gl.toneMapping,C=e.scene.background,_=j.current.envMapIntensity,e.gl.toneMapping=o.NoToneMapping,y&&(e.scene.background=y),R.material=F,r&&(e.gl.setRenderTarget(k),e.gl.render(e.scene,e.camera),R.material=j.current,R.material.buffer=k.texture,R.material.thickness=f,R.material.side=o.BackSide,R.material.envMapIntensity=v),e.gl.setRenderTarget(E),e.gl.render(e.scene,e.camera),R.material=j.current,R.material.thickness=u,R.material.side=i,R.material.buffer=E.texture,R.material.envMapIntensity=_,e.scene.background=C,e.gl.setRenderTarget(null),e.gl.toneMapping=T)}}),s.useImperativeHandle(S,()=>j.current,[]),s.createElement("meshTransmissionMaterial",(0,n.default)({args:[p,t],ref:j},w,{buffer:e||E.texture,_transmission:a,anisotropicBlur:null!=b?b:M,transmission:t?a:0,thickness:u,side:i}))});e.s(["MeshTransmissionMaterial",0,v],75565)},93550,e=>{"use strict";var t=e.i(44180),r=e.i(1529),i=e.i(46648),a=e.i(26843),n=e.i(3782),o=e.i(92958),s=e.i(44803),l=e.i(75565),c=e.i(79867),u=e.i(43050),m=e.i(64556),f=e.i(21348);let d=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,h=`
  precision highp float;

  varying vec2 vUv;

  uniform float u_time;
  uniform vec2  u_resolution;
  uniform vec2  u_pointer;     // -1..1
  uniform float u_intensity;   // 0..1 reveal
  uniform vec3  u_surface;     // luminous platinum base
  uniform vec3  u_nude;        // warm nude
  uniform vec3  u_rose;        // soft rose/champagne
  uniform vec3  u_teal;        // single teal whisper

  // Hash + value noise for soft caustic variation.
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
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
  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.55;
    for (int i = 0; i < 5; i++) {
      v += amp * noise(p);
      p *= 2.02;
      amp *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = u_resolution.x / max(u_resolution.y, 1.0);
    vec2 p = (uv - 0.5);
    p.x *= aspect;

    float t = u_time * 0.05;

    // Soft light source upper-left, drifting + a touch of cursor pull.
    vec2 src = vec2(-0.42 + u_pointer.x * 0.1, 0.34 + u_pointer.y * 0.05);
    vec2 d = p - src;
    float dist = length(d);

    // Domain-warped caustic field: two slow scrolling fbm layers refracting.
    vec2 q = p * 1.6;
    vec2 warp = vec2(
      fbm(q + vec2(t * 0.6, t * 0.3)),
      fbm(q + vec2(-t * 0.4 + 3.1, t * 0.5 + 1.7))
    );
    float caustic = fbm(q + warp * 1.8 + vec2(t * 0.5, 0.0));
    // Sharpen into thin caustic filaments, but keep them soft (low power).
    float filaments = pow(smoothstep(0.42, 0.92, caustic), 2.2);

    // A broad luminous sweep band that travels diagonally (the "light sweep").
    float band = sin((p.x * 0.9 + p.y * 0.55) * 2.4 - t * 2.2);
    band = smoothstep(0.2, 1.0, band) * 0.5;

    // Radial falloff so the glow concentrates near the light source.
    float falloff = exp(-dist * 1.15);
    float core = exp(-dist * 2.6) * 0.6;

    float light = (filaments * 0.55 + band * 0.5 + core) * falloff;

    // Base luminous surface, gently graded toward the source.
    float vgrad = smoothstep(1.1, -0.2, uv.y);
    vec3 base = mix(u_surface, u_nude, vgrad * 0.35 + 0.12);
    base = mix(base, u_rose, smoothstep(0.0, 1.0, uv.y) * 0.14);

    vec3 col = base;
    // Warm nude + platinum caustic light (the bulk of the glow).
    col = mix(col, u_surface, light * 0.7);
    col += u_nude * filaments * falloff * 0.18;
    // Single teal whisper in the caustic cores only — restraint.
    col += u_teal * pow(filaments, 1.6) * falloff * 0.10;
    // Soft rose lift in the lower glow.
    col += u_rose * band * 0.06;

    // Very gentle vignette to frame without darkening the airy look.
    float vig = smoothstep(1.5, 0.4, length(p));
    col *= mix(0.94, 1.0, vig);

    // Fine dither to avoid banding on the near-white gradient (subtle).
    float grain = (hash(uv * u_resolution + u_time) - 0.5) * 0.006;
    col += grain;

    col = mix(u_surface, col, u_intensity);

    gl_FragColor = vec4(col, 1.0);
  }
`,v="#faf8f5";function p({pointer:e}){let r=(0,m.useRef)(null),{size:n,viewport:o}=(0,a.useThree)(),s=(0,m.useRef)({x:0,y:0}),l=(0,m.useMemo)(()=>({u_time:{value:0},u_resolution:{value:new f.Vector2(n.width,n.height)},u_pointer:{value:new f.Vector2(0,0)},u_intensity:{value:0},u_surface:{value:new f.Color(v)},u_nude:{value:new f.Color("#d8d0c5")},u_rose:{value:new f.Color("#e2d4cd")},u_teal:{value:new f.Color("#cdddd8")}}),[]);return(0,i.useFrame)(({clock:t},i)=>{let a=r.current;if(!a)return;a.uniforms.u_time.value=t.getElapsedTime(),a.uniforms.u_resolution.value.set(n.width,n.height);let o=e.current??{x:0,y:0},l=1-Math.pow(.0016,i);s.current.x+=(o.x-s.current.x)*l,s.current.y+=(o.y-s.current.y)*l,a.uniforms.u_pointer.value.set(s.current.x,s.current.y);let c=a.uniforms.u_intensity.value;a.uniforms.u_intensity.value=c+(1-c)*Math.min(1,1.1*i)}),(0,t.jsxs)("mesh",{scale:[o.width,o.height,1],children:[(0,t.jsx)("planeGeometry",{args:[1,1]}),(0,t.jsx)("shaderMaterial",{ref:r,vertexShader:d,fragmentShader:h,uniforms:l,depthWrite:!1,depthTest:!1})]})}function g({pointer:e,lite:r}){let a=(0,m.useRef)(null);return(0,i.useFrame)(({clock:t},r)=>{let i=a.current;if(!i)return;let n=t.getElapsedTime(),o=e.current??{x:0,y:0};i.rotation.y+=.05*r;let s=1-Math.pow(.0025,r),l=.18*o.y+.03*Math.sin(.3*n),c=-(.16*o.x);i.rotation.x+=(l-i.rotation.x)*s,i.rotation.z+=(c-i.rotation.z)*s;let u=1+.012*Math.sin(.5*n);i.scale.setScalar(u)}),(0,t.jsx)(n.Float,{speed:.8,rotationIntensity:.12,floatIntensity:.4,children:(0,t.jsx)("group",{ref:a,children:(0,t.jsxs)("mesh",{children:[(0,t.jsx)("icosahedronGeometry",{args:[1.5,6]}),(0,t.jsx)(l.MeshTransmissionMaterial,{samples:r?6:10,resolution:r?256:512,thickness:1.1,roughness:.2,ior:1.3,chromaticAberration:.22,anisotropy:.14,distortion:.1,distortionScale:.3,temporalDistortion:.03,clearcoat:1,clearcoatRoughness:.12,color:"#ffffff",attenuationColor:"#cfc6b9",attenuationDistance:2.6,background:new f.Color(v)})]})})})}function x(){return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("ambientLight",{intensity:.6}),(0,t.jsxs)(o.Environment,{resolution:256,frames:1,children:[(0,t.jsx)(s.Lightformer,{form:"rect",intensity:2.2,color:"#f4ece0",position:[-3.4,3.2,2],rotation:[-Math.PI/5,0,0],scale:[6,9,1]}),(0,t.jsx)(s.Lightformer,{form:"rect",intensity:1.6,color:"#efe9e1",position:[4,1.4,1],rotation:[0,-Math.PI/2.4,0],scale:[6,6,1]}),(0,t.jsx)(s.Lightformer,{form:"circle",intensity:1.1,color:"#d3e0db",position:[0,-2.4,-4],scale:[7,7,1]})]}),(0,t.jsx)("directionalLight",{position:[-4,5,3],intensity:.65,color:"#f7efe3"})]})}e.s(["default",0,function({lite:e=!1,onContextLost:i}){let a=(0,m.useRef)({x:0,y:0}),n=(0,m.useRef)(null),[o,s]=(0,m.useState)(!0),l=(0,m.useCallback)(({gl:e})=>{e.domElement.addEventListener("webglcontextlost",e=>{e.preventDefault(),i?.()},{once:!0})},[i]);(0,m.useEffect)(()=>{let e=n.current;if(!e||"u"<typeof IntersectionObserver)return;let t=new IntersectionObserver(([e])=>s(e.isIntersecting),{rootMargin:"120px"});t.observe(e);let r=()=>s("visible"===document.visibilityState);return document.addEventListener("visibilitychange",r),()=>{t.disconnect(),document.removeEventListener("visibilitychange",r)}},[]);let d=o?"always":"never";return(0,t.jsxs)("div",{ref:n,className:"absolute inset-0",onPointerMove:e=>{let t=e.currentTarget.getBoundingClientRect();a.current.x=(e.clientX-t.left)/t.width*2-1,a.current.y=-((e.clientY-t.top)/t.height*2-1)},onPointerLeave:()=>{a.current.x=0,a.current.y=0},children:[(0,t.jsx)(r.Canvas,{orthographic:!0,frameloop:d,camera:{zoom:1,position:[0,0,1]},dpr:[1,2],gl:{antialias:!1,alpha:!1,powerPreference:"high-performance",failIfMajorPerformanceCaveat:!0},onCreated:l,style:{position:"absolute",inset:0},children:(0,t.jsx)(p,{pointer:a})}),(0,t.jsxs)(r.Canvas,{frameloop:d,camera:{position:[0,0,5.4],fov:38},dpr:[1,2],gl:{antialias:!0,alpha:!0,powerPreference:"high-performance",toneMapping:f.ACESFilmicToneMapping,failIfMajorPerformanceCaveat:!0},onCreated:l,style:{position:"absolute",inset:0,pointerEvents:"none"},children:[(0,t.jsx)(x,{}),(0,t.jsx)(g,{pointer:a,lite:e}),(0,t.jsx)(c.EffectComposer,{enableNormalPass:!1,children:(0,t.jsx)(c.Bloom,{intensity:e?.45:.7,luminanceThreshold:.75,luminanceSmoothing:.25,mipmapBlur:!0,kernelSize:e?u.KernelSize.MEDIUM:u.KernelSize.LARGE})})]})]})}],93550)},88589,e=>{e.n(e.i(93550))}]);