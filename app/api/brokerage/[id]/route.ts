import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const brokerage = await prisma.brokerage.findUnique({
      where: { id: params.id },
      include: {
        category: {
          select: { id: true, name: true, type: true, icon: true }
        },
        bookings: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED'] }
          },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true
          },
          orderBy: { startDate: 'asc' }
        }
      }
    })

    if (!brokerage) {
      return NextResponse.json({ error: 'Brokerage not found' }, { status: 404 })
    }

    // Get related brokerage from the same category
    const relatedBrokerage = await prisma.brokerage.findMany({
      where: {
        categoryId: brokerage.categoryId,
        id: { not: brokerage.id },
        available: true
      },
      include: {
        category: {
          select: { name: true }
        }
      },
      take: 4,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      ...brokerage,
      relatedBrokerage
    })
  } catch (error) {
    console.error('Get brokerage details error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}