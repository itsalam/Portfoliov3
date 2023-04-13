import { StateCreator, create } from 'zustand';
import createThemeSlice, { ThemeStore } from '../themes';
import createCMSSlice from './client';
import { AsyncCMSStore } from './types';
import { debounce } from 'lodash';

interface AppStore {
  activePage: number;
  revealSettings: boolean;
  toggleRevealSettings: () => void;
  pages: string[];
  setActivePage: (index: number) => void;
  progress: number;
  setProgress: (progress: number) => void;
}

const createAppSlice: StateCreator<AppStore> = (set) => ({
  activePage: 0,
  revealSettings: false,
  toggleRevealSettings: () =>
    set((state) => ({ revealSettings: !state.revealSettings })),
  pages: ['Home', 'Projects', 'Work', 'Contact'],
  setActivePage: debounce((index: number) => set({ activePage: index }), 300),
  progress: 0,
  setProgress: (progress: number) => set({ progress })
});

export default create<AppStore & AsyncCMSStore & ThemeStore>((...a) => ({
  ...createThemeSlice(...a),
  ...createCMSSlice(...a),
  ...createAppSlice(...a)
}));
