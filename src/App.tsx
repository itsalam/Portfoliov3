import { Flex, MantineProvider, MantineThemeOverride } from '@mantine/core';

import { Notifications } from '@mantine/notifications';
import { useEffect } from 'react';
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
  const { themes, loadingProgress } = useStore.getState();
  const { isLoading, activeTheme, darkMode, setDarkMode } = useStore();
  const defaultTheme: MantineThemeOverride = {
    globalStyles: (theme) => ({
      '.primary-color': {
        color: theme.colors[theme.primaryColor][5],
      },

      '.primary-font': {
        color: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 0 : 9],
      },

      '.primary-bg': {
        backgroundColor: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 0 : 9],
      },
      '.secondary-color': {
        color: theme.colors.secondaryColor[theme.colorScheme === 'dark' ? 2 : 7],
      },
      '.muted-color': {
        color: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 2 : 7],
      },

      body: {
        color: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 0 : 9],
      },
    }),
  };

  useStore.subscribe(() => loadingProgress && loadingProgress());

  // TODO: FIX LIGHT DARK AND THEMES
  // MOBILE PROJECT EFFECTS/LAYOUT
  // THREEJS LAYOUT/RESIZING BUG
  useEffect(() => {
    console.log(darkMode);
    localStorage.theme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  return (
    <MantineProvider
      theme={
        {
          ...defaultTheme,
          ...themes[activeTheme].mantineTheme,
          colorScheme: darkMode ? 'dark' : 'light',
        }}
      withCSSVariables
      withGlobalStyles
      withNormalizeCSS
    >
      <Notifications />
      <Flex
        w="100%"
        direction="column"
      >
        {isLoading ? (
          <DefaultLoader />
        ) : (
          <>
            <Background />
            <Toolbar {...{ darkMode, setDarkMode }} />
            <Content>
              <Home />
              <Projects />
              <Work />
              <Contact />
            </Content>
          </>
        )}
      </Flex>
    </MantineProvider>
  );
}

export default App;
