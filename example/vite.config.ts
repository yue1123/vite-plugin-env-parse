import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { envParse } from 'vite-plugin-env-parse'

export default defineConfig({
  plugins: [vue(), envParse()]
})
