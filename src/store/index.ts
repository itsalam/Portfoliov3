import { StateCreator, create } from 'zustand';
import createThemeSlice, { ThemeStore } from '../themes';
import createCMSSlice from './client';
import { CMSStore } from './types';
import { debounce } from 'lodash';

interface AppStore {
  activePage: number;
  pages: string[];
  setActivePage: (index: number) => void;
  progress: number;
  setProgress: (progress: number) => void;
}

const createAppSlice: StateCreator<AppStore> = (set) => ({
  activePage: 0,
  pages: ['Home', 'Projects', 'Work', 'Contact'],
  setActivePage: debounce((index: number) => set({ activePage: index }), 300),
  progress: 0,
  setProgress: (progress: number) => set({ progress })
});

export default create<AppStore & CMSStore & ThemeStore>((...a) => ({
  ...createThemeSlice(...a),
  ...createCMSSlice(...a),
  ...createAppSlice(...a)
}));
