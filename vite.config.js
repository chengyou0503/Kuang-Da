import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { glob } from 'glob'

// Find all HTML files in the public directory
const htmlFiles = glob.sync('public/**/*.html').reduce((acc, file) => {
  const name = file.replace('public/', '').replace('.html', '')
  acc[name] = resolve(__dirname, file)
  return acc
}, {})

export default defineConfig({
  plugins: [
    react()
  ],
  root: 'public', // Set the project root to the public directory
  base: '/Kuang-Da/',
  build: {
    outDir: '../dist', // Output directory relative to the root
    rollupOptions: {
      input: htmlFiles
    }
  }
})
