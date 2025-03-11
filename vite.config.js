import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define:{
    'process.env.VITE_CLIENT_ID' : JSON.stringify(process.env.VITE_CLIENT_ID),
  }
})
