import dwThemes from './DomainWarpTheme/colorScheme';
import smileyThemes from './SmileyTheme/colorScheme';
import { extendTheme, VechaiTheme } from '@vechaiui/react';
import { StateCreator } from 'zustand';
import { GroupProps, RootState } from '@react-three/fiber';
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
  background: LazyExoticComponent<
    ComponentType<GroupProps> & Partial<RootState>
  >;
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

const fadeInOutCanvas = (callback: () => void) => {
  const canvas = document.querySelector('#canvas');
  if (canvas) {
    const animation = (transitions?: object, delay?: number) =>
      canvas.animate(
        { opacity: 0, ...transitions },
        { duration: 550, easing: 'linear', fill: 'forwards', delay: delay ?? 0 }
      );
    animation()
      .finished.then(callback)
      .then(() => animation({ opacity: [0, 1] }, 350));
  }
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
      fadeInOutCanvas(() =>
        set({
          activeTheme: id
        })
      );
    }
  },
  bgOpacity: 100,
  setBgOpacity: (opacity: number) =>
    set((state) => ({ ...state, bgOpacity: opacity }))
});

export default createThemeSlice;
