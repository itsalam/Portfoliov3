import React, { useRef, useMemo, forwardRef, useEffect, useState } from "react";
import fragmentShader from "./fragment.glsl";
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
import {Mesh, Vector2, Shape, Group, Color, Uniform, Side, DoubleSide } from "three";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Noise, Scanline, Vignette } from "@react-three/postprocessing";
import Smiley from "@/assets/smile1.svg";
import { Effect } from "postprocessing";
import { useControls } from "leva";
import { Backdrop, MeshReflectorMaterial, Plane, SpotLight } from "@react-three/drei";
// import { DebugLayerMaterial, Fresnel, Normal, LayerMaterial, Displace } from "lamina";

class DistortEffect extends Effect {
  u_resolution: Vector2;
  u_time: number;

  constructor({resolution, time, ...configs }) {
    super('DistortEffect', fragmentShader, {
        uniforms: new Map<string, Uniform>([
            ...Object.entries(configs).map<[string, Uniform]>(([name, val]) => [name, new Uniform(val)]).concat(
              [["u_time", new Uniform(time)], ["resolution", new Uniform(resolution)]]
        )])
    })
    this.u_resolution = resolution;
    this.u_time = time; 
  }

  update(renderer: any, inputBuffer: any, deltaTime: any) {
    
    this.uniforms.get('u_time')!.value = this.u_time;
    this.uniforms.get('resolution')!.value = this.u_resolution;
  }
}

export default function Background(props: {elementRef: React.RefObject<HTMLDivElement>}) {
  const NUM_ICONS = 28;
  const ROW_PER_ICON = 4;

  const groupRef = useRef<Group>(null);
  const effectRef = useRef<DistortEffect>(null);
  const time = useRef<number>(0);

  const {size} = useThree(({size, camera}) => {
    camera.position.set(7, -4, 5);
    return {size};
  });
  const [meshs, setMeshes] = useState<Mesh[]>([]);

  const { speed, offSet, scale, horizontalOffset, verticalOffset, distort } = useControls(
    { offSet: 1.75, 
      speed: 1, 
      scale: 7, 
      horizontalOffset:1.0, 
      verticalOffset: 0.6,
      distort: true
    })

  const shaderConfigs = useControls("Shader Config", {
    //distort speed
    speed:1,
    speed_x:3,
    speed_y:3,

    // refraction
    emboss:10.90,
    intensity:5.4,
    steps: 2,
    frequency:13.0,
    angle:13,

    // reflection
    delta:145.,
  })

  useEffect(() => {
    let curMeshes: Mesh[] = []
    groupRef.current?.traverse((child) => {
      if ( !child.name.includes("screen") && child instanceof Mesh) {
        curMeshes = curMeshes.concat(child);
      }
    });
    setMeshes(curMeshes);
  }, [groupRef.current])



  useFrame((state, delta) => {
    if (effectRef.current) {
      time.current += delta;
      effectRef.current.u_time = time.current;
    }
    meshs.forEach((child) => {
        const adjSpeed = speed/1000;
        child.position.x -= adjSpeed * horizontalOffset;
        child.position.y -= adjSpeed * verticalOffset;
        if (child.position.y < 0){
            child.position.x = offSet * NUM_ICONS * horizontalOffset /ROW_PER_ICON + child.position.x;
            child.position.y = offSet * NUM_ICONS * verticalOffset /ROW_PER_ICON;
        }
    })
  });


  const smiley: Shape[] = useLoader(SVGLoader, Smiley).paths.flatMap( path => SVGLoader.createShapes(path));

  const smileys = Array(NUM_ICONS).fill(null).map((_, i) => {
      const level = Math.floor(i/ROW_PER_ICON);
      const offsetX = i%ROW_PER_ICON * offSet * 2 * horizontalOffset+ level * offSet;
      const offsetY = level * offSet * verticalOffset;
      const color = new Color(  i % (ROW_PER_ICON-1) + Math.random() > ROW_PER_ICON/2? 0xffef1f: 0xFF10F0 );
      
      return <mesh name={"icon"} rotation={[0, 0 , Math.PI]} scale={scale/10000} position={[offSet + offsetX , offSet + offsetY, 0]}>
          <meshBasicMaterial color={color}  side={DoubleSide}/>
          <shapeGeometry args={[smiley]} />
      </mesh>;
  })

  const Distort = forwardRef(({}, ref) => {
    const resolution = new Vector2(size.width, size.height);
    const effect = useMemo(() => new DistortEffect({time: time.current, resolution, ...shaderConfigs}), [time]);
    return <primitive ref={ref} object={effect} dispose={null} />
  })

  return (<>
      <ambientLight/>

      <group position={[-3,-6,0]} ref={groupRef} castShadow >
        {smileys}

      </group>
        <meshStandardMaterial color="#353540" />
        <EffectComposer>
          <Scanline opacity={0.1}/>
          <Distort ref={effectRef}/>
          <Noise opacity={0.1} />
          <Bloom luminanceThreshold={0.1}/>
          <Vignette eskil offset={0.6} darkness={0.8}/>
        </EffectComposer>
    </>
  );
}
