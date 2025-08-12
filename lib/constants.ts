// Status enums and constants
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

export const BOOKING_TYPE = {
  SERVICE: 'SERVICE',
  EQUIPMENT: 'EQUIPMENT',
  BROKERAGE: 'BROKERAGE',
} as const

export const PRICE_TYPE = {
  HOURLY: 'HOURLY',
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  FIXED: 'FIXED',
} as const

export const USER_ROLE = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const

export const CATEGORY_TYPE = {
  EQUIPMENT: 'EQUIPMENT',
  BROKERAGE: 'BROKERAGE',
} as const

// Equipment categories
export const EQUIPMENT_CATEGORY = {
  CONSTRUCTION: 'CONSTRUCTION',
  AGRICULTURAL: 'AGRICULTURAL',
  INDUSTRIAL: 'INDUSTRIAL',
  TRANSPORTATION: 'TRANSPORTATION',
} as const

// Brokerage categories
export const BROKERAGE_CATEGORY = {
  REAL_ESTATE: 'REAL_ESTATE',
  BUSINESS: 'BUSINESS',
  INVESTMENT: 'INVESTMENT',
  INSURANCE: 'INSURANCE',
} as const

// API Response constants
export const API_RESPONSE_STATUS = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
} as const

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
} as const

// Rate limiting constants
export const RATE_LIMITS = {
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5, // 5 attempts per window
  },
  API: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100, // 100 requests per window
  },
  BOOKING: {
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
    MAX_REQUESTS: 10, // 10 bookings per hour
  },
} as const

// Export RATE_LIMIT for backward compatibility
export const RATE_LIMIT = RATE_LIMITS

// Validation constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 2000,
  NOTES_MAX_LENGTH: 1000,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const

// File upload constants
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILES: 10,
} as const

// Cache constants (optimized for performance)
export const CACHE = {
  EQUIPMENT_TTL: 15 * 60, // 15 minutes (increased for better performance)
  BROKERAGE_TTL: 15 * 60, // 15 minutes (increased for better performance)
  CATEGORIES_TTL: 60 * 60, // 1 hour (categories change infrequently)
  STATS_TTL: 30 * 60, // 30 minutes (dashboard stats can be cached longer)
  USER_SESSION_TTL: 24 * 60 * 60, // 24 hours
  SEARCH_RESULTS_TTL: 10 * 60, // 10 minutes for search results
} as const

// Cache durations (in milliseconds) - aligned with CACHE constants
export const CACHE_DURATION = {
  SHORT: 10 * 60 * 1000,    // 10 minutes
  MEDIUM: 30 * 60 * 1000,   // 30 minutes
  LONG: 60 * 60 * 1000,     // 1 hour
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
} as const

// Export individual cache durations for backward compatibility
export const { SHORT: CACHE_SHORT, MEDIUM: CACHE_MEDIUM, LONG: CACHE_LONG, VERY_LONG: CACHE_VERY_LONG } = CACHE_DURATION

// API Endpoints
export const API_ENDPOINTS = {
  BOOKINGS: '/api/bookings',
  EQUIPMENT: '/api/equipment',
  BROKERAGE: '/api/brokerage',
  CATEGORIES: '/api/categories',
  AUTH: '/api/auth',
  USERS: '/api/users',
} as const

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation failed',
  INTERNAL_ERROR: 'Internal server error',
  RATE_LIMITED: 'Too many requests, please try again later',
  BOOKING_NOT_FOUND: 'Booking not found',
  EQUIPMENT_NOT_FOUND: 'Equipment not found',
  BROKERAGE_NOT_FOUND: 'Brokerage service not found',
  CATEGORY_NOT_FOUND: 'Category not found',
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Invalid credentials',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  BOOKING_ALREADY_CANCELLED: 'Booking is already cancelled',
  BOOKING_CANNOT_BE_CANCELLED: 'Booking cannot be cancelled',
  EQUIPMENT_NOT_AVAILABLE: 'Equipment is not available',
  BROKERAGE_NOT_AVAILABLE: 'Brokerage service is not available',
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  BOOKING_CREATED: 'Booking created successfully',
  BOOKING_UPDATED: 'Booking updated successfully',
  BOOKING_CANCELLED: 'Booking cancelled successfully',
  BOOKING_DELETED: 'Booking deleted successfully',
  EQUIPMENT_CREATED: 'Equipment created successfully',
  EQUIPMENT_UPDATED: 'Equipment updated successfully',
  EQUIPMENT_DELETED: 'Equipment deleted successfully',
  BROKERAGE_CREATED: 'Brokerage service created successfully',
  BROKERAGE_UPDATED: 'Brokerage service updated successfully',
  BROKERAGE_DELETED: 'Brokerage service deleted successfully',
  CATEGORY_CREATED: 'Category created successfully',
  CATEGORY_UPDATED: 'Category updated successfully',
  CATEGORY_DELETED: 'Category deleted successfully',
  USER_REGISTERED: 'User registered successfully',
  USER_LOGGED_IN: 'User logged in successfully',
  USER_LOGGED_OUT: 'User logged out successfully',
  PASSWORD_RESET: 'Password reset successfully',
  EMAIL_SENT: 'Email sent successfully',
} as const

export type BookingStatus = keyof typeof BOOKING_STATUS
export type BookingType = keyof typeof BOOKING_TYPE
export type PriceType = keyof typeof PRICE_TYPE
export type UserRole = keyof typeof USER_ROLE
export type CategoryType = keyof typeof CATEGORY_TYPE
export type ApiResponseStatus = keyof typeof API_RESPONSE_STATUS