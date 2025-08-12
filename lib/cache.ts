import { CacheEntry } from './types'
import { CACHE_DURATION } from './constants'
import { logger } from './logger'

// In-memory cache implementation
class InMemoryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private cleanupInterval: NodeJS.Timeout
  private maxSize: number
  private hitCount = 0
  private missCount = 0

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize
    
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000) as unknown as NodeJS.Timeout
  }

  private cleanup() {
    const now = Date.now()
    let removedCount = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && entry.expiresAt < now) {
        this.cache.delete(key)
        removedCount++
      }
    }
    
    if (removedCount > 0) {
      logger.info('Cache cleanup completed', {
        removedEntries: removedCount,
        remainingEntries: this.cache.size,
      })
    }
  }

  private evictLRU() {
    if (this.cache.size < this.maxSize) return
    
    let oldestKey: string | null = null
    let oldestTime = Date.now()
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey)
      logger.debug('Evicted LRU cache entry', { key: oldestKey })
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.missCount++
      return null
    }
    
    // Check if expired
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key)
      this.missCount++
      return null
    }
    
    // Update last accessed time
    entry.lastAccessed = Date.now()
    this.hitCount++
    
    return entry.value as T
  }

  set<T>(key: string, value: T, ttl?: number): void {
    // Evict if necessary
    this.evictLRU()
    
    const now = Date.now()
    const entry: CacheEntry<T> = {
      value,
      createdAt: now,
      lastAccessed: now,
      expiresAt: ttl ? now + ttl : undefined,
    }
    
    this.cache.set(key, entry)
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
    this.hitCount = 0
    this.missCount = 0
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    // Check if expired
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  size(): number {
    return this.cache.size
  }

  getStats() {
    const total = this.hitCount + this.missCount
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: total > 0 ? (this.hitCount / total) * 100 : 0,
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.clear()
  }
}

// Global cache instance
const cache = new InMemoryCache()

// Cache key generators
export const CacheKeys = {
  // Equipment
  equipment: (id: string) => `equipment:${id}`,
  equipmentList: (filters: Record<string, any> = {}) => {
    const filterStr = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('|')
    return `equipment:list:${filterStr}`
  },
  
  // Brokerage
  brokerage: (id: string) => `brokerage:${id}`,
  brokerageList: (filters: Record<string, any> = {}) => {
    const filterStr = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('|')
    return `brokerage:list:${filterStr}`
  },
  
  // Categories
  categories: (type?: string) => type ? `categories:${type}` : 'categories:all',
  category: (id: string) => `category:${id}`,
  
  // User
  user: (id: string) => `user:${id}`,
  userBookings: (userId: string, filters: Record<string, any> = {}) => {
    const filterStr = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('|')
    return `user:${userId}:bookings:${filterStr}`
  },
  
  // Bookings
  booking: (id: string) => `booking:${id}`,
  bookingsList: (filters: Record<string, any> = {}) => {
    const filterStr = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('|')
    return `bookings:list:${filterStr}`
  },
  
  // Stats
  dashboardStats: (period: string = 'month') => `stats:dashboard:${period}`,
  equipmentStats: (id: string) => `stats:equipment:${id}`,
  brokerageStats: (id: string) => `stats:brokerage:${id}`,
  
  // Search
  search: (query: string, type: string, filters: Record<string, any> = {}) => {
    const filterStr = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('|')
    return `search:${type}:${encodeURIComponent(query)}:${filterStr}`
  },
} as const

