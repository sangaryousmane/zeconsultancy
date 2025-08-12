'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/lib/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Equipment', href: '/equipment' },
  { name: 'Brokerage', href: '/brokerage' },
  { name: 'Documentation Services', href: '/documentation' },
  { name: 'Software Development', href: '/software-development' },
  { name: 'Contact', href: '/contact' },
]

interface User {
  id: string
  name: string
  email: string
  role: string
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    checkAuthStatus()
    
    // Listen for auth changes
    const handleAuthChange = () => {
      // Small delay to ensure cookie is set
      setTimeout(() => {
        checkAuthStatus()
      }, 50)
    }
    
    window.addEventListener('auth-change', handleAuthChange)
    
    return () => {
      window.removeEventListener('auth-change', handleAuthChange)
    }
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        // Clear user state if not authenticated
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // Clear user state on error
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        // Clear user state immediately
        setUser(null)
        
        // Clear any cached data
        if (typeof window !== 'undefined') {
          // Clear localStorage if any auth data is stored there
          localStorage.clear()
          // Clear sessionStorage if any auth data is stored there
          sessionStorage.clear()
        }
        
        toast({ title: 'Success', description: 'Logged out successfully' })
        
        // Trigger auth change event
        window.dispatchEvent(new Event('auth-change'))
        
        // Force a hard reload to clear all cached state
        window.location.href = '/'
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Logout failed', variant: 'destructive' })
    }
  }

  return (
    <nav className="fixed top-0 w-full z-50 glass-effect border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-lg">ZE</span>
            </div>
            <span className="text-xl font-bold gradient-text">Consultancy</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLoading && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {user.role !== 'ADMIN' && (
                      <DropdownMenuItem asChild>
                        <Link href="/bookings" className="flex items-center space-x-2 w-full">
                          <User className="w-4 h-4" />
                          <span>My Bookings</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user.role === 'ADMIN' && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center space-x-2 w-full">
                          <User className="w-4 h-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <button onClick={handleLogout} className="flex items-center space-x-2 w-full">
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  {/* <Button variant="ghost" size="sm" asChild>
                    <Link href="/auth/login"></Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/auth/register"></Link>
                  </Button> */}
                </>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-white/10">
                {!isLoading && (
                  user ? (
                    <>
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        Welcome, {user.name}
                      </div>
                      {user.role !== 'ADMIN' && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link href="/bookings" onClick={() => setIsOpen(false)}>My Bookings</Link>
                        </Button>
                      )}
                      {user.role === 'ADMIN' && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link href="/admin" onClick={() => setIsOpen(false)}>Admin Dashboard</Link>
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          handleLogout()
                          setIsOpen(false)
                        }}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/auth/login" onClick={() => setIsOpen(false)}>Login</Link>
                      </Button>
                      <Button size="sm" asChild>
                        <Link href="/auth/register" onClick={() => setIsOpen(false)}>Sign Up</Link>
                      </Button>
                    </>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}