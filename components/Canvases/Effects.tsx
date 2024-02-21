import { extend } from "@react-three/fiber";
import { Autofocus, Bloom, EffectComposer } from "@react-three/postprocessing";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { SSAOPass } from "three/addons/postprocessing/SSAOPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

extend({ EffectComposer, RenderPass, UnrealBloomPass, SSAOPass });

export default function Effects() {
  return (
    <EffectComposer multisampling={0} disableNormalPass={true}>
      {/* <SSAO
          samples={30} // amount of samples per pixel (shouldn't be a multiple of the ring count)
          rings={4} // amount of rings in the occlusion sampling pattern
          distanceThreshold={1.0} // global distance threshold at which the occlusion effect starts to fade out. min: 0, max: 1
          distanceFalloff={0.0} // distance falloff. min: 0, max: 1
          rangeThreshold={0.5} // local occlusion range threshold at which the occlusion starts to fade out. min: 0, max: 1
          rangeFalloff={0.1} // occlusion range falloff. min: 0, max: 1
          luminanceInfluence={0.9} // how much the luminance of the scene influences the ambient occlusion
          radius={20} // occlusion sampling radius
          scale={0.5} // scale of the ambient occlusion
          bias={0.5} // occlusion bias
      /> */}
      <Bloom intensity={1} luminanceThreshold={0.1} radius={2} />
      <Autofocus />
      {/* <Noise opacity={0.025} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} /> */}
    </EffectComposer>
  );
}
