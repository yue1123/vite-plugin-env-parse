import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { envParse } from 'vite-plugin-env-parse'

export default defineConfig(() => {
  return {
    plugins: [
      vue(),
      envParse({
        castType: {
          json: false
        },
        // generateDts:{}
        // buildEnable: true,
        // validation: {
        //   schema: {
        //     VITE_APP_NAME: 'number',
        //     VITE_APP_DB_NAME: '"db1" | "db2"'
        //   },
        //   keepBaseline: true
        // }
      })
    ],
    // envDir: './env',
    build: {
      sourcemap: true
    }
  }
})
