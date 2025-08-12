import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const equipment = await prisma.equipment.findUnique({
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

    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
    }

    // Get related equipment from the same category
    const relatedEquipment = await prisma.equipment.findMany({
      where: {
        categoryId: equipment.categoryId,
        id: { not: equipment.id },
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
      ...equipment,
      relatedEquipment
    })
  } catch (error) {
    console.error('Get equipment details error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}