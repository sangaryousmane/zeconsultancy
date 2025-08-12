import nodemailer from 'nodemailer'
import { sendOtpEmail } from './email'

// Email debugging and testing utilities
export async function testEmailConfiguration() {
  console.log('🔍 Testing email configuration...')
  
  // Check environment variables
  const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM']
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars)
    return {
      success: false,
      error: `Missing environment variables: ${missingVars.join(', ')}`,
      suggestions: [
        'Check your .env file',
        'Ensure EMAIL_USER, EMAIL_PASS, and EMAIL_FROM are set',
        'For Gmail, use App Password instead of regular password'
      ]
    }
  }
  
  console.log('✅ Environment variables found')
  
  // Test transporter connection
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      requireTLS: true,
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      }
    })
    
    await transporter.verify()
    console.log('✅ SMTP connection successful')
    
    return {
      success: true,
      message: 'Email configuration is working correctly'
    }
  } catch (error) {
    console.error('❌ SMTP connection failed:', error)
    
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    let suggestions: string[] = []
    if (errorMessage.includes('authentication') || errorMessage.includes('535')) {
      suggestions = [
        'Check your Gmail credentials',
        'Enable 2-Factor Authentication on Gmail',
        'Generate and use an App Password instead of your regular password',
        'Visit: https://support.google.com/accounts/answer/185833'
      ]
    } else if (errorMessage.includes('connection') || errorMessage.includes('timeout')) {
      suggestions = [
        'Check your internet connection',
        'Verify firewall settings',
        'Try using port 465 with secure: true'
      ]
    }
    
    return {
      success: false,
      error: errorMessage,
      suggestions
    }
  }
}

export async function sendTestEmail(toEmail: string) {
  console.log(`📧 Sending test email to ${toEmail}...`)
  
  try {
    await sendOtpEmail(toEmail, '123456', 'registration')
    console.log('✅ Test email sent successfully')
    return {
      success: true,
      message: 'Test email sent successfully'
    }
  } catch (error) {
    console.error('❌ Test email failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

export function getEmailTroubleshootingGuide() {
  return {
    commonIssues: [
      {
        issue: 'Authentication Failed (535 error)',
        solutions: [
          'Enable 2-Factor Authentication on your Gmail account',
          'Generate an App Password: Gmail Settings > Security > App passwords',
          'Use the App Password in EMAIL_PASS instead of your regular password',
          'Ensure EMAIL_USER is your full Gmail address'
        ]
      },
      {
        issue: 'Connection Timeout',
        solutions: [
          'Check your internet connection',
          'Verify firewall/antivirus settings',
          'Try using port 465 with SSL instead of 587 with STARTTLS',
          'Contact your hosting provider about SMTP restrictions'
        ]
      },
      {
        issue: 'Emails Going to Spam',
        solutions: [
          'Set up SPF record for your domain',
          'Configure DKIM authentication',
          'Use a verified sender email address',
          'Avoid spam trigger words in email content'
        ]
      },
      {
        issue: 'Rate Limiting',
        solutions: [
          'Gmail has sending limits (500 emails/day for free accounts)',
          'Implement exponential backoff for retries',
          'Consider using a dedicated email service like SendGrid or Mailgun',
          'Add delays between email sends'
        ]
      }
    ],
    setupSteps: [
      '1. Go to your Google Account settings',
      '2. Navigate to Security > 2-Step Verification',
      '3. Enable 2-Step Verification if not already enabled',
      '4. Go to Security > App passwords',
      '5. Generate a new app password for "Mail"',
      '6. Use this app password in your EMAIL_PASS environment variable',
      '7. Set EMAIL_USER to your full Gmail address',
      '8. Set EMAIL_FROM to your Gmail address or a verified sender'
    ]
  }
}