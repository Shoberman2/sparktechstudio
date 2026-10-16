import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Server build used only by scripts/prerender.mjs. Two entries: the renderer and the content module (for the route list).
export default defineConfig({
  plugins: [react()],
  build: {
    ssr: true,
    outDir: 'dist-ssr',
    emptyOutDir: true,
    rollupOptions: { input: { 'entry-server': 'src/entry-server.jsx', content: 'src/designs/content.jsx' }, output: { entryFileNames: '[name].js' } },
  },
})
