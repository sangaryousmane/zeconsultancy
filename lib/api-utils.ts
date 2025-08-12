import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { ApiResponse, ApiError, ValidationError, RateLimitInfo } from './types'
import { API_RESPONSE_STATUS, ERROR_MESSAGES } from './constants'
import { logger, generateRequestId } from './logger'

// Custom error classes
export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean
  public code?: string

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true, code?: string) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.code = code
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationAppError extends AppError {
  public errors: ValidationError[]

  constructor(message: string, errors: ValidationError[], statusCode: number = 400) {
    super(message, statusCode)
    this.errors = errors
  }
}

export class RateLimitError extends AppError {
  public retryAfter: number

  constructor(message: string, retryAfter: number) {
    super(message, 429)
    this.retryAfter = retryAfter
  }
}

// Success response helper
export function createSuccessResponse<T>(
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    status: API_RESPONSE_STATUS.SUCCESS,
    message,
    data,
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(response, { status: statusCode })
}

// Error response helper
export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  errors?: Record<string, string[]> | ValidationError[],
  code?: string
): NextResponse<ApiResponse> {
  let status: keyof typeof API_RESPONSE_STATUS
  
  switch (statusCode) {
    case 400:
      status = API_RESPONSE_STATUS.VALIDATION_ERROR
      break
    case 401:
      status = API_RESPONSE_STATUS.UNAUTHORIZED
      break
    case 403:
      status = API_RESPONSE_STATUS.FORBIDDEN
      break
    case 404:
      status = API_RESPONSE_STATUS.NOT_FOUND
      break
    case 429:
      status = API_RESPONSE_STATUS.RATE_LIMITED
      break
    default:
      status = API_RESPONSE_STATUS.ERROR
  }

  const response: ApiResponse = {
    status,
    message,
    error: message,
    timestamp: new Date().toISOString(),
  }

  if (errors) {
    if (Array.isArray(errors)) {
      // Convert ValidationError[] to Record<string, string[]>
      response.errors = errors.reduce((acc, error) => {
        acc[error.field] = [error.message]
        return acc
      }, {} as Record<string, string[]>)
    } else {
      response.errors = errors
    }
  }

  return NextResponse.json(response, { status: statusCode })
}

// Global error handler
export function handleApiError(error: unknown, requestId?: string): NextResponse<ApiResponse> {
  logger.error('API Error', error as Error, { requestId })

  if (error instanceof ValidationAppError) {
    return createErrorResponse(
      error.message,
      error.statusCode,
      error.errors
    )
  }

  if (error instanceof RateLimitError) {
    const response = createErrorResponse(
      error.message,
      error.statusCode
    )
    response.headers.set('Retry-After', error.retryAfter.toString())
    return response
  }

  if (error instanceof AppError) {
    return createErrorResponse(
      error.message,
      error.statusCode,
      undefined,
      error.code
    )
  }

  if (error instanceof ZodError) {
    const validationErrors: ValidationError[] = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }))

    return createErrorResponse(
      ERROR_MESSAGES.VALIDATION_ERROR,
      400,
      validationErrors
    )
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any
    
    switch (prismaError.code) {
      case 'P2002':
        return createErrorResponse(
          'A record with this information already exists',
          409
        )
      case 'P2025':
        return createErrorResponse(
          ERROR_MESSAGES.NOT_FOUND,
          404
        )
      case 'P2003':
        return createErrorResponse(
          'Cannot delete record due to related data',
          409
        )
      default:
        logger.error('Unhandled Prisma error', prismaError, { requestId })
    }
  }

  // Default error response
  return createErrorResponse(
    ERROR_MESSAGES.INTERNAL_ERROR,
    500
  )
}

// Request wrapper with error handling and logging
export function withErrorHandling(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const requestId = generateRequestId()
    const start = Date.now()
    
    try {
      // Log incoming request
      logger.logRequest(
        request.method,
        request.url,
        undefined, // userId will be added by auth middleware
        requestId,
        request.ip,
        request.headers.get('user-agent') || undefined
      )

      const response = await handler(request, { ...context, requestId })
      
      // Log response
      const duration = Date.now() - start
      logger.logResponse(
        request.method,
        request.url,
        response.status,
        duration,
        undefined, // userId will be added by auth middleware
        requestId
      )

      return response
    } catch (error) {
      const duration = Date.now() - start
      logger.error(
        `Request failed: ${request.method} ${request.url}`,
        error as Error,
        { requestId, duration }
      )
      
      return handleApiError(error, requestId)
    }
  }
}

// Validation helper
export function validateRequest<T>(schema: any, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof ZodError) {
      const validationErrors: ValidationError[] = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      
      // Log validation errors for debugging
      logger.error('Validation failed with errors:', error, {
        validationErrors,
        data,
        schemaName: schema._def?.typeName || 'unknown'
      })
      
      throw new ValidationAppError(
        ERROR_MESSAGES.VALIDATION_ERROR,
        validationErrors
      )
    }
    throw error
  }
}

// Pagination helper
export function parsePaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12')))
  const skip = (page - 1) * limit

  return { page, limit, skip }
}

// Filter helper
export function parseFilterParams(searchParams: URLSearchParams, allowedFilters: string[]) {
  const filters: Record<string, any> = {}
  
  for (const [key, value] of searchParams.entries()) {
    if (allowedFilters.includes(key) && value) {
      // Handle boolean values
      if (value === 'true') {
        filters[key] = true
      } else if (value === 'false') {
        filters[key] = false
      } else if (!isNaN(Number(value))) {
        // Handle numeric values
        filters[key] = Number(value)
      } else {
        filters[key] = value
      }
    }
  }
  
  return filters
}

// Rate limiting helper
export function createRateLimitHeaders(rateLimitInfo: RateLimitInfo): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': rateLimitInfo.limit.toString(),
    'X-RateLimit-Remaining': rateLimitInfo.remaining.toString(),
    'X-RateLimit-Reset': rateLimitInfo.reset.toString(),
  }

  if (rateLimitInfo.retryAfter) {
    headers['Retry-After'] = rateLimitInfo.retryAfter.toString()
  }

  return headers
}

// CORS helper
export function createCorsHeaders(origin?: string): Record<string, string> {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
  const isAllowedOrigin = origin && allowedOrigins.includes(origin)
  
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  }
}

// Security headers helper
export function createSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;",
  }
}