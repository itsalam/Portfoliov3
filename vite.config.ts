import { defineConfig } from 'vite'
import { resolve } from 'path';
import react from '@vitejs/plugin-react-swc'
import glsl from 'vite-plugin-glsl';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '#root': resolve(__dirname)
    }
  },
  plugins: [react(), glsl()],
})
