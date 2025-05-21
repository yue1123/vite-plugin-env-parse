import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { envParse, parseLoadedEnv } from 'vite-plugin-env-parse'

import './env.d'
export default defineConfig(() => {
  return {
    plugins: [
      vue(),
      envParse({
        onlyDts: true,
        validation: {
          VITE_APP_ARRAY_DATA: 'string[]',
          VITE_APP_API_KEY: 'string',
          VITE_APP_DB_NAME: '"aa" | "bb"',
          VITE_APP_FEATURE_FLAG_1: 'boolean',
          VITE_APP_EXTERNAL_API_KEY: 'string',
          VITE_APP_NAME: 'string.alpha'
        }
      })
    ],
    build: {
      sourcemap: true
    }
  }
})
