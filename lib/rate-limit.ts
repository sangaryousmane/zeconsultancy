import { NextRequest } from 'next/server'
import { RateLimitInfo } from './types'
import { RATE_LIMIT } from './constants'
import { logger } from './logger'

// In-memory store for rate limiting (in production, use Redis)
interface RateLimitEntry {
  count: number
  resetTime: number
  firstRequest: number
}

class InMemoryRateLimitStore {
  private store = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000) as unknown as NodeJS.Timeout
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key)
      }
    }
  }

  get(key: string): RateLimitEntry | undefined {
    const entry = this.store.get(key)
    if (entry && entry.resetTime < Date.now()) {
      this.store.delete(key)
      return undefined
    }
    return entry
  }

  set(key: string, entry: RateLimitEntry): void {
    this.store.set(key, entry)
  }

  delete(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }

  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.clear()
  }
}

// Global rate limit store
const rateLimitStore = new InMemoryRateLimitStore()

// Rate limit configuration
interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

// Default configurations for different endpoints
export const RATE_LIMIT_CONFIGS = {
  // General API endpoints
  api: {
    windowMs: RATE_LIMIT.API.WINDOW_MS,
    maxRequests: RATE_LIMIT.API.MAX_REQUESTS,
  },
  // Authentication endpoints (more restrictive)
  auth: {
    windowMs: RATE_LIMIT.AUTH.WINDOW_MS,
    maxRequests: RATE_LIMIT.AUTH.MAX_REQUESTS,
  },
  // Password reset (very restrictive)
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 attempts per hour
  },
  // File upload endpoints
  upload: {
    windowMs: RATE_LIMIT.API.WINDOW_MS,
    maxRequests: 20, // 20 uploads per 15 minutes
  },
  // Search endpoints
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 searches per minute
  },
} as const

// Default key generator (IP-based)
function defaultKeyGenerator(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'
  return `rate_limit:${ip}`
}

// User-based key generator (for authenticated requests)
export function userKeyGenerator(userId: string): string {
  return `rate_limit:user:${userId}`
}

// Endpoint-specific key generator
export function endpointKeyGenerator(request: NextRequest, endpoint: string): string {
  const baseKey = defaultKeyGenerator(request)
  return `${baseKey}:${endpoint}`
}

// Main rate limiting function
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitInfo> {
  const keyGenerator = config.keyGenerator || defaultKeyGenerator
  const key = keyGenerator(request)
  const now = Date.now()
  const windowStart = now - config.windowMs

  // Get current entry
  let entry = rateLimitStore.get(key)

  if (!entry || entry.resetTime <= now) {
    // Create new entry
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
      firstRequest: now,
    }
    rateLimitStore.set(key, entry)
  } else {
    // Increment existing entry
    entry.count++
    rateLimitStore.set(key, entry)
  }

  const remaining = Math.max(0, config.maxRequests - entry.count)
  const isLimited = entry.count > config.maxRequests
  const resetTime = Math.ceil(entry.resetTime / 1000) // Convert to seconds

  const rateLimitInfo: RateLimitInfo = {
    limit: config.maxRequests,
    remaining,
    reset: resetTime,
    isLimited,
  }

  if (isLimited) {
    rateLimitInfo.retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    
    // Log rate limit violation
    logger.logSecurity('Rate limit exceeded', {
      key,
      count: entry.count,
      limit: config.maxRequests,
      ip: request.ip,
      userAgent: request.headers.get('user-agent'),
      url: request.url,
      method: request.method,
    })
  }

  return rateLimitInfo
}

// Middleware factory for different rate limit configurations
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<RateLimitInfo> => {
    return rateLimit(request, config)
  }
}

// Pre-configured middleware functions
export const apiRateLimit = createRateLimitMiddleware(RATE_LIMIT_CONFIGS.api)
export const authRateLimit = createRateLimitMiddleware(RATE_LIMIT_CONFIGS.auth)
export const passwordResetRateLimit = createRateLimitMiddleware(RATE_LIMIT_CONFIGS.passwordReset)
export const uploadRateLimit = createRateLimitMiddleware(RATE_LIMIT_CONFIGS.upload)
export const searchRateLimit = createRateLimitMiddleware(RATE_LIMIT_CONFIGS.search)

// Rate limit for specific users
export async function userRateLimit(
  userId: string,
  config: RateLimitConfig
): Promise<RateLimitInfo> {
  const key = userKeyGenerator(userId)
  const now = Date.now()

  let entry = rateLimitStore.get(key)

  if (!entry || entry.resetTime <= now) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
      firstRequest: now,
    }
    rateLimitStore.set(key, entry)
  } else {
    entry.count++
    rateLimitStore.set(key, entry)
  }

  const remaining = Math.max(0, config.maxRequests - entry.count)
  const isLimited = entry.count > config.maxRequests
  const resetTime = Math.ceil(entry.resetTime / 1000)

  const rateLimitInfo: RateLimitInfo = {
    limit: config.maxRequests,
    remaining,
    reset: resetTime,
    isLimited,
  }

  if (isLimited) {
    rateLimitInfo.retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    
    logger.logSecurity('User rate limit exceeded', {
      userId,
      count: entry.count,
      limit: config.maxRequests,
    })
  }

  return rateLimitInfo
}

// Rate limit for specific endpoints
export async function endpointRateLimit(
  request: NextRequest,
  endpoint: string,
  config: RateLimitConfig
): Promise<RateLimitInfo> {
  const customConfig = {
    ...config,
    keyGenerator: (req: NextRequest) => endpointKeyGenerator(req, endpoint),
  }
  
  return rateLimit(request, customConfig)
}

// Utility to check if IP is whitelisted
export function isWhitelisted(request: NextRequest): boolean {
  const whitelist = process.env.RATE_LIMIT_WHITELIST?.split(',') || []
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || ''
  
  return whitelist.includes(ip.trim())
}

// Utility to reset rate limit for a key
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key)
}

// Utility to get current rate limit status
export function getRateLimitStatus(key: string): RateLimitEntry | null {
  return rateLimitStore.get(key) || null
}

// Cleanup function for graceful shutdown
export function cleanup(): void {
  rateLimitStore.destroy()
}

// Export store for testing
export { rateLimitStore }