import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth'
import { z } from 'zod'

const equipmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  categoryId: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be positive'),
  priceType: z.enum(['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY']),
  images: z.array(z.string()).optional().default([]),
  features: z.array(z.string()).optional().default([]),
  location: z.string().optional(),
  condition: z.string().optional(),
  available: z.boolean().optional().default(true)
})

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100) // Cap at 100
    const skip = (page - 1) * limit

    // Optimize with select instead of include and parallel queries
    const [equipment, categories, total] = await Promise.all([
      prisma.equipment.findMany({
        skip,
        take: limit,
        select: {
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
          updatedAt: true,
          categoryId: true,
          _count: {
            select: { bookings: true }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      // Cache categories separately
      prisma.category.findMany({
        where: { type: 'EQUIPMENT' },
        select: { id: true, name: true, icon: true }
      }),
      // Only count on first page
      page === 1 ? prisma.equipment.count() : Promise.resolve(0)
    ])

    // Map category data to equipment items
    const equipmentWithCategories = equipment.map(item => ({
      ...item,
      category: categories.find(cat => cat.id === item.categoryId) || null
    }))

    const response = NextResponse.json({
      equipment: equipmentWithCategories,
      pagination: {
        page,
        limit,
        total: page === 1 ? total : undefined,
        pages: page === 1 ? Math.ceil(total / limit) : undefined,
        hasNext: equipment.length === limit,
        hasPrev: page > 1
      }
    })

    // Add cache headers
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60')
    
    return response
  } catch (error) {
    console.error('Get equipment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = equipmentSchema.parse(body)

    // Verify category exists and is of type EQUIPMENT
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId }
    })

    if (!category || category.type !== 'EQUIPMENT') {
      return NextResponse.json({ error: 'Invalid equipment category' }, { status: 400 })
    }

    const equipment = await prisma.equipment.create({
      data: validatedData,
      include: {
        category: {
          select: { name: true }
        },
        _count: {
          select: { bookings: true }
        }
      }
    })

    return NextResponse.json(equipment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Create equipment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}