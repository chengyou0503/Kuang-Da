import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/Kuang-Da/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        Admin: resolve(__dirname, 'Admin.html'),
        KD03: resolve(__dirname, 'KD03.html'),
        KD04: resolve(__dirname, 'KD04.html'),
        KD06: resolve(__dirname, 'KD06.html'),
        KD12: resolve(__dirname, 'KD12.html'),
        KD22: resolve(__dirname, 'KD22.html'),
        KD25: resolve(__dirname, 'KD25.html'),
        KD26: resolve(__dirname, 'KD26.html'),
      }
    }
  }
})
