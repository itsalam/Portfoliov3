import { VechaiProvider, cx } from '@vechaiui/react';
import { Suspense, useEffect } from 'react';
import Background from './components/Background';
import Content from './components/Content';
import Toolbar from './components/Toolbar';
import { DefaultLoader } from './etc/Helpers';
import Contact from './pages/Contact';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Work from './pages/Work';
import useStore from './store';

function App() {

  console.log(useStore());
  const { vechaiTheme, loadingProgress } = useStore.getState();
  const { isLoading, activeTheme, darkMode, setDarkMode } = useStore();

  useStore.subscribe(() => console.log(loadingProgress ? loadingProgress() : ""));

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
