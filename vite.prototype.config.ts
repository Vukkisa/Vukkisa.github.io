import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Builds only the design prototype (app/prototype.html) into prototype-dist/.
// It never touches the production build, which writes index.html + static/ to the repo root.
export default defineConfig({
  root: 'app',
  base: '/',
  plugins: [react(), tailwindcss()],
  publicDir: 'public',
  build: { outDir: '../prototype-dist', emptyOutDir: true, assetsDir: 'assets', target: 'es2020', rollupOptions: { input: 'app/prototype.html' } },
})
