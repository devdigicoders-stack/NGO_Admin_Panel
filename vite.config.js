import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND_URL = 'https://ngo-backend-j2lt.onrender.com'
const LOCAL_BACKEND = 'http://localhost:5002'

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_BASE': JSON.stringify(`${BACKEND_URL}/api`),
    'import.meta.env.VITE_SERVER_URL': JSON.stringify(BACKEND_URL),
  },
  server: {
    proxy: {
      '/api': {
        target: LOCAL_BACKEND,
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: LOCAL_BACKEND,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

