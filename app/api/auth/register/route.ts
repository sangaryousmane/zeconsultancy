import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { sendOtpEmail } from '@/lib/email'
import { generateOTP } from '@/lib/utils'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Generate OTP
    const otp = generateOTP()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Create user (unverified)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verified: false,
        role: 'USER',
      },
    })

    // Store OTP
    await prisma.otpToken.create({
      data: {
        userId: user.id,
        token: otp,
        type: 'REGISTRATION',
        expiresAt: otpExpires,
      },
    })

    // Send OTP email with enhanced error handling
    try {
      console.log(`[REGISTER] Attempting to send OTP email to ${email}`)
      await sendOtpEmail(email, otp, 'registration')
      
      console.log(`[REGISTER] OTP email sent successfully to ${email}`)
      return NextResponse.json({
        success: true,
        message: 'Account created successfully. Please check your email for verification code.',
        requiresVerification: true
      })
    } catch (emailError) {
      console.error('[REGISTER] Email sending failed:', emailError)
      
      // Account was created but email failed - provide helpful error message
      const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown email error'
      
      return NextResponse.json({
        success: true,
        message: 'Account created successfully, but we couldn\'t send the verification email. You can request a new verification code using the "Resend Code" option.',
        requiresVerification: true,
        emailError: true,
        emailErrorDetails: errorMessage,
        troubleshooting: {
          suggestion: 'Try clicking "Resend Code" in a few moments',
          commonCauses: [
            'Temporary email service delay',
            'Email may be in spam folder',
            'Email service configuration issue'
          ]
        }
      }, { status: 207 }) // Multi-Status: partial success
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}