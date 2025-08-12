import { NextRequest, NextResponse } from 'next/server'
import { testEmailConfiguration, sendTestEmail, getEmailTroubleshootingGuide } from '@/lib/email-debug'
import { sendOtpEmail } from '@/lib/email'

// Admin-only email testing endpoint
export async function POST(request: NextRequest) {
  try {
    const { action, email } = await request.json()

    switch (action) {
      case 'test-config':
        const configResult = await testEmailConfiguration()
        return NextResponse.json(configResult)

      case 'send-test':
        if (!email) {
          return NextResponse.json(
            { success: false, error: 'Email address is required for test send' },
            { status: 400 }
          )
        }
        const sendResult = await sendTestEmail(email)
        return NextResponse.json(sendResult)

      case 'troubleshoot':
        const guide = getEmailTroubleshootingGuide()
        return NextResponse.json({ success: true, guide })

      case 'send-real-otp':
        if (!email) {
          return NextResponse.json(
            { success: false, error: 'Email address is required' },
            { status: 400 }
          )
        }
        
        // Generate a test OTP
        const testOtp = Math.floor(100000 + Math.random() * 900000).toString()
        
        try {
          await sendOtpEmail(email, testOtp, 'registration')
          return NextResponse.json({
            success: true,
            message: 'Test OTP email sent successfully',
            otp: testOtp // Include OTP for testing purposes
          })
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send OTP email'
          })
        }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Email test endpoint error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// Get email configuration status
export async function GET() {
  try {
    const envVars = {
      EMAIL_USER: !!process.env.EMAIL_USER,
      EMAIL_PASS: !!process.env.EMAIL_PASS,
      EMAIL_FROM: !!process.env.EMAIL_FROM,
      EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
      EMAIL_PORT: process.env.EMAIL_PORT || '587',
      APP_NAME: process.env.APP_NAME || 'App'
    }

    const configStatus = {
      configured: envVars.EMAIL_USER && envVars.EMAIL_PASS && envVars.EMAIL_FROM,
      variables: envVars
    }

    return NextResponse.json({
      success: true,
      config: configStatus,
      troubleshooting: getEmailTroubleshootingGuide()
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get config' 
      },
      { status: 500 }
    )
  }
}