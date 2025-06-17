// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/stations': 'http://localhost:3000',
      '/defects':  'http://localhost:3000',
      '/incidents':'http://localhost:3000'
    }
  }
});
