import { Recordable } from "./types"

type SupportType = 'string' | 'number' | 'boolean' | 'object' | 'array'

export function generateEnvInterface(env: Recordable, commentRecord: Recordable<string, string>) {
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
    const comment = `/**
   * ${commentRecord[envKey]}
   */
  `
    const keyValue = `readonly ${envKey}: ${typeMap[valueType] || 'any'}`

    interfaceItem.push(comment ? comment + keyValue : keyValue)
  }

  if (!interfaceItem.length) return

  return `interface ImportMetaEnv {
  // Auto generate by env-parse
  ${interfaceItem.join('\n  ')}
}`
}
