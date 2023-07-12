import { MantineThemeOverride } from '@mantine/core';
import { GroupProps, RootState } from '@react-three/fiber';
import { ComponentType, LazyExoticComponent, lazy } from 'react';
import { StateCreator } from 'zustand';
import { DomainWarp } from './DomainWarpTheme/colorScheme';
import { Smiley } from './SmileyTheme/colorScheme';

export type Theme = {
  id: string;
  background: LazyExoticComponent<
    ComponentType<GroupProps> & Partial<RootState>
  >;
  mantineTheme: MantineThemeOverride;
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
  themes: Record<string, Theme>;
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
  darkMode: localStorage.theme === 'dark',
  setDarkMode: (darkMode: boolean) => set((state) => ({ ...state, darkMode })),
  themes: {
    Smiley: {
      background: lazy(() => import('./SmileyTheme')),
      mantineTheme: Smiley
    },
    DomainWarp: {
      background: lazy(() => import('./DomainWarpTheme')),
      mantineTheme: DomainWarp
    }
  },
  themeIds: ['Smiley', 'DomainWarp'],
  activeTheme: 'DomainWarp',
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
