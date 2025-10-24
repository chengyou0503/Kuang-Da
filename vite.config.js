import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react()
  ],
  base: '/Kuang-Da/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'public/index.html',
        admin: 'public/Admin.html',
        kd03: 'public/KD03.html',
        kd04: 'public/KD04.html',
        kd06: 'public/KD06.html',
        kd12: 'public/KD12.html',
        kd22: 'public/KD22.html',
        kd25: 'public/KD25.html',
        kd26: 'public/KD26.html',
      }
    }
  }
})