import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/easy-timestamp-tool/',
  plugins: [react()],
})
