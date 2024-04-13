import { Options } from './options'
import { Recordable } from './types'

type StringBoolean = 'true' | 'false'

/**
 * parse loaded env
 * @param env env string record
 */
export function parseEnv(env: Recordable, options: Options = {}) {
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
        } catch (e) {
          /**
           * nonstandard json data parse
           * @example `['item1', 'item2', 'item3']`
           * @example `{key1:'value1',key2:"value2"}`
           */
          try {
            value = (0, eval)(`(${value})`)
          } catch (e) {}
        }
      }
      if (customParser) {
        value = (customParser && customParser(envKey, value)) || value
      }
    }

    parsedRes[envKey] = value
  }

  return parsedRes
}
