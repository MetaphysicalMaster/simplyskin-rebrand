(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,98443,e=>{"use strict";var t=e.i(55350);e.s(["extend",()=>t.e])},71320,e=>{"use strict";var t=e.i(55350);e.s(["createPortal",()=>t.o])},14714,e=>{"use strict";var t=e.i(55350);e.s(["applyProps",()=>t.s])},318,e=>{"use strict";var t=e.i(55350);e.s(["useLoader",()=>t.G])},71611,e=>{"use strict";function t(){return(t=Object.assign.bind()).apply(null,arguments)}e.s(["default",()=>t])},75565,e=>{"use strict";var t,o,a,i,r=e.i(71611),n=e.i(21348),s=e.i(64556),l=e.i(98443),c=e.i(46648),u=e.i(26843);function m(e,t,o){let a=(0,u.useThree)(e=>e.size),i=(0,u.useThree)(e=>e.viewport),r="number"==typeof e?e:a.width*i.dpr,l="number"==typeof t?t:a.height*i.dpr,c=("number"==typeof e?o:e)||{},{samples:m=0,depth:f,...d}=c,h=null!=f?f:c.depthBuffer,p=s.useMemo(()=>{let e=new n.WebGLRenderTarget(r,l,{minFilter:n.LinearFilter,magFilter:n.LinearFilter,type:n.HalfFloatType,...d});return h&&(e.depthTexture=new n.DepthTexture(r,l,n.FloatType)),e.samples=m,e},[]);return s.useLayoutEffect(()=>{p.setSize(r,l),m&&(p.samples=m)},[m,p,r,l]),s.useEffect(()=>()=>p.dispose(),[]),p}var f=n;let d=(t={},o="void main() { }",a="void main() { gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); discard;  }",(i=class extends f.ShaderMaterial{constructor(e){for(const i in super({vertexShader:o,fragmentShader:a,...e}),t)this.uniforms[i]=new f.Uniform(t[i]),Object.defineProperty(this,i,{get(){return this.uniforms[i].value},set(e){this.uniforms[i].value=e}});this.uniforms=f.UniformsUtils.clone(this.uniforms)}}).key=f.MathUtils.generateUUID(),i);class h extends n.MeshPhysicalMaterial{constructor(e=6,t=!1){super(),this.uniforms={chromaticAberration:{value:.05},transmission:{value:0},_transmission:{value:1},transmissionMap:{value:null},roughness:{value:0},thickness:{value:0},thicknessMap:{value:null},attenuationDistance:{value:1/0},attenuationColor:{value:new n.Color("white")},anisotropicBlur:{value:.1},time:{value:0},distortion:{value:0},distortionScale:{value:.5},temporalDistortion:{value:0},buffer:{value:null}},this.onBeforeCompile=o=>{o.uniforms={...o.uniforms,...this.uniforms},this.anisotropy>0&&(o.defines.USE_ANISOTROPY=""),t?o.defines.USE_SAMPLER="":o.defines.USE_TRANSMISSION="",o.fragmentShader=`
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
`+o.fragmentShader,o.fragmentShader=o.fragmentShader.replace("#include <transmission_pars_fragment>",`
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
`),o.fragmentShader=o.fragmentShader.replace("#include <transmission_fragment>",`  
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
`)},Object.keys(this.uniforms).forEach(e=>Object.defineProperty(this,e,{get:()=>this.uniforms[e].value,set:t=>this.uniforms[e].value=t}))}}let p=s.forwardRef(({buffer:e,transmissionSampler:t=!1,backside:o=!1,side:a=n.FrontSide,transmission:i=1,thickness:u=0,backsideThickness:f=0,backsideEnvMapIntensity:p=1,samples:v=10,resolution:g,backsideResolution:x,background:M,anisotropy:y,anisotropicBlur:b,...S},w)=>{let C,T,j,z;(0,l.extend)({MeshTransmissionMaterial:h});let A=s.useRef(null),[R]=s.useState(()=>new d),F=m(x||g),E=m(g);return(0,c.useFrame)(e=>{if(A.current.time=e.clock.elapsedTime,A.current.buffer===E.texture&&!t){var i;(z=null==(i=A.current.__r3f.parent)?void 0:i.object)&&(j=e.gl.toneMapping,C=e.scene.background,T=A.current.envMapIntensity,e.gl.toneMapping=n.NoToneMapping,M&&(e.scene.background=M),z.material=R,o&&(e.gl.setRenderTarget(F),e.gl.render(e.scene,e.camera),z.material=A.current,z.material.buffer=F.texture,z.material.thickness=f,z.material.side=n.BackSide,z.material.envMapIntensity=p),e.gl.setRenderTarget(E),e.gl.render(e.scene,e.camera),z.material=A.current,z.material.thickness=u,z.material.side=a,z.material.buffer=E.texture,z.material.envMapIntensity=T,e.scene.background=C,e.gl.setRenderTarget(null),e.gl.toneMapping=j)}}),s.useImperativeHandle(w,()=>A.current,[]),s.createElement("meshTransmissionMaterial",(0,r.default)({args:[v,t],ref:A},S,{buffer:e||E.texture,_transmission:i,anisotropicBlur:null!=b?b:y,transmission:t?i:0,thickness:u,side:a}))});e.s(["MeshTransmissionMaterial",0,p],75565)},41967,e=>{"use strict";var t=e.i(44180),o=e.i(1529),a=e.i(46648),i=e.i(26843),r=e.i(92958),n=e.i(44803),s=e.i(75565),l=e.i(79867),c=e.i(43050),u=e.i(64556),m=e.i(21348),f=e.i(43390);let d=["#f06ba8","#f7a6c8","#e0568f","#f0c987","#fff1f6"],h=["#f7a6c8","#f0c987","#fff1f6","#f06ba8"];function p({spec:e,body:o,lite:i}){let r=(0,u.useRef)(null);return(0,a.useFrame)((t,a)=>{let i=r.current;if(!i)return;i.position.copy(o.pos);let n=o.squash,s=o.vis;i.visible=s>.02,i.scale.set(e.radius*(1-.5*n)*s,e.radius*(1+n)*s,e.radius*(1-.5*n)*s),i.rotation.y+=.3*a,i.rotation.z=.18*o.vel.x}),(0,t.jsxs)("mesh",{ref:r,position:e.home,children:[(0,t.jsx)("sphereGeometry",{args:[1,i?24:40,i?24:40]}),(0,t.jsx)(s.MeshTransmissionMaterial,{samples:i?4:8,resolution:i?128:256,thickness:.9,roughness:.05,ior:1.32,chromaticAberration:.5,anisotropy:.2,distortion:.2,distortionScale:.4,temporalDistortion:.08,clearcoat:1,clearcoatRoughness:.04,color:e.color,attenuationColor:e.color,attenuationDistance:.7,transmission:.62})]})}function v(){return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("ambientLight",{intensity:.5}),(0,t.jsxs)(r.Environment,{resolution:256,frames:1,children:[(0,t.jsx)(n.Lightformer,{form:"rect",intensity:4,color:"#fff4ec",position:[-3.4,3.6,2],rotation:[-Math.PI/5,0,0],scale:[6,9,1]}),(0,t.jsx)(n.Lightformer,{form:"rect",intensity:2.7,color:"#f06ba8",position:[4,.8,1],rotation:[0,-Math.PI/2.4,0],scale:[6,7,1]}),(0,t.jsx)(n.Lightformer,{form:"ring",intensity:2.4,color:"#f0c987",position:[1.4,2.2,-3.6],scale:[4,4,1]}),(0,t.jsx)(n.Lightformer,{form:"circle",intensity:1.5,color:"#e8b86a",position:[-1.6,-2.6,-3],scale:[7,7,1]})]}),(0,t.jsx)("directionalLight",{position:[-4,5,3],intensity:1,color:"#fff0f6"})]})}function g({pointer:e,lite:o,surge:r,burstRef:n}){var s;let l=(0,u.useRef)(null),c=(s=o?7:11,(0,u.useMemo)(()=>{let e=[];for(let t=0;t<s;t++){let o=t/Math.max(1,s-1),a=(1.7*Math.sin(2.4*t)+(t%2==0?.4:-.4))*1,i=(o-.5)*4.6+.5*Math.sin(1.7*t),r=.7*Math.cos(1.3*t),n=.42+.55*Math.abs(Math.sin(3.1*t)),l=d[t%d.length];e.push({radius:n,color:l,home:new m.Vector3(a,i,r),phase:1.37*t,speed:.5+t%5*.12,jiggle:.6+t%3*.25})}return e},[s])),{viewport:h}=(0,i.useThree)(),v=(0,u.useMemo)(()=>c.map(e=>({pos:e.home.clone(),vel:new m.Vector3,squash:0,vis:1,popT:0,cooldown:0})),[c]),x=(0,u.useRef)(0),M=(0,u.useMemo)(()=>new m.Vector3,[]);return(0,a.useFrame)(({clock:t},o)=>{let a=l.current;if(!a)return;let i=Math.min(o,1/30),s=t.getElapsedTime(),u=m.MathUtils.clamp(f.fizzBus.velocity/28,-1,1.6);r.current+=(u-r.current)*Math.min(1,6*i);let d=r.current,p=e.current?.active??!1,g=(e.current?.x??0)*(h.width/2),y=(e.current?.y??0)*(h.height/2),b=Math.max(1e-4,a.scale.x),S=(g-a.position.x)/b,w=(y-a.position.y)/b;for(let e=0;e<v.length;e++){let t=c[e],o=v[e],r=.28*Math.sin(s*t.speed+t.phase)*t.jiggle,l=.34*Math.cos(s*t.speed*.8+t.phase)*t.jiggle,u=t.home.x+r,m=t.home.y+l,f=t.home.z;if(o.vel.x+=(u-o.pos.x)*7.5*i,o.vel.y+=(m-o.pos.y)*7.5*i,o.vel.z+=(f-o.pos.z)*7.5*i,o.vel.y+=2.6*d*(.7+.5*t.jiggle)*i*60*.06,o.cooldown=Math.max(0,o.cooldown-i),o.popT>0)o.popT-=i,o.vis=Math.max(0,o.vis-9*i),o.popT<=0&&(o.pos.set(t.home.x+(Math.sin(7.3*s+e)-.1)*.9,t.home.y-5.5,t.home.z),o.vel.set(0,3.4,0));else if(o.vis=Math.min(1,o.vis+1.6*i),p){let e=o.pos.x-S,r=o.pos.y-w,s=e*e+r*r,l=.78*t.radius;if(o.cooldown<=0&&o.vis>.92&&s<l*l)o.popT=.16,o.cooldown=2.8,M.set(o.pos.x*b+a.position.x,o.pos.y*b+a.position.y,o.pos.z*b),n.current?.(M,t.color,t.radius);else if(s<2.2*2.2){let t=Math.max(1e-4,Math.sqrt(s)),a=(1-t/2.2)*9;o.vel.x+=e/t*a*i,o.vel.y+=r/t*a*i}}}for(let e=0;e<v.length;e++)for(let t=e+1;t<v.length;t++){let o=v[e],a=v[t],r=a.pos.x-o.pos.x,n=a.pos.y-o.pos.y,s=a.pos.z-o.pos.z,l=Math.max(1e-4,Math.sqrt(r*r+n*n+s*s)),u=(c[e].radius+c[t].radius)*.82;if(l<u){let e=(u-l)/u,t=r/l*e*6*i,c=n/l*e*6*i,m=s/l*e*6*i;o.vel.x-=t,o.vel.y-=c,o.vel.z-=m,a.vel.x+=t,a.vel.y+=c,a.vel.z+=m}}let C=Math.pow(9e-4,i);for(let e=0;e<v.length;e++){let t=v[e];t.vel.multiplyScalar(C),t.pos.addScaledVector(t.vel,i);let o=Math.min(.16,.05*t.vel.length()+.03*Math.abs(d));t.squash+=(o-t.squash)*Math.min(1,10*i)}x.current=Math.min(1,x.current+.7*o);let T=1-Math.pow(1-x.current,3);a.position.y=-((1-T)*1.4);let j=m.MathUtils.clamp(h.width/9,.62,1.15);a.scale.setScalar((.6+.4*T)*j)}),(0,t.jsx)("group",{ref:l,children:c.map((e,a)=>(0,t.jsx)(p,{spec:e,body:v[a],lite:o},a))})}function x({surge:e,burstRef:o,lite:r}){let n=r?160:260,{viewport:s}=(0,i.useThree)(),l=(0,u.useRef)(null),c=(0,u.useMemo)(()=>({positions:new Float32Array(3*n),colors:new Float32Array(3*n),sizes:new Float32Array(n),alphas:new Float32Array(n),vel:new Float32Array(3*n),life:new Float32Array(n),maxLife:new Float32Array(n),wobble:new Float32Array(n),spark:new Uint8Array(n),cursor:0,emitAcc:0}),[n]),f=(0,u.useMemo)(()=>({uScale:{value:300}}),[]),d=(0,u.useMemo)(()=>h.map(e=>new m.Color(e)),[]),p=(0,u.useMemo)(()=>new m.Color,[]);return(0,u.useEffect)(()=>{let e=()=>{for(let e=0;e<n;e++){let t=(c.cursor+e)%n;if(c.life[t]<=0)return c.cursor=(t+1)%n,t}return -1};return o.current=(t,o,a=.7)=>{p.set(o);let i=r?9:13;for(let o=0;o<i;o++){let r=e();if(r<0)return;let n=o/i*Math.PI*2+.7*Math.random(),s=1.2+2.2*Math.random()*(.6+a);c.positions[3*r]=t.x,c.positions[3*r+1]=t.y,c.positions[3*r+2]=t.z,c.vel[3*r]=Math.cos(n)*s,c.vel[3*r+1]=Math.sin(n)*s+.9,c.vel[3*r+2]=(Math.random()-.5)*.6;let l=o%3==0?p:d[(o+r)%d.length];c.colors[3*r]=Math.min(1,1.15*l.r),c.colors[3*r+1]=Math.min(1,1.15*l.g),c.colors[3*r+2]=Math.min(1,1.15*l.b),c.sizes[r]=.07+.11*Math.random(),c.maxLife[r]=c.life[r]=.45+.4*Math.random(),c.wobble[r]=Math.random()*Math.PI*2,c.spark[r]=1,c.alphas[r]=1}},()=>{o.current=null}},[n,c,r,d,p,o]),(0,a.useFrame)((t,o)=>{let a=Math.min(o,1/30),i=t.clock.elapsedTime,u=s.width,h=s.height,p=Math.max(0,e.current),v=t.camera;f.uScale.value=t.size.height*t.gl.getPixelRatio()/(2*Math.tan(m.MathUtils.degToRad(v.fov)/2));let g=(r?5:8)+p*(r?55:90);for(c.emitAcc+=g*a;c.emitAcc>=1;){c.emitAcc-=1;let e=-1;for(let t=0;t<n;t++){let o=(c.cursor+t)%n;if(c.life[o]<=0){c.cursor=(o+1)%n,e=o;break}}if(e<0)break;let t=e;c.positions[3*t]=(Math.random()-.5)*u*.92,c.positions[3*t+1]=-h/2-.4,c.positions[3*t+2]=(Math.random()-.5)*2,c.vel[3*t]=(Math.random()-.5)*.2,c.vel[3*t+1]=.65+ +Math.random()+2.4*p,c.vel[3*t+2]=0;let o=d[Math.random()*d.length|0];c.colors[3*t]=o.r,c.colors[3*t+1]=o.g,c.colors[3*t+2]=o.b,c.sizes[t]=.035+.075*Math.random(),c.maxLife[t]=c.life[t]=3.2+2.2*Math.random(),c.wobble[t]=Math.random()*Math.PI*2,c.spark[t]=0,c.alphas[t]=0}for(let e=0;e<n;e++){if(c.life[e]<=0){c.alphas[e]=0;continue}c.life[e]-=a;let t=1===c.spark[e];t?(c.vel[3*e]*=Math.pow(.012,a),c.vel[3*e+1]*=Math.pow(.06,a),c.vel[3*e+1]+=.5*a):(c.vel[3*e+1]+=.18*a,c.positions[3*e]+=.16*Math.sin(2.4*i+c.wobble[e])*a),c.positions[3*e]+=c.vel[3*e]*a,c.positions[3*e+1]+=c.vel[3*e+1]*a,c.positions[3*e+2]+=c.vel[3*e+2]*a;let o=Math.min(1,(c.maxLife[e]-c.life[e])/.25),r=Math.min(1,c.life[e]/(t?.3:.6));c.alphas[e]=o*r*(t?.95:.5),c.positions[3*e+1]>h/2+.6&&(c.life[e]=0,c.alphas[e]=0)}let x=l.current;x&&(x.attributes.position.needsUpdate=!0,x.attributes.aColor.needsUpdate=!0,x.attributes.aSize.needsUpdate=!0,x.attributes.aAlpha.needsUpdate=!0)}),(0,t.jsxs)("points",{frustumCulled:!1,children:[(0,t.jsxs)("bufferGeometry",{ref:l,children:[(0,t.jsx)("bufferAttribute",{attach:"attributes-position",args:[c.positions,3]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-aColor",args:[c.colors,3]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-aSize",args:[c.sizes,1]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-aAlpha",args:[c.alphas,1]})]}),(0,t.jsx)("shaderMaterial",{transparent:!0,depthWrite:!1,blending:m.AdditiveBlending,uniforms:f,vertexShader:`
          attribute vec3 aColor;
          attribute float aSize;
          attribute float aAlpha;
          uniform float uScale;
          varying vec3 vColor;
          varying float vAlpha;
          void main() {
            vColor = aColor;
            vAlpha = aAlpha;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize * uScale / -mv.z;
            gl_Position = projectionMatrix * mv;
          }
        `,fragmentShader:`
          precision mediump float;
          varying vec3 vColor;
          varying float vAlpha;
          void main() {
            vec2 uv = gl_PointCoord - 0.5;
            float d = length(uv);
            float core = smoothstep(0.5, 0.1, d);
            float gloss = smoothstep(0.22, 0.0, length(uv + vec2(0.13, -0.13))) * 0.5;
            float a = core * vAlpha;
            if (a < 0.004) discard;
            gl_FragColor = vec4(vColor + gloss, a);
          }
        `})]})}e.s(["default",0,function({lite:e=!1}){let a=(0,u.useRef)({x:0,y:0,active:!1}),i=(0,u.useRef)(null),r=(0,u.useRef)(0),n=(0,u.useRef)(null),[s,f]=(0,u.useState)(!0);return(0,u.useEffect)(()=>{let e,t=i.current,o=!0,a=()=>f(o&&"visible"===document.visibilityState);return t&&"u">typeof IntersectionObserver&&(e=new IntersectionObserver(([e])=>{o=e.isIntersecting,a()},{rootMargin:"120px"})).observe(t),document.addEventListener("visibilitychange",a),()=>{e?.disconnect(),document.removeEventListener("visibilitychange",a)}},[]),(0,u.useEffect)(()=>{let e=i.current;if(!e)return;let t=t=>{let o=e.getBoundingClientRect();if(t.clientX<o.left||t.clientX>o.right||t.clientY<o.top||t.clientY>o.bottom){a.current.active=!1;return}a.current.x=(t.clientX-o.left)/o.width*2-1,a.current.y=-((t.clientY-o.top)/o.height*2-1),a.current.active=!0},o=()=>{a.current.active=!1};return window.addEventListener("pointermove",t,{passive:!0}),window.addEventListener("pointerdown",t,{passive:!0}),document.documentElement.addEventListener("pointerleave",o),()=>{window.removeEventListener("pointermove",t),window.removeEventListener("pointerdown",t),document.documentElement.removeEventListener("pointerleave",o)}},[]),(0,t.jsx)("div",{ref:i,className:"absolute inset-0",children:(0,t.jsxs)(o.Canvas,{frameloop:s?"always":"never",camera:{position:[0,0,8],fov:40},dpr:[1,2],gl:{antialias:!0,alpha:!0,powerPreference:"high-performance",toneMapping:m.ACESFilmicToneMapping},style:{position:"absolute",inset:0},children:[(0,t.jsx)(v,{}),(0,t.jsx)(g,{pointer:a,lite:e,surge:r,burstRef:n}),(0,t.jsx)(x,{surge:r,burstRef:n,lite:e}),(0,t.jsxs)(l.EffectComposer,{enableNormalPass:!1,children:[(0,t.jsx)(l.Bloom,{intensity:e?.62:.9,luminanceThreshold:.64,luminanceSmoothing:.22,mipmapBlur:!0,kernelSize:e?c.KernelSize.MEDIUM:c.KernelSize.LARGE}),(0,t.jsx)(l.Vignette,{eskil:!1,offset:.32,darkness:.62})]})]})})}])},82328,e=>{e.n(e.i(41967))}]);