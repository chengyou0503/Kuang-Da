import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  base: '/Kuang-Da/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'Admin.html'),
        kd03: resolve(__dirname, 'KD03.html'),
        kd04: resolve(__dirname, 'KD04.html'),
        kd06: resolve(__dirname, 'KD06.html'),
        kd12: resolve(__dirname, 'KD12.html'),
        kd22: resolve(__dirname, 'KD22.html'),
        kd25: resolve(__dirname, 'KD25.html'),
        kd26: resolve(__dirname, 'KD26.html'),
      }
    }
  }
})
