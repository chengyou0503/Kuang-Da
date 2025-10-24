import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/Kuang-Da/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html'),
        admin: resolve(__dirname, 'public/Admin.html'),
        kd03: resolve(__dirname, 'public/KD03.html'),
        kd04: resolve(__dirname, 'public/KD04.html'),
        kd06: resolve(__dirname, 'public/KD06.html'),
        kd12: resolve(__dirname, 'public/KD12.html'),
        kd22: resolve(__dirname, 'public/KD22.html'),
        kd25: resolve(__dirname, 'public/KD25.html'),
        kd26: resolve(__dirname, 'public/KD26.html'),
      }
    }
  }
})