import { AdditiveBlending, PlaneGeometry, Vector2 } from "three";
import externalForceGlsl from "../glsl/externalForce.frag.glsl";
import mouseGlsl from "../glsl/mouse.vert.glsl";
import BasePass, { BasePassProps } from "./BasePass";

type ExternalForceProps = {
  cellScale: Vector2;
  cursorSize: number;
} & Omit<BasePassProps, "material">;

type UpdateProps = {
  pointer: Vector2;
  cursorSize: number;
  mouseForce: number;
  cellScale: Vector2;
  time: number;
};

export default class ExternalForce extends BasePass<UpdateProps> {
  oldMousePos: Vector2;

  constructor(simProps: ExternalForceProps) {
    const { cellScale, cursorSize, ...baseProps } = simProps;
    super({
      ...baseProps,
      geometry: new PlaneGeometry(1, 1),
      material: {
        blending: AdditiveBlending,
        vertexShader: mouseGlsl,
        fragmentShader: externalForceGlsl,
        uniforms: {
          px: { value: cellScale },
          force: {
            value: new Vector2(0.0, 0.0),
          },
          center: {
            value: new Vector2(0.0, 0.0),
          },
          scale: {
            value: cursorSize,
          },
          time: {
            value: 0.0,
          },
        },
      },
    });
    this.oldMousePos = new Vector2(0, 0);
  }

  update({ pointer, cursorSize, mouseForce, cellScale, time }: UpdateProps) {
    const velocity = new Vector2().subVectors(
      pointer.clone(),
      this.oldMousePos
    );

    const forceX = (velocity.x / 2) * mouseForce;
    const forceY = (velocity.y / 2) * mouseForce;
    const cursorSizeX = cursorSize * cellScale.x;
    const cursorSizeY = cursorSize * cellScale.y;
    const centerX = Math.min(
      Math.max(pointer.x, -1 + 0 + cellScale.x * 2),
      1 - 0 - cellScale.x * 2
    );
    const centerY = Math.min(
      Math.max(pointer.y, -1 + 0 + cellScale.y * 2),
      1 - 0 - cellScale.y * 2
    );
    this.material.uniforms["force"].value.set(forceX, forceY);
    this.material.uniforms["center"].value.set(centerX, centerY);
    this.material.uniforms["scale"].value = cursorSize;
    this.material.uniforms["time"].value = time;
    this.oldMousePos = pointer.clone();
    super.update();
  }
}
