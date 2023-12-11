interface ImportMetaEnv {
  // Auto generate by env-parse
  /**
   * App configuration
   */
  VITE_APP_NAME: string
  /**
   * This is the version of the app
   */
  VITE_APP_VERSION: string
  /**
   * Set DEBUG to true for development
   */
  VITE_APP_DEBUG: boolean
  /**
   * The base URL for the app
   */
  VITE_APP_URL: string
  /**
   * Database configuration
   */
  VITE_APP_DB_HOST: string
  /**
   * Database port number
   */
  VITE_APP_DB_PORT: number
  /**
   * Database username
   */
  VITE_APP_DB_USER: string
  /**
   * Database password (ensure it is strong)
   */
  VITE_APP_DB_PASSWORD: string
  /**
   * Database name
   */
  VITE_APP_DB_NAME: string
  /**
   * API keys
   */
  VITE_APP_API_KEY: string
  /**
   * Secret key for sensitive operations
   */
  VITE_APP_SECRET_KEY: string
  /**
   * Feature toggles
   * Enable or disable Feature Flag 1
   */
  VITE_APP_FEATURE_FLAG_1: boolean
  /**
   * Enable or disable Feature Flag 2
   */
  VITE_APP_FEATURE_FLAG_2: boolean
  /**
   * External services
   * URL for an external API
   */
  VITE_APP_EXTERNAL_API_URL: string
  /**
   * API key for the external service
   */
  VITE_APP_EXTERNAL_API_KEY: string
  /**
   * Social media
   * Facebook App ID for social login
   */
  VITE_APP_SOCIAL_FACEBOOK_APP_ID: string
  /**
   * Twitter API key for social sharing
   */
  VITE_APP_SOCIAL_TWITTER_API_KEY: string
  /**
   * Notification settings
   * Email address for admin notifications
   */
  VITE_APP_NOTIFICATION_EMAIL: string
  /**
   * Slack webhook for important alerts
   */
  VITE_APP_NOTIFICATION_SLACK_WEBHOOK: string
  /**
   * JSON data
   * Example JSON data for configuration
   */
  VITE_APP_JSON_DATA: Record<string, any>
  /**
   * Array data
   * Example array data
   */
  VITE_APP_ARRAY_DATA: any[]
  /**
   * Multiline data
   * This is a multiline value.
   * You can break it into multiple lines.
   * It will be concatenated.
   */
  VITE_APP_MULTILINE_DATA: string
}
