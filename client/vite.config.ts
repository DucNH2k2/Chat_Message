import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")

  if (env.APP_PORT === undefined) {
    throw new Error("APP_PORT is undefined")
  }

  const appPort = parseInt(env.APP_PORT)
  if (Number.isNaN(appPort)) {
    throw new Error("invalid APP_PORT detected")
  }

  return {
    server: {
      port: appPort
    },
    plugins: [
      react(),
      tsconfigPaths(),
      tailwindcss()
    ],
  }
})
