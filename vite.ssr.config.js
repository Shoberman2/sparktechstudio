import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Server build used only by scripts/prerender.mjs. Three entries: the renderer, and the content and pages modules (for the route list).
export default defineConfig({
  plugins: [react()],
  build: {
    ssr: true,
    outDir: 'dist-ssr',
    emptyOutDir: true,
    rollupOptions: { input: { 'entry-server': 'src/entry-server.jsx', content: 'src/designs/content.jsx', pages: 'src/designs/pages.jsx' }, output: { entryFileNames: '[name].js' } },
  },
})
