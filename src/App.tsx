import { Suspense, useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls, useProgress } from '@react-three/drei';
import { Leva, useControls } from 'leva';
import Toolbar from './components/Toolbar';
import Content from './components/Content';
import { VechaiProvider } from '@vechaiui/react';
import useStore from './store';
import cn from 'classnames';
import { RGBtoHex } from './etc/helper';

function App() {
  const { vechaiTheme, themeOptions } = useStore.getState();
  const [darkMode, setDarkMode] = useState(localStorage.theme == 'dark');

  function Loader() {
    const { progress } = useProgress();
    return <Html center>{progress} % loaded</Html>;
  }

  const { theme } = useControls(themeOptions);
  useEffect(() => {
    localStorage.theme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  const ThemeLoader = () => {
    const Background = theme.background;
    return (
      <Suspense fallback={<Loader />}>
        <Background />
      </Suspense>
    );
  };

  const colorSchemeId = `${theme.id}${darkMode ? 'Dark' : 'Light'}`;
  const vechaiThemeToLeva = useMemo(() => {
    const scheme = vechaiTheme.colorSchemes[colorSchemeId].colors;
    return {
      colors: {
        elevation1: RGBtoHex([...scheme.bg.base.split(","), "150"]),
        elevation2: RGBtoHex([...scheme.bg.base.split(","), "0"]),
        elevation3: RGBtoHex([...scheme.bg.base.split(","), "0"]),
        accent1: RGBtoHex([...scheme.neutral[900].split(","), "255"]),
        accent2: RGBtoHex([...scheme.neutral[900].split(","), "255"]),
        accent3: RGBtoHex([...scheme.neutral[900].split(","), "255"]),
        highlight1: RGBtoHex([...scheme.text.foreground.split(","), "255"]),
        highlight2: RGBtoHex([...scheme.text.foreground.split(","), "255"]),
        highlight3: RGBtoHex([...scheme.text.foreground.split(","), "255"]),
      },
      space: {
        sm: "4px",
        md: "8px",
        rowGap: "5px",
        colGap: "5px",
      },
      fonts: {
        mono: "Source Code Pro",
        sans: 'Source Sans Pro'
      },
      fontSizes: {
        root: "0.75rem",
        toolTip: '0.5rem'
      },
      sizes: {
        rootWidth: "15rem",
        controlWidth: "7rem",
        scrubberWidth: "20px",
      }
    }
  }, [vechaiTheme, colorSchemeId]);

  return (
    <div
      className={cn(
        'w-full h-screen flex flex-col transition snap-y snap-mandatory overflow-x-clip',
        darkMode ? 'dark' : 'light'
      )}
    >
      <Suspense fallback={<Loader />}>
        <Leva
          titleBar={{
            title: "Theme Options",
            position: { x: 0, y: 60 }
          }
          }
          collapsed={true}
          theme={vechaiThemeToLeva}
        />
        <VechaiProvider
          theme={vechaiTheme}
          colorScheme={`${theme.id}${darkMode ? 'Dark' : 'Light'}`}
        >
          <div className="canvas-holder bg-base fixed z-[-1] h-screen w-screen">
            <Canvas shadows="percentage" className="z-[-2] opacity-20">
              <OrbitControls />
              <ThemeLoader />
            </Canvas>
          </div>
          <Toolbar {...{ darkMode, setDarkMode }} />
          <Content />
        </VechaiProvider>
      </Suspense>
    </div>
  );
}

export default App;
