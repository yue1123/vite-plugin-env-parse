import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { envParse, parseLoadedEnv } from 'vite-plugin-env-parse'

export default defineConfig(({ mode }) => {
  console.log('vite.config.ts', parseLoadedEnv(loadEnv(mode, './')))
  return {
    plugins: [vue(), envParse()],
    build: {
      sourcemap: true
    }
  }
})
