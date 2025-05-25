import { Options } from '../options'
import { Recordable } from '../types'
import { excludeKey } from './generateDTS'

function safeEval(expr: string, context: Record<string, any> = {}) {
  const contextKeys = Object.keys(context)
  const contextValues = Object.values(context)

  // 构造受限函数体，屏蔽全局对象
  const func = new Function(...contextKeys, `"use strict"; return (${expr});`)

  return func(...contextValues)
}

function parseBoolean(value: string): boolean | string {
  return value === 'true' ? true : value === 'false' ? false : value
}

function parseNumber(value: string): number | string {
  return typeof value !== 'boolean' && value !== '' && !isNaN(Number(value)) ? parseFloat(value) : value
}

function parseJsonValue(value: string): any {
  try {
    return JSON.parse(value)
  } catch {
    /**
     * nonstandard json data parse
     * @example `['item1', 'item2', 'item3']`
     * @example `{key1:'value1',key2:"value2"}`
     */
    try {
      const temp = safeEval(`${value}`)
      if (!(temp instanceof RegExp)) {
        value = temp
      }
    } catch {}
  }
  return value
}

function isLikelyJson(str: string) {
  return typeof str === 'string' && str.trim().length > 0 && /^[{\[].*[}\]]$/.test(str.trim())
}

/**
 * parse loaded env
 * @param env env string record
 */
export function parseEnv(
  env: Recordable = {},
  options: Pick<Options, 'onlyDts' | 'parseJson' | 'exclude' | 'customParser'> = {}
) {
  const { parseJson = true, exclude = [], onlyDts, customParser } = options
  const envKeys = Object.keys(env).filter((key) => !excludeKey.includes(key))

  if (onlyDts) {
    return { parsedEnv: env, parsedEnvKeys: envKeys }
  }

  const parsedEnv: Recordable = {}
  const parsedEnvKeys: string[] = []
  for (const envKey of envKeys) {
    let value = env[envKey]

    if (exclude.includes(envKey)) {
      parsedEnv[envKey] = value
      continue
    }

    if (typeof value === 'string') {
      value = parseBoolean(value) // boolean
      if (typeof value === 'string') {
        value = parseNumber(value) // number
        if (typeof value === 'string') {
          if (parseJson && isLikelyJson(value)) {
            value = parseJsonValue(value) // json
          }
        }
      }
      if (customParser) {
        value = customParser(envKey, value)
      }
    }

    parsedEnvKeys.push(envKey)
    parsedEnv[envKey] = value
  }

  return { parsedEnv, parsedEnvKeys }
}
