import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Server build used only by scripts/prerender.mjs. Entries: the renderer, the content module, and the route meta table (src/designs/seo.js).
export default defineConfig({
  plugins: [react()],
  build: {
    ssr: true,
    outDir: 'dist-ssr',
    emptyOutDir: true,
    rollupOptions: { input: { 'entry-server': 'src/entry-server.jsx', content: 'src/designs/content.jsx', seo: 'src/designs/seo.js' }, output: { entryFileNames: '[name].js' } },
  },
})
