import { StateCreator, create } from 'zustand';
import createThemeSlice, { ThemeStore } from '../themes';
import createCMSSlice from './client';
import { AsyncCMSStore } from './types';
import { debounce } from 'lodash';

interface AppStore {
  activePage: number;
  pages: string[];
  setActivePage: (index: number) => void;
  hideForeground: boolean;
}

const createAppSlice: StateCreator<AppStore> = (set) => ({
  activePage: 0,
  pages: ['Home', 'Projects', 'Work', 'Contact'],
  setActivePage: debounce((index: number) => set({ activePage: index }), 300),
  hideForeground: false
});

export default create<AppStore & AsyncCMSStore & ThemeStore>((...a) => ({
  ...createThemeSlice(...a),
  ...createCMSSlice(...a),
  ...createAppSlice(...a)
}));
