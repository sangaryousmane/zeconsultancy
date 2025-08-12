import { NextRequest, NextResponse } from 'next/server'
import { generateJWT } from '@/lib/auth'

export async function GET(request: NextRequest) {
  // Generate a fresh JWT token for the admin user
  const payload = {
    userId: '686aa267ca6b64183a2ea942',
    email: 'almousleck.developer@gmail.com',
    role: 'ADMIN'
  }

  const freshToken = await generateJWT(payload)
  
  // Create response and set the cookie
  const response = NextResponse.json({
    success: true,
    message: 'Fresh authentication token has been set',
    tokenSet: true,
    expiresIn: '7 days',
    timestamp: new Date().toISOString()
  })
  
  // Set the cookie with proper options
  response.cookies.set('token', freshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/'
  })
  
  return response
}