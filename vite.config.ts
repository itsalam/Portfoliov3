import { defineConfig } from 'vite'
import { resolve } from 'path';
import react from '@vitejs/plugin-react-swc'
import glsl from 'vite-plugin-glsl';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      { find: '@', replacement: resolve(__dirname, 'src') },
    ],
  },
  plugins: [react(), glsl(), svgr()],
})