// Cache utility functions
export const cacheUtils = {
  // Get from cache
  get: <T>(key: string): T | null => {
    try {
      return cache.get<T>(key)
    } catch (error) {
      logger.error('Cache get error', error as Error, { key })
      return null
    }
  },

  // Set in cache
  set: <T>(key: string, value: T, ttl?: number): void => {
    try {
      cache.set(key, value, ttl)
    } catch (error) {
      logger.error('Cache set error', error as Error, { key })
    }
  },

  // Delete from cache
  delete: (key: string): boolean => {
    try {
      return cache.delete(key)
    } catch (error) {
      logger.error('Cache delete error', error as Error, { key })
      return false
    }
  },

  // Check if key exists
  has: (key: string): boolean => {
    try {
      return cache.has(key)
    } catch (error) {
      logger.error('Cache has error', error as Error, { key })
      return false
    }
  },

  // Clear cache
  clear: (): void => {
    try {
      cache.clear()
      logger.info('Cache cleared')
    } catch (error) {
      logger.error('Cache clear error', error as Error)
    }
  },

  // Get cache stats
  getStats: () => {
    try {
      return cache.getStats()
    } catch (error) {
      logger.error('Cache stats error', error as Error)
      return {
        size: 0,
        maxSize: 0,
        hitCount: 0,
        missCount: 0,
        hitRate: 0,
      }
    }
  },

  // Invalidate related cache entries
  invalidatePattern: (pattern: string): number => {
    try {
      let count = 0
      const keys = Array.from((cache as any).cache.keys())
      
      for (const key of keys) {
        if (typeof key === 'string' && key.includes(pattern)) {
          cache.delete(key)
          count++
        }
      }
      
      if (count > 0) {
        logger.info('Cache pattern invalidated', { pattern, count })
      }
      
      return count
    } catch (error) {
      logger.error('Cache pattern invalidation error', error as Error, { pattern })
      return 0
    }
  },
}

// Higher-order function for caching API responses
export function withCache<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyGenerator: (...args: T) => string,
  ttl: number = CACHE_DURATION.SHORT
) {
  return async (...args: T): Promise<R> => {
    const key = keyGenerator(...args)
    
    // Try to get from cache first
    const cached = cacheUtils.get<R>(key)
    if (cached !== null) {
      logger.debug('Cache hit', { key })
      return cached
    }
    
    // Execute function and cache result
    try {
      logger.debug('Cache miss, executing function', { key })
      const result = await fn(...args)
      cacheUtils.set(key, result, ttl)
      return result
    } catch (error) {
      logger.error('Function execution error in cache wrapper', error as Error, { key })
      throw error
    }
  }
}

// Memoization decorator for expensive computations
export function memoize<T extends any[], R>(
  fn: (...args: T) => R,
  keyGenerator?: (...args: T) => string,
  ttl?: number
) {
  const defaultKeyGenerator = (...args: T) => {
    return `memo:${fn.name}:${JSON.stringify(args)}`
  }
  
  const getKey = keyGenerator || defaultKeyGenerator
  
  return (...args: T): R => {
    const key = getKey(...args)
    
    const cached = cacheUtils.get<R>(key)
    if (cached !== null) {
      return cached
    }
    
    const result = fn(...args)
    cacheUtils.set(key, result, ttl)
    return result
  }
}

// Cache invalidation helpers
export const invalidateCache = {
  // Equipment related
  equipment: (id?: string) => {
    if (id) {
      cacheUtils.delete(CacheKeys.equipment(id))
      cacheUtils.invalidatePattern(`equipment:list`)
      cacheUtils.invalidatePattern(`stats:equipment:${id}`)
    } else {
      cacheUtils.invalidatePattern('equipment:')
    }
  },
  
  // Brokerage related
  brokerage: (id?: string) => {
    if (id) {
      cacheUtils.delete(CacheKeys.brokerage(id))
      cacheUtils.invalidatePattern(`brokerage:list`)
      cacheUtils.invalidatePattern(`stats:brokerage:${id}`)
    } else {
      cacheUtils.invalidatePattern('brokerage:')
    }
  },
  
  // Categories
  categories: () => {
    cacheUtils.invalidatePattern('categories:')
    cacheUtils.invalidatePattern('category:')
  },
  
  // User related
  user: (id?: string) => {
    if (id) {
      cacheUtils.delete(CacheKeys.user(id))
      cacheUtils.invalidatePattern(`user:${id}:`)
    } else {
      cacheUtils.invalidatePattern('user:')
    }
  },
  
  // Bookings
  bookings: (userId?: string) => {
    cacheUtils.invalidatePattern('bookings:')
    cacheUtils.invalidatePattern('booking:')
    if (userId) {
      cacheUtils.invalidatePattern(`user:${userId}:bookings`)
    }
  },
  
  // Stats
  stats: () => {
    cacheUtils.invalidatePattern('stats:')
  },
  
  // Search
  search: () => {
    cacheUtils.invalidatePattern('search:')
  },
  
  // All cache
  all: () => {
    cacheUtils.clear()
  },
}

// Cleanup function for graceful shutdown
export function cleanup(): void {
  cache.destroy()
}

// Export cache instance for testing
export { cache }