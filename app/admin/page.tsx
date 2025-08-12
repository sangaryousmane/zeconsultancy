'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Package, Building, Users, Calendar, TrendingUp, Eye, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/lib/hooks/use-toast'
import Link from 'next/link'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface DashboardStats {
  totalUsers: number
  totalEquipment: number
  totalBrokerage: number
  totalBookings: number
  pendingBookings: number
  totalRevenue: number
}

interface Equipment {
  id: string
  title: string
  description: string
  price: number
  priceType: string
  available: boolean
  category: { name: string }
  _count: { bookings: number }
}

interface Brokerage {
  id: string
  title: string
  description: string
  price: number
  priceType: string
  available: boolean
  category: { name: string }
  _count: { bookings: number }
}

interface Category {
  id: string
  name: string
  description: string
  type: string
  _count: { equipment: number; brokerage: number }
}

interface Booking {
  id: string
  type: string
  status: string
  totalPrice: number
  startDate: string
  endDate: string
  user: { name: string; email: string }
  equipment?: { title: string }
  brokerage?: { title: string }
  service?: { title: string }
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [brokerage, setBrokerage] = useState<Brokerage[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        if (data.user.role !== 'ADMIN') {
          toast({ 
            title: 'Access Denied', 
            description: 'You do not have admin privileges to access this page', 
            variant: 'destructive' 
          })
          router.push('/')
          return
        }
        setUser(data.user)
        await loadDashboardData()
      } else {
        toast({ 
          title: 'Authentication Required', 
          description: 'Please log in to access the admin dashboard', 
          variant: 'destructive' 
        })
        router.push('/auth/login')
      }
    } catch (error) {
      toast({ 
        title: 'Authentication Error', 
        description: 'Failed to verify authentication status', 
        variant: 'destructive' 
      })
      router.push('/auth/login')
    } finally {
      setIsLoading(false)
    }
  }

  const debugAuth = async () => {
    try {
      const response = await fetch('/api/debug/auth')
      const data = await response.json()
      console.log('Auth Debug:', data)
      toast({ 
        title: 'Debug Info', 
        description: `Status: ${data.status}, Admin: ${data.isAdmin}, Verified: ${data.isVerified}` 
      })
    } catch (error) {
      console.error('Debug failed:', error)
      toast({ title: 'Debug Failed', description: 'Could not fetch debug info', variant: 'destructive' })
    }
  }

  const loadDashboardData = async () => {
    try {
      const [statsRes, equipmentRes, brokerageRes, categoriesRes, bookingsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/equipment'),
        fetch('/api/admin/brokerage'),
        fetch('/api/admin/categories'),
        fetch('/api/admin/bookings')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (equipmentRes.ok) {
        const equipmentData = await equipmentRes.json()
        setEquipment(Array.isArray(equipmentData.equipment) ? equipmentData.equipment : [])
      }

      if (brokerageRes.ok) {
        const brokerageData = await brokerageRes.json()
        setBrokerage(Array.isArray(brokerageData.brokerage) ? brokerageData.brokerage : [])
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(Array.isArray(categoriesData.categories) ? categoriesData.categories : [])
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        setBookings(bookingsData.bookings || [])
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load dashboard data', variant: 'destructive' })
    }
  }

  const handleDeleteEquipment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this equipment?')) return

    try {
      const response = await fetch(`/api/admin/equipment/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setEquipment(equipment.filter(item => item.id !== id))
        toast({ title: 'Success', description: 'Equipment deleted successfully' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete equipment', variant: 'destructive' })
    }
  }

  const handleDeleteBrokerage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brokerage listing?')) return

    try {
      const response = await fetch(`/api/admin/brokerage/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setBrokerage(brokerage.filter(item => item.id !== id))
        toast({ title: 'Success', description: 'Brokerage listing deleted successfully' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete brokerage listing', variant: 'destructive' })
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const response = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setCategories(categories.filter(item => item.id !== id))
        toast({ title: 'Success', description: 'Category deleted successfully' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete category', variant: 'destructive' })
    }
  }

  const updateBookingStatus = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: id, status })
      })

      if (response.ok) {
        setBookings(bookings.map(booking => 
          booking.id === id ? { ...booking, status } : booking
        ))
        toast({ title: 'Success', description: 'Booking status updated' })
      } else {
        const errorData = await response.json()
        toast({ title: 'Error', description: errorData.error || 'Failed to update booking status', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update booking status', variant: 'destructive' })
    }
  }

  const deleteBooking = async (id: string) => {
    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: id })
      })

      if (response.ok) {
        setBookings(bookings.filter(booking => booking.id !== id))
        toast({ title: 'Success', description: 'Booking deleted successfully' })
      } else {
        const errorData = await response.json()
        toast({ title: 'Error', description: errorData.error || 'Failed to delete booking', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete booking', variant: 'destructive' })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen pt-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your equipment, brokerage listings, and bookings</p>
            </div>
            <Button variant="outline" onClick={debugAuth}>
              Debug Auth
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Equipment</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEquipment}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Brokerage</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBrokerage}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Calendar className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingBookings}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="equipment" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
              <TabsTrigger value="brokerage">Brokerage</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
            </TabsList>

            {/* Equipment Tab */}
            <TabsContent value="equipment" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Equipment Management</h2>
                <Button asChild>
                  <Link href="/admin/equipment/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Equipment
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(equipment) && equipment.length > 0 ? equipment.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription>{item.category.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold">
                          ${item.price}/{item.priceType.toLowerCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.available ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {item.available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">
                        {item._count?.bookings || 0} bookings
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/equipment/${item.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/equipment/${item.id}/edit`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteEquipment(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">No equipment found</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Brokerage Tab */}
            <TabsContent value="brokerage" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Brokerage Management</h2>
                <Button asChild>
                  <Link href="/admin/brokerage/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Brokerage
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(brokerage) && brokerage.length > 0 ? brokerage.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription>{item.category.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold">
                          ${item.price.toLocaleString()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.available ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {item.available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">
                        {item._count?.bookings || 0} bookings
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/brokerage/${item.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/brokerage/${item.id}/edit`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteBrokerage(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">No brokerage listings found</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Category Management</h2>
                <Button asChild>
                  <Link href="/admin/categories/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(categories) && categories.length > 0 ? categories.map((category) => (
                  <Card key={category.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <CardDescription>{category.type}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {category.description || 'No description'}
                      </p>
                      <div className="text-sm text-muted-foreground mb-4">
                        {category.type === 'EQUIPMENT' 
                          ? `${category._count?.equipment || 0} equipment items`
                          : `${category._count?.brokerage || 0} brokerage listings`
                        }
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/categories/${category.id}/edit`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">No categories found</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-6">
              <h2 className="text-2xl font-bold">Booking Management</h2>
              
              <div className="space-y-4">
                {Array.isArray(bookings) && bookings.length > 0 ? bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="font-semibold">
                            {booking.equipment?.title || booking.brokerage?.title || booking.service?.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Customer: {booking.user.name} ({booking.user.email})
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Type: {booking.type} | Price: ${booking.totalPrice.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.startDate).toLocaleDateString()} - {booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'Open'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400' :
                            booking.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-400' :
                            'bg-primary/10 text-primary'
                          }`}>
                            {booking.status}
                          </span>
                          {booking.status === 'PENDING' && (
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                              >
                                Confirm
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => deleteBooking(booking.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          )}
                          {booking.status === 'COMPLETED' && (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => deleteBooking(booking.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">No bookings found</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}