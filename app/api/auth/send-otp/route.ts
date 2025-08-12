import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOtpEmail } from '@/lib/email'
import { generateOTP } from '@/lib/utils'
import { z } from 'zod'

function mapOtpType(type: string) {
  switch (type) {
    case 'registration': return 'REGISTRATION'
    case 'login': return 'LOGIN'
    case 'reset': return 'PASSWORD_RESET'
    default: throw new Error('Invalid OTP type')
  }
}

const sendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  type: z.enum(['registration', 'login', 'reset'], {
    errorMap: () => ({ message: 'Invalid OTP type' }),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, type } = sendOtpSchema.parse(body)

    // Check user existence based on type
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (type === 'login' || type === 'reset') {
      if (!user) {
        return NextResponse.json(
          { error: 'No account found with this email' },
          { status: 404 }
        )
      }

      if (type === 'login' && !user.verified) {
        return NextResponse.json(
          { error: 'Please verify your email first' },
          { status: 400 }
        )
      }
    }

    if (type === 'registration' && !user) {
      return NextResponse.json(
        { error: 'Please complete registration first' },
        { status: 400 }
      )
    }

    // Generate OTP
    const otp = generateOTP()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Delete existing OTPs for this user and type
    if (user) {
      await prisma.otpToken.deleteMany({
        where: {
          userId: user.id,
          type: mapOtpType(type) as any,
        },
      })

      // Create new OTP
      await prisma.otpToken.create({
        data: {
          userId: user.id,
          token: otp,
          type: mapOtpType(type) as any,
          expiresAt: otpExpires,
        },
      })
    }

    // Send OTP email with enhanced logging
    try {
      console.log(`[SEND-OTP] Attempting to send ${type} OTP to ${email}`)
      const startTime = Date.now()
      
      await sendOtpEmail(email, otp, type)
      
      const duration = Date.now() - startTime
      console.log(`[SEND-OTP] OTP sent successfully to ${email} in ${duration}ms`)
      
      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully. Please check your email (including spam folder).'
      })
    } catch (emailError) {
      console.error('[SEND-OTP] Failed to send OTP email:', emailError)
      
      const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown error'
      
      // Provide specific error guidance
      let userMessage = 'Failed to send OTP email. Please try again.'
      let suggestions: string[] = []
      
      if (errorMessage.includes('timeout')) {
        userMessage = 'Email service is currently slow. Please wait a moment and try again.'
        suggestions = ['Wait 30 seconds before trying again', 'Check your internet connection']
      } else if (errorMessage.includes('authentication') || errorMessage.includes('535')) {
        userMessage = 'Email service configuration issue. Please contact support.'
        suggestions = ['Contact support for assistance']
      } else if (errorMessage.includes('connection')) {
        userMessage = 'Unable to connect to email service. Please try again later.'
        suggestions = ['Check your internet connection', 'Try again in a few minutes']
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: userMessage,
          errorDetails: errorMessage,
          suggestions,
          canRetry: true
        },
        { status: 500 }
      )
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    )
  }
}