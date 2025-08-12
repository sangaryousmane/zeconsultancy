import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await getAuthenticatedUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        equipment: {
          select: { id: true, title: true, images: true, price: true, priceType: true, description: true }
        },
        brokerage: {
          select: { id: true, title: true, images: true, price: true, priceType: true, description: true }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if user owns the booking or is admin
    if (booking.userId !== authUser.id && authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Get booking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await getAuthenticatedUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        user: true
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check permissions
    if (action === 'cancel') {
      // Users can only cancel their own bookings
      if (booking.userId !== authUser.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      // Can only cancel pending or confirmed bookings
      if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
        return NextResponse.json({ error: 'Cannot cancel this booking' }, { status: 400 })
      }

      // Cannot cancel if booking starts within 24 hours
      const now = new Date()
      const startDate = new Date(booking.startDate)
      const timeDiff = startDate.getTime() - now.getTime()
      const hoursDiff = timeDiff / (1000 * 3600)

      if (hoursDiff < 24) {
        return NextResponse.json({ 
          error: 'Cannot cancel booking within 24 hours of start time' 
        }, { status: 400 })
      }

      // Delete the booking instead of updating status to CANCELLED
      await prisma.booking.delete({
        where: { id: params.id }
      })

      return NextResponse.json({ message: 'Booking cancelled and removed successfully' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await getAuthenticatedUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can delete bookings
    if (authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.booking.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Booking deleted successfully' })
  } catch (error) {
    console.error('Delete booking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}