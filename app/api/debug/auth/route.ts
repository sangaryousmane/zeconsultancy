import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const tokenCookie = request.cookies.get('token')
    
    if (!tokenCookie) {
      return NextResponse.json({
        status: 'no_token',
        message: 'No authentication token found',
        hasToken: false
      })
    }
    
    const decoded = await verifyJWT(tokenCookie.value)
    
    if (!decoded) {
      return NextResponse.json({
        status: 'invalid_token',
        message: 'Invalid or expired token',
        hasToken: true,
        tokenLength: tokenCookie.value.length
      })
    }
    
    // Check user in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        verified: true,
        createdAt: true
      }
    })
    
    return NextResponse.json({
      status: 'success',
      hasToken: true,
      tokenLength: tokenCookie.value.length,
      decoded: {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        iat: decoded.iat,
        exp: decoded.exp
      },
      user: user || null,
      isVerified: user?.verified || false,
      isAdmin: user?.role === 'ADMIN'
    })
    
  } catch (error) {
    console.error('Debug auth error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}