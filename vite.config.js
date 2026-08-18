import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path must match the GitHub repo name for GitHub Pages project sites
// e.g. https://USERNAME.github.io/metronome/  ->  base: '/metronome/'
export default defineConfig({
  plugins: [react()],
  base: '/metronome/',
})
