import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { cache } from '@/lib/cache'
import { z } from 'zod'

// Cache categories for 10 minutes
let categoriesCache: { data: any[], timestamp: number } | null = null
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const categoryId = searchParams.get('categoryId')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const priceType = searchParams.get('priceType')
    const available = searchParams.get('available')
    const includeBookingCount = searchParams.get('includeBookingCount') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50) // Limit max items
    const skip = (page - 1) * limit

    const where: any = {
      available: available === 'false' ? false : true
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { features: { hasSome: [search] } }
      ]
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    if (priceType) {
      where.priceType = priceType
    }

    // Get categories from cache or fetch
    let categories
    const now = Date.now()
    if (categoriesCache && (now - categoriesCache.timestamp) < CACHE_DURATION) {
      categories = categoriesCache.data
    } else {
      categories = await prisma.category.findMany({
        where: { type: 'EQUIPMENT' },
        select: { id: true, name: true, icon: true },
        orderBy: { name: 'asc' }
      })
      categoriesCache = { data: categories, timestamp: now }
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
      available: true,
      location: true,
      condition: true,
      createdAt: true,
      categoryId: true // Use categoryId instead of full category relation for better performance
    }

    // Only include booking count when specifically requested
    if (includeBookingCount) {
      selectFields._count = {
        select: { bookings: true }
      }
    }

    // Optimize queries by running them in parallel
    const [equipment, total] = await Promise.all([
      prisma.equipment.findMany({
        where,
        select: selectFields,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit + 1 // Fetch one extra to check if there are more
      }),
      // Only count when necessary (first page)
      page === 1 ? prisma.equipment.count({ where }) : Promise.resolve(0)
    ])

    // Check if there are more items and remove the extra one
    const hasNext = equipment.length > limit
    if (hasNext) {
      equipment.pop() // Remove the extra item
    }

    // Map category data to equipment items for better performance
    const equipmentWithCategories = equipment.map(item => ({
      ...item,
      category: categories.find(cat => cat.id === item.categoryId) || null
    }))

    const response = NextResponse.json({
      equipment: equipmentWithCategories,
      categories,
      pagination: {
        page,
        limit,
        total: page === 1 ? total : undefined,
        pages: page === 1 ? Math.ceil(total / limit) : undefined,
        hasNext,
        hasPrev: page > 1
      }
    })

    // Add cache headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')

    return response
  } catch (error) {
    console.error('Get equipment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}