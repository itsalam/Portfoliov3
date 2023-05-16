import { Suspense, useEffect } from 'react';
import Toolbar from './components/Toolbar';
import Content from './components/Content';
import { VechaiProvider } from '@vechaiui/react';
import useStore from './store';
import { cx } from '@vechaiui/react';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import Work from './pages/Work';
import { DefaultLoader } from './etc/Helpers';
import Background from './components/Background';

function App() {
  const { vechaiTheme } = useStore.getState();
  const { isLoading, activeTheme, darkMode, setDarkMode } = useStore();

  const colorSchemeId = `${activeTheme}${darkMode ? 'Dark' : 'Light'}`;

  useEffect(() => {
    localStorage.theme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  return (
    <div
      className={cx(
        'w-full h-screen flex flex-col transition snap-y snap-mandatory overflow-x-clip',
        darkMode ? 'dark' : 'light'
      )}
    >
      {isLoading ? (
        <DefaultLoader />
      ) : (
        <Suspense fallback={<DefaultLoader />}>
          <VechaiProvider theme={vechaiTheme} colorScheme={colorSchemeId}>
            <Background />
            <Toolbar {...{ darkMode, setDarkMode }} />
            <Content>
              <Home />
              <Projects />
              <Work />
              <Contact />
            </Content>
          </VechaiProvider>
        </Suspense>
      )}
    </div>
  );
}

export default App;
