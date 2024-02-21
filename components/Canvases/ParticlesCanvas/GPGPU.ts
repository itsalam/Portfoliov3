import { DataTexture, RepeatWrapping, Texture, WebGLRenderer } from "three";
import { GPUComputationRenderer, Variable } from "three/examples/jsm/Addons.js";
import positionSimulationGlsl from "./glsl/gpgpu/position.glsl";
import velocitySimulationGlsl from "./glsl/gpgpu/velocity.glsl";

class GPGPU extends GPUComputationRenderer {
  positionVariable: Variable;
  veloVariable: Variable;
  constructor(w: number, h: number, rndr: WebGLRenderer, veloTexture: Texture) {
    super(w, h, rndr);

    const dtPosition = this.createTexture();
    this.fillPositionTexture(dtPosition);
    this.positionVariable = this.addVariable(
      "texturePosition",
      positionSimulationGlsl,
      dtPosition
    );
    this.veloVariable = this.addVariable(
      "textureVelocity",
      velocitySimulationGlsl,
      veloTexture
    );
    this.setVariableDependencies(this.positionVariable, [
      this.positionVariable,
      this.veloVariable,
    ]);
    this.setVariableDependencies(this.veloVariable, [
      this.positionVariable,
      this.veloVariable,
    ]);
    const u = this.positionVariable.material.uniforms;
    u["delta"] = { value: 0 };
    this.positionVariable.wrapS = RepeatWrapping;
    this.positionVariable.wrapT = RepeatWrapping;
    this.veloVariable.wrapS = RepeatWrapping;
    this.veloVariable.wrapT = RepeatWrapping;
    const error = this.init();

    if (error !== null) {
      console.error(error);
    }
  }

  setVelocityTexture(texture: Texture) {
    this.veloVariable.material.uniforms.textureVelocity.value = texture;
  }

  fillPositionTexture(texture: DataTexture) {
    const theArray = texture.image.data;
    for (let k = 0, kl = theArray.length; k < kl; k += 4) {
      theArray[k + 0] = (Math.random() - 0.5) * 5;
      theArray[k + 1] = (Math.random() - 0.5) * 5;
      theArray[k + 2] = 0;
      theArray[k + 3] = Math.random() * 0.1 + 0.9;
    }
  }
}

export default GPGPU;
