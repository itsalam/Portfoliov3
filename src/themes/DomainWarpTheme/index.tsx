import React, { forwardRef, useCallback, useState } from "react";
import { useMemo, useRef } from "react";
import fragmentShader from "./fragment.glsl";
import {Mesh, Vector2, Vector3, SpotLight as ThreeSpotLight, MeshNormalMaterial, Shader, WebGLRenderer, UniformsLib, MeshStandardMaterial, MeshPhongMaterial, DoubleSide, MeshDepthMaterial, MeshDistanceMaterial, NoBlending, Color, NormalBlending, MeshPhysicalMaterial, ShaderMaterial, UniformsUtils, ObjectSpaceNormalMap, Uniform } from "three";
import { extend, Size, useFrame, useThree } from "@react-three/fiber";
import THREE, { Box, SpotLight, OrbitControls, useAspect, Plane, RandomizedLight, Sphere, BakeShadows, ContactShadows, Environment } from "@react-three/drei/core";
import { EffectComposer, Bloom, Scanline, TiltShift, Noise, Vignette } from "@react-three/postprocessing";
import { Effect } from "postprocessing";
import { useControls } from "leva";
// import { DebugLayerMaterial, Fresnel, Normal, LayerMaterial, Displace } from "lamina";

class DomainWarpEffect extends Effect {
  u_resolution: Vector2;
  u_time: number;

  constructor({ resolution, time, ...configs}) {
    super('DomainWarpEffect', fragmentShader, {
      uniforms: new Map<string, Uniform>([
        ...Object.entries(configs).map<[string, Uniform]>(([name, val]) => name.includes("color")? [name, new Uniform(new Color(val))] :[name, new Uniform(val)]).concat(
          [["time", new Uniform(time)], ["resolution", new Uniform(resolution)]]
    )])})
    this.u_resolution = resolution;
    this.u_time = time; 
  }

  update(renderer: any, inputBuffer: any, deltaTime: any) {
    this.uniforms.get('time')!.value = this.u_time;
    this.uniforms.get('resolution')!.value = this.u_resolution;
  }
}

export default function Background(props: {elementRef: React.RefObject<HTMLDivElement>}) {
  
  const effectRef = useRef<DomainWarpEffect>(null);
  const time = useRef<number>(0);
  const {viewport, size} = useThree();

  const configs = useControls({
    color1: "#00aa58",
    color2: "#e3aa00",
    color3: "#00cc69",
    color4: "#664e00",
    alpha: 7.0,

  })

  const DomainWarp = forwardRef(({}, ref) => {
    const resolution = new Vector2(size.width, size.height);
    const effect = useMemo(() => new DomainWarpEffect({time: time.current, resolution, ...configs}), [time]);
    return <primitive ref={ref} object={effect} dispose={null} />
  })

  useFrame((state, delta) => {
    // console.log(effectRef.current)
    if (effectRef.current) {
      time.current += delta;
      effectRef.current.u_time = time.current;
    }
  });

  return (
    <group>
        <EffectComposer>
        <DomainWarp ref={effectRef}/>
        {/* <Noise opacity={0.25} /> */}
        <Bloom intensity={0.8} luminanceThreshold={0.1} />
        <Vignette offset={0.5} darkness={0.6}/>
        </EffectComposer>
    </group>


  );
}
