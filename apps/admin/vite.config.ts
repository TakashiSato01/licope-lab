import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  root: __dirname, 
  plugins: [react()],
  server: { port: 5173 },
  test: {
    environment: 'node', 
  },
});
