import fs from 'node:fs'
import path from 'node:path'
import { type Plugin, type ResolvedConfig } from 'vite'
import { parseEnvComment } from './parseEnvComment'
import { isHTMLRequest, isCSSRequest, isNonJsRequest, errorLog } from './utils'
import { Options } from './options'
import { parseEnv } from './parseEnv'
import { writeEnvInterface } from './writeEnvInterface'
import { generateEnvInterface } from './generateEnvInterface'

export function envParse(options: Options = {}): Plugin {
  const { parseJson = true, exclude = [], dtsPath = 'env.d.ts', customParser, dev = true, build = false } = options
  let parsedEnv: Record<string, any>
  let isBuild = false
  let userConfig: ResolvedConfig
  const importMetaEnvReg = /(?<![\'\"])import\.meta\.env\.([\w-]+)/gi
  const importObjReg = /(import\.meta\.env)(?:[^.])/gi
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
          .replace(importMetaEnvReg, (matched, envKey) => {
            let val = parsedEnv[envKey]
            if (typeof val !== 'undefined') {
              return typeof val === 'string' ? `'${val}'` : JSON.stringify(val)
            }
            return matched
          })
          .replace(importObjReg, (matched, envKey) => matched.replace(envKey, JSON.stringify(parsedEnv)))
        return {
          code,
          map: null
        }
      }
    },
    configResolved(config) {
      const { command } = config
      try {
        isBuild = command === 'build'
        userConfig = config
        parsedEnv = parseEnv(config.env, { parseJson, customParser, exclude })
        if ((!isBuild && dev) || (isBuild && build)) {
          // gen dts
          const { mode, envDir, root } = config
          const baseEnvFilePath = path.resolve(envDir || root, `.env`)
          const modeFilePath = path.resolve(envDir || root, `.env.${mode}`)
          const localEnvFilePath = path.resolve(envDir || root, `.env.local`)
          const modeLocalFilePath = path.resolve(envDir || root, `.env.${mode}.local`)
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
          const envInterface = generateEnvInterface(parsedEnv, envCommentRecord)
          envInterface && writeEnvInterface(path.resolve(root, dtsPath), envInterface)
        }
        if (!isBuild && dev) {
          // this code only dev mode go into effect
          // import meta env getter proxy
          Object.defineProperty(config, 'env', {
            get() {
              return parsedEnv
            }
          })
        }
      } catch (error: any) {
        errorLog(error.message)
      }
    }
  }
}

export { parseEnv as parseLoadedEnv }
