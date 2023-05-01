import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

export interface EnvParseOptions {
  /**
   * exclude parse env keys
   */
  exclude?: string[]
  /**
   * parse json string to json object
   * @default true
   */
  parseJson?: boolean
  /**
   * custom parser
   */
  customParser?: CustomTransformer
  /**
   * generate env .d.ts file path
   * @default 'env.d.ts'
   */
  dtsPath?: string
}
type Recordable<K extends string = string, T = any> = Record<K, T>
type StringBoolean = 'true' | 'false'
type SupportType = 'string' | 'number' | 'boolean' | 'object' | 'array'
export type CustomTransformer = (key: string, value: string) => string
function errorLog(content: string) {
  console.log('\n')
  console.log('\x1b[31m%s%s\x1b[0m', '✘ [spa-loading] - ', content)
  console.log()
}
function parseEnv(env: Recordable, options: EnvParseOptions) {
  const { parseJson, exclude, customParser } = options
  const parsedRes: Recordable = {}
  const booleanValueMap: Record<StringBoolean, boolean> = {
    true: true,
    false: false
  }
  for (const envKey of Object.keys(env)) {
    let value = env[envKey]
    if (typeof value === 'string' || !exclude!.includes(envKey)) {
      if (value === 'true' || value === 'false') {
        // boolean
        value = booleanValueMap[value as StringBoolean]
      } else if (typeof value !== 'boolean' && value !== '' && !isNaN(value as unknown as number)) {
        // number
        value = parseFloat(value) || value
      } else if (parseJson) {
        // json
        try {
          value = JSON.parse(value)
        } catch (e) {}
        try {
          value = (0, eval)(value)
        } catch (e) {}
      }
    }
    if (customParser) {
      value = customParser(envKey, value) || value
    }
    parsedRes[envKey] = value
  }

  return parsedRes
}
function generateEnvInterface(env: Recordable) {
  let interfaceItem = []
  const excludeKey = ['MODE', 'BASE_URL', 'PROD', 'DEV', 'SSR']
  const typeMap: Recordable<SupportType> = {
    boolean: 'boolean',
    string: 'string',
    number: 'number',
    array: 'any[]',
    object: 'Record<string,any>'
  }
  for (const envKey of Object.keys(env)) {
    if (excludeKey.includes(envKey)) continue
    const value = env[envKey]
    let valueType = typeof value as SupportType
    valueType = valueType === 'object' ? (Array.isArray(value) ? 'array' : valueType) : valueType

    interfaceItem.push(`${envKey}: ${typeMap[valueType] || 'any'}`)
  }
  return `interface ImportMetaEnv {
    // Auto generate by env parse
  ${interfaceItem.join('\n  ')}
}`
}

function writeEnvInterface(envInterface: string, options: EnvParseOptions) {
  const { dtsPath } = options
  const root = process.cwd()
  const _dtsPath = path.resolve(root, dtsPath!)
  const importMetaEnvRegexp = /interface ImportMetaEnv\s*\{[\s\S]*?\}/g

  if (fs.existsSync(_dtsPath)) {
    // replace
    const fileContent = fs.readFileSync(_dtsPath, { encoding: 'utf-8' })
    envInterface = fileContent.replace(importMetaEnvRegexp, envInterface)
  }
  fs.writeFileSync(_dtsPath, envInterface)
}

export function envParse(options: EnvParseOptions = {}): Plugin {
  const defaultOptions = {
    parseJson: true,
    exclude: [],
    dtsPath: 'env.d.ts'
  }
  options = Object.assign(options, defaultOptions)
  let env: Record<string, any> | null = null
  return {
    name: 'vite-plugin-env-parse',
    enforce: 'post',
    configResolved(config) {
      try {
        env = parseEnv(config.env, options)
        writeEnvInterface(generateEnvInterface(env), options)
        Object.defineProperty(config, 'env', {
          get() {
            return env
          }
        })
      } catch (error: any) {
        errorLog(error.message || error)
      }
    }
  }
}
