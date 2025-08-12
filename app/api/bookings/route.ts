import { NextRequest } from 'next/server'
import { withErrorHandling, createSuccessResponse, validateRequest, parsePaginationParams, parseFilterParams, AppError } from '@/lib/api-utils'
import { schemas } from '@/lib/validations'
import { db } from '@/lib/database'
import { cacheUtils, CacheKeys, withCache } from '@/lib/cache'
import { logger } from '@/lib/logger'
import { CACHE_DURATION, BOOKING_STATUS, BOOKING_TYPE } from '@/lib/constants'
import { getAuthenticatedUser } from '@/lib/auth'

// Optimized cache-enabled booking fetcher with better performance
const getCachedBookingList = withCache(
  async (filters: Record<string, any>, page: number, limit: number, userId?: string) => {
    const { skip, take, orderBy } = {
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' as const },
    }

    // Build optimized where clause
    const where: any = {}

    // If userId is provided, filter by user (most selective filter first)
    if (userId) {
      where.userId = userId
    }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.equipmentId) {
      where.equipmentId = filters.equipmentId
    }

    if (filters.brokerageId) {
      where.brokerageId = filters.brokerageId
    }

    if (filters.startDate) {
      where.startDate = {
        gte: new Date(filters.startDate),
      }
    }

    if (filters.endDate) {
      where.endDate = {
        lte: new Date(filters.endDate),
      }
    }

    // Optimized queries with minimal data selection and parallel execution
    const [bookings, total] = await Promise.all([
      db.booking.findMany({
        where,
        skip,
        take,
        orderBy,
        select: {
          id: true,
          userId: true,
          equipmentId: true,
          brokerageId: true,
          startDate: true,
          endDate: true,
          totalPrice: true,
          status: true,
          notes: true,
          phoneNumber: true,
          createdAt: true,
          updatedAt: true,
          // Optimized nested selections - only essential fields
          equipment: {
            select: {
              id: true,
              title: true,
              images: true,
              price: true,
            },
          },
          brokerage: {
            select: {
              id: true,
              title: true,
              images: true,
              price: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      // Optimized count query with same where clause
      db.booking.count({ where }),
    ])

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    }
  },
  (filters, page, limit, userId) => CacheKeys.bookingsList({ ...filters, page, limit, userId }),
  CACHE_DURATION.MEDIUM // Increased cache duration for better performance
)

// GET /api/bookings - List bookings with filtering and pagination
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = request.nextUrl
  
  // Get authenticated user from JWT token
  const user = await getAuthenticatedUser(request)
  if (!user) {
    throw new AppError('Authentication required', 401)
  }
  
  const userId = user.id
  const isAdmin = user.role === 'ADMIN'
  
  // Parse and validate pagination parameters
  const { page, limit } = parsePaginationParams(searchParams)
  
  // Parse and validate filter parameters
  const allowedFilters = ['status', 'equipmentId', 'brokerageId', 'startDate', 'endDate']
  const filters = parseFilterParams(searchParams, allowedFilters)
  
  // Validate search parameters
  const validatedParams = validateRequest(schemas.bookingFilter.merge(schemas.pagination), {
    ...Object.fromEntries(searchParams.entries()),
    page,
    limit,
  })
  
  logger.logBusiness('Fetching booking list', {
    filters,
    page,
    limit,
    userId,
    isAdmin,
  })
  
  try {
    // Only allow users to see their own bookings unless they're admin
    const effectiveUserId = isAdmin ? undefined : (userId || undefined)
    const result = await getCachedBookingList(filters, page, limit, effectiveUserId)
    
    logger.logBusiness('Booking list fetched successfully', {
      count: result.bookings.length,
      total: result.pagination.total,
      page,
      limit,
      userId,
    })
    
    return createSuccessResponse(result, 'Booking list retrieved successfully')
  } catch (error) {
    logger.error('Failed to fetch booking list', error as Error, {
      filters,
      page,
      limit,
      userId,
    })
    throw error
  }
})

// POST /api/bookings - Create new booking
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Get authenticated user from JWT token
  const user = await getAuthenticatedUser(request)
  if (!user) {
    throw new AppError('Authentication required', 401)
  }
  
  const userId = user.id
  
  const body = await request.json()
  
  // Log the incoming request body for debugging
  logger.logBusiness('Booking request body received', {
    userId,
    body,
    bodyKeys: Object.keys(body),
  })
  
  // Validate request body
  logger.logBusiness('About to validate request body', {
    userId,
    body,
    bodyType: typeof body,
    bodyStringified: JSON.stringify(body),
  })
  
  const validatedData = validateRequest<{
    equipmentId?: string;
    brokerageId?: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    notes?: string;
    type?: string;
    phoneNumber?: string;
  }>(schemas.bookingCreate, body)
  
  logger.logBusiness('Request body validated successfully', {
    userId,
    validatedData,
  })
  
  logger.logBusiness('Creating booking', {
    userId,
    equipmentId: validatedData.equipmentId,
    brokerageId: validatedData.brokerageId,
    startDate: validatedData.startDate,
    endDate: validatedData.endDate,
  })
  
  try {
    // Use transaction for booking creation
    const booking = await db.$transaction(async (tx) => {
      const startDate = new Date(validatedData.startDate)
      const endDate = new Date(validatedData.endDate)
      
      // Validate dates
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
      
      if (startDateOnly < today) {
        const todayStr = today.toISOString().split('T')[0]
        throw new AppError(`Start date cannot be in the past. Please select ${todayStr} or later.`, 400)
      }
      
      if (endDate <= startDate) {
        throw new AppError('End date must be after start date', 400)
      }
      
      // Check availability and conflicts
      if (validatedData.equipmentId) {
        const equipment = await tx.equipment.findUnique({
          where: { id: validatedData.equipmentId },
        })
        
        if (!equipment || !equipment.available) {
          throw new AppError('Equipment not available', 400)
        }
        
        // Check for conflicting bookings
        const conflictingBooking = await tx.booking.findFirst({
          where: {
            equipmentId: validatedData.equipmentId,
            status: { in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED] },
            OR: [
              {
                startDate: { lte: endDate },
                endDate: { gte: startDate },
              },
            ],
          },
        })
        
        if (conflictingBooking) {
          throw new AppError('Equipment is already booked for the selected dates', 400)
        }
      }
      
      if (validatedData.brokerageId) {
        logger.logBusiness('Checking brokerage availability', {
          brokerageId: validatedData.brokerageId,
          brokerageIdType: typeof validatedData.brokerageId,
          brokerageIdLength: validatedData.brokerageId.length,
        })
        
        const brokerage = await tx.brokerage.findUnique({
          where: { id: validatedData.brokerageId },
        })
        
        logger.logBusiness('Brokerage query result', {
          brokerageId: validatedData.brokerageId,
          brokerageFound: !!brokerage,
          brokerageData: brokerage ? {
            id: brokerage.id,
            title: brokerage.title,
            available: brokerage.available,

          } : null,
        })
        
        if (!brokerage || !brokerage.available) {
          logger.error('Brokerage not available error', new Error('Brokerage not available'), {
            brokerageId: validatedData.brokerageId,
            brokerageFound: !!brokerage,
            brokerageAvailable: brokerage?.available,

          })
          throw new AppError('Brokerage not available', 400)
        }
      }
      
      // Create booking
      const bookingData = {
        userId,
        startDate,
        endDate,
        status: BOOKING_STATUS.PENDING,
        equipmentId: validatedData.equipmentId,
        brokerageId: validatedData.brokerageId,
        totalPrice: validatedData.totalPrice,
        notes: validatedData.notes,
        type: (validatedData.type as keyof typeof BOOKING_TYPE) || BOOKING_TYPE.EQUIPMENT,
        phoneNumber: validatedData.phoneNumber,
      }
      
      return await tx.booking.create({
        data: bookingData,
        include: {
          equipment: {
            select: {
              id: true,
              title: true,
              images: true,
              price: true,
            },
          },
          brokerage: {
            select: {
              id: true,
              title: true,
              images: true,
              price: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })
    })
    
    // Invalidate related cache entries
    cacheUtils.invalidatePattern('booking:list')
    cacheUtils.invalidatePattern('stats:')
    
    logger.logBusiness('Booking created successfully', {
      bookingId: booking.id,
      userId,
      equipmentId: booking.equipmentId,
      brokerageId: booking.brokerageId,
    })
    
    return createSuccessResponse(booking, 'Booking created successfully', 201)
  } catch (error) {
    logger.error('Failed to create booking', error as Error, {
      userId,
      bookingData: validatedData,
    })
    throw error
  }
})