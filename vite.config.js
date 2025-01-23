import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/reactle/",
  build: {
    outDir: 'reactle', //Thats what I call it on the server
  }
})
