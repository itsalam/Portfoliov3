import {
  BufferAttribute,
  BufferGeometry,
  LineSegments,
  RawShaderMaterial,
  Vector2,
  WebGLRenderTarget,
} from "three";
import advection_frag from "../glsl/advection.frag.glsl";
import face_vert from "../glsl/face.vert.glsl";
import line_vert from "../glsl/line.vert.glsl";
import BasePass, { BasePassProps } from "./BasePass";

type SimProps = {
  cellScale: Vector2;
  fboSize: Vector2;
  src: WebGLRenderTarget; // replace 'any' with the actual type of 'texture'
  dt: number;
} & Omit<BasePassProps, "material">;

type UpdateProps = {
  dt: number;
};

export default class Advection extends BasePass<UpdateProps> {
  line: LineSegments = new LineSegments();
  constructor(simProps: SimProps) {
    const { cellScale, src, fboSize, dt, ...baseProps } = simProps;
    super({
      ...baseProps,
      material: {
        vertexShader: face_vert,
        fragmentShader: advection_frag,
        uniforms: {
          px: {
            value: cellScale,
          },
          fboSize: {
            value: fboSize,
          },
          velocity: {
            value: src.texture,
          },
          dt: {
            value: dt,
          },
        },
      },
    });

    this.createBoundary();
  }

  createBoundary() {
    const boundaryG = new BufferGeometry();
    const vertices_boundary = new Uint16Array([
      // left
      -1, -1, 0, -1, 1, 0,

      // top
      -1, 1, 0, 1, 1, 0,

      // right
      1, 1, 0, 1, -1, 0,

      // bottom
      1, -1, 0, -1, -1, 0,
    ]);
    boundaryG.setAttribute(
      "position",
      new BufferAttribute(vertices_boundary, 3)
    );
    const boundaryM = new RawShaderMaterial({
      vertexShader: line_vert,
      fragmentShader: advection_frag,
      uniforms: {
        px: this.material.uniforms.px,
        fboSize: this.material.uniforms.fboSize,
      },
    });

    this.line = new LineSegments(boundaryG, boundaryM);
    this.line.visible = true;
    this.scene.add(this.line);
  }

  update() {
    if (!this.material) return;
    super.update();
  }

  updateUniforms({ dt }: Pick<UpdateProps, "dt">) {
    if (!this.material) return;
    this.material.uniforms["dt"].value = dt;
    super.update();
  }
}
