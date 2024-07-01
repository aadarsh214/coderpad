import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This will bind the server to 0.0.0.0, making it accessible on your network
    port: 5173, // Default port
  },
})
