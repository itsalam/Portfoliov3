import React, { forwardRef } from 'react';
import { useMemo, useRef } from 'react';
import fragmentShader from './fragment.glsl';
import { Vector2, Color, Uniform } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Effect } from 'postprocessing';
import { useControls } from 'leva';
import { Html } from '@react-three/drei';

class DomainWarpEffect extends Effect {
  u_resolution: Vector2;
  u_time: number;

  constructor({ resolution, time, ...configs }) {
    super('DomainWarpEffect', fragmentShader, {
      uniforms: new Map<string, Uniform>([
        ...Object.entries(configs)
          .map<[string, Uniform]>(([name, val]) =>
            name.includes('color')
              ? [name, new Uniform(new Color(val))]
              : [name, new Uniform(val)]
          )
          .concat([
            ['time', new Uniform(time)],
            ['resolution', new Uniform(resolution)]
          ])
      ])
    });
    this.u_resolution = resolution;
    this.u_time = time;
  }

  update(renderer: any, inputBuffer: any, deltaTime: any) {
    this.uniforms.get('time')!.value = this.u_time;
    this.uniforms.get('resolution')!.value = this.u_resolution;
  }
}

export default function Background(props: {}) {
  const effectRef = useRef<DomainWarpEffect>(null);
  const time = useRef<number>(0);
  const { size } = useThree();

  const configs = useControls({
    color1: '#00aa58',
    color2: '#e3aa00',
    color3: '#00cc69',
    color4: '#664e00',
    alpha: 3.0
  });

  const DomainWarp = forwardRef(({}, ref) => {
    const resolution = new Vector2(size.width, size.height);
    const effect = useMemo(
      () =>
        new DomainWarpEffect({ time: time.current, resolution, ...configs }),
      []
    );
    return <primitive ref={ref} object={effect} dispose={null} />;
  });

  useFrame((state, delta) => {
    if (effectRef.current) {
      time.current += delta;
      effectRef.current.u_time = time.current;
    }
  });

  return (
    <group>
      <Html center className="w-screen h-screen bg-base opacity-[85%]" />
      <EffectComposer>
        <DomainWarp ref={effectRef} />
        <Bloom intensity={0.8} luminanceThreshold={0.1} />
        <Vignette offset={0.5} darkness={0.7} />
      </EffectComposer>
    </group>
  );
}
