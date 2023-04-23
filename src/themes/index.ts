import dwThemes from './DomainWarpTheme/colorScheme';
import smileyThemes from './SmileyTheme/colorScheme';
import { extendTheme, VechaiTheme } from '@vechaiui/react';
import { StateCreator } from 'zustand';
import { GroupProps } from '@react-three/fiber';
import { ComponentType, lazy, LazyExoticComponent } from 'react';

const theme = extendTheme({
  cursor: 'pointer',
  colorSchemes: {
    ...dwThemes,
    ...smileyThemes
  }
});

export type Theme = {
  id: string;
  background: LazyExoticComponent<ComponentType<GroupProps>>;
};

export type BgColorScheme = {
  colors: {
    hightlight1: string;
    hightlight2: string;
  };
};

export type ThemeStore = {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
  vechaiTheme: VechaiTheme;
  themes: Record<string, Theme>;
  themeIds: string[];
  activeTheme: string;
  setActiveTheme: (id: string) => void;
  bgOpacity: number;
  setBgOpacity: (opacity: number) => void;
};

const createThemeSlice: StateCreator<ThemeStore> = (set, get) => ({
  darkMode: localStorage.theme == 'dark',
  setDarkMode: (darkMode: boolean) => set((state) => ({ ...state, darkMode })),
  vechaiTheme: theme,
  themes: {
    Smiley: {
      id: 'smileyTheme',
      background: lazy(() => import('../themes/SmileyTheme'))
    },
    DomainWarp: {
      id: 'dwTheme',
      background: lazy(() => import('../themes/DomainWarpTheme'))
    }
  },
  themeIds: ['Smiley', 'DomainWarp'],
  activeTheme: 'Smiley',
  setActiveTheme: async (id: string) => {
    if (get().activeTheme !== id) {
      const animation = (transitions?: object) =>
        document
          .querySelector('#canvas')
          ?.animate(
            { opacity: 0, ...transitions },
            { duration: 600, easing: 'linear' }
          );

      animation()
        ?.finished.then(() => {
          set({
            activeTheme: id
          });
        })
        .then(() => animation({ opacity: [0, 1] }));
    }
  },
  bgOpacity: 100,
  setBgOpacity: (opacity: number) =>
    set((state) => ({ ...state, bgOpacity: opacity }))
});

export default createThemeSlice;
