import { Vector2, WebGLRenderTarget } from "three";
import faceVert from "../glsl/face.vert.glsl";
import poissonFrag from "../glsl/poisson.frag.glsl";
import BasePass, { BasePassProps } from "./BasePass";

type PoissonProps = {
  boundarySpace: Vector2;
  dst1: WebGLRenderTarget;
  divergence: WebGLRenderTarget;
  cellScale: Vector2;
} & Omit<BasePassProps, "material">;

type UpdateProps = {
  iterations: number;
};

export default class Poisson extends BasePass<UpdateProps> {
  output0: WebGLRenderTarget;
  output1: WebGLRenderTarget;
  constructor(simProps: PoissonProps) {
    const {
      boundarySpace,
      dst1: output1,
      divergence,
      cellScale,
      ...baseProps
    } = simProps;
    super({
      ...baseProps,
      material: {
        vertexShader: faceVert,
        fragmentShader: poissonFrag,
        uniforms: {
          boundarySpace: {
            value: boundarySpace,
          },
          pressure: {
            value: output1.texture,
          },
          divergence: {
            value: divergence.texture,
          },
          px: {
            value: cellScale,
          },
        },
      },
    });
    this.output0 = output1;
    this.output1 = this.dst;
  }

  update({ iterations }: UpdateProps) {
    let p_in = this.output0,
      p_out = this.output1;
    for (let i = 0; i < iterations; i++) {
      if (i % 2 == 0) {
        p_in = this.output0;
        p_out = this.output1;
      } else {
        p_in = this.output1;
        p_out = this.output0;
      }

      this.material.uniforms.pressure.value = p_in.texture;
      this.dst = p_out;
      super.update();
    }

    return p_out;
  }
}
