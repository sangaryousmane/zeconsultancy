'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/lib/hooks/use-toast'

export default function TestAuthPage() {
  const [authInfo, setAuthInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const checkAuth = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/debug/auth')
      const data = await response.json()
      setAuthInfo(data)
      console.log('Auth Debug:', data)
    } catch (error) {
      console.error('Auth check failed:', error)
      toast({ title: 'Error', description: 'Failed to check auth status', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) {
        toast({ title: 'Success', description: 'Logged out successfully' })
        setAuthInfo(null)
        window.dispatchEvent(new Event('auth-change'))
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Logout failed', variant: 'destructive' })
    }
  }

  const goToLogin = () => {
    router.push('/auth/login')
  }

  const goToAdmin = () => {
    router.push('/admin')
  }

  return (
    <div className="min-h-screen pt-16 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Status</CardTitle>
              <CardDescription>Check your current authentication status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={checkAuth} disabled={isLoading}>
                {isLoading ? 'Checking...' : 'Check Auth Status'}
              </Button>
              
              {authInfo && (
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Auth Info:</h3>
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(authInfo, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Test authentication actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={goToLogin} variant="outline" className="w-full">
                Go to Login
              </Button>
              
              <Button onClick={logout} variant="outline" className="w-full">
                Logout
              </Button>
              
              <Button onClick={goToAdmin} className="w-full">
                Try Admin Access
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Click "Check Auth Status" to see your current authentication state</li>
              <li>If you're not logged in, click "Go to Login" and log in with your admin credentials</li>
              <li>After logging in, come back here and check auth status again</li>
              <li>Try "Try Admin Access" to test if you can access the admin dashboard</li>
              <li>Use "Logout" to clear your session and test the flow again</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}