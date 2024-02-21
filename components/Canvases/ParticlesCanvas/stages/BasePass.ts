import {
  Camera,
  Mesh,
  PlaneGeometry,
  RawShaderMaterial,
  Scene,
  ShaderMaterialParameters,
  WebGLRenderTarget,
  WebGLRenderer,
} from "three";

export type BasePassProps = {
  gl: WebGLRenderer;
  material: ShaderMaterialParameters;
  geometry?: PlaneGeometry;
  dst: WebGLRenderTarget;
};

export default class BasePass<T> {
  scene: Scene;
  camera: Camera;
  plane: Mesh;
  material: RawShaderMaterial;
  geometry: PlaneGeometry;
  props: Omit<BasePassProps, "material" | "dst">;
  dst: WebGLRenderTarget;

  constructor(props: BasePassProps) {
    const { material, geometry, dst, ...baseProps } = props;
    this.dst = dst;
    this.props = baseProps;
    this.scene = new Scene();
    this.camera = new Camera();
    this.material = new RawShaderMaterial(material);
    this.geometry = geometry ?? new PlaneGeometry(2.0, 2.0);
    this.plane = new Mesh(this.geometry, this.material);
    this.scene.add(this.plane);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(args?: Partial<T>) {
    this.props.gl.setRenderTarget(this.dst);
    this.props.gl.render(this.scene, this.camera);
    this.props.gl.setRenderTarget(null);
  }
}
