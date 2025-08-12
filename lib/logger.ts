import { ApiError } from './types'

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  error?: Error | ApiError
  userId?: string
  requestId?: string
  ip?: string
  userAgent?: string
}

class Logger {
  private static instance: Logger
  private logLevel: LogLevel
  private isDevelopment: boolean

  private constructor() {
    this.logLevel = process.env.LOG_LEVEL ? parseInt(process.env.LOG_LEVEL) : LogLevel.INFO
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel
  }

  private formatLogEntry(entry: LogEntry): string {
    const { level, message, timestamp, context, error, userId, requestId, ip, userAgent } = entry
    
    const logData = {
      level: LogLevel[level],
      message,
      timestamp,
      ...(context && { context }),
      ...(error && { 
        error: {
          message: error.message,
          ...(error instanceof Error && { 
            stack: error.stack,
            name: error.name 
          }),
          ...('status' in error && { status: error.status }),
        }
      }),
      ...(userId && { userId }),
      ...(requestId && { requestId }),
      ...(ip && { ip }),
      ...(userAgent && { userAgent }),
    }

    return JSON.stringify(logData, null, this.isDevelopment ? 2 : 0)
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error | ApiError): void {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    }

    const formattedLog = this.formatLogEntry(entry)

    // In development, use console methods for better formatting
    if (this.isDevelopment) {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedLog)
          break
        case LogLevel.INFO:
          console.info(formattedLog)
          break
        case LogLevel.WARN:
          console.warn(formattedLog)
          break
        case LogLevel.ERROR:
          console.error(formattedLog)
          break
      }
    } else {
      // In production, always use console.log for structured logging
      console.log(formattedLog)
    }
  }

  public debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  public info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context)
  }

  public warn(message: string, context?: Record<string, any>, error?: Error | ApiError): void {
    this.log(LogLevel.WARN, message, context, error)
  }

  public error(message: string, error?: Error | ApiError, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, error)
  }

  // Request-specific logging methods
  public logRequest(method: string, url: string, userId?: string, requestId?: string, ip?: string, userAgent?: string): void {
    const entry: LogEntry = {
      level: LogLevel.INFO,
      message: `${method} ${url}`,
      timestamp: new Date().toISOString(),
      context: { type: 'request' },
      userId,
      requestId,
      ip,
      userAgent,
    }

    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatLogEntry(entry))
    }
  }

  public logResponse(method: string, url: string, statusCode: number, duration: number, userId?: string, requestId?: string): void {
    const entry: LogEntry = {
      level: LogLevel.INFO,
      message: `${method} ${url} - ${statusCode}`,
      timestamp: new Date().toISOString(),
      context: { 
        type: 'response',
        statusCode,
        duration: `${duration}ms`
      },
      userId,
      requestId,
    }

    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatLogEntry(entry))
    }
  }

  // Database operation logging
  public logDatabaseOperation(operation: string, table: string, duration?: number, context?: Record<string, any>): void {
    this.info(`Database ${operation} on ${table}`, {
      type: 'database',
      operation,
      table,
      ...(duration && { duration: `${duration}ms` }),
      ...context,
    })
  }

  // Security event logging
  public logSecurityEvent(event: string, userId?: string, ip?: string, context?: Record<string, any>): void {
    const entry: LogEntry = {
      level: LogLevel.WARN,
      message: `Security event: ${event}`,
      timestamp: new Date().toISOString(),
      context: {
        type: 'security',
        event,
        ...context,
      },
      userId,
      ip,
    }

    if (this.shouldLog(LogLevel.WARN)) {
      console.log(this.formatLogEntry(entry))
    }
  }

  // Business logic logging
  public logBusinessEvent(event: string, context?: Record<string, any>, userId?: string): void {
    this.info(`Business event: ${event}`, {
      type: 'business',
      event,
      ...context,
    })
  }

  public logBusiness(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, { ...data, type: 'business' })
  }

  // Business operation logging
  public business(message: string, data?: Record<string, any>): void {
    this.logBusiness(message, data)
  }

  // Security logging (backward compatibility)
  public logSecurity(message: string, context?: Record<string, any>, userId?: string, ip?: string): void {
    this.logSecurityEvent(message, userId, ip, context)
  }

  // Performance logging
  public logPerformance(operation: string, duration: number, context?: Record<string, any>): void {
    const level = duration > 1000 ? LogLevel.WARN : LogLevel.INFO
    this.log(level, `Performance: ${operation} took ${duration}ms`, {
      type: 'performance',
      operation,
      duration,
      ...context,
    })
  }
}

// Export singleton instance
export const logger = Logger.getInstance()

// Utility function to measure execution time
export function measureTime<T>(fn: () => T | Promise<T>, operation: string): T | Promise<T> {
  const start = Date.now()
  
  try {
    const result = fn()
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = Date.now() - start
        logger.logPerformance(operation, duration)
      })
    } else {
      const duration = Date.now() - start
      logger.logPerformance(operation, duration)
      return result
    }
  } catch (error) {
    const duration = Date.now() - start
    logger.error(`Error in ${operation} after ${duration}ms`, error as Error)
    throw error
  }
}

// Request ID generator for tracing
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}