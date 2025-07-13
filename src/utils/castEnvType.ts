import { WithDefaultOptions } from '../options'
import { excludeKey } from './generateDTS'

/**
 * Safely evaluate a JavaScript expression in a limited context.
 * @param expr The expression to evaluate.
 * @param context The context in which to evaluate the expression.
 * @returns The result of the evaluated expression.
 */
function safeEval(expr: string, context: Record<string, any> = {}) {
  const contextKeys = Object.keys(context)
  const contextValues = Object.values(context)

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
 * Cast environment variable types.
 * @param env The environment variables to cast.
 * @param options Options for casting.
 * @returns The casted environment variables.
 */
export function castEnvType(env: Record<string, any> = {}, options: WithDefaultOptions['castType']) {
  const { exclude, json, transformer, enabled } = options
  const envKeys = Object.keys(env).filter((key) => !excludeKey.includes(key))

  if (!enabled) {
    return { castedEnv: env, castedEnvKeys: envKeys }
  }

  const castedEnv: Record<string, any> = {}
  const castedEnvKeys: string[] = []
  for (const envKey of envKeys) {
    let value = env[envKey]

    if (exclude.some((pattern) => (typeof pattern === 'string' ? pattern === envKey : pattern.test(envKey)))) {
      castedEnv[envKey] = value
      continue
    }

    if (typeof value === 'string') {
      value = parseBoolean(value) // boolean
      if (typeof value === 'string') {
        value = parseNumber(value) // number
        if (typeof value === 'string') {
          if (json && isLikelyJson(value)) {
            value = parseJsonValue(value) // json
          }
        }
      }
      if (transformer && typeof transformer === 'function') {
        value = transformer(envKey, value)
      }
    }

    castedEnvKeys.push(envKey)
    castedEnv[envKey] = value
  }

  return { castedEnv, castedEnvKeys }
}
