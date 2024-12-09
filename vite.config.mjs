import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src', // Set the root to the /src directory
  build: {
    outDir: '../dist', // Specify output directory outside of /src
  },
});
