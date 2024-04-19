import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { envParse, parseLoadedEnv } from 'vite-plugin-env-parse'

export type EnvVarDefault = string | null | undefined

export type EnvVarDefaults = Record<string, EnvVarDefault>

function defineEnvVars(env: EnvVarDefaults, defineOn: string, keys: string[], defaultValues: EnvVarDefaults) {
  return keys.reduce((vars, key) => {
    const value = env[key] === undefined ? defaultValues[key] : env[key]
    if (value === undefined) {
    }
    vars[`${defineOn}.${key}`] = JSON.stringify(value)
    return vars
  }, {} as Record<string, string | null>)
}

export default defineConfig(({ mode }) => {
  const a = parseLoadedEnv(loadEnv(mode, './'))
  console.log('vite.config.ts', loadEnv(mode, './'))
  console.log(defineEnvVars(loadEnv(mode, './'), 'process.env', Object.keys(a), {}))
  return {
    plugins: [vue(), envParse()],
    build: {
      sourcemap: true
    },
    define: defineEnvVars(parseLoadedEnv(loadEnv(mode, './')), 'process.env', Object.keys(a), {})
  }
})
