import { Suspense, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import Toolbar from './components/Toolbar';
import Content from './components/Content';
import { VechaiProvider } from '@vechaiui/react';
import useStore from './store';
import { cx } from "@vechaiui/react";

function App() {
  const { vechaiTheme, themes } = useStore.getState();
  const { isLoading, activeTheme, bgOpacity, darkMode, setDarkMode } = useStore();


  function AppLoader() {
    return (
      <div aria-label="Loading..." role="status" className="flex h-screen w-full flex-col items-center justify-center">
        <svg className="h-12 w-12 animate-spin" viewBox="3 3 18 18">
          <path
            className="fill-gray-200"
            d="M12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5ZM3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z"></path>
          <path
            className="fill-gray-800"
            d="M16.9497 7.05015C14.2161 4.31648 9.78392 4.31648 7.05025 7.05015C6.65973 7.44067 6.02656 7.44067 5.63604 7.05015C5.24551 6.65962 5.24551 6.02646 5.63604 5.63593C9.15076 2.12121 14.8492 2.12121 18.364 5.63593C18.7545 6.02646 18.7545 6.65962 18.364 7.05015C17.9734 7.44067 17.3403 7.44067 16.9497 7.05015Z"></path>
        </svg>
      </div>
    );
  }

  const colorSchemeId = `${activeTheme}${darkMode ? 'Dark' : 'Light'}`;
  useEffect(() => {
    localStorage.theme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  const Theme = useCallback(() => {
    function ThreeJsLoader() {
      return <Html center><AppLoader /></Html>;
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
      {
        isLoading ? <AppLoader /> :
          <Suspense fallback={<AppLoader />}>
            <VechaiProvider
              theme={vechaiTheme}
              colorScheme={colorSchemeId}
            >
              <div className="canvas-holder bg-base fixed z-[-1] h-screen w-screen" style={{ opacity: bgOpacity }}>

                <Canvas id="canvas" shadows="percentage" className="intro-revealer z-[-2]" style={{ opacity: 0 }}>
                  <OrbitControls />
                  <Theme />
                </Canvas>
              </div>
              <Toolbar {...{ darkMode, setDarkMode }} />
              <Content />
            </VechaiProvider>
          </Suspense>
      }

    </div>
  );
}

export default App;
