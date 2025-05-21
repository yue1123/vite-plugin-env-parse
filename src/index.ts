import fs from 'node:fs'
import path from 'node:path'
import { type Plugin, type ResolvedConfig } from 'vite'
import { parseComment } from './utils/parseComment'
import { isHTMLRequest, isCSSRequest, isNonJsRequest, errorLog } from './utils'
import { type Options } from './options'
import { parseEnv } from './utils/parseEnv'
import { updateEnvInterface } from './utils/updateEnvInterface'
import { generateDTS } from './utils/generateDTS'
import { ArktypeJSONObject, validationToTsObj } from './utils/validationToTsObj'
import { type } from 'arktype'

export function envParse<const V extends Partial<Record<string, string>> = any>(options: Options<V> = {}): Plugin {
  const {
    parseJson = true,
    onlyDts = false,
    exclude = [],
    dtsPath = 'env.d.ts',
    customParser,
    dev = true,
    validation = {},
    build = false
  } = options
  let parsedEnv: Record<string, any>
  let isBuild = false
  let userConfig: ResolvedConfig
  const importMetaEnvReg = /(?<![\'\"])import\.meta\.env\.([\w-]+)/gi
  const importObjReg = /(import\.meta\.env)(?:[^.])/gi
  // const User = type({
  //   name: 'string',
  //   email: 'string.email',
  //   'age?': 'number >= 18',
  //   'age2?': 'Record<string, string>'
  // })
  // console.log(
  //   type('number >= 18').expression,
  //   type('"aa" | "fasdf"').expression,
  //   type('Record<string, string>').expression
  // )
  // type a = bigint
  // const en = Object.entries(validation) as [string, string][]
  // const subTypeRemove = /(string|number)(\.\w+)+/g
  // const res = en.map(([key, value]) => {
  //   value = value.replace(subTypeRemove, (_, g1, ...args) => {
  //     console.log({ _, g1, args })
  //     return g1
  //   })
  //   // console.log(key, type(value as any).expression, )
  //   return [key, type(value as any).toJSON()]
  // })
  // console.log(arktypeToTs(type(validation).toJSON() as any))

  // console.dir(json, { depth: 10 })
  // console.dir(arktypeToTsValue(json), { depth: 10 })
  // ;(async () => {
  //   const d1 = Date.now()
  //   const res = await compile(json as any, 'test', {
  //     customName(schema, keyNameFromDefinition) {
  //         return '11111'
  //     },
  //   })
  //   console.log(Date.now() - d1, res, '\n')
  // })()
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
      const { command, envPrefix } = config
      const envPrefixLinter = type(`string & /^VITE/`)
      const validator = type({
        index: [
          {
            signature: `string & /^${envPrefix}/`,
            value: 'string'
          }
        ],
        ...validation
      } as any)

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
        // const a = validator(parsedEnv)
        parsedEnv = _parsedEnv

        parsedEnvKeys.forEach((key) => {
          const out = envPrefixLinter(key)
          if (out instanceof type.errors) {
            // hover out.summary to see validation errors
            console.error(out.summary)
          }
        })
        // console.log(a)
        if ((!isBuild && dev) || (isBuild && build)) {
          // gen dts
          const { mode, envDir, root } = config

          const envPaths = [
            path.resolve(envDir || root, `.env`),
            path.resolve(envDir || root, `.env.local`),
            path.resolve(envDir || root, `.env.${mode}`),
            path.resolve(envDir || root, `.env.${mode}.local`)
          ]

          const envCommentRecord = envPaths.reduce((acc, filePath) => {
            if (fs.existsSync(filePath)) {
              const content = fs.readFileSync(filePath, 'utf-8')
              const parsed = parseComment(content)
              return { ...acc, ...parsed }
            }
            return acc
          }, {})
          const envInterface = generateDTS(
            parsedEnv,
            validationToTsObj(validationJson as ArktypeJSONObject),
            envCommentRecord
          )

          envInterface && updateEnvInterface(path.resolve(root, dtsPath), envInterface)
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
