import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth'
import { z } from 'zod'

const brokerageUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  categoryId: z.string().min(1, 'Category is required').optional(),
  price: z.number().positive('Price must be positive').optional(),
  priceType: z.enum(['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'FIXED']).optional(),
  images: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  location: z.string().optional(),
  available: z.boolean().optional()
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await getAuthenticatedUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const brokerage = await prisma.brokerage.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        bookings: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!brokerage) {
      return NextResponse.json({ error: 'Brokerage not found' }, { status: 404 })
    }

    return NextResponse.json(brokerage)
  } catch (error) {
    console.error('Get brokerage error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await getAuthenticatedUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = brokerageUpdateSchema.parse(body)

    // If categoryId is being updated, verify it exists and is of type BROKERAGE
    if (validatedData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: validatedData.categoryId }
      })

      if (!category || category.type !== 'BROKERAGE') {
        return NextResponse.json({ error: 'Invalid brokerage category' }, { status: 400 })
      }
    }

    const brokerage = await prisma.brokerage.update({
      where: { id: params.id },
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

    return NextResponse.json(brokerage)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Update brokerage error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await getAuthenticatedUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if brokerage has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        brokerageId: params.id,
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    })

    if (activeBookings > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete brokerage with active bookings' 
      }, { status: 400 })
    }

    await prisma.brokerage.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Brokerage deleted successfully' })
  } catch (error) {
    console.error('Delete brokerage error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}