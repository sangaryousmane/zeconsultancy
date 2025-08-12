import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const tokenCookie = request.cookies.get('token')
    
    if (!tokenCookie) {
      return NextResponse.json({
        error: 'No token cookie found',
        hasCookie: false
      })
    }

    const token = tokenCookie.value
    console.log('Token found:', {
      length: token.length,
      preview: token.substring(0, 50) + '...'
    })

    // Try to verify the token
    const decoded = await verifyJWT(token)
    console.log('Decoded result:', decoded)

    return NextResponse.json({
      hasCookie: true,
      tokenLength: token.length,
      tokenPreview: token.substring(0, 50) + '...',
      decoded: decoded,
      isValid: !!decoded,
      jwtSecret: process.env.JWT_SECRET ? 'Present' : 'Missing'
    })
  } catch (error) {
    console.error('Debug token error:', error)
    return NextResponse.json({
      error: 'Failed to debug token',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}