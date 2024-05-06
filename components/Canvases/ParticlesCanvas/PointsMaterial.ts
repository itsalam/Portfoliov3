import { Object3DNode, extend } from "@react-three/fiber";
import { NormalBlending, ShaderMaterial, Vector2, Vector3 } from "three";

class DofPointsMaterial extends ShaderMaterial {
  constructor(particleLength: number, fboSize = new Vector2(1, 1)) {
    super({
      vertexShader: `uniform sampler2D positions;
      uniform float uTime;
      uniform float uFocus;
      uniform float uBlur;
      uniform float uParticleLength;
      uniform vec2 uFboSize;
      varying float vDistance;
      varying float vPointSize;
      varying float vSpeed;
      
      void main() { 
        vec4 pos = texture2D(positions, position.xy);
        if(pos.w == 0.0) return;
        vec2 ratio = max(uFboSize.x, uFboSize.y) / uFboSize;
        vec4 mvPosition = modelViewMatrix * vec4(pos.xyz, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_Position.xy /= ratio;
        vDistance = uFocus + sin(uTime * 0.1)*0.5 + mvPosition.z*2.0;  
        vPointSize = min(abs(mvPosition.z * 1.5 + uFocus) * uBlur, 75.0);

        gl_PointSize = vPointSize;
      }`,
      fragmentShader: `uniform float uOpacity;
      uniform float uTime;
      uniform vec3 uColor;
      uniform vec3 uAccent;
      varying float vDistance;
      varying float vPointSize;
      void main() {
        vec2 cxy = 2.0 * gl_PointCoord - 1.0;
        float dist = dot(cxy, cxy);
        if (dist > 1.0) discard;
        float alpha = mix(0.6, 1.0, clamp(vDistance, -3.0 , 3.0));
        alpha *= mix((1.0-dist) * 0.2 + 0.1, 1.0, 0.5*smoothstep(0.0, 1.0, 7.0-vPointSize)); 
        alpha *= clamp(uTime * 0.01, 0.0, 1.0);
        gl_FragColor = vec4(mix(uAccent, uColor, 1.0*smoothstep(0.0, 2.0, 12.0-vPointSize)), alpha);
      }`,
      uniforms: {
        positions: { value: null },
        uTime: { value: 0 },
        uFocus: { value: 0.0 },
        uBlur: { value: 0.0 },
        uParticleLength: { value: particleLength },
        uFboSize: { value: fboSize },
        uColor: { value: new Vector3(0.215, 0.231, 0.223) },
        uAccent: { value: new Vector3(0.215, 0.231, 0.223) },
      },
      transparent: true,
      blending: NormalBlending,
      depthWrite: false,
    });
  }
}

extend({ DofPointsMaterial });

export default DofPointsMaterial;

declare module "@react-three/fiber" {
  interface ThreeElements {
    dofPointsMaterial: Object3DNode<
      DofPointsMaterial,
      typeof DofPointsMaterial
    > & { particleLength: number; fboSize?: Vector2 };
  }
}
