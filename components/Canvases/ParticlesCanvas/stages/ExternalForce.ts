import { AdditiveBlending, PlaneGeometry, Vector2 } from "three";
import externalForceGlsl from "../glsl/externalForce.frag.glsl";
import mouseGlsl from "../glsl/mouse.vert.glsl";
import BasePass, { BasePassProps } from "./BasePass";

type ExternalForceProps = {
  cellScale: Vector2;
  cursorSize: number;
  factor: number;
} & Omit<BasePassProps, "material">;

type UpdateProps = {
  pointer: Vector2;
  cursorSize: number;
  factor: number;
  cellScale: Vector2;
  time: number;
};

export default class ExternalForce extends BasePass<UpdateProps> {
  oldMousePos: Vector2;

  constructor(simProps: ExternalForceProps) {
    const { cellScale, cursorSize, factor, ...baseProps } = simProps;
    super({
      ...baseProps,
      geometry: new PlaneGeometry(1, 1),
      material: {
        blending: AdditiveBlending,
        vertexShader: mouseGlsl,
        fragmentShader: externalForceGlsl,
        uniforms: {
          px: { value: cellScale },
          center: {
            value: new Vector2(-2.0, -2.0),
          },
          oldCenter: {
            value: new Vector2(-2.0, -2.0),
          },
          scale: {
            value: cursorSize,
          },
          factor: {
            value: factor,
          },
          time: {
            value: 0.0,
          },
        },
      },
    });
    this.oldMousePos = new Vector2(0, 0);
  }

  update({ pointer, cursorSize, factor, cellScale, time }: UpdateProps) {
    const centerX = Math.min(
      Math.max(pointer.x, -1 + cellScale.x * 2),
      1 - cellScale.x * 2
    );
    const centerY = Math.min(
      Math.max(pointer.y, -1 + cellScale.y * 2),
      1 - cellScale.y * 2
    );

    this.material.uniforms["center"].value.set(centerX, centerY);
    this.material.uniforms["oldCenter"].value.set(...this.oldMousePos);
    this.material.uniforms["scale"].value = cursorSize;
    this.material.uniforms["factor"].value = factor;
    this.material.uniforms["time"].value = time;
    this.oldMousePos = this.material.uniforms["center"].value.clone();
    super.update();
  }
}
