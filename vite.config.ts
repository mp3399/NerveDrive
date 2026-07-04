import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Set base to '/<repo>/' when deploying to GitHub Pages project sites.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  worker: { format: 'es' },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        manualChunks: {
          echarts: ['echarts', 'echarts-for-react'],
          pdf: ['jspdf'],
          react: ['react', 'react-dom'],
        },
      },
    },
  },
});
