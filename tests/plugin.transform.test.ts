// tests/plugin.transform.test.ts
import { describe, it, expect } from 'vitest'
import { envParse } from '../src/index'

describe('vite-plugin-env-parse transform', () => {
  const mockConfig = {
    envDir: './',
    assetsInclude: () => false
  }

  it('should not replace import.meta.env.VITE_KEY when envDir is false', async () => {
    const plugin = envParse({
      enable: true
    })

    const configResolved = typeof plugin.configResolved === 'function' ? plugin.configResolved : plugin.configResolved!.handler

    configResolved({
      command: 'build',
      envDir: false,
      env: {},
      root: '',
      assetsInclude: () => false
    } as any)

    const input = `console.log(import.meta.env.VITE_KEY)`
    const transform =  typeof plugin.transform === 'function' ? plugin.transform : plugin.transform!.handler
    const result = await transform.apply(plugin, [input, 'test.js'])

    expect(result).toBe(undefined)
  })
})
