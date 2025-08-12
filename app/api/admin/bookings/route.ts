import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth'
import { z } from 'zod'

const bookingUpdateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED']),
  adminNotes: z.string().optional()
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
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50) // Cap at 50
    const skip = (page - 1) * limit

    const where: any = {}
    if (status) where.status = status
    if (type) where.type = type

    // Optimize with select instead of include and parallel queries
    const [bookings, users, equipment, brokerage, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        select: {
          id: true,
          userId: true,
          serviceId: true,
          equipmentId: true,
          brokerageId: true,
          type: true,
          startDate: true,
          endDate: true,
          status: true,
          totalPrice: true,
          notes: true,
          adminNotes: true,
          phoneNumber: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      // Fetch related data separately for better performance
      prisma.user.findMany({
        select: { id: true, name: true, email: true }
      }),
      prisma.equipment.findMany({
        select: { id: true, title: true, price: true, priceType: true }
      }),
      prisma.brokerage.findMany({
        select: { id: true, title: true, price: true, priceType: true }
      }),
      // Only count on first page
      page === 1 ? prisma.booking.count({ where }) : Promise.resolve(0)
    ])

    // Map related data to bookings
    const bookingsWithRelations = bookings.map(booking => ({
      ...booking,
      user: users.find(u => u.id === booking.userId) || null,
      equipment: booking.equipmentId ? equipment.find(e => e.id === booking.equipmentId) || null : null,
      brokerage: booking.brokerageId ? brokerage.find(b => b.id === booking.brokerageId) || null : null
    }))

    const response = NextResponse.json({
      bookings: bookingsWithRelations,
      pagination: {
        page,
        limit,
        total: page === 1 ? total : undefined,
        pages: page === 1 ? Math.ceil(total / limit) : undefined,
        hasNext: bookings.length === limit,
        hasPrev: page > 1
      }
    })

    // Add cache headers
    response.headers.set('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=30')
    
    return response
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { bookingId, ...updateData } = body
    const validatedData = bookingUpdateSchema.parse(updateData)

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: validatedData,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        equipment: {
          select: { id: true, title: true, price: true, priceType: true }
        },
        brokerage: {
          select: { id: true, title: true, price: true, priceType: true }
        }
      }
    })

    return NextResponse.json(booking)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Update booking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { bookingId } = body

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    // Check if booking exists and is completed or cancelled
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { status: true }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Only completed bookings can be deleted' }, { status: 400 })
    }

    await prisma.booking.delete({
      where: { id: bookingId }
    })

    return NextResponse.json({ message: 'Booking deleted successfully' })
  } catch (error) {
    console.error('Delete booking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}