import { Vector2, WebGLRenderTarget } from "three";
import faceVert from "../glsl/face.vert.glsl";
import pressureFrag from "../glsl/pressure.frag.glsl";
import BasePass, { BasePassProps } from "./BasePass";

type PressureProps = {
  boundarySpace: Vector2;
  cellScale: Vector2;
  dt: number;
  velocity: WebGLRenderTarget;
  pressure: WebGLRenderTarget;
} & Omit<BasePassProps, "material">;

type UpdateProps = {
  velocity?: WebGLRenderTarget;
  pressure?: WebGLRenderTarget;
};

export default class Pressure extends BasePass<UpdateProps> {
  constructor(simProps: PressureProps) {
    const { pressure, velocity, boundarySpace, cellScale, dt, ...baseProps } =
      simProps;
    super({
      ...baseProps,
      material: {
        vertexShader: faceVert,
        fragmentShader: pressureFrag,
        uniforms: {
          pressure: {
            value: pressure.texture,
          },
          boundarySpace: {
            value: boundarySpace,
          },
          velocity: {
            value: velocity.texture,
          },
          px: {
            value: cellScale,
          },
          dt: {
            value: dt,
          },
        },
      },
    });
  }

  update({
    velocity,
    pressure,
  }: {
    velocity: WebGLRenderTarget;
    pressure: WebGLRenderTarget;
  }) {
    this.material.uniforms.velocity.value = velocity.texture;
    this.material.uniforms.pressure.value = pressure.texture;
    super.update();
  }
}
