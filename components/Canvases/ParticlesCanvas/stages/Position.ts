import { Vector2, WebGLRenderTarget } from "three";
import positionFrag from "../glsl/position.frag.glsl";
import positionVert from "../glsl/position.vert.glsl";
import BasePass, { BasePassProps } from "./BasePass";

type DivergenceProps = {
  boundarySpace: Vector2;
  cellScale: Vector2;
  velocity: WebGLRenderTarget;
  dst1: WebGLRenderTarget;
} & Omit<BasePassProps, "material">;

type UpdateProps = {
  velocity: WebGLRenderTarget;
  time: number;
};

export default class Position extends BasePass<UpdateProps> {
  output0: WebGLRenderTarget;
  output1: WebGLRenderTarget;
  constructor(simProps: DivergenceProps) {
    const { velocity, cellScale, dst1, ...baseProps } = simProps;

    super({
      ...baseProps,
      raw: false,
      material: {
        vertexShader: positionVert,
        fragmentShader: positionFrag,
        uniforms: {
          particles: {
            value: dst1.texture,
          },
          velocity: {
            value: velocity.texture,
          },
          px: {
            value: cellScale,
          },
          time: {
            value: 0.0,
          },
        },
      },
    });
    this.output0 = dst1;
    this.output1 = this.dst;
  }

  update({ velocity, time }: UpdateProps) {
    const p_in = this.output0,
      p_out = this.output1;

    this.material.uniforms.particles.value = p_in.texture;
    this.material.uniforms.time.value = time;
    this.material.uniforms.velocity.value = velocity.texture;
    this.dst = p_out;

    super.update();
    [this.output0, this.output1] = [this.output1, this.output0];
    return this.dst.texture;
  }
}
