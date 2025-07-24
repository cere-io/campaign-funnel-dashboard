/**
 * Environment configuration utility
 * Provides type-safe access to environment variables
 */

export interface EnvironmentConfig {
  APP_NAME: string
  APP_VERSION: string
  ROB_API_URL: string
  ENVIRONMENT: 'dev' | 'stage' | 'prod'
  DEBUG: boolean
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error'
}

/**
 * Get environment variable with fallback
 */
function getEnvVar(key: string, fallback: string = ''): string {
  return import.meta.env[key] || fallback
}

/**
 * Get boolean environment variable
 */
function getBooleanEnvVar(key: string, fallback: boolean = false): boolean {
  const value = getEnvVar(key)
  return value === 'true' || value === '1' || fallback
}

/**
 * Environment configuration object
 */
export const env: EnvironmentConfig = {
  APP_NAME: getEnvVar('VITE_APP_NAME', 'Campaign Funnel Dashboard'),
  APP_VERSION: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  ROB_API_URL: getEnvVar('VITE_ROB_API_URL', 'http://localhost:3000/api'),
  ENVIRONMENT: (getEnvVar('VITE_ENVIRONMENT', 'development') as EnvironmentConfig['ENVIRONMENT']) || 'development',
  DEBUG: getBooleanEnvVar('VITE_DEBUG', true),
  LOG_LEVEL: (getEnvVar('VITE_LOG_LEVEL', 'debug') as EnvironmentConfig['LOG_LEVEL']) || 'debug',
}

/**
 * Check if current environment is development
 */
export const isDevelopment = env.ENVIRONMENT === 'dev'

/**
 * Check if current environment is staging
 */
export const isStaging = env.ENVIRONMENT === 'stage'

/**
 * Check if current environment is production
 */
export const isProduction = env.ENVIRONMENT === 'prod'

/**
 * Get API URL for a specific endpoint
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = env.ROB_API_URL.replace(/\/$/, '')
  const cleanEndpoint = endpoint.replace(/^\//, '')
  return `${baseUrl}/${cleanEndpoint}`
}

/**
 * Logger utility that respects LOG_LEVEL setting
 */
export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (env.LOG_LEVEL === 'debug') {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  },
  info: (message: string, ...args: any[]) => {
    if (['debug', 'info'].includes(env.LOG_LEVEL)) {
      console.info(`[INFO] ${message}`, ...args)
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (['debug', 'info', 'warn'].includes(env.LOG_LEVEL)) {
      console.warn(`[WARN] ${message}`, ...args)
    }
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args)
  },
}
