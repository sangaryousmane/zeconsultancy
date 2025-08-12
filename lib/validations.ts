import { z } from 'zod'
import { BOOKING_STATUS, BOOKING_TYPE, USER_ROLE, EQUIPMENT_CATEGORY, BROKERAGE_CATEGORY } from './constants'

// Common validation schemas
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required')
  .max(255, 'Email must be less than 255 characters')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')

export const phoneSchema = z
  .string()
  .regex(/^\+?\d{7,15}$/, 'Please enter a valid phone number')
  .optional()

export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .optional()

export const priceSchema = z
  .number()
  .positive('Price must be positive')
  .max(1000000, 'Price cannot exceed 1,000,000')

// MongoDB ObjectId validation
export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format')

export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
})

// Search schema
export const searchSchema = z.object({
  q: z.string().min(1).max(100).optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  available: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'price', 'name', 'rating']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// User schemas
export const userRegistrationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  role: z.enum([USER_ROLE.USER, USER_ROLE.ADMIN]).default(USER_ROLE.USER),
})

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const userUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: phoneSchema,
  currentPassword: z.string().optional(),
  newPassword: passwordSchema.optional(),
}).refine(
  (data) => {
    if (data.newPassword && !data.currentPassword) {
      return false
    }
    return true
  },
  {
    message: 'Current password is required when setting a new password',
    path: ['currentPassword'],
  }
)

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
})

export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
})

export const otpVerificationSchema = z.object({
  email: emailSchema,
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must contain only numbers'),
})

// Category schemas
export const categoryCreateSchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Category name must be less than 50 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  type: z.enum([EQUIPMENT_CATEGORY.CONSTRUCTION, EQUIPMENT_CATEGORY.AGRICULTURAL, EQUIPMENT_CATEGORY.INDUSTRIAL, EQUIPMENT_CATEGORY.TRANSPORTATION, BROKERAGE_CATEGORY.REAL_ESTATE, BROKERAGE_CATEGORY.BUSINESS, BROKERAGE_CATEGORY.INVESTMENT, BROKERAGE_CATEGORY.INSURANCE]),
})

export const categoryUpdateSchema = categoryCreateSchema.partial()

// Equipment schemas
const equipmentBaseSchema = z.object({
  name: z.string().min(1, 'Equipment name is required').max(100, 'Equipment name must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
  category: z.string().min(1, 'Category is required'),
  price: priceSchema,
  location: z.string().min(1, 'Location is required').max(200, 'Location must be less than 200 characters'),
  coordinates: coordinatesSchema.optional(),
  images: z.array(z.string().url()).min(1, 'At least one image is required').max(10, 'Maximum 10 images allowed'),
  specifications: z.record(z.string()).optional(),
  available: z.boolean().default(true),
  minRentalPeriod: z.number().int().min(1, 'Minimum rental period must be at least 1 day').default(1),
  maxRentalPeriod: z.number().int().min(1, 'Maximum rental period must be at least 1 day').default(365),
})

export const equipmentCreateSchema = equipmentBaseSchema.refine(
  (data) => data.maxRentalPeriod >= data.minRentalPeriod,
  {
    message: 'Maximum rental period must be greater than or equal to minimum rental period',
    path: ['maxRentalPeriod'],
  }
)

export const equipmentUpdateSchema = equipmentBaseSchema.partial().refine(
  (data) => {
    if (data.minRentalPeriod !== undefined && data.maxRentalPeriod !== undefined) {
      return data.maxRentalPeriod >= data.minRentalPeriod
    }
    return true
  },
  {
    message: 'Maximum rental period must be greater than or equal to minimum rental period',
    path: ['maxRentalPeriod'],
  }
)

export const equipmentFilterSchema = z.object({
  category: z.string().optional(),
  location: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  available: z.coerce.boolean().optional(),
  minRentalPeriod: z.coerce.number().int().positive().optional(),
  maxRentalPeriod: z.coerce.number().int().positive().optional(),
})

// Brokerage schemas
export const brokerageCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  price: priceSchema,
  location: z.string().min(1, 'Location is required').max(200, 'Location must be less than 200 characters'),
  coordinates: coordinatesSchema.optional(),
  images: z.array(z.string().url()).min(1, 'At least one image is required').max(10, 'Maximum 10 images allowed'),
  details: z.record(z.string()).optional(),
  available: z.boolean().default(true),
  contactInfo: z.object({
    phone: phoneSchema,
    email: emailSchema.optional(),
    website: urlSchema,
  }).optional(),
})

export const brokerageUpdateSchema = brokerageCreateSchema.partial()

export const brokerageFilterSchema = z.object({
  categoryId: z.string().optional(),
  location: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  available: z.coerce.boolean().optional(),
})

