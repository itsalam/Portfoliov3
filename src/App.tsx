import { Suspense, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import Toolbar from './components/Toolbar';
import Content from './components/Content';
import { VechaiProvider } from '@vechaiui/react';
import useStore from './store';
import { cx } from '@vechaiui/react';

function App() {
  const { vechaiTheme, themes } = useStore.getState();
  const { isLoading, activeTheme, bgOpacity, darkMode, setDarkMode } =
    useStore();

  function AppLoader() {
    return (
      <div className="absolute bottom-1/2 right-1/2  translate-x-1/2 translate-y-1/2">
        <div className="h-32 w-32 animate-spin  rounded-full border-8 border-solid border-gray-500/50 border-t-transparent"></div>
      </div>
    );
  }

  const colorSchemeId = `${activeTheme}${darkMode ? 'Dark' : 'Light'}`;

  useEffect(() => {
    localStorage.theme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  const Theme = useCallback(() => {
    function ThreeJsLoader() {
      return (
        <Html center>
          <AppLoader />
        </Html>
      );
    }

    const Background = themes[activeTheme].background;
    return (
      <Suspense fallback={<ThreeJsLoader />}>
        <Background />
      </Suspense>
    );
  }, [activeTheme]);

  return (
    <div
      className={cx(
        'w-full h-screen flex flex-col transition snap-y snap-mandatory overflow-x-clip',
        darkMode ? 'dark' : 'light'
      )}
    >
      {isLoading ? (
        <AppLoader />
      ) : (
        <Suspense fallback={<AppLoader />}>
          <VechaiProvider theme={vechaiTheme} colorScheme={colorSchemeId}>
            <div
              className="canvas-holder bg-base fixed z-[-1] h-screen w-screen"
              style={{ opacity: bgOpacity }}
            >
              <Canvas
                id="canvas"
                shadows="percentage"
                className="intro-revealer z-[-2]"
                style={{ opacity: 0 }}
              >
                <OrbitControls />
                <Theme />
              </Canvas>
            </div>
            <Toolbar {...{ darkMode, setDarkMode }} />
            <Content />
          </VechaiProvider>
        </Suspense>
      )}
    </div>
  );
}

export default App;
