import { describe, it, expect } from 'vitest'

import { generateDTS } from './generateDTS'

describe('generateDTS', () => {
  it('should generate correct TypeScript interface', () => {
    const env = {
      VITE_APP_TITLE: 'My App',
      VITE_API_URL: 'https://api.example.com',
      VITE_ENABLE_FEATURE: true,
      VITE_MAX_RETRIES: 5,
      VITE_TIMEOUT: 3000,
      VITE_ARRAY: [1, 2, 3],
      VITE_OBJECT: { key: 'value' }
    }

    const commentRecord = {
      VITE_APP_TITLE: 'The title of the application',
      VITE_API_URL: 'The base URL for the API',
      VITE_ENABLE_FEATURE: 'Enable or disable a feature',
      VITE_MAX_RETRIES: 'Maximum number of retries for requests',
      VITE_TIMEOUT: 'Timeout duration in milliseconds',
      VITE_ARRAY: 'An array of numbers',
      VITE_OBJECT: 'An object with key-value pairs'
    }

    const result = generateDTS(env, commentRecord)

    expect(result).toContain('readonly VITE_APP_TITLE: string')
    expect(result).toContain('readonly VITE_API_URL: string')
    expect(result).toContain('readonly VITE_ENABLE_FEATURE: boolean')
    expect(result).toContain('readonly VITE_MAX_RETRIES: number')
    expect(result).toContain('readonly VITE_TIMEOUT: number')
    expect(result).toContain('readonly VITE_ARRAY: any[]')
    expect(result).toContain('readonly VITE_OBJECT: Record<string, any>')

    expect(result).toMatchSnapshot()
  })

  it('should exclude specified keys', () => {
    const containExcludeEnv = {
      MODE: 'development',
      BASE_URL: 'https://example.com',
      PROD: true,
      DEV: false,
      SSR: false,
      VITE_APP_TITLE: 'My App'
    }
    const commentRecord = {
      MODE: 'The mode of the application',
      BASE_URL: 'The base URL for the application',
      PROD: 'Production mode',
      DEV: 'Development mode',
      SSR: 'Server-side rendering',
      VITE_APP_TITLE: 'The title of the application'
    }
    const result = generateDTS(containExcludeEnv, commentRecord)
    expect(result).not.toContain('readonly MODE: string')
    expect(result).not.toContain('readonly BASE_URL: string')
    expect(result).not.toContain('readonly PROD: boolean')
    expect(result).not.toContain('readonly DEV: boolean')
    expect(result).not.toContain('readonly SSR: boolean')
    expect(result).toContain('readonly VITE_APP_TITLE: string')

    expect(result).toMatchSnapshot()
  })

  it('should handle empty env and commentRecord', () => {
    const env = {}
    const commentRecord = {}
    const result = generateDTS(env, commentRecord)
    expect(result).toBeUndefined()
  })

  it('should handle empty commentRecord', () => {
    const env = {
      VITE_APP_TITLE: 'My App',
      VITE_API_URL: 'https://api.example.com'
    }
    const commentRecord = {}
    const result = generateDTS(env, commentRecord)
    expect(result).toContain('readonly VITE_APP_TITLE: string')
    expect(result).toContain('readonly VITE_API_URL: string')
    expect(result).toMatchSnapshot()
  })
})