// Booking schemas
export const bookingCreateSchema = z.object({
  equipmentId: objectIdSchema.optional(),
  brokerageId: objectIdSchema.optional(),
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
  totalPrice: priceSchema,
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  type: z.enum(['EQUIPMENT', 'BROKERAGE', 'SERVICE']).optional(),
  phoneNumber: phoneSchema,
}).refine(
  (data) => !!(data.equipmentId || data.brokerageId),
  {
    message: 'Either equipmentId or brokerageId is required',
    path: ['equipmentId'],
  }
).refine(
  (data) => !(data.equipmentId && data.brokerageId),
  {
    message: 'Cannot book both equipment and brokerage in the same booking',
    path: ['brokerageId'],
  }
).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
).refine(
  (data) => {
    const startDate = new Date(data.startDate)
    const now = new Date()
    // Allow bookings that start today or in the future
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return startDate >= today
  },
  {
    message: 'Start date cannot be in the past',
    path: ['startDate'],
  }
)

export const bookingUpdateSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum([BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CANCELLED, BOOKING_STATUS.COMPLETED]).optional(),
  notes: z.string().max(1000).optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) > new Date(data.startDate)
    }
    return true
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
)

export const bookingFilterSchema = z.object({
  status: z.enum([BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CANCELLED, BOOKING_STATUS.COMPLETED]).optional(),
  type: z.enum([BOOKING_TYPE.SERVICE, BOOKING_TYPE.EQUIPMENT, BOOKING_TYPE.BROKERAGE]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  userId: objectIdSchema.optional(),
})

// File upload schemas
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB default
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp']),
})

export const multipleFileUploadSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, 'At least one file is required').max(10, 'Maximum 10 files allowed'),
  maxSize: z.number().default(5 * 1024 * 1024),
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp']),
})

// Admin schemas
export const adminUserUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: emailSchema.optional(),
  phone: phoneSchema,
  role: z.enum([USER_ROLE.USER, USER_ROLE.ADMIN]).optional(),
  isActive: z.boolean().optional(),
})

export const adminStatsFilterSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
})

// Contact/Support schemas
export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: emailSchema,
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be less than 200 characters'),
  message: z.string().min(1, 'Message is required').max(2000, 'Message must be less than 2000 characters'),
  phone: phoneSchema,
})

// Newsletter subscription schema
export const newsletterSubscriptionSchema = z.object({
  email: emailSchema,
  preferences: z.object({
    equipment: z.boolean().default(true),
    brokerage: z.boolean().default(true),
    promotions: z.boolean().default(false),
  }).optional(),
})

// Review/Rating schemas
export const reviewCreateSchema = z.object({
  equipmentId: objectIdSchema.optional(),
  brokerageId: objectIdSchema.optional(),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().max(1000, 'Comment must be less than 1000 characters').optional(),
}).refine(
  (data) => !!(data.equipmentId || data.brokerageId),
  {
    message: 'Either equipmentId or brokerageId is required',
    path: ['equipmentId'],
  }
).refine(
  (data) => !(data.equipmentId && data.brokerageId),
  {
    message: 'Cannot review both equipment and brokerage in the same review',
    path: ['brokerageId'],
  }
)

export const reviewUpdateSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
})

// Notification schemas
export const notificationCreateSchema = z.object({
  userId: objectIdSchema,
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
  actionUrl: z.string().url().optional(),
})

export const notificationUpdateSchema = z.object({
  read: z.boolean().optional(),
})

// Webhook schemas
export const webhookSchema = z.object({
  event: z.string(),
  data: z.record(z.any()),
  timestamp: z.string().datetime(),
  signature: z.string().optional(),
})

// Export all schemas for easy access
export const schemas = {
  // Common
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  url: urlSchema,
  price: priceSchema,
  coordinates: coordinatesSchema,
  pagination: paginationSchema,
  search: searchSchema,
  
  // User
  userRegistration: userRegistrationSchema,
  userLogin: userLoginSchema,
  userUpdate: userUpdateSchema,
  passwordResetRequest: passwordResetRequestSchema,
  passwordReset: passwordResetSchema,
  otpVerification: otpVerificationSchema,
  
  // Category
  categoryCreate: categoryCreateSchema,
  categoryUpdate: categoryUpdateSchema,
  
  // Equipment
  equipmentCreate: equipmentCreateSchema,
  equipmentUpdate: equipmentUpdateSchema,
  equipmentFilter: equipmentFilterSchema,
  
  // Brokerage
  brokerageCreate: brokerageCreateSchema,
  brokerageUpdate: brokerageUpdateSchema,
  brokerageFilter: brokerageFilterSchema,
  
  // Booking
  bookingCreate: bookingCreateSchema,
  bookingUpdate: bookingUpdateSchema,
  bookingFilter: bookingFilterSchema,
  
  // File Upload
  fileUpload: fileUploadSchema,
  multipleFileUpload: multipleFileUploadSchema,
  
  // Admin
  adminUserUpdate: adminUserUpdateSchema,
  adminStatsFilter: adminStatsFilterSchema,
  
  // Contact
  contactForm: contactFormSchema,
  newsletterSubscription: newsletterSubscriptionSchema,
  
  // Review
  reviewCreate: reviewCreateSchema,
  reviewUpdate: reviewUpdateSchema,
  
  // Notification
  notificationCreate: notificationCreateSchema,
  notificationUpdate: notificationUpdateSchema,
  
  // Webhook
  webhook: webhookSchema,
} as const