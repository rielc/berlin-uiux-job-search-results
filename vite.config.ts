import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Prevent vite from obscuring rust errors
  clearScreen: false,

  server: {
    // Tauri expects a fixed port, fail if that port is not available
    strictPort: true,
    // If the host Tauri is expecting is set, use it
    port: 5173,
  },

  // Env variables starting with TAURI_ will be exposed to the client
  envPrefix: ['VITE_'],
})
