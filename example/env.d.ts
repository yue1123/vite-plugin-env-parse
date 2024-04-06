interface ImportMetaEnv {
  // Auto generate by env-parse
  /**
   * development local env
   */
  readonly VITE_APP_NAME: string
  /**
   * App 版本号
   */
  readonly VITE_APP_VERSION: string
  /**
   * 是否开启 App 调试
   */
  readonly VITE_APP_DEBUG: boolean
  /**
   * App base url
   */
  readonly VITE_APP_URL: string
  /**
   * App 的 json 配置
   */
  readonly VITE_APP_JSON_DATA: Record<string, any>
}