import dwThemes from './DomainWarpTheme/colorScheme';
import smileyThemes from './SmileyTheme/colorScheme';
import { extendTheme, VechaiTheme } from '@vechaiui/react';
import DWBackground from './DomainWarpTheme';
import SmileyBackground from './SmileyTheme';
import { StateCreator } from 'zustand';
import { GroupProps } from '@react-three/fiber';

const theme = extendTheme({
  cursor: 'pointer',
  colorSchemes: {
    ...dwThemes,
    ...smileyThemes
  }
});

export const initDarkMode = (): boolean =>
  localStorage.theme === 'dark' ||
  (!('theme' in localStorage) &&
    window.matchMedia('(prefers-color-scheme: dark)').matches);

export const checkDarkMode = (): boolean => {
  return document.documentElement.classList.contains('dark');
};

export const toggleDarkMode = (): void => {
  if (checkDarkMode()) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export type ThemeStore = {
  vechaiTheme: VechaiTheme;
  themeOptions: {
    theme: {
      options: Record<
        string,
        { id: string; background: (props: GroupProps) => JSX.Element }
      >;
    };
  };
};

const createThemeSlice: StateCreator<ThemeStore> = (): ThemeStore => ({
  vechaiTheme: theme,
  themeOptions: {
    theme: {
      options: {
        Smiley: { id: 'smileyTheme', background: SmileyBackground },
        'Domain-Warp': { id: 'dwTheme', background: DWBackground }
      }
    }
  }
});

export default createThemeSlice;
