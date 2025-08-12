import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth'
import { cache, CacheKeys } from '@/lib/cache'

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const cacheKey = CacheKeys.dashboardStats()
    
    // Try to get from cache first
    let stats = cache.get(cacheKey)
    
    if (!stats) {
      // Get dashboard statistics from database
      const [totalUsers, totalEquipment, totalBrokerage, totalBookings, pendingBookings, revenueData] = await Promise.all([
        prisma.user.count(),
        prisma.equipment.count(),
        prisma.brokerage.count(),
        prisma.booking.count(),
        prisma.booking.count({ where: { status: 'PENDING' } }),
        prisma.booking.aggregate({
          where: { status: 'CONFIRMED' },
          _sum: { totalPrice: true }
        })
      ])

      const totalRevenue = revenueData._sum.totalPrice || 0

      stats = {
        totalUsers,
        totalEquipment,
        totalBrokerage,
        totalBookings,
        pendingBookings,
        totalRevenue
      }
      
      // Cache for 5 minutes
      cache.set(cacheKey, stats, 5 * 60 * 1000)
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}