import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // ... suas outras configurações
  optimizeDeps: {
    exclude: ['core-js']
  }
});
