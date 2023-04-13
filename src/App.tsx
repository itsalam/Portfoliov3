import { Fragment, Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls, useProgress } from '@react-three/drei';
import { useControls } from 'leva';
import Toolbar from './components/Toolbar';
import Content from './components/Content';
import { VechaiProvider } from '@vechaiui/react';
import useStore from './store';
import cn from 'classnames';

function App() {
  const { vechaiTheme, themeOptions } = useStore.getState();
  const [darkMode, setDarkMode] = useState(localStorage.theme == 'dark');

  function Loader() {
    const { progress } = useProgress();
    console.log(progress);
    return <Html center>{progress} % loaded</Html>;
  }

  const { theme } = useControls('Theme', themeOptions);
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

  return (
    <div
      className={cn(
        'w-full h-screen flex flex-col transition snap-y snap-mandatory overflow-x-clip',
        darkMode ? 'dark' : 'light'
      )}
    >
      <Suspense fallback={<Loader />}>
        <VechaiProvider
          theme={vechaiTheme}
          colorScheme={`${theme.id}${darkMode ? 'Dark' : 'Light'}`}
        >
          <div className="canvas-holder fixed w-screen h-screen z-[-1]">
            <Canvas shadows="percentage" className="z-[-2]">
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
