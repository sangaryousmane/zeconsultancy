import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateJWT } from '@/lib/auth'
import { z } from 'zod'

// Map API types to Prisma enum values
function mapOtpType(type: string) {
  switch (type) {
    case 'registration': return 'REGISTRATION'
    case 'login': return 'LOGIN'
    case 'reset': return 'PASSWORD_RESET'
    default: throw new Error('Invalid OTP type')
  }
}

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  type: z.enum(['registration', 'login', 'reset'], {
    errorMap: () => ({ message: 'Invalid OTP type' }),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp, type } = verifyOtpSchema.parse(body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Find valid OTP
    const otpToken = await prisma.otpToken.findFirst({
      where: {
        userId: user.id,
        token: otp,
        type: mapOtpType(type) as any,
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    if (!otpToken) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    // Delete the used OTP
    await prisma.otpToken.delete({
      where: { id: otpToken.id },
    })

    // Handle different OTP types
    if (type === 'registration') {
      // Verify email for registration
      await prisma.user.update({
        where: { id: user.id },
        data: { verified: true },
      })

      return NextResponse.json(
        { message: 'Email verified successfully' },
        { status: 200 }
      )
    }

    if (type === 'login') {
      // Generate JWT token for login
      const token = await generateJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

      // Create response
      const response = NextResponse.json(
        {
          message: 'Login successful',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
        { status: 200 }
      )

      // Set HTTP-only cookie
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      })

      return response
    }

    if (type === 'reset') {
      // For password reset, just verify the OTP
      return NextResponse.json(
        { message: 'OTP verified. You can now reset your password.' },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: 'Invalid OTP type' },
      { status: 400 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}