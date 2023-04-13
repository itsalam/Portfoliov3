import { forwardRef } from 'react';
import { useMemo, useRef } from 'react';
import fragmentShader from './fragment.glsl';
import { Vector2 } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing';
import { useControls } from 'leva';
import { CustomEffect } from '../helper';
import { Html } from '@react-three/drei/web/Html';
import useStore from '@src/store';

export default function Background() {
  const effectRef = useRef<CustomEffect>(null);
  const time = useRef<number>(0);
  const { size } = useThree();

  const { darkMode } = useStore();

  const configs = useControls("Theme Configs", {
    color1: '#22c55e',
    color2: '#d9f99d',
    color3: '#10b981',
    color4: '#facc15',
    alpha: 3.0
  }, { collapsed: true });

  const DomainWarp = forwardRef((_, ref) => {
    const resolution = new Vector2(size.width, size.height);
    const effect = useMemo(
      () =>
        new CustomEffect(fragmentShader, resolution, time.current, configs),
      []
    );
    return <primitive ref={ref} object={effect} dispose={null} />;
  });

  useFrame((_state, delta) => {
    if (effectRef.current) {
      time.current += delta;
      effectRef.current.u_time = time.current;
    }
  });

  return (
    <group>
      {darkMode && <Html center className='bg-base h-screen w-screen opacity-[.95]'></Html>}
      <EffectComposer>
        <DomainWarp ref={effectRef} />
        <Bloom intensity={0.4} luminanceThreshold={0.1} />
        {/* <Vignette offset={0.5} darkness={0.7} /> */}
      </EffectComposer>
    </group>
  );
}
