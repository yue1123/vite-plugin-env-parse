// tests/configResolved.memfs.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { envParse } from '../src/index'
import { vol, fs } from 'memfs'
import { afterEach } from 'node:test'

vi.mock('node:fs')

describe('vite-plugin-env-parse with memfs', () => {
  beforeEach(() => {
    vol.reset() // 清除虚拟文件系统
  })
  it('should load env files and generate dts using memfs', () => {
    // 设置虚拟的 .env 文件
    vol.fromJSON({
      '/.env': `# 注释行
      VITE_APP_NAME=memfs-app`
    })

    const plugin = envParse({
      onlyDts: false,
      dtsPath: 'env.d.ts'
    })

    const mockConfig = {
      command: 'serve',
      root: '/',
      envDir: '/',
      env: {
        VITE_APP_NAME: 'test-app'
      },
      mode: 'development',
      assetsInclude: () => false
    } as any

    const configResolved =
      typeof plugin.configResolved === 'function' ? plugin.configResolved : plugin.configResolved!.handler
    configResolved(mockConfig)

    // 检查 d.ts 文件是否生成
    const dtsFile = fs.readFileSync('/env.d.ts', 'utf-8')
    expect(dtsFile).toContain('VITE_APP_NAME')
  })

  // validation
  it('should validate env variables correctly', () => {
    // 设置虚拟的 .env 文件
    vol.fromJSON({
      '/.env': `# 注释行
      VITE_APP_NAME=memfs-app`
    })

    const plugin = envParse({
      onlyDts: false,
      dtsPath: 'env.d.ts',
      validation: {
        VITE_APP_NAME: 'string',
        VITE_APP_UNION_TYPE: '"test-a" | "test-b"'
      }
    })

    const mockConfig = {
      command: 'serve',
      root: '/',
      envDir: '/',
      env: {
        VITE_APP_NAME: 'test-app',
        VITE_APP_UNION_TYPE: 'fasdfsdf'
      },
      mode: 'development',
      assetsInclude: () => false
    } as any

    const configResolved =
      typeof plugin.configResolved === 'function' ? plugin.configResolved : plugin.configResolved!.handler
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    configResolved(mockConfig)

    // 检查 d.ts 文件是否生成
    const dtsFile = fs.readFileSync('/env.d.ts', 'utf-8')
    expect(dtsFile).toContain('VITE_APP_UNION_TYPE: "test-a" | "test-b"')
    expect(spy).toHaveBeenCalled()
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenCalledWith(
      '✘  [env-parse]',
      `Type Error:
   └ VITE_APP_UNION_TYPE must be \"test-a\" or \"test-b\" (was \"fasdfsdf\")`
    )

    spy.mockRestore()
  })
})
