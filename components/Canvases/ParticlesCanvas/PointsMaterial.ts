import { Object3DNode, extend } from "@react-three/fiber";
import { NormalBlending, ShaderMaterial, Vector2, Vector3 } from "three";
import pointsFrag from "./glsl/points.frag.glsl";
import pointsVert from "./glsl/points.vert.glsl";

class DofPointsMaterial extends ShaderMaterial {
  constructor(particleLength: number, fboSize = new Vector2(1, 1)) {
    super({
      vertexShader: pointsVert,
      fragmentShader: pointsFrag,
      uniforms: {
        positions: { value: null },
        uTime: { value: 0 },
        uFocus: { value: 0.0 },
        uBlur: { value: 0.0 },
        uChromaOffset: { value: 0.0001 },
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
