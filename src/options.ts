export type CustomTransformer = (key: string, value: string) => any
import { type } from 'arktype'
import { type LogLevel } from 'vite'
import 'vite/types/importMeta'

export interface Options<V = any> {
  /**
   * log level
   * @default vite.logLevel
   */
  logLevel?: LogLevel
  /**
   * only generate dts file
   * @default false
   */
  onlyDts?: boolean
  /**
   * validation env value
   * @experimental
   */
  validation?: type.validate<V, {}> & Partial<Record<keyof ImportMetaEnv, any>>
  /**
   * exclude parse env keys
   */
  exclude?: string[]
  /**
   * parse json string to json object
   * @default true
   */
  parseJson?: boolean
  /**
   * custom parser
   */
  customParser?: CustomTransformer
  /**
   * generate env .d.ts file path
   * @default 'env.d.ts'
   */
  dtsPath?: string
  /**
   * Enable the .d.ts file generate
   *
   * @default true
   */
  enable?: boolean
}
