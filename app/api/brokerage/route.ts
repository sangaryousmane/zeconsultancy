import { NextRequest } from 'next/server'
import { withErrorHandling, createSuccessResponse, validateRequest, parsePaginationParams, parseFilterParams } from '@/lib/api-utils'
import { schemas } from '@/lib/validations'
import { prisma } from '@/lib/prisma'
import { cacheUtils, CacheKeys, withCache } from '@/lib/cache'
import { logger } from '@/lib/logger'
import { CACHE_DURATION } from '@/lib/constants'

// Cache categories for 10 minutes
let categoriesCache: { data: any[], timestamp: number } | null = null
const CATEGORIES_CACHE_DURATION = 10 * 60 * 1000 // 10 minutes
import { getAuthenticatedUser } from '@/lib/auth'
import { Brokerage, ApiResponse } from '@/lib/types'
import { Prisma } from '@prisma/client'

// Cache-enabled brokerage fetcher
const getCachedBrokerageList = withCache(
  async (filters: Record<string, any>, page: number, limit: number, includeBookingCount: boolean = false) => {
    const { skip, take, orderBy } = {
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' as const },
    }

    // Build where clause
    const where: any = {}

    if (filters.type) {
      where.type = filters.type
    }

    if (filters.location) {
      where.location = {
        contains: filters.location,
        mode: 'insensitive',
      }
    }

    if (filters.minPrice || filters.maxPrice) {
      where.price = {}
      if (filters.minPrice) where.price.gte = filters.minPrice
      if (filters.maxPrice) where.price.lte = filters.maxPrice
    }

    if (filters.available !== undefined) {
      where.available = filters.available
    }

    if (filters.q) {
      where.OR = [
        {
          title: {
            contains: filters.q,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: filters.q,
            mode: 'insensitive',
          },
        },
      ]
    }

    // Build optimized select object
    const selectFields: any = {
      id: true,
      title: true,
      description: true,
      price: true,
      priceType: true,
      images: true,
      features: true,
      location: true,
      available: true,
      createdAt: true,
      updatedAt: true,
      categoryId: true // Use categoryId instead of full category relation
    }

    // Only include booking count when specifically requested
    if (includeBookingCount) {
      selectFields._count = {
        select: {
          bookings: true,
        },
      }
    }

    // Execute queries in parallel with optimized pagination
    const [brokerage, total] = await Promise.all([
      prisma.brokerage.findMany({
        where,
        skip,
        take: take + 1, // Fetch one extra to check if there are more
        orderBy,
        select: selectFields,
      }),
      // Only count when necessary (first page)
      page === 1 ? prisma.brokerage.count({ where }) : Promise.resolve(0),
    ])

    // Check if there are more items and remove the extra one
    const hasNext = brokerage.length > take
    if (hasNext) {
      brokerage.pop() // Remove the extra item
    }

    return {
      brokerage,
      pagination: {
        page,
        limit,
        total: page === 1 ? total : undefined,
        pages: page === 1 ? Math.ceil(total / limit) : undefined,
        hasNext,
        hasPrev: page > 1,
      },
    }
  },
  (filters, page, limit, includeBookingCount) => CacheKeys.brokerageList({ ...filters, page, limit, includeBookingCount }),
  CACHE_DURATION.MEDIUM
)

// GET /api/brokerage - List brokerage with filtering and pagination
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = request.nextUrl
  
  // Parse and validate pagination parameters
  const { page, limit } = parsePaginationParams(searchParams)
  
  // Parse and validate filter parameters
  const allowedFilters = ['type', 'location', 'minPrice', 'maxPrice', 'available', 'q']
  const filters = parseFilterParams(searchParams, allowedFilters)
  const includeBookingCount = searchParams.get('includeBookingCount') === 'true'
  
  // Validate search parameters
  const validatedParams = validateRequest(schemas.brokerageFilter.merge(schemas.pagination), {
    ...Object.fromEntries(searchParams.entries()),
    page,
    limit,
  })
  
  logger.logBusiness('Fetching brokerage list', {
    filters,
    page,
    limit,
  })
  
  try {
    // Get categories from cache or database
    const getCachedCategories = async () => {
      const now = Date.now()
      if (categoriesCache && (now - categoriesCache.timestamp) < CATEGORIES_CACHE_DURATION) {
        return categoriesCache.data
      }
      
      const categories = await prisma.category.findMany({
        where: { type: 'BROKERAGE' },
        select: { id: true, name: true, icon: true },
        orderBy: { name: 'asc' },
      })
      
      categoriesCache = { data: categories, timestamp: now }
      return categories
    }

    const [result, categories] = await Promise.all([
      getCachedBrokerageList(filters, page, limit, includeBookingCount),
      getCachedCategories()
    ])

    // Map category data to brokerage items for better performance
    const brokerageWithCategories = result.brokerage.map(item => ({
      ...item,
      category: categories.find(cat => cat.id === String(item.categoryId)) || null
    }))
    
    logger.logBusiness('Brokerage list fetched successfully', {
      count: result.brokerage.length,
      total: result.pagination.total,
      page,
      limit,
    })
    
    const response = createSuccessResponse({
      brokerage: brokerageWithCategories,
      pagination: result.pagination,
      categories
    }, 'Brokerage list retrieved successfully')
    
    // Add cache headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    
    return response
  } catch (error) {
    logger.error('Failed to fetch brokerage list', error as Error, {
      filters,
      page,
      limit,
    })
    throw error
  }
})

// POST /api/brokerage - Create new brokerage
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Get authenticated user from JWT token
  const user = await getAuthenticatedUser(request)
  if (!user) {
    throw new Error('Authentication required')
  }
  
  const userId = user.id
  
  const body = await request.json()
  
  // Validate request body
  const validatedData = validateRequest<{
    title: string;
    description: string;
    categoryId: string;
    price: number;
    location: string;
    coordinates?: { lat: number; lng: number };
    images: string[];
    details?: Record<string, string>;
    available?: boolean;
    contactInfo?: {
      phone: string;
      email?: string;
      website: string;
    };
  }>(schemas.brokerageCreate, body)
  
  logger.logBusiness('Creating brokerage', {
    userId,
    brokerageTitle: validatedData.title,
    categoryId: validatedData.categoryId,
  })
  
  try {
    // Create brokerage
    const brokerage = await prisma.brokerage.create({
       data: validatedData,
     })
    
    // Invalidate related cache entries
    cacheUtils.invalidatePattern('brokerage:list')
    cacheUtils.invalidatePattern('stats:')
    
    logger.logBusiness('Brokerage created successfully', {
      brokerageId: brokerage.id,
      userId,
      brokerageTitle: brokerage.title,
    })
    
    return createSuccessResponse(brokerage, 'Brokerage created successfully', 201)
  } catch (error) {
    logger.error('Failed to create brokerage', error as Error, {
      userId,
      brokerageData: validatedData,
    })
    throw error
  }
})