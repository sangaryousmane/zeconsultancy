import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth'
import { z } from 'zod'

const equipmentUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  categoryId: z.string().min(1, 'Category is required').optional(),
  price: z.number().positive('Price must be positive').optional(),
  priceType: z.enum(['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY']).optional(),
  images: z.array(z.string()).optional(),
  specifications: z.array(z.string()).optional(),
  location: z.string().optional(),
  condition: z.string().optional(),
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

    const equipment = await prisma.equipment.findUnique({
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

    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
    }

    return NextResponse.json(equipment)
  } catch (error) {
    console.error('Get equipment error:', error)
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
    const validatedData = equipmentUpdateSchema.parse(body)

    // If categoryId is being updated, verify it exists and is of type EQUIPMENT
    if (validatedData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: validatedData.categoryId }
      })

      if (!category || category.type !== 'EQUIPMENT') {
        return NextResponse.json({ error: 'Invalid equipment category' }, { status: 400 })
      }
    }

    const equipment = await prisma.equipment.update({
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

    return NextResponse.json(equipment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Update equipment error:', error)
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

    // Check if equipment has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        equipmentId: params.id,
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    })

    if (activeBookings > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete equipment with active bookings' 
      }, { status: 400 })
    }

    await prisma.equipment.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Equipment deleted successfully' })
  } catch (error) {
    console.error('Delete equipment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}