import { NextRequest } from 'next/server'
import { withErrorHandling, createSuccessResponse } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'
import { cacheUtils, CacheKeys, withCache } from '@/lib/cache'
import { logger } from '@/lib/logger'
import { CACHE_DURATION, USER_ROLE } from '@/lib/constants'
import { getAuthenticatedUser } from '@/lib/auth'
import { DashboardStats, ApiResponse } from '@/lib/types'
import { Prisma } from '@prisma/client'

// Cache-enabled dashboard stats fetcher
const getCachedDashboardStats = withCache(
  async (): Promise<DashboardStats> => {
    logger.info('Fetching dashboard statistics')
      
      // Get current date for time-based queries
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      // Parallel queries for better performance
      // Optimize with fewer, more efficient queries
      const [
        usersByRole,
        equipmentStats,
        brokerageStats,
        bookingsByStatus,
        monthlyRevenue,
        equipmentByCategory,
        brokerageByCategory,
        recentActivity,
      ] = await Promise.all([
        // User stats with role grouping
        prisma.user.groupBy({
          by: ['role'],
          _count: { role: true },
        }),
        
        // Equipment count
        prisma.equipment.count(),
        
        // Brokerage count
        prisma.brokerage.count(),
        
        // Booking stats by status
        prisma.booking.groupBy({
          by: ['status'],
          _count: { status: true },
        }),
        
        // Revenue calculation (monthly)
        prisma.booking.aggregate({
          where: {
            status: 'CONFIRMED',
            createdAt: { gte: startOfMonth },
          },
          _sum: { totalPrice: true },
        }),
        
        // Equipment by category
        prisma.category.findMany({
          where: {
            type: 'EQUIPMENT',
          },
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                equipment: true,
              },
            },
          },
        }),
        
        // Brokerage by category
        prisma.brokerage.groupBy({
          by: ['categoryId'],
          _count: { categoryId: true },
        }),
        
        // Recent activity (last 24 hours)
        Promise.all([
          prisma.user.count({
            where: {
              createdAt: { gte: startOfDay },
            },
          }),
          prisma.booking.count({
            where: {
              createdAt: { gte: startOfDay },
            },
          }),
          prisma.equipment.count({
            where: {
              createdAt: { gte: startOfDay },
            },
          }),
          prisma.brokerage.count({
            where: {
              createdAt: { gte: startOfDay },
            },
          }),
        ]),
      ])
      
      // Calculate growth percentages (simplified)
      const userGrowth = 5.2 // This would be calculated based on historical data
      const bookingGrowth = 12.8 // This would be calculated based on historical data
      
      // Extract stats from grouped results
      const totalUsers = usersByRole.reduce((sum, item) => sum + item._count.role, 0)
      const totalBookings = bookingsByStatus.reduce((sum, item) => sum + item._count.status, 0)
      const activeBookings = bookingsByStatus.find(item => item.status === 'CONFIRMED')?._count.status || 0
      const pendingBookings = bookingsByStatus.find(item => item.status === 'PENDING')?._count.status || 0
      
      return {
        overview: {
          totalUsers,
          totalEquipment: equipmentStats,
          totalBrokerage: brokerageStats,
          totalBookings,
          activeBookings,
          pendingBookings,
          userGrowth,
          bookingGrowth,
        },
        revenue: {
          monthly: monthlyRevenue._sum.totalPrice || 0,
          weekly: 0, // Would need separate calculation
          daily: 0, // Would need separate calculation
        },
        charts: {
          equipmentByCategory: equipmentByCategory.map((category: any) => ({
            name: category.name,
            count: category._count.equipment,
          })),
          brokerageByType: brokerageByCategory.map((item: any) => ({
            type: item.categoryId,
            count: item._count.categoryId,
          })),
          usersByRole: usersByRole.map((item: any) => ({
            role: item.role,
            count: item._count.role,
          })),
          bookingsByStatus: bookingsByStatus.map((item: any) => ({
            status: item.status,
            count: item._count.status,
          })),
        },
        recentActivity: {
          newUsers: recentActivity[0],
          newBookings: recentActivity[1],
          newEquipment: recentActivity[2],
          newBrokerage: recentActivity[3],
        },
      }
  },
  () => CacheKeys.dashboardStats(),
  CACHE_DURATION.MEDIUM
)

// GET /api/admin/dashboard - Get dashboard statistics
export const GET = withErrorHandling(async (request: NextRequest) => {
  // Get authenticated user from JWT token
  const user = await getAuthenticatedUser(request)
  if (!user) {
    throw new Error('Authentication required')
  }
  
  // Ensure user is admin
  if (user.role !== USER_ROLE.ADMIN) {
    throw new Error('Access denied. Admin role required.')
  }
  
  const userId = user.id
  const userRole = user.role
  
  logger.logBusiness('Fetching dashboard stats', {
    userId,
    userRole,
  })
  
  try {
    const stats = await getCachedDashboardStats()
    
    logger.logBusiness('Dashboard stats fetched successfully', {
      userId,
      totalUsers: stats.overview.totalUsers,
      totalBookings: stats.overview.totalBookings,
      monthlyRevenue: stats.revenue.monthly,
    })
    
    return createSuccessResponse(stats, 'Dashboard statistics retrieved successfully')
  } catch (error) {
    logger.error('Failed to fetch dashboard stats', error as Error, {
      userId,
      userRole,
    })
    throw error
  }
})

// POST /api/admin/dashboard/refresh - Force refresh dashboard cache
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Get authenticated user from JWT token
  const user = await getAuthenticatedUser(request)
  if (!user) {
    throw new Error('Authentication required')
  }
  
  // Ensure user is admin
  if (user.role !== USER_ROLE.ADMIN) {
    throw new Error('Access denied. Admin role required.')
  }
  
  const userId = user.id
  const userRole = user.role
  
  logger.logBusiness('Refreshing dashboard cache', {
    userId,
    userRole,
  })
  
  try {
    // Invalidate dashboard cache
    cacheUtils.invalidatePattern('stats:')
    
    // Fetch fresh stats
    const stats = await getCachedDashboardStats()
    
    logger.logBusiness('Dashboard cache refreshed successfully', {
      userId,
    })
    
    return createSuccessResponse(stats, 'Dashboard cache refreshed successfully')
  } catch (error) {
    logger.error('Failed to refresh dashboard cache', error as Error, {
      userId,
      userRole,
    })
    throw error
  }
})