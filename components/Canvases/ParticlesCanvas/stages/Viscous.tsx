import { Vector2, WebGLRenderTarget } from "three";
import faceVert from "../glsl/face.vert.glsl";
import viscousFrag from "../glsl/viscous.frag.glsl";
import BasePass, { BasePassProps } from "./BasePass";

type ViscousProps = {
  iterations: number;
  boundarySpace: Vector2;
  velocity: WebGLRenderTarget;
  dst1: WebGLRenderTarget;
  v: unknown;
  cellScale: Vector2;
  dt: number;
} & Omit<BasePassProps, "material">;

type UpdateProps = {
  viscous: number;
  iterations: number;
  dt: number;
};

export default class Viscous extends BasePass<UpdateProps> {
  output0: WebGLRenderTarget;
  output1: WebGLRenderTarget;
  iterations: number;

  constructor({
    iterations,
    boundarySpace,
    velocity,
    dst1: output1,
    v,
    cellScale: px,
    dt,
    ...baseProps
  }: ViscousProps) {
    super({
      ...baseProps,
      material: {
        vertexShader: faceVert,
        fragmentShader: viscousFrag,
        uniforms: {
          boundarySpace: {
            value: boundarySpace,
          },
          velocity: {
            value: velocity.texture,
          },
          velocity_new: {
            value: output1.texture,
          },
          v: {
            value: v,
          },
          px: {
            value: px,
          },
          dt: {
            value: dt,
          },
        },
      },
    });
    this.output0 = output1;
    this.output1 = this.dst;
    this.iterations = iterations;
  }

  update() {
    let fbo_in = this.output0,
      fbo_out = this.output1;
    for (let i = 0; i < this.iterations; i++) {
      if (i % 2 == 0) {
        fbo_in = this.output0;
        fbo_out = this.output1;
      } else {
        fbo_in = this.output1;
        fbo_out = this.output0;
      }

      this.material!.uniforms.velocity_new.value = fbo_in.texture;
      this.dst = fbo_out;

      super.update();
    }

    return fbo_out;
  }

  updateUniforms({
    viscous,
    iterations,
    dt,
  }: Pick<UpdateProps, "dt" | "iterations" | "viscous">) {
    this.material.uniforms.v.value = viscous;
    this.material.uniforms.dt.value = dt;
    this.iterations = iterations;
    super.update();
  }
}
