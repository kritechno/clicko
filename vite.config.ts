import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative base so the build works on GitHub Pages and on a custom domain.
  base: './',
  plugins: [react()],
  server: { port: 5173 },
});
