import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { DefaultLoader } from '@src/etc/Helpers';
import useStore from '@src/store';
import { useControls } from 'leva';
import { Suspense, useCallback } from 'react';

export default function Background() {
  const { themes } = useStore.getState();
  const { activeTheme, bgOpacity } = useStore();

  function ThreeJsLoader() {
    return (
      <Html center>
        <DefaultLoader />
      </Html>
    );
  }

  const Theme = useCallback(() => {
    const Background = themes[activeTheme].background;
    return (
      <Suspense fallback={<ThreeJsLoader />}>
        <Background {...useThree()} />
      </Suspense>
    );
  }, [activeTheme]);

  useControls({
    hideForeground: {
      value: false,
      label: 'Hide Content',
      onChange: (value: boolean) => {
        useStore.setState({ hideForeground: value })
      }
    }
  })

  return (
    <div
      className="canvas-holder bg-base fixed h-screen w-screen"
      style={{ opacity: bgOpacity }}
    >
      <Canvas
        id="canvas"
        shadows="percentage"
        className="intro-revealer"
        style={{ opacity: 0 }}
      >
        <OrbitControls />
        <Theme />
      </Canvas>
    </div>
  );
}
