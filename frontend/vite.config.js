import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // 🔧 FOR LOCAL TESTING: Use localhost
        target: "http://localhost:3000",

        // 🚀 FOR PRODUCTION: Uncomment this line and comment localhost
        // target: "https://divyansh-chat-app-tkuh.onrender.com",

        secure: false
      }
    }
  },
})