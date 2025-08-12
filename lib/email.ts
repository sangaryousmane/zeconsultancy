import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

// Enhanced logging for email debugging
const logEmail = (level: 'info' | 'error' | 'warn', message: string, data?: any) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] EMAIL ${level.toUpperCase()}: ${message}`, data || '')
}

// Create multiple transporter configurations for fallback
const createGmailTransporter = (): Transporter => {
  const config = {
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
    tls: {
      rejectUnauthorized: false
    }
  }
  
  logEmail('info', 'Creating Gmail transporter', { host: config.host, port: config.port, user: config.auth.user })
  return nodemailer.createTransport(config as any)
}

const createFallbackTransporter = (): Transporter => {
  const config = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
    tls: {
      rejectUnauthorized: false
    },
    pool: true,
    maxConnections: 3,
    maxMessages: 50
  }
  
  logEmail('info', 'Creating fallback transporter', { host: config.host, port: config.port })
  return nodemailer.createTransport(config as any)
}

// Create a simple transporter without verification for development
const createSimpleTransporter = (): Transporter => {
  const config = {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
    tls: {
      rejectUnauthorized: false
    }
  }
  
  logEmail('info', 'Creating simple Gmail transporter', { user: config.auth.user })
  return nodemailer.createTransport(config as any)
}

// Try multiple transporter configurations
const getWorkingTransporter = async (): Promise<Transporter> => {
  // For development, skip verification and use simple config
  if (process.env.NODE_ENV === 'development') {
    logEmail('info', 'Development mode: using simple transporter without verification')
    return createSimpleTransporter()
  }

  const transporters = [
    { name: 'Gmail', transporter: createGmailTransporter() },
    { name: 'Fallback', transporter: createFallbackTransporter() }
  ]

  for (const { name, transporter } of transporters) {
    try {
      logEmail('info', `Verifying ${name} transporter...`)
      await Promise.race([
        transporter.verify(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Verification timeout')), 10000)
        )
      ])
      logEmail('info', `${name} transporter verified successfully`)
      return transporter
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logEmail('error', `${name} transporter verification failed`, { error: errorMessage })
      transporter.close()
      continue
    }
  }

  // Fallback to simple transporter if all verifications fail
  logEmail('warn', 'All verifications failed, using simple transporter as fallback')
  return createSimpleTransporter()
}

let transporter: Transporter | null = null

// Initialize transporter on first use
const getTransporter = async () => {
  if (!transporter) {
    transporter = await getWorkingTransporter()
  }
  return transporter
}

export const sendOtpEmail = async (email: string, otp: string, type: 'registration' | 'login' | 'reset') => {
  const startTime = Date.now()
  logEmail('info', `Starting OTP email send`, { email, type, otp: otp.substring(0, 2) + '****' })
  
  // For development mode, simulate email sending
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_EMAIL_SENDING === 'true') {
    logEmail('info', 'Development mode: simulating email send', { email, otp })
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate delay
    logEmail('info', 'Email simulated successfully', { email, otp, duration: '1000ms' })
    return
  }
  
  try {
    // Get or create working transporter
    if (!transporter) {
      logEmail('info', 'No existing transporter, creating new one')
      transporter = await getWorkingTransporter()
    }

    const subject = type === 'registration' 
      ? 'Verify Your Account' 
      : type === 'login'
      ? 'Login Verification Code'
      : 'Password Reset Code'

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 24px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 20px;
          }
          .otp-code {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-size: 32px;
            font-weight: bold;
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            letter-spacing: 8px;
            margin: 30px 0;
            font-family: 'Courier New', monospace;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">${process.env.APP_NAME || 'App'}</div>
            <h1>${subject}</h1>
          </div>
          
          <p>Your verification code is:</p>
          
          <div class="otp-code">${otp}</div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> This code will expire in 10 minutes. If you didn't request this, please ignore this email.
          </div>
          
          <div class="footer">
            <p>This is an automated message from ${process.env.APP_NAME || 'our application'}.</p>
            <p>Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'App'}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject,
      html,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    }

    logEmail('info', 'Prepared mail options', { to: email, subject, from: mailOptions.from })

    // Send email with timeout and retry logic
    const sendWithTimeout = () => {
      return Promise.race([
        transporter!.sendMail(mailOptions),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Email send timeout after 30 seconds')), 30000)
        )
      ])
    }

    // Enhanced retry logic with exponential backoff
    let lastError: any
    const maxAttempts = 3
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        logEmail('info', `Email send attempt ${attempt}/${maxAttempts}`)
        const result = await sendWithTimeout()
        const duration = Date.now() - startTime
        logEmail('info', `Email sent successfully on attempt ${attempt}`, { 
          messageId: result.messageId, 
          duration: `${duration}ms`,
          response: result.response 
        })
        return result
      } catch (error) {
        lastError = error
        const errorMessage = error instanceof Error ? error.message : String(error)
        logEmail('error', `Email send attempt ${attempt} failed`, { error: errorMessage })
        
        if (attempt < maxAttempts) {
          // Reset transporter for retry if it's a connection issue
          if (errorMessage.includes('connection') || errorMessage.includes('timeout')) {
            logEmail('info', 'Resetting transporter for retry')
            if (transporter) {
              transporter.close()
            }
            transporter = null
            transporter = await getWorkingTransporter()
          }
          
          // Exponential backoff: 2s, 4s, 8s
          const delay = Math.pow(2, attempt) * 1000
          logEmail('info', `Waiting ${delay}ms before retry`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError

  } catch (error) {
    const duration = Date.now() - startTime
    logEmail('error', 'Email sending failed completely', { 
      error: error instanceof Error ? error.message : String(error),
      duration: `${duration}ms`
    })
    
    // Provide specific error messages
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error('Email service is currently slow. Please try again in a few minutes.')
      } else if (error.message.includes('authentication') || error.message.includes('535')) {
        throw new Error('Email service configuration error. Please contact support.')
      } else if (error.message.includes('connection')) {
        throw new Error('Unable to connect to email service. Please try again later.')
      } else if (error.message.includes('verification')) {
        throw new Error('Email service is not properly configured. Please contact support.')
      }
    }
    
    throw new Error('Failed to send verification email. Please try again.')
  }
}

export async function sendContactEmail(data: {
  name: string
  email: string
  subject: string
  message: string
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a1a1a; padding: 20px; text-align: center;">
        <h1 style="color: #fbbf24; margin: 0;">New Contact Message</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px;">
        <h2 style="color: #333;">${data.subject}</h2>
        <p><strong>From:</strong> ${data.name} (${data.email})</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          ${data.message}
        </div>
      </div>
    </div>
  `

  const currentTransporter = await getTransporter()
  await currentTransporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_FROM,
    subject: `Contact Form: ${data.subject}`,
    html,
  })
}