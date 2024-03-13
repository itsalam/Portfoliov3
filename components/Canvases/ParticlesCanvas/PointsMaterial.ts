import { Object3DNode, extend } from "@react-three/fiber";
import { NormalBlending, ShaderMaterial, Vector2 } from "three";

class DofPointsMaterial extends ShaderMaterial {
  constructor(particleLength: number, fboSize = new Vector2(1, 1)) {
    super({
      vertexShader: `uniform sampler2D positions;
      uniform float uTime;
      uniform float uFocus;
      uniform float uFov;
      uniform float uBlur;
      uniform float uParticleLength;
      uniform vec2 uFboSize;
      varying float vDistance;
      varying float vPointSize;
      
      void main() { 
        vec4 pos = texture2D(positions, position.xy);
        if(pos.w == 0.0) return;
        vec2 ratio = max(uFboSize.x, uFboSize.y) / uFboSize;
        vec4 mvPosition = modelViewMatrix * vec4(pos.xyz, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_Position.xy /= ratio;
        vDistance = abs(uFocus - -mvPosition.z);  
        vPointSize = min((step(0.1, position.x)) * vDistance * uBlur, 50.0) + 2.0;
        gl_PointSize = vPointSize;
        
        // gl_PointSize = 5.0;
      }`,
      fragmentShader: `uniform float uOpacity;
      varying float vDistance;
      varying float vPointSize;
      void main() {
        vec2 cxy = 2.0 * gl_PointCoord - 1.0;
        float dist = dot(cxy, cxy);
        if (dist > 1.0) discard;
        // color(display-p3 0.69 0.709 0.682)
        float alpha = (0.5 - clamp(vDistance, 0.0 , 0.4));
        if (vPointSize > 2.0) alpha *= (1.0-dist) * 0.4; 
        if (vPointSize < 0.5) alpha = 1.0;
        gl_FragColor = vec4(vec3(0.69, 0.709, 0.682), alpha);
      }`,
      uniforms: {
        positions: { value: null },
        uTime: { value: 0 },
        uFocus: { value: 5.1 },
        uFov: { value: 94 },
        uBlur: { value: 10 },
        uParticleLength: { value: particleLength },
        uFboSize: { value: fboSize },
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
