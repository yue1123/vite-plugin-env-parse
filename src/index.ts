import fs from 'node:fs'
import path from 'node:path'
import { type Plugin, type ResolvedConfig } from 'vite'
import { parseComment } from './utils/parseComment'
import { isHTMLRequest, isCSSRequest, isNonJsRequest, logger } from './utils'
import { type Options } from './options'
import { parseEnv } from './utils/parseEnv'
import { updateEnvInterface } from './utils/updateEnvInterface'
import { generateDTS } from './utils/generateDTS'
import { ArktypeJSONObject, validationToTsObj } from './utils/validationToTsObj'
import { type } from 'arktype'
import { Recordable } from './types'

const NAME = 'vite-plugin-env-parse'
export function envParse<const V extends Partial<Record<string, string>> = any>(options: Options<V> = {}): Plugin {
  const {
    parseJson = true,
    onlyDts = false,
    exclude = [],
    dtsPath = 'env.d.ts',
    customParser,
    enable = true,
    validation = {}
  } = options
  let parsedEnv: Record<string, any>
  let isBuild = false
  let userConfig: ResolvedConfig
  const importMetaEnvReg = /(?<![\'\"])import\.meta\.env\.([\w-]+)/gi
  const importObjReg = /(import\.meta\.env)(?:[^.])/gi

  // const userLogger = createLogger('info', {
  //   prefix: '[env-parse]',
  // })
  // userLogger.info('vite-plugin-env-parse is deprecated, please use vite-plugin-env-parse-next instead', {
  //   timestamp: true
  // })
  // userLogger.error('vite-plugin-env-parse is deprecated, please use vite-plugin-env-parse-next instead',{
  //   timestamp: true
  // })
  return enable
    ? {
        name: NAME,
        enforce: 'pre',
        transform(code, id) {
          const { envDir } = userConfig

          if (
            envDir === false ||
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
          const { command, envDir } = config

          // envDir is false is disable env load
          if (envDir === false) return
          const validator = type(validation as any)

          const validationJson = validator.toJSON()

          try {
            isBuild = command === 'build'
            userConfig = config
            const { parsedEnv: _parsedEnv, parsedEnvKeys } = parseEnv(config.env, {
              onlyDts,
              parseJson,
              customParser,
              exclude
            })
            parsedEnv = _parsedEnv

            if (!isBuild) {
              const { mode, envDir, root } = config
              const envPaths = [
                path.resolve(envDir || root, `.env`),
                path.resolve(envDir || root, `.env.local`),
                path.resolve(envDir || root, `.env.${mode}`),
                path.resolve(envDir || root, `.env.${mode}.local`)
              ]

              const { paths: loadedPaths, comment: loadedComment } = envPaths.reduce<{
                paths: string[]
                comment: Recordable<string, string>
              }>(
                (res, filePath) => {
                  const { paths, comment } = res
                  if (fs.existsSync(filePath)) {
                    const content = fs.readFileSync(filePath, 'utf-8')
                    const parsedComment = parseComment(content)
                    return {
                      paths: paths.concat(path.relative(root, filePath)),
                      comment: { ...comment, ...parsedComment }
                    }
                  }
                  return res
                },
                { paths: [], comment: {} }
              )
              logger.success(`Loaded dotenv mode: ${mode}`)
              logger.success(`Loaded dotenv count: ${parsedEnvKeys.length}`)
              logger.success(`Loaded dotenv files: \n${logger.group(loadedPaths, 3)}`)
              const envInterface = generateDTS(
                parsedEnv,
                validationToTsObj(validationJson as ArktypeJSONObject),
                loadedComment
              )

              envInterface && updateEnvInterface(path.resolve(root, dtsPath), envInterface)
              // this code only dev mode go into effect
              // import meta env getter proxy
              Object.defineProperty(config, 'env', {
                get() {
                  return parsedEnv
                }
              })
            }

            if (!onlyDts) {
              const out = validator(parsedEnv)
              if (out instanceof type.errors) {
                logger.error('Type Error:\n' + logger.group(out.summary.split('\n')))
              }
            }
          } catch (error: any) {
            logger.error(error.message)
          }
        }
      }
    : {
        name: NAME
      }
}

export { parseEnv as parseLoadedEnv }
