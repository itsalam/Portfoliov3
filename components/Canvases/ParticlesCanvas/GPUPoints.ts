import {
  BufferAttribute,
  BufferGeometry,
  Matrix4,
  Points,
  ShaderMaterial,
} from "three";
import fragShader from "./glsl/gpgpu/points.frag.glsl";
import vertShader from "./glsl/gpgpu/points.vert.glsl";
class GPUPoints extends Points {
  constructor(WIDTH: number) {
    const pg = new BufferGeometry();
    const pos = new Float32Array(WIDTH * WIDTH * 3);
    const refs = new Float32Array(WIDTH * WIDTH * 2);
    for (let i = 0; i < WIDTH * WIDTH; i++) {
      const xx = (i % WIDTH) / WIDTH;
      const yy = ~~(i / WIDTH) / WIDTH;
      pos.set([0, 0, 0], i * 3);
      refs.set([xx, yy], i * 2);
    }
    pg.setAttribute("position", new BufferAttribute(pos, 3));
    console.log("pos: " + pg.attributes.position.count);
    pg.setAttribute("reference", new BufferAttribute(refs, 2));

    const pm = new ShaderMaterial({
      uniforms: {
        posTexture: { value: null },
        boxMatrixInv: { value: new Matrix4() },
      },
      vertexShader: vertShader,
      fragmentShader: fragShader,
    });
    super(pg, pm);
    this.frustumCulled = false;
  }
}

export { GPUPoints };
