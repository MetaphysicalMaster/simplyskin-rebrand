(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,98443,e=>{"use strict";var t=e.i(55350);e.s(["extend",()=>t.e])},71320,e=>{"use strict";var t=e.i(55350);e.s(["createPortal",()=>t.o])},14714,e=>{"use strict";var t=e.i(55350);e.s(["applyProps",()=>t.s])},318,e=>{"use strict";var t=e.i(55350);e.s(["useLoader",()=>t.G])},71611,e=>{"use strict";function t(){return(t=Object.assign.bind()).apply(null,arguments)}e.s(["default",()=>t])},3782,e=>{"use strict";var t=e.i(64556),r=e.i(46648),i=e.i(21348);let o=t.forwardRef(({children:e,enabled:o=!0,speed:a=1,rotationIntensity:n=1,floatIntensity:s=1,floatingRange:l=[-.1,.1],autoInvalidate:c=!1,...u},m)=>{let f=t.useRef(null);t.useImperativeHandle(m,()=>f.current,[]);let d=t.useRef(1e4*Math.random());return(0,r.useFrame)(e=>{var t,r;if(!o||0===a)return;c&&e.invalidate();let u=d.current+e.clock.elapsedTime;f.current.rotation.x=Math.cos(u/4*a)/8*n,f.current.rotation.y=Math.sin(u/4*a)/8*n,f.current.rotation.z=Math.sin(u/4*a)/20*n;let m=Math.sin(u/4*a)/10;m=i.MathUtils.mapLinear(m,-.1,.1,null!=(t=null==l?void 0:l[0])?t:-.1,null!=(r=null==l?void 0:l[1])?r:.1),f.current.position.y=m*s,f.current.updateMatrix()}),t.createElement("group",u,t.createElement("group",{ref:f,matrixAutoUpdate:!1},e))});e.s(["Float",0,o])},75565,e=>{"use strict";var t,r,i,o,a=e.i(71611),n=e.i(21348),s=e.i(64556),l=e.i(98443),c=e.i(46648),u=e.i(26843);function m(e,t,r){let i=(0,u.useThree)(e=>e.size),o=(0,u.useThree)(e=>e.viewport),a="number"==typeof e?e:i.width*o.dpr,l="number"==typeof t?t:i.height*o.dpr,c=("number"==typeof e?r:e)||{},{samples:m=0,depth:f,...d}=c,v=null!=f?f:c.depthBuffer,p=s.useMemo(()=>{let e=new n.WebGLRenderTarget(a,l,{minFilter:n.LinearFilter,magFilter:n.LinearFilter,type:n.HalfFloatType,...d});return v&&(e.depthTexture=new n.DepthTexture(a,l,n.FloatType)),e.samples=m,e},[]);return s.useLayoutEffect(()=>{p.setSize(a,l),m&&(p.samples=m)},[m,p,a,l]),s.useEffect(()=>()=>p.dispose(),[]),p}var f=n;let d=(t={},r="void main() { }",i="void main() { gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); discard;  }",(o=class extends f.ShaderMaterial{constructor(e){for(const o in super({vertexShader:r,fragmentShader:i,...e}),t)this.uniforms[o]=new f.Uniform(t[o]),Object.defineProperty(this,o,{get(){return this.uniforms[o].value},set(e){this.uniforms[o].value=e}});this.uniforms=f.UniformsUtils.clone(this.uniforms)}}).key=f.MathUtils.generateUUID(),o);class v extends n.MeshPhysicalMaterial{constructor(e=6,t=!1){super(),this.uniforms={chromaticAberration:{value:.05},transmission:{value:0},_transmission:{value:1},transmissionMap:{value:null},roughness:{value:0},thickness:{value:0},thicknessMap:{value:null},attenuationDistance:{value:1/0},attenuationColor:{value:new n.Color("white")},anisotropicBlur:{value:.1},time:{value:0},distortion:{value:0},distortionScale:{value:.5},temporalDistortion:{value:0},buffer:{value:null}},this.onBeforeCompile=r=>{r.uniforms={...r.uniforms,...this.uniforms},this.anisotropy>0&&(r.defines.USE_ANISOTROPY=""),t?r.defines.USE_SAMPLER="":r.defines.USE_TRANSMISSION="",r.fragmentShader=`
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
`)},Object.keys(this.uniforms).forEach(e=>Object.defineProperty(this,e,{get:()=>this.uniforms[e].value,set:t=>this.uniforms[e].value=t}))}}let p=s.forwardRef(({buffer:e,transmissionSampler:t=!1,backside:r=!1,side:i=n.FrontSide,transmission:o=1,thickness:u=0,backsideThickness:f=0,backsideEnvMapIntensity:p=1,samples:h=10,resolution:g,backsideResolution:x,background:y,anisotropy:b,anisotropicBlur:M,...w},S)=>{let C,_,R,F;(0,l.extend)({MeshTransmissionMaterial:v});let T=s.useRef(null),[A]=s.useState(()=>new d),j=m(x||g),E=m(g);return(0,c.useFrame)(e=>{if(T.current.time=e.clock.elapsedTime,T.current.buffer===E.texture&&!t){var o;(F=null==(o=T.current.__r3f.parent)?void 0:o.object)&&(R=e.gl.toneMapping,C=e.scene.background,_=T.current.envMapIntensity,e.gl.toneMapping=n.NoToneMapping,y&&(e.scene.background=y),F.material=A,r&&(e.gl.setRenderTarget(j),e.gl.render(e.scene,e.camera),F.material=T.current,F.material.buffer=j.texture,F.material.thickness=f,F.material.side=n.BackSide,F.material.envMapIntensity=p),e.gl.setRenderTarget(E),e.gl.render(e.scene,e.camera),F.material=T.current,F.material.thickness=u,F.material.side=i,F.material.buffer=E.texture,F.material.envMapIntensity=_,e.scene.background=C,e.gl.setRenderTarget(null),e.gl.toneMapping=R)}}),s.useImperativeHandle(S,()=>T.current,[]),s.createElement("meshTransmissionMaterial",(0,a.default)({args:[h,t],ref:T},w,{buffer:e||E.texture,_transmission:o,anisotropicBlur:null!=M?M:b,transmission:t?o:0,thickness:u,side:i}))});e.s(["MeshTransmissionMaterial",0,p],75565)},38653,e=>{"use strict";var t=e.i(44180),r=e.i(1529),i=e.i(46648),o=e.i(26843),a=e.i(3782),n=e.i(92958),s=e.i(44803),l=e.i(75565),c=e.i(71611),u=e.i(64556),m=e.i(21348),f=e.i(98443);let d=parseInt(m.REVISION.replace(/\D+/g,""));class v extends m.ShaderMaterial{constructor(){super({uniforms:{time:{value:0},pixelRatio:{value:1}},vertexShader:`
        uniform float pixelRatio;
        uniform float time;
        attribute float size;  
        attribute float speed;  
        attribute float opacity;
        attribute vec3 noise;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vOpacity;

        void main() {
          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
          modelPosition.y += sin(time * speed + modelPosition.x * noise.x * 100.0) * 0.2;
          modelPosition.z += cos(time * speed + modelPosition.x * noise.y * 100.0) * 0.2;
          modelPosition.x += cos(time * speed + modelPosition.x * noise.z * 100.0) * 0.2;
          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectionPostion = projectionMatrix * viewPosition;
          gl_Position = projectionPostion;
          gl_PointSize = size * 25. * pixelRatio;
          gl_PointSize *= (1.0 / - viewPosition.z);
          vColor = color;
          vOpacity = opacity;
        }
      `,fragmentShader:`
        varying vec3 vColor;
        varying float vOpacity;
        void main() {
          float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
          float strength = 0.05 / distanceToCenter - 0.1;
          gl_FragColor = vec4(vColor, strength * vOpacity);
          #include <tonemapping_fragment>
          #include <${d>=154?"colorspace_fragment":"encodings_fragment"}>
        }
      `})}get time(){return this.uniforms.time.value}set time(e){this.uniforms.time.value=e}get pixelRatio(){return this.uniforms.pixelRatio.value}set pixelRatio(e){this.uniforms.pixelRatio.value=e}}let p=e=>e&&e.constructor===Float32Array,h=e=>e instanceof m.Vector2||e instanceof m.Vector3||e instanceof m.Vector4,g=e=>Array.isArray(e)?e:h(e)?e.toArray():[e,e,e];function x(e,t,r){return u.useMemo(()=>{if(void 0!==t)if(p(t))return t;else{if(t instanceof m.Color){let r=Array.from({length:3*e},()=>[t.r,t.g,t.b]).flat();return Float32Array.from(r)}if(h(t)||Array.isArray(t)){let r=Array.from({length:3*e},()=>g(t)).flat();return Float32Array.from(r)}return Float32Array.from({length:e},()=>t)}return Float32Array.from({length:e},r)},[t])}let y=u.forwardRef(({noise:e=1,count:t=100,speed:r=1,opacity:a=1,scale:n=1,size:s,color:l,children:d,...h},y)=>{u.useMemo(()=>(0,f.extend)({SparklesImplMaterial:v}),[]);let b=u.useRef(null),M=(0,o.useThree)(e=>e.viewport.dpr),w=g(n),S=u.useMemo(()=>Float32Array.from(Array.from({length:t},()=>w.map(m.MathUtils.randFloatSpread)).flat()),[t,...w]),C=x(t,s,Math.random),_=x(t,a),R=x(t,r),F=x(3*t,e),T=x(void 0===l?3*t:t,p(l)?l:new m.Color(l),()=>1);return(0,i.useFrame)(e=>{b.current&&b.current.material&&(b.current.material.time=e.clock.elapsedTime)}),u.useImperativeHandle(y,()=>b.current,[]),u.createElement("points",(0,c.default)({key:`particle-${t}-${JSON.stringify(n)}`},h,{ref:b}),u.createElement("bufferGeometry",null,u.createElement("bufferAttribute",{attach:"attributes-position",args:[S,3]}),u.createElement("bufferAttribute",{attach:"attributes-size",args:[C,1]}),u.createElement("bufferAttribute",{attach:"attributes-opacity",args:[_,1]}),u.createElement("bufferAttribute",{attach:"attributes-speed",args:[R,1]}),u.createElement("bufferAttribute",{attach:"attributes-color",args:[T,3]}),u.createElement("bufferAttribute",{attach:"attributes-noise",args:[F,3]})),d||u.createElement("sparklesImplMaterial",{transparent:!0,pixelRatio:M,depthWrite:!1}))});var b=e.i(79867),M=e.i(43050);let w=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,S=`
  precision highp float;

  varying vec2 vUv;

  uniform float u_time;
  uniform vec2  u_resolution;
  uniform vec2  u_pointer;     // -1..1
  uniform float u_intensity;   // 0..1 reveal
  uniform vec3  u_void0;       // deep void
  uniform vec3  u_void1;       // raised void
  uniform vec3  u_beam;        // warm shaft
  uniform vec3  u_beamCool;    // cool shaft

  // Hash + value noise for soft volumetric variation
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
      p *= 2.03;
      amp *= 0.5;
    }
    return v;
  }

  void main() {
    // Aspect-correct coords centered at the light source above-center.
    vec2 uv = vUv;
    float aspect = u_resolution.x / max(u_resolution.y, 1.0);
    vec2 p = (uv - 0.5);
    p.x *= aspect;

    // Light source drifts subtly + follows cursor a touch (the rake angle).
    vec2 src = vec2(0.04 + u_pointer.x * 0.12, 0.62 + u_pointer.y * 0.06);
    vec2 dir = p - src;
    float dist = length(dir);
    float ang = atan(dir.y, dir.x);

    // Radial shafts: modulate by angle with layered noise scrolling outward.
    float t = u_time * 0.045;
    float shaftField = 0.0;
    // Two beam systems: a tight warm core + a wider cool spread.
    float warp = ang * 3.0 + dist * 2.2;
    shaftField += fbm(vec2(warp, dist * 3.2 - t * 5.0)) * 0.7;
    shaftField += fbm(vec2(warp * 0.5 - 1.7, dist * 1.6 - t * 2.6)) * 0.5;

    // Sharpen into beams and fade with distance (volumetric falloff).
    float beams = pow(clamp(shaftField, 0.0, 1.0), 2.25);
    float falloff = exp(-dist * 1.5);
    float core = exp(-dist * 3.2) * 0.95; // bright source bloom seed

    // Vertical bias so light reads as descending from upper area.
    float vertical = smoothstep(1.05, -0.15, uv.y);

    float warmAmt = (beams * falloff * 0.85 + core) * vertical;
    float coolAmt = (fbm(vec2(warp * 0.7 + 4.0, dist * 2.0 - t * 3.4)) *
                     falloff * 0.5) * vertical;
    coolAmt = pow(clamp(coolAmt, 0.0, 1.0), 1.6);

    // Base void gradient (dark, raised toward the source).
    float vgrad = smoothstep(1.0, -0.1, uv.y);
    vec3 base = mix(u_void0, u_void1, vgrad * 0.85);
    // Gentle radial lift around the source.
    base += u_void1 * core * 0.6;

    vec3 col = base;
    col += u_beam * warmAmt * 1.22;
    col += u_beamCool * coolAmt * 0.92;

    // Faint drifting dust motes catching the light — cinematic volumetric feel.
    vec2 mp = p * 5.5 + vec2(0.0, t * 1.4);
    float motes = pow(noise(mp + noise(mp * 1.7)), 9.0);
    col += u_beam * motes * warmAmt * 2.4;

    // Subtle vignette to frame.
    float vig = smoothstep(1.25, 0.25, length(p));
    col *= mix(0.76, 1.0, vig);

    // Fine grain to avoid banding on the dark gradient.
    float grain = (hash(uv * u_resolution + u_time) - 0.5) * 0.012;
    col += grain;

    col *= mix(0.0, 1.0, u_intensity);

    gl_FragColor = vec4(col, 1.0);
  }
`,C="#161f2b";function _({pointer:e}){let r=(0,u.useRef)(null),{size:a,viewport:n}=(0,o.useThree)(),s=(0,u.useRef)({x:0,y:0}),l=(0,u.useMemo)(()=>({u_time:{value:0},u_resolution:{value:new m.Vector2(a.width,a.height)},u_pointer:{value:new m.Vector2(0,0)},u_intensity:{value:0},u_void0:{value:new m.Color(C)},u_void1:{value:new m.Color("#222d3e")},u_beam:{value:new m.Color("#f4e7c6")},u_beamCool:{value:new m.Color("#c6e6ef")}}),[]);return(0,i.useFrame)(({clock:t},i)=>{let o=r.current;if(!o)return;o.uniforms.u_time.value=t.getElapsedTime(),o.uniforms.u_resolution.value.set(a.width,a.height);let n=e.current??{x:0,y:0},l=1-Math.pow(.0015,i);s.current.x+=(n.x-s.current.x)*l,s.current.y+=(n.y-s.current.y)*l,o.uniforms.u_pointer.value.set(s.current.x,s.current.y);let c=o.uniforms.u_intensity.value;o.uniforms.u_intensity.value=c+(1-c)*Math.min(1,1.1*i)}),(0,t.jsxs)("mesh",{scale:[n.width,n.height,1],children:[(0,t.jsx)("planeGeometry",{args:[1,1]}),(0,t.jsx)("shaderMaterial",{ref:r,vertexShader:w,fragmentShader:S,uniforms:l,depthWrite:!1})]})}function R({pointer:e}){let r=(0,u.useRef)(null),o=(0,u.useRef)(null);return(0,i.useFrame)(({clock:t},i)=>{let o=r.current;if(!o)return;let a=t.getElapsedTime(),n=e.current??{x:0,y:0};o.rotation.y+=.18*i;let s=1-Math.pow(.0025,i),l=.32*n.y+.05*Math.sin(.4*a),c=-(.28*n.x);o.rotation.x+=(l-o.rotation.x)*s,o.rotation.z+=(c-o.rotation.z)*s;let u=1+.018*Math.sin(.55*a);o.scale.setScalar(u)}),(0,t.jsx)(a.Float,{speed:1,rotationIntensity:.18,floatIntensity:.5,children:(0,t.jsx)("group",{ref:r,children:(0,t.jsxs)("mesh",{ref:o,castShadow:!0,children:[(0,t.jsx)("octahedronGeometry",{args:[1.18,0]}),(0,t.jsx)(l.MeshTransmissionMaterial,{samples:10,resolution:512,thickness:1.55,roughness:.015,ior:1.46,chromaticAberration:1.05,anisotropy:.4,distortion:.2,distortionScale:.5,temporalDistortion:.06,clearcoat:1,clearcoatRoughness:.04,color:"#ffffff",attenuationColor:"#aed2dd",attenuationDistance:2.1,background:new m.Color(C)})]})})})}function F(){return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("ambientLight",{intensity:.32}),(0,t.jsxs)(n.Environment,{resolution:256,frames:1,children:[(0,t.jsx)(s.Lightformer,{form:"rect",intensity:3.5,color:"#fbeccb",position:[-3.2,3.4,2],rotation:[-Math.PI/5,0,0],scale:[5,9,1]}),(0,t.jsx)(s.Lightformer,{form:"rect",intensity:2.3,color:"#c6e6ef",position:[4,1.5,1],rotation:[0,-Math.PI/2.4,0],scale:[6,6,1]}),(0,t.jsx)(s.Lightformer,{form:"circle",intensity:2.6,color:"#ffffff",position:[0,-2.6,-4],scale:[7,7,1]}),(0,t.jsx)(s.Lightformer,{form:"ring",intensity:1.5,color:"#f4e7c6",position:[1.5,2.5,-2],scale:[3,3,1]})]}),(0,t.jsx)("directionalLight",{position:[-4,5,3],intensity:1.1,color:"#fff4e0"})]})}e.s(["default",0,function({lite:e=!1}){let i=(0,u.useRef)({x:0,y:0}),o=(0,u.useRef)(null),[a,n]=(0,u.useState)(!0);(0,u.useEffect)(()=>{let e=o.current;if(!e||"u"<typeof IntersectionObserver)return;let t=new IntersectionObserver(([e])=>n(e.isIntersecting),{rootMargin:"120px"});t.observe(e);let r=()=>n("visible"===document.visibilityState);return document.addEventListener("visibilitychange",r),()=>{t.disconnect(),document.removeEventListener("visibilitychange",r)}},[]);let s=a?"always":"never";return(0,t.jsxs)("div",{ref:o,className:"absolute inset-0",onPointerMove:e=>{let t=e.currentTarget.getBoundingClientRect();i.current.x=(e.clientX-t.left)/t.width*2-1,i.current.y=-((e.clientY-t.top)/t.height*2-1)},onPointerLeave:()=>{i.current.x=0,i.current.y=0},children:[(0,t.jsx)(r.Canvas,{orthographic:!0,frameloop:s,camera:{zoom:1,position:[0,0,1]},dpr:[1,2],gl:{antialias:!1,alpha:!1,powerPreference:"high-performance"},style:{position:"absolute",inset:0},children:(0,t.jsx)(_,{pointer:i})}),(0,t.jsxs)(r.Canvas,{frameloop:s,camera:{position:[0,0,5.2],fov:38},dpr:[1,2],gl:{antialias:!0,alpha:!0,powerPreference:"high-performance",toneMapping:m.ACESFilmicToneMapping},style:{position:"absolute",inset:0,pointerEvents:"none"},children:[(0,t.jsx)(F,{}),(0,t.jsx)(R,{pointer:i}),!e&&(0,t.jsx)(y,{count:28,scale:[6,5,3],size:2.4,speed:.28,opacity:.5,color:"#f3e6c8"}),(0,t.jsxs)(b.EffectComposer,{enableNormalPass:!1,children:[(0,t.jsx)(b.Bloom,{intensity:e?.95:1.45,luminanceThreshold:.6,luminanceSmoothing:.2,mipmapBlur:!0,kernelSize:M.KernelSize.LARGE}),(0,t.jsx)(b.Vignette,{eskil:!1,offset:.3,darkness:.82})]})]})]})}],38653)},78429,e=>{e.n(e.i(38653))}]);