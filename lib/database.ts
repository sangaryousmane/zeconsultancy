import { PrismaClient, Prisma } from '@prisma/client'
import { logger } from './logger'

// Global database instance with connection pooling
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // Note: MongoDB connection pooling is handled by the MongoDB driver
  // Connection pool settings are configured via DATABASE_URL connection string
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db



// Database utilities
export const dbUtils = {
  // Transaction wrapper with retry logic
  transaction: async <T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: {
      maxRetries?: number
      timeout?: number
    }
  ): Promise<T> => {
    const { maxRetries = 3, timeout = 10000 } = options || {}
    
    let lastError: Error
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await db.$transaction(fn, {
          timeout,
        })
      } catch (error) {
        lastError = error as Error
        
        logger.warn(`Transaction attempt ${attempt} failed`, {
          error: lastError.message,
          attempt,
          maxRetries,
        })
        
        // Don't retry on certain errors
        if (
          lastError.message.includes('Unique constraint') ||
          lastError.message.includes('Foreign key constraint') ||
          lastError.message.includes('Check constraint')
        ) {
          throw lastError
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    throw lastError!
  },
  
  // Pagination helper
  paginate: <T>(args: {
    page: number
    limit: number
    orderBy?: any
  }) => {
    const { page, limit, orderBy } = args
    const skip = (page - 1) * limit
    
    return {
      skip,
      take: limit,
      ...(orderBy && { orderBy }),
    }
  },
  
  // Cursor-based pagination
  cursorPaginate: <T>(args: {
    cursor?: string
    limit: number
    orderBy?: any
  }) => {
    const { cursor, limit, orderBy } = args
    
    return {
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1, // Skip the cursor
      }),
      take: limit,
      ...(orderBy && { orderBy }),
    }
  },
  
  // Health check
  healthCheck: async (): Promise<{
    status: 'healthy' | 'unhealthy'
    latency: number
    error?: string
  }> => {
    const start = Date.now()
    
    try {
      // Simple health check using a basic query
      await db.user.findFirst({ take: 1 })
      const latency = Date.now() - start
      
      return {
        status: 'healthy',
        latency,
      }
    } catch (error) {
      const latency = Date.now() - start
      
      return {
        status: 'unhealthy',
        latency,
        error: (error as Error).message,
      }
    }
  },
  
  // Connection info
  getConnectionInfo: async () => {
    try {
      // Simplified connection info without raw queries
      return {
        activeConnections: 1, // Placeholder since we can't use raw queries
      }
    } catch (error) {
      logger.error('Failed to get connection info', error as Error)
      return {
        activeConnections: 0,
      }
    }
  },
  
  // Database stats
  getStats: async () => {
    try {
      const [equipmentCount, brokerageCount, bookingCount, userCount] = await Promise.all([
        db.equipment.count(),
        db.brokerage.count(),
        db.booking.count(),
        db.user.count(),
      ])
      
      return {
        equipment: equipmentCount,
        brokerage: brokerageCount,
        bookings: bookingCount,
        users: userCount,
      }
    } catch (error) {
      logger.error('Failed to get database stats', error as Error)
      return {
        equipment: 0,
        brokerage: 0,
        bookings: 0,
        users: 0,
      }
    }
  },
  

}

// Graceful shutdown
export async function disconnect(): Promise<void> {
  try {
    await db.$disconnect()
    logger.info('Database connection closed')
  } catch (error) {
    logger.error('Error closing database connection', error as Error)
  }
}

// Export types
export type { Prisma }
export type TransactionClient = Prisma.TransactionClient