'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function AuthDebugPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        setError('Not authenticated')
      }
    } catch (err) {
      setError('Failed to check authentication')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Clear the cookie by setting it to expire
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      setUser(null)
      setError(null)
      console.log('Logged out successfully')
    } catch (err) {
      setError('Logout failed')
    }
  }

  const testLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'almousleck.developer@gmail.com',
          password: 'Almousleck123!' // Update this with your actual password
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Login successful:', data)
        window.location.reload()
      } else {
        const errorData = await response.json()
        setError(`Login failed: ${errorData.error}`)
      }
    } catch (err) {
      setError('Login request failed')
    }
  }

  const testAdminAccess = () => {
    router.push('/admin')
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Current URL</h2>
          <p>{window.location.href}</p>
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
          {user ? (
            <div>
              <p className="text-green-600">✅ Authenticated</p>
              <div className="mt-2">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
              </div>
            </div>
          ) : (
            <p className="text-red-600">❌ Not authenticated</p>
          )}
          {error && <p className="text-red-600 mt-2">Error: {error}</p>}
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Actions</h2>
          <div className="space-x-2">
            <button 
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
            <button 
              onClick={testLogin}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Login
            </button>
            <button 
              onClick={checkAuth}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Refresh Auth
            </button>
            <button 
              onClick={testAdminAccess}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Test Admin Access
            </button>
          </div>
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Instructions</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>Make sure you're accessing <strong>http://localhost:3000</strong> (not 3004)</li>
            <li>Update the password in the Test Login button code</li>
            <li>Click "Test Login" to authenticate</li>
            <li>Click "Test Admin Access" to check admin redirect</li>
          </ol>
        </div>
      </div>
    </div>
  )
}