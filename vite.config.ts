import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/comparador-de-precios/',
  build: {
    chunkSizeWarningLimit: 2048,
    outDir: 'dist',
    assetsDir: 'assets',
  },
  optimizeDeps: {
    include: ['tailwindcss', '@tailwindcss/postcss'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
