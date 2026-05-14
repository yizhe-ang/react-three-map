import react from '@vitejs/plugin-react'
import { resolve } from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'three/examples/jsm/utils/BufferGeometryUtils': resolve(__dirname, './src/compat/buffer-geometry-utils.ts'),
      'three/examples/jsm/utils/BufferGeometryUtils.js': resolve(__dirname, './src/compat/buffer-geometry-utils.ts'),
    }
  },
  optimizeDeps: {
    exclude: ['react-three-map', 'web-ifc-three']
  }
})
