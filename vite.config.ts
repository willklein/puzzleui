import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served at https://willklein.github.io/puzzleui/ in production, so assets
// need that base path baked in. Keep the dev server at the domain root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/puzzleui/' : '/',
  plugins: [react()],
}))
