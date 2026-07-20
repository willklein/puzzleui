import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// GitHub Pages serves this as a project site at /puzzleui/, so assets need
// that base path baked in when building there. Netlify (and local dev) serve
// from the domain root. GitHub Actions' runners set GITHUB_ACTIONS=true
// automatically, so this only kicks in for that specific deploy target.
export default defineConfig({
    base: process.env.GITHUB_ACTIONS ? '/puzzleui/' : '/',
    plugins: [react()],
});
