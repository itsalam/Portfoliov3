import { Vector2, WebGLRenderTarget } from "three";
import divergenceFrag from "../glsl/divergence.frag.glsl";
import faceVert from "../glsl/face.vert.glsl";
import BasePass, { BasePassProps } from "./BasePass";

type DivergenceProps = {
  boundarySpace: Vector2;
  cellScale: Vector2;
  dt: number;
  velocity: WebGLRenderTarget;
} & Omit<BasePassProps, "material">;

type UpdateProps = {
  velocity: WebGLRenderTarget;
};

export default class Divergence extends BasePass<UpdateProps> {
  constructor(simProps: DivergenceProps) {
    const { boundarySpace, velocity, cellScale, dt, ...baseProps } = simProps;

    super({
      ...baseProps,
      material: {
        vertexShader: faceVert,
        fragmentShader: divergenceFrag,
        uniforms: {
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

  update({ velocity }: { velocity: WebGLRenderTarget }) {
    this.material!.uniforms.velocity.value = velocity.texture;
    super.update();
  }
}
