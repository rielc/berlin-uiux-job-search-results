import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/jobs': {
        target: 'https://flow.gabrielcredico.de',
        changeOrigin: true,
        rewrite: (path) => '/webhook/berlin-ui-ux-job-feed'
      }
    }
  }
})
