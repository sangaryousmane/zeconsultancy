import { BOOKING_STATUS, BOOKING_TYPE, PRICE_TYPE, USER_ROLE, CATEGORY_TYPE, API_RESPONSE_STATUS } from './constants'

// Base API Response types
export interface ApiResponse<T = any> {
  status: keyof typeof API_RESPONSE_STATUS
  message: string
  data?: T
  error?: string
  errors?: Record<string, string[]>
  timestamp: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// User types
export interface User {
  id: string
  name: string
  email: string
  role: keyof typeof USER_ROLE
  createdAt: string
  updatedAt: string
}

export interface UserWithBookings extends User {
  bookings: Booking[]
}

// Category types
export interface Category {
  id: string
  name: string
  description: string
  type: keyof typeof CATEGORY_TYPE
  createdAt: string
  updatedAt: string
  _count?: {
    equipment: number
    brokerage: number
  }
}

// Equipment types
export interface Equipment {
  id: string
  title: string
  description: string
  price: number
  priceType: keyof typeof PRICE_TYPE
  images: string[]
  features: string[]
  available: boolean
  categoryId: string
  category: Category
  createdAt: string
  updatedAt: string
}

export interface EquipmentWithBookings extends Equipment {
  bookings: Booking[]
}

// Brokerage types
export interface Brokerage {
  id: string
  title: string
  description: string
  price: number
  priceType: keyof typeof PRICE_TYPE
  location?: string
  images: string[]
  features: string[]
  available: boolean
  categoryId: string
  category: Category
  createdAt: string
  updatedAt: string
}

export interface BrokerageWithBookings extends Brokerage {
  bookings: Booking[]
}

// Booking types
export interface Booking {
  id: string
  type: keyof typeof BOOKING_TYPE
  status: keyof typeof BOOKING_STATUS
  startDate: string
  endDate: string
  totalPrice: number
  notes?: string
  adminNotes?: string
  userId: string
  user: User
  equipmentId?: string
  equipment?: Equipment
  brokerageId?: string
  brokerage?: Brokerage
  createdAt: string
  updatedAt: string
}

// Dashboard stats types
export interface DashboardStats {
  overview: {
    totalUsers: number
    totalEquipment: number
    totalBrokerage: number
    totalBookings: number
    activeBookings: number
    pendingBookings: number
    userGrowth: number
    bookingGrowth: number
  }
  revenue: {
    monthly: number
    weekly: number
    daily: number
  }
  charts: {
    equipmentByCategory: Array<{ name: string; count: number }>
    brokerageByType: Array<{ type: string; count: number }>
    usersByRole: Array<{ role: string; count: number }>
    bookingsByStatus: Array<{ status: string; count: number }>
  }
  recentActivity: {
    newUsers: number
    newBookings: number
    newEquipment: number
    newBrokerage: number
  }
}

// Filter types
export interface EquipmentFilters {
  search?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  priceType?: keyof typeof PRICE_TYPE
  available?: boolean
  page?: number
  limit?: number
}

export interface BrokerageFilters {
  search?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  priceType?: keyof typeof PRICE_TYPE
  location?: string
  available?: boolean
  page?: number
  limit?: number
}

export interface BookingFilters {
  status?: keyof typeof BOOKING_STATUS
  type?: keyof typeof BOOKING_TYPE
  userId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

// Form data types
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface ForgotPasswordFormData {
  email: string
}

export interface ResetPasswordFormData {
  token: string
  password: string
  confirmPassword: string
}

export interface BookingFormData {
  equipmentId?: string
  brokerageId?: string
  startDate: string
  endDate: string
  totalPrice: number
  notes?: string
}

export interface EquipmentFormData {
  title: string
  description: string
  price: number
  priceType: keyof typeof PRICE_TYPE
  images: string[]
  features: string[]
  available: boolean
  categoryId: string
}

export interface BrokerageFormData {
  title: string
  description: string
  price: number
  priceType: keyof typeof PRICE_TYPE
  location?: string
  images: string[]
  features: string[]
  available: boolean
  categoryId: string
}

export interface CategoryFormData {
  name: string
  description: string
  type: keyof typeof CATEGORY_TYPE
}

// Error types
export interface ValidationError {
  field: string
  message: string
}

export interface ApiError {
  status: number
  message: string
  errors?: ValidationError[]
  timestamp: string
}

// Rate limiting types
export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
  isLimited: boolean
}

// Cache types
export interface CacheEntry<T> {
  value: T
  createdAt: number
  lastAccessed: number
  expiresAt?: number
}

// Notification types
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
}

// Search types
export interface SearchResult<T> {
  items: T[]
  total: number
  query: string
  filters: Record<string, any>
  suggestions?: string[]
}

// File upload types
export interface FileUploadResult {
  url: string
  filename: string
  size: number
  type: string
}

export interface FileUploadError {
  filename: string
  error: string
}

// Audit log types
export interface AuditLog {
  id: string
  action: string
  resource: string
  resourceId: string
  userId: string
  user: User
  changes?: Record<string, any>
  metadata?: Record<string, any>
  timestamp: string
}