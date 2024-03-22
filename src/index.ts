import fs from 'node:fs'
import path from 'node:path'
import { type Plugin, type ResolvedConfig } from 'vite'
import { type Recordable } from './types'
import { parseEnvComment } from './parseEnvComment'
import { isHTMLRequest, isCSSRequest, isNonJsRequest } from './utils'

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

type StringBoolean = 'true' | 'false'
type SupportType = 'string' | 'number' | 'boolean' | 'object' | 'array'
export type CustomTransformer = (key: string, value: string) => string
function errorLog(content: string) {
  console.log('\n')
  console.log('\x1b[31m%s%s\x1b[0m', '✘ [env-parse] - ', content)
  console.log()
}
/**
 * parse loaded env
 * @param env env string record
 */
function parseEnv(env: Recordable, options: EnvParseOptions = {}) {
  const { parseJson = true, exclude = [], customParser } = options
  const parsedRes: Recordable = {}
  const booleanValueMap: Record<StringBoolean, boolean> = {
    true: true,
    false: false
  }
  for (const envKey of Object.keys(env)) {
    let value = env[envKey]
    if (typeof value === 'string' || !exclude.includes(envKey)) {
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
      value = (customParser && customParser(envKey, value)) || value
    }
    parsedRes[envKey] = value
  }

  return parsedRes
}
function generateEnvInterface(env: Recordable, commentRecord: Recordable<string, string>) {
  let interfaceItem: string[] = []
  const excludeKey = ['MODE', 'BASE_URL', 'PROD', 'DEV', 'SSR']
  const typeMap: Recordable<SupportType> = {
    boolean: 'boolean',
    string: 'string',
    number: 'number',
    array: 'any[]',
    object: 'Record<string, any>'
  }
  for (const envKey of Object.keys(env)) {
    if (excludeKey.includes(envKey)) continue
    const value = env[envKey]
    let valueType = typeof value as SupportType
    valueType = valueType === 'object' ? (Array.isArray(value) ? 'array' : valueType) : valueType
    let comment = commentRecord[envKey]
    interfaceItem.push(
      comment
        ? `/**
   * ${comment}
   */
  ${envKey}: ${typeMap[valueType] || 'any'}`
        : `${envKey}: ${typeMap[valueType] || 'any'}`
    )
  }
  return `interface ImportMetaEnv {
  // Auto generate by env-parse
  ${interfaceItem.join('\n  ')}
}`
}

function writeEnvInterface(envInterface: string, options: EnvParseOptions) {
  const { dtsPath } = options
  const root = process.cwd()
  const _dtsPath = path.resolve(root, dtsPath!)
  const importMetaEnvRegexp = /interface ImportMetaEnv\s*\{[\s\S]*?\}/g
  if (fs.existsSync(_dtsPath)) {
    const fileContent = fs.readFileSync(_dtsPath, { encoding: 'utf-8' })
    if (importMetaEnvRegexp.test(fileContent)) {
      // replace
      envInterface = fileContent.replace(importMetaEnvRegexp, envInterface)
    } else {
      // append
      envInterface = `${fileContent}
${envInterface}`
    }
  }
  fs.writeFileSync(_dtsPath, envInterface)
}

export function envParse(options: EnvParseOptions = {}): Plugin {
  const defaultOptions = {
    parseJson: true,
    exclude: [],
    dtsPath: 'env.d.ts'
  }
  options = Object.assign(defaultOptions, options) as Required<EnvParseOptions>
  let parsedEnv: Record<string, any>
  let isBuild = false
  let userConfig: ResolvedConfig
  const importMetaEnvReg = /(?<![\'\"])import\.meta\.env\.([\w-]+)/gi
  const importObjReg = /import\.meta\.env/gi
  return {
    name: 'vite-plugin-env-parse',
    enforce: 'pre',
    transform(code, id) {
      if (
        !isBuild ||
        // exclude html, css and static assets for performance
        isHTMLRequest(id) ||
        isCSSRequest(id) ||
        isNonJsRequest(id) ||
        userConfig.assetsInclude(id)
      ) {
        return
      }
      if (code.includes('import.meta.env')) {
        code = code
          .replace(importMetaEnvReg, (all, envKey) => {
            let val = parsedEnv[envKey]
            if (typeof val !== 'undefined') {
              return typeof val === 'string' ? `'${val}'` : JSON.stringify(val)
            }
            return all
          })
          .replace(importObjReg, () => JSON.stringify(parsedEnv))
        return {
          code,
          map: null
        }
      }
    },
    configResolved(config) {
      const { command, env } = config
      try {
        isBuild = command === 'build'
        userConfig = config
        parsedEnv = parseEnv(config.env, options)
        if (!isBuild && env.MODE === 'development') {
          // gen dts
          const { mode, envDir, root } = config
          const modeFilePath = path.resolve(envDir || root, `.env.${mode}`)
          const modeLocalFilePath = path.resolve(envDir || root, `.env.${mode}.local`)
          const localEnvFilePath = path.resolve(envDir || root, `.env.local`)
          const baseEnvFilePath = path.resolve(envDir || root, `.env`)
          const modeEnvFileContent = fs.existsSync(modeFilePath) && fs.readFileSync(modeFilePath, 'utf-8')
          const modeLocalEnvFileContent =
            fs.existsSync(modeLocalFilePath) && fs.readFileSync(modeLocalFilePath, 'utf-8')
          const localEnvFileContent = fs.existsSync(localEnvFilePath) && fs.readFileSync(localEnvFilePath, 'utf-8')
          const baseEnvFileContent = fs.existsSync(baseEnvFilePath) && fs.readFileSync(baseEnvFilePath, 'utf-8')

          const modeEnvCommentRecord = modeEnvFileContent ? parseEnvComment(modeEnvFileContent) : {}
          const modeLocalCommentRecord = modeLocalEnvFileContent ? parseEnvComment(modeLocalEnvFileContent) : {}
          const localEnvCommentRecord = localEnvFileContent ? parseEnvComment(localEnvFileContent) : {}
          const baseEnvCommentRecord = baseEnvFileContent ? parseEnvComment(baseEnvFileContent) : {}

          const envCommentRecord = {
            ...baseEnvCommentRecord,
            ...localEnvCommentRecord,
            ...modeEnvCommentRecord,
            ...modeLocalCommentRecord
          }
          writeEnvInterface(generateEnvInterface(parsedEnv, envCommentRecord), options)
          Object.defineProperty(config, 'env', {
            get() {
              return parsedEnv
            }
          })
          return
        }
      } catch (error: any) {
        errorLog(error.message || error)
      }
    }
  }
}
export { parseEnv as parseLoadedEnv }
