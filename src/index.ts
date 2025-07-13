import fs from 'node:fs'
import { cwd } from 'node:process'
import { type Plugin, mergeConfig, loadEnv, normalizePath } from 'vite'
import { WithDefaultOptions, type Options } from './options'
import { ArktypeJSONObject, validationToTsObj } from './utils/validationToTsObj'
import { defaultOptions } from './defaultOptions'
import { ParsedEnvFileResult, parseEnvFile } from './utils/parseEnvFile'
import { relative, resolve } from 'node:path'
import { castEnvType } from './utils/castEnvType'
import { ArkError, type } from 'arktype'
import { logger } from './utils'
import { generateDTS } from './utils/generateDTS'
import { updateEnvInterface } from './utils/updateEnvInterface'

const NAME = 'vite-plugin-env-parse'
export function envParse<const V extends Partial<Record<string, string>> = any>(options: Options<V> = {}): Plugin {
  const {
    logLevel,
    generateDts: { devEnable, buildEnable, path: dtsPath },
    castType,
    validation: { schema, strictMode, keepBaseline }
  } = mergeConfig(defaultOptions, options) as WithDefaultOptions<Options<V>>

  return {
    name: NAME,
    enforce: 'pre',
    config(config, env) {
      if (config.envDir === false) return

      const { root = cwd(), envPrefix = 'VITE_', envDir = './' } = config
      const resolvedRoot = normalizePath(root)
      const { command, mode, isPreview } = env
      const resolvedEnvDir = normalizePath(resolve(resolvedRoot, envDir))
      const isDev = command === 'serve' && !isPreview && [process.env.NODE_ENV, mode].includes('development')
      const isBuild = command === 'build' && [process.env.NODE_ENV, mode].includes('production')

      const validator = type(schema as any)
      const validationJson = validator.toJSON()
      const loadedEnv = loadEnv(mode, resolvedEnvDir, envPrefix)
      const { castedEnv, castedEnvKeys } = castEnvType(loadedEnv, castType)
      const enableGenerateDTS = isDev ? devEnable : isBuild && buildEnable

      const envPaths = [`.env`, `.env.local`, `.env.${mode}`, `.env.${mode}.local`]

      const {
        paths: loadedPaths,
        parsedEnvs,
        group: parsedEnvsGroup
      } = envPaths.reduce<{
        paths: string[]
        parsedEnvs: ParsedEnvFileResult
        group: Record<string, ParsedEnvFileResult>
      }>(
        (res, _filePath) => {
          const { paths, parsedEnvs, group } = res
          const filePath = resolve(resolvedEnvDir, _filePath)
          const relativeFilePath = relative(resolvedRoot, filePath)

          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8')
            const parsedEnvFile = parseEnvFile(content, relativeFilePath)
            return {
              paths: paths.concat(relative(root, filePath)),
              parsedEnvs: { ...parsedEnvs, ...parsedEnvFile },
              group: {
                ...group,
                [relativeFilePath]: parsedEnvFile
              }
            }
          }
          return res
        },
        { paths: [], parsedEnvs: {}, group: {} }
      )

      const define = Object.fromEntries(
        Object.entries(castedEnv).map(([key, value]) => {
          return [`import.meta.env.${key}`, JSON.stringify(value)] // Ensure string values are quoted
        })
      )

      if (enableGenerateDTS) {
        // generate dts
        const envInterface = generateDTS(
          loadedEnv,
          validationToTsObj(validationJson as ArktypeJSONObject),
          Object.fromEntries(Object.values(parsedEnvs).map((item) => [item.key, item.comment]))
        )

        envInterface && updateEnvInterface(resolve(root, dtsPath), envInterface)
      }

      if (logLevel === 'info') {
        logger.success(`Loaded dotenv mode: ${mode}`)
        logger.success(`Loaded dotenv count: ${castedEnvKeys.length}`)
        logger.success(`Loaded dotenv files: \n${logger.group(loadedPaths, 3)}`)
      }

      const parsedEnvsGroupEntries = Object.entries(parsedEnvsGroup)
      if (keepBaseline && parsedEnvsGroupEntries.length) {
        const baseline = parsedEnvsGroup['.env'] || parsedEnvsGroup['.env.local']
        // Check if .env files are present in the project root
        if (!baseline) {
          console.warn(
            `keepBaseline is enabled, but no .env file found in the project root.\n` +
              `To ensure consistent environment variables across different environments, please create a .env file in the project root.\n`
          )
        } else {
          parsedEnvsGroupEntries.forEach(([filePath, parsedEnvs]) => {
            if (filePath === '.env') return // Skip baseline files
            const missingKeys = Object.keys(parsedEnvs).filter((key) => !(key in baseline))
            if (missingKeys.length) {
              console.warn(
                `The following environment variables are defined in ${filePath} but not in the baseline .env file:\n` +
                  missingKeys.map((key) => `- ${key}`).join('\n') +
                  `\nTo ensure consistent environment variables across different environments, please add these keys to the .env file.\n`
              )
            }
          })
        }
      }
      
      if (Object.keys(schema).length) {
        const out: ArkError[] = validator(castedEnv)
        out.forEach((error) => {
          const path = error.path[0] as string
          if (path) {
            const envRaw = parsedEnvs[path]
            console.log(`${envRaw['__file']}(${envRaw['line']},${envRaw['line']})`, error.message || error.expected)
          }
        })
        if (strictMode && out instanceof type.errors) {
          console.log('\r')
          logger.error('Environment variable validation failed. Exiting process.')
          process.exit(1)
        }
      }
      return {
        envDir: false,
        define
      }
    }
    // load(){}
  }
}

export { castEnvType }