import { defineConfig } from 'vite'
import { resolve } from 'path'
import { glob } from 'glob'

// Dynamically find all HTML files in the public directory
const inputFiles = glob.sync('public/*.html').reduce((acc, file) => {
  // Create a name for the entry point by removing 'public/' and '.html'
  const name = file.replace('public/', '').replace('.html', '');
  acc[name] = resolve(__dirname, file);
  return acc;
}, {});

export default defineConfig({
  // Set the root to the 'public' directory, so Vite serves from here
  root: 'public',
  base: '/Kuang-Da/',
  build: {
    // Output directory is relative to the project root, not the 'public' root
    outDir: '../dist',
    // Empty the output directory before building
    emptyOutDir: true,
    rollupOptions: {
      input: inputFiles,
      output: {
        // This ensures that the output files are not placed in a 'public' subfolder
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      }
    }
  }
})
