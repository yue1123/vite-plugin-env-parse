import { describe, it, expect } from 'vitest'
import { castEnvType } from '../src/utils/castEnvType'

describe('castEnvType', () => {
  it('should parse env variables correctly', () => {
    const env = {
      VITE_APP_NAME: 'MyApp',
      VITE_APP_VERSION: '1.0.0',
      VITE_APP_DEBUG: 'true',
      VITE_APP_PORT: '3000',
      VITE_APP_API_URL: 'https://api.example.com',
      VITE_APP_FEATURES: '["feature1", "feature2"]',
      VITE_APP_CONFIG: '{"key1":"value1","key2":"value2"}',
      VITE_APP_JSON: '{"key":"value"}',
      VITE_APP_JSON_LIKE: '{"key": `value`}',
      VITE_APP_EMPTY: '',
      VITE_APP_NUMBER: '42',
      VITE_APP_BOOLEAN: 'false',
      VITE_APP_UNDEFINED: undefined,
      VITE_APP_NULL: null,
      VITE_APP_OBJECT: '{"key":"value"}',
      VITE_APP_ARRAY: '["item1", "item2", "item3"]',
      VITE_APP_REGEXP: '/^\\d+$/',
      VITE_APP_DATE: '2023-10-01T00:00:00Z',
      VITE_APP_CUSTOM: 'customValue',
      VITE_APP_BASE: '/base/'
    }
    const { castedEnv } = castEnvType(env, {
      enabled: true,
      json: true,
      exclude: []
    })

    expect(castedEnv.VITE_APP_NAME).toBe('MyApp')
    expect(castedEnv.VITE_APP_VERSION).toBe('1.0.0')
    expect(castedEnv.VITE_APP_DEBUG).toBe(true)
    expect(castedEnv.VITE_APP_PORT).toBe(3000)
    expect(castedEnv.VITE_APP_API_URL).toBe('https://api.example.com')
    expect(castedEnv.VITE_APP_FEATURES).toEqual(['feature1', 'feature2'])
    expect(castedEnv.VITE_APP_CONFIG).toEqual({ key1: 'value1', key2: 'value2' })
    expect(castedEnv.VITE_APP_JSON).toEqual({ key: 'value' })
    expect(castedEnv.VITE_APP_JSON_LIKE).toEqual({ key: 'value' })
    expect(castedEnv.VITE_APP_EMPTY).toBe('')
    expect(castedEnv.VITE_APP_NUMBER).toBe(42)
    expect(castedEnv.VITE_APP_BOOLEAN).toBe(false)
    expect(castedEnv.VITE_APP_UNDEFINED).toBe(undefined)
    expect(castedEnv.VITE_APP_NULL).toBe(null)
    expect(castedEnv.VITE_APP_OBJECT).toEqual({ key: 'value' })
    expect(castedEnv.VITE_APP_ARRAY).toEqual(['item1', 'item2', 'item3'])
    expect(castedEnv.VITE_APP_REGEXP).toBe('/^\\d+$/')
    expect(castedEnv.VITE_APP_DATE).toEqual('2023-10-01T00:00:00Z')
    expect(castedEnv.VITE_APP_CUSTOM).toBe('customValue')
    expect(castedEnv.VITE_APP_BASE).toBe('/base/')
    expect(Object.keys(castedEnv).length).toBe(Object.keys(env).length)
    expect(castedEnv).toMatchSnapshot()
  })

  // xss
  it('should parse env variables with xss', () => {
    const env = {
      VITE_APP_XSS: `console.log('Hacked'); process.exit()`,
      VITE_APP_XSS_ADD: `1 + 1`
    }
    const { castedEnv } = castEnvType(env, { json: true, enabled: true, exclude: [] })
    expect(castedEnv.VITE_APP_XSS).toBe(`console.log('Hacked'); process.exit()`)
    expect(castedEnv.VITE_APP_XSS_ADD).toBe(`1 + 1`)
  })

  it('should parse env variables with custom parser', () => {
    const env = {
      VITE_APP_CUSTOM: 'customValue'
    }
    const transformer = (key: string, value: any) => {
      if (key === 'VITE_APP_CUSTOM') {
        return `Parsed: ${value}`
      }
      return value
    }
    const { castedEnv } = castEnvType(env, { transformer, json: true, enabled: true, exclude: [] })
    expect(castedEnv.VITE_APP_CUSTOM).toBe('Parsed: customValue')
  })

  it('should parse env variables with exclude option', () => {
    const env = {
      VITE_APP_EXCLUDE: '1',
      VITE_APP_INCLUDE: '1'
    }
    const { castedEnv } = castEnvType(env, { exclude: ['VITE_APP_EXCLUDE'], json: true, enabled: true })
    expect(castedEnv.VITE_APP_EXCLUDE).toBe('1')
    expect(castedEnv.VITE_APP_INCLUDE).toBe(1)
  })

  it('should parse env variables with parseJson option', () => {
    const env = {
      VITE_APP_JSON: '{"key":"value"}',
      VITE_APP_JSON_LIKE: '{"key": `value`}',
      VITE_APP_STRING: 'string'
    }
    const { castedEnv } = castEnvType(env, { json: false, enabled: true, exclude: [] })
    expect(castedEnv.VITE_APP_JSON).toBe('{"key":"value"}')
    expect(castedEnv.VITE_APP_JSON_LIKE).toBe('{"key": `value`}')
    expect(castedEnv.VITE_APP_STRING).toBe('string')
  })

  it('should handle empty env', () => {
    const env = {}
    const castedEnv = castEnvType(env, { json: true, enabled: true, exclude: [] })
    expect(castedEnv).toEqual({
      castedEnv: {},
      castedEnvKeys: []
    })
  })

  it('should handle env with empty string values', () => {
    const env = {
      VITE_APP_EMPTY: '',
      VITE_APP_NULL: null,
      VITE_APP_UNDEFINED: undefined
    }
    const { castedEnv } = castEnvType(env, { json: true, enabled: true, exclude: [] })
    expect(castedEnv.VITE_APP_EMPTY).toBe('')
    expect(castedEnv.VITE_APP_NULL).toBe(null)
    expect(castedEnv.VITE_APP_UNDEFINED).toBe(undefined)
  })

  it('should handle env with non-string values', () => {
    const env = {
      VITE_APP_NUMBER: 42,
      VITE_APP_BOOLEAN: true,
      VITE_APP_OBJECT: { key: 'value' },
      VITE_APP_ARRAY: ['item1', 'item2', 'item3']
    }
    const { castedEnv } = castEnvType(env, { json: true, enabled: true, exclude: [] })
    expect(castedEnv.VITE_APP_NUMBER).toBe(42)
    expect(castedEnv.VITE_APP_BOOLEAN).toBe(true)
    expect(castedEnv.VITE_APP_OBJECT).toEqual({ key: 'value' })
    expect(castedEnv.VITE_APP_ARRAY).toEqual(['item1', 'item2', 'item3'])
  })
})
