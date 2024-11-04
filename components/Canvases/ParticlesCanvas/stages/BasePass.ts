import {
  Camera,
  Mesh,
  PlaneGeometry,
  RawShaderMaterial,
  Scene,
  ShaderMaterial,
  ShaderMaterialParameters,
  WebGLRenderTarget,
  WebGLRenderer,
} from "three";

export type BasePassProps = {
  gl: WebGLRenderer;
  material?: ShaderMaterialParameters;
  geometry?: PlaneGeometry;
  dst: WebGLRenderTarget;
  raw?: boolean;
};

export default class BasePass<T, P> {
  scene: Scene;
  camera: Camera;
  plane: Mesh;
  material: ShaderMaterial;
  geometry?: PlaneGeometry;
  raw?: boolean;
  props: Omit<BasePassProps, "material" | "dst">;
  dst: WebGLRenderTarget;

  constructor(props: BasePassProps) {
    const { material, geometry, dst, raw = true, ...baseProps } = props;
    this.dst = dst;
    this.props = baseProps;
    this.scene = new Scene();
    this.camera = new Camera();
    this.material = raw
      ? new RawShaderMaterial(material)
      : new ShaderMaterial(material);
    this.geometry = geometry ?? new PlaneGeometry(2.0, 2.0);
    this.plane = new Mesh(this.geometry, this.material);
    this.scene.add(this.plane);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(props?: Partial<P & BasePassProps>) {
    this.props.gl.setRenderTarget(this.dst);
    this.props.gl.render(this.scene, this.camera);
    this.props.gl.setRenderTarget(null);
  }
}
