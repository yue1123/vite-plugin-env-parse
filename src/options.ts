export type CustomTransformer = (key: string, value: string) => any
import { type } from 'arktype'
import { type LogLevel } from 'vite'

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
   * @support
   * - `string`
   * - `string.xxx`
   * - `Record`
   * - `string union`
   * - `number union`
   * - `boolean`
   * - `number[]`
   * - `string[]`
   * - `boolean[]`
   * - `(number | string)[]`
   *
   *
   * ```ts
   * validation: {
   *   VITE_APP_STRING_DATA: 'string',
   *   VITE_APP_ARRAY_DATA: 'string[]',
   *   VITE_APP_API_KEY: 'string',
   *   VITE_APP_DB_NAME: '"aa" | "bb"',
   *   VITE_APP_FEATURE_FLAG_1: 'boolean'
   * }
   * ```
   */
  validation?: type.validate<V, {}>
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
