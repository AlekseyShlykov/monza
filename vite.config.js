import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// For GitHub Project Pages, set env VITE_BASE=/your-repo-name/ when building.
// Default '/' works for custom domains and local preview.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? '/',
  build: {
    assetsInlineLimit: 4096,
    sourcemap: false,
  },
});
