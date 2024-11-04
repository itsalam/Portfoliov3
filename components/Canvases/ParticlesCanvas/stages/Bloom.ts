import { Camera } from "@react-three/fiber";
import { Scene, Vector2, WebGLRenderer } from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import BasePass, { BasePassProps } from "./BasePass";

type BloomProps = {
  camera: Camera;
  width: number;
  height: number;
  renderer: WebGLRenderer;
  scene: Scene;
} & UpdateProps &
  Omit<BasePassProps, "material">;

type UpdateProps = {
  luminanceThreshold: number;
  intensity: number;
  radius: number;
};

export default class Bloom extends BasePass<any, UpdateProps> {
  camera: Camera;
  particleEffect: EffectComposer;
  //   baseEffect: EffectComposer;
  scene: Scene;
  bloomPass: UnrealBloomPass;

  constructor(props: BloomProps) {
    const { camera, scene, width, height, renderer, ...baseProps } = props;
    super(baseProps);
    this.camera = camera;
    // this.baseEffect = new EffectComposer(renderer);
    this.particleEffect = new EffectComposer(renderer, this.dst);
    this.scene = scene;
    this.props = props;
    const renderScene = new RenderPass(scene, camera);
    this.bloomPass = new UnrealBloomPass(
      new Vector2(width, height),
      props.intensity,
      props.radius,
      props.luminanceThreshold
    );
    const outputPass = new OutputPass();
    this.bloomPass.clear = true;
    outputPass.clear = true;
    this.particleEffect.addPass(renderScene);
    this.particleEffect.addPass(this.bloomPass);
    this.particleEffect.addPass(outputPass);
  }

  update(props: UpdateProps) {
    this.bloomPass.strength = props.intensity;
    this.bloomPass.radius = props.radius;
    this.bloomPass.threshold = props.luminanceThreshold;
    // this.bloomPass.smo = props.luminanceSmoothing
    this.props.gl.clear();
    super.update();
    this.props.gl.clear();
    this.particleEffect.render();
  }
}
