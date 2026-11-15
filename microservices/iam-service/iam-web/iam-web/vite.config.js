import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {fileURLToPath} from 'node:url'
import { defineConfig, loadEnv } from 'vite'

const sourceDirectory = fileURLToPath(new URL('./src', import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const iamOrigin = env.VITE_IAM_ORIGIN || 'http://localhost:8080'
  return {
    plugins: [react(), tailwindcss()],
    resolve: {alias: {'@': sourceDirectory}},
    base: '/',
    build: {
      outDir: '../src/main/resources/static',
      emptyOutDir: true,
    },
    server: {
      proxy: {
        '/login': iamOrigin,
        '/register': iamOrigin,
        '/api': iamOrigin,
        '/account': iamOrigin,
        '/profile': iamOrigin,
        '/oauth2': iamOrigin,
      },
    },
  }
})
