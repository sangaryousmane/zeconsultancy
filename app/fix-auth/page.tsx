'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

export default function FixAuthPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const fixAuthentication = async () => {
    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/fix-auth', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setStatus('success')
        setMessage('Authentication token has been refreshed successfully!')
        
        // Redirect to admin page after 2 seconds
        setTimeout(() => {
          window.location.href = '/admin'
        }, 2000)
      } else {
        setStatus('error')
        setMessage('Failed to refresh authentication token')
      }
    } catch (error) {
      setStatus('error')
      setMessage('An error occurred while refreshing the token')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Fix Authentication</CardTitle>
          <CardDescription>
            This page will refresh your authentication token to resolve admin access issues.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'idle' && (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  If you're having trouble accessing the admin dashboard, click the button below to refresh your authentication token.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={fixAuthentication} 
                className="w-full"
                size="lg"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Authentication Token
              </Button>
            </>
          )}

          {status === 'loading' && (
            <Alert>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Refreshing your authentication token...
              </AlertDescription>
            </Alert>
          )}

          {status === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {message}
                <br />
                <span className="text-sm text-green-600">Redirecting to admin dashboard...</span>
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <>
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {message}
                </AlertDescription>
              </Alert>
              <Button 
                onClick={fixAuthentication} 
                variant="outline" 
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </>
          )}

          <div className="text-center">
            <Button 
              variant="link" 
              onClick={() => window.location.href = '/'}
              className="text-sm text-gray-600"
            >
              ← Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}