interface ImportMetaEnv {
  // Auto generate by env-parse
  /**
   * development local env
   */
  readonly VITE_APP_NAME: string
  /**
   * This is the version of the app
   */
  readonly VITE_APP_VERSION: string
  /**
   * Set DEBUG to true for development
   */
  readonly VITE_APP_DEBUG: boolean
  /**
   * The base URL for the app
   */
  readonly VITE_APP_URL: string
  /**
   * Database configuration
   */
  readonly VITE_APP_DB_HOST: string
  /**
   * Database port number
   */
  readonly VITE_APP_DB_PORT: number
  /**
   * Database username
   */
  readonly VITE_APP_DB_USER: string
  /**
   * Database password (ensure it is strong)
   */
  readonly VITE_APP_DB_PASSWORD: string
  /**
   * Database name
   */
  readonly VITE_APP_DB_NAME: string
  /**
   * API keys
   */
  readonly VITE_APP_API_KEY: string
  /**
   * Secret key for sensitive operations
   */
  readonly VITE_APP_SECRET_KEY: string
  /**
   * Feature toggles
   * Enable or disable Feature Flag 1
   */
  readonly VITE_APP_FEATURE_FLAG_1: boolean
  /**
   * Enable or disable Feature Flag 2
   */
  readonly VITE_APP_FEATURE_FLAG_2: boolean
  /**
   * External services
   * URL for an external API
   */
  readonly VITE_APP_EXTERNAL_API_URL: string
  /**
   * API key for the external service
   */
  readonly VITE_APP_EXTERNAL_API_KEY: string
  /**
   * Social media
   * Facebook App ID for social login
   */
  readonly VITE_APP_SOCIAL_FACEBOOK_APP_ID: string
  /**
   * Twitter API key for social sharing
   */
  readonly VITE_APP_SOCIAL_TWITTER_API_KEY: string
  /**
   * Notification settings
   * Email address for admin notifications
   */
  readonly VITE_APP_NOTIFICATION_EMAIL: string
  /**
   * Slack webhook for important alerts
   */
  readonly VITE_APP_NOTIFICATION_SLACK_WEBHOOK: string
  /**
   * JSON data
   * Example JSON data for configuration
   */
  readonly VITE_APP_JSON_DATA: Record<string, any>
  /**
   * Nonstandard json data
   * Example JSON data for configuration
   */
  readonly VITE_APP_NONSTANDARD_JSON_DATA: Record<string, any>
  /**
   * Array data
   * Example array data
   */
  readonly VITE_APP_ARRAY_DATA: any[]
  /**
   * Multiline data
   * This is a multiline value.
   * You can break it into multiple lines.
   * It will be concatenated.
   */
  readonly VITE_APP_MULTILINE_DATA: string
  readonly VITE_APP_NO_COMMENT_ENV_KEY: string
}

namespace NodeJS {
  interface ProcessEnv extends ImportMetaEnv {}
}
