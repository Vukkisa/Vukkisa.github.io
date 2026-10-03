import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Source lives in app/. GitHub Pages serves this repo's root, so the build is written
// there (index.html + static/). Old hashed bundles are cleared by the build script.
export default defineConfig({
  root: 'app',
  base: '/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '..',
    emptyOutDir: false,
    assetsDir: 'static',
    target: 'es2020',
    sourcemap: false,
  },
})
