import { useMantineTheme } from '@mantine/core';
import { useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { useControls } from 'leva';
import { forwardRef, useMemo, useRef } from 'react';
import { Vector2 } from 'three';
import { CustomEffect } from '../helper';
import fragmentShader from './fragment.glsl';

export default function Background() {
  const effectRef = useRef<CustomEffect>(null);
  const time = useRef<number>(0);
  const { size, scene } = useThree();
  const theme = useMantineTheme();

  const configs = useControls(
    'Theme Configs',
    {
      color1: '#233e2d',
      color2: '#d9f99d',
      color3: '#10b981',
      color4: '#facc15',
      alpha: 3.0,
      multiply: 1,
    },
    { collapsed: true }
  );

  const DomainWarp = forwardRef((_, ref) => {
    const resolution = new Vector2(size.width, size.height);
    configs.multiply *= theme.colorScheme === 'dark' ? 2 : 1;
    const effect = useMemo(
      () => new CustomEffect(fragmentShader, resolution, time.current, configs),
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

      <EffectComposer>
        <DomainWarp ref={effectRef} />
        <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
      </EffectComposer>
    </group>
  );
}
