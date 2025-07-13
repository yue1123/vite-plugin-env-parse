export type CustomTransformer = (key: string, value: string) => any
import { type } from 'arktype'
import { type LogLevel } from 'vite'
import { defaultOptions } from './defaultOptions'

export type EnvValidation<V = any> = type.validate<V, {}>

export type WithDefaultOptions<T = Options> = T & typeof defaultOptions
export interface Options<V = any> {
  /**
   * Log level for the plugin
   * @default 'info'
   * @link https://vitejs.dev/config/shared-options.html#loglevel
   */
  logLevel?: LogLevel

  /**
   * validation env value
   */
  validation?: {
    /**
     * Ensures that all environment variable keys used in other .env.* files
     * are declared in the base .env file.
     *
     * - If enabled, it will check for extra environment variable keys in mode-specific
     *   .env files (e.g., .env.production) that are not declared in the base .env.
     * - This helps to maintain a consistent baseline of environment variables.
     * - Typically used to prevent "hidden" environment variables that might cause confusion
     *   or inconsistencies across different modes.
     *
     * @default true
     */
    keepBaseline?: boolean
    /**
     * Schema defined by the user
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
    schema?: EnvValidation<V>
    /**
     * Enable strict mode for environment variable validation.
     * Throws error and exits on invalid envs.
     * @default true
     */
    strictMode?: boolean
  }
  /**
   * Automatically cast environment variable values from string to appropriate types:
   * - `"true"` → `true`
   * - `"123"` → `123`
   * - `"["a", "b"]"` → `["a", "b"]`
   * - `"{"a": "1", "b":"2"}"` → `{a: 1, b: 2}`
   */
  castType?: {
    /**
     * Whether to enable value casting at all.
     * If false, all env values remain as strings.
     *
     * @default true
     */
    enabled?: boolean

    /**
     * Whether to parse JSON strings into objects or arrays.
     * For example:
     * - '{"foo":"bar"}' => { foo: 'bar' }
     * - '["a", "b"]' => ['a', 'b']
     * @default true
     */
    json?: boolean

    /**
     * Exclude specific keys or patterns from being type-cast.
     * You can use:
     * - string (exact key match)
     * - RegExp (pattern match)
     * @example
     * ['VITE_NO_CAST_THIS', /^VITE_SECRET_/]
     */
    exclude?: (string | RegExp)[]

    /**
     * Custom value transformer.
     * If provided, it will override the default casting logic.
     */
    transformer?: (key: string, value: string) => any
  }

  generateDts?: {
    /**
     * Whether to generate .d.ts file during development.
     * @default true
     */
    devEnable?: boolean

    /**
     * Whether to generate .d.ts file during build.
     * @link https://github.com/yue1123/vite-plugin-env-parse/issues/6
     * @default false
     */
    buildEnable?: boolean

    /**
     * Output path for generated env .d.ts file.
     * Can be relative (project root) or absolute.
     * @default 'env.d.ts'
     */
    path?: string
  }

  /**
   * Picks and rewrites process.env usage to import.meta.env for consistency.
   * @default vite.envPrefix
   */
  pickFromProcessEnv?: [string | RegExp]
  /**
   * Whether to inject .env file variables into process.env.
   * @default true
   */
  injectToProcessEnv?: boolean
}
