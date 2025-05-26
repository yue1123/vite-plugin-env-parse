import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { envParse } from 'vite-plugin-env-parse'

export default defineConfig(() => {
  return {
    plugins: [
      vue(),
      envParse({
        validation: {
          VITE_APP_NAME: 'string',
          VITE_APP_DB_NAME: '"db1" | "db2"'
        }
      })
    ],
    build: {
      sourcemap: true
    }
  }
})
