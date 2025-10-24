import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/Kuang-Da/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html'),
        Admin: resolve(__dirname, 'public/Admin.html'),
        KD03: resolve(__dirname, 'public/KD03.html'),
        KD04: resolve(__dirname, 'public/KD04.html'),
        KD06: resolve(__dirname, 'public/KD06.html'),
        KD12: resolve(__dirname, 'public/KD12.html'),
        KD22: resolve(__dirname, 'public/KD22.html'),
        KD25: resolve(__dirname, 'public/KD25.html'),
        KD26: resolve(__dirname, 'public/KD26.html'),
      }
    }
  }
})