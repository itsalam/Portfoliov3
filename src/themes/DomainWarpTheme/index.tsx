import { forwardRef } from 'react';
import { useMemo, useRef } from 'react';
import fragmentShader from './fragment.glsl';
import { Vector2 } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useControls } from 'leva';
import { CustomEffect } from '../helper';

export default function Background() {
  const effectRef = useRef<CustomEffect>(null);
  const time = useRef<number>(0);
  const { size } = useThree();

  const configs = useControls("Theme Configs", {
    color1: '#00aa58',
    color2: '#e3aa00',
    color3: '#00cc69',
    color4: '#664e00',
    alpha: 3.0,
    backgroundOpacity: "100%",
  });

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
      <EffectComposer>
        <DomainWarp ref={effectRef} />
        <Bloom intensity={0.8} luminanceThreshold={0.1} />
        <Vignette offset={0.5} darkness={0.7} />
      </EffectComposer>
    </group>
  );
}
