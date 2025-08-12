'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, DollarSign, MapPin, X, Eye, AlertCircle, CheckCircle, XCircle, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/lib/hooks/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface Booking {
  id: string
  type: 'EQUIPMENT' | 'BROKERAGE'
  startDate: string
  endDate: string
  totalPrice: number
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED'
  notes?: string
  adminNotes?: string
  createdAt: string
  equipment?: {
    id: string
    title: string
    images: string[]
    price: number
    priceType: string
  }
  brokerage?: {
    id: string
    title: string
    images: string[]
    price: number
    priceType: string
  }
}

interface BookingsResponse {
  bookings: Booking[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelLoading, setCancelLoading] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: '',
    type: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const { toast } = useToast()
  const router = useRouter()

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') params.append(key, value)
      })
      params.append('page', (pagination?.page || 1).toString())
      params.append('limit', (pagination?.limit || 10).toString())

      const response = await fetch(`/api/bookings?${params}`)
      if (response.ok) {
        const data: BookingsResponse = await response.json()
        setBookings(data.bookings)
        setPagination(data.pagination)
      } else if (response.status === 401) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to view your bookings',
          variant: 'destructive'
        })
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast({
        title: 'Error',
        description: 'Failed to load bookings',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [filters, pagination?.page])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setCancelLoading(bookingId)
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'cancel' })
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: 'Success',
          description: 'Booking cancelled and removed successfully'
        })
        // Refresh the bookings list since the booking was deleted
        fetchBookings()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to cancel booking',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast({
        title: 'Error',
        description: 'Failed to cancel booking',
        variant: 'destructive'
      })
    } finally {
      setCancelLoading(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4" />
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
      case 'CONFIRMED':
        return 'bg-green-500/10 text-green-400 border border-green-500/20'
      case 'COMPLETED':
        return 'bg-primary/10 text-primary border border-primary/20'
      default:
        return 'bg-muted/50 text-muted-foreground border border-border'
    }
  }

  const canCancelBooking = (booking: Booking) => {
    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) return false
    
    const now = new Date()
    const startDate = new Date(booking.startDate)
    const timeDiff = startDate.getTime() - now.getTime()
    const hoursDiff = timeDiff / (1000 * 3600)
    
    return hoursDiff >= 24
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const item = booking.equipment || booking.brokerage
    if (!item) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="hover-glow transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3">
                <div className="relative h-16 w-16 rounded-lg overflow-hidden">
                  <Image
                    src={item.images[0] || '/placeholder-equipment.jpg'}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">
                      {booking.type === 'EQUIPMENT' ? 'Equipment' : 'Brokerage'}
                    </Badge>
                    <Badge className={getStatusColor(booking.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </span>
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">
                  ${booking.totalPrice.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  ${item.price}/{item.priceType.toLowerCase()}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Start Date</p>
                  <p className="text-muted-foreground">{formatDate(booking.startDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">End Date</p>
                  <p className="text-muted-foreground">{formatDate(booking.endDate)}</p>
                </div>
              </div>
            </div>

            {booking.notes && (
              <div>
                <p className="font-medium text-sm mb-1">Your Notes</p>
                <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                  {booking.notes}
                </p>
              </div>
            )}

            {booking.adminNotes && (
              <div>
                <p className="font-medium text-sm mb-1">Admin Notes</p>
                <p className="text-sm text-muted-foreground bg-primary/10 p-2 rounded border border-primary/20">
                  {booking.adminNotes}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <p className="text-xs text-muted-foreground">
                Booked on {formatDate(booking.createdAt)}
              </p>
              <div className="flex gap-2">
                <Link href={`/${booking.type.toLowerCase()}/${item.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </Link>
                {canCancelBooking(booking) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={cancelLoading === booking.id}>
                        {cancelLoading === booking.id ? (
                          <Loader className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <X className="h-4 w-4 mr-1" />
                        )}
                        Cancel
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to cancel this booking? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleCancelBooking(booking.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Cancel Booking
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const BookingSkeleton = () => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <div className="h-16 w-16 bg-muted rounded-lg animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-32 bg-muted rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                <div className="h-5 w-20 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="h-6 w-20 bg-muted rounded animate-pulse" />
            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 bg-muted rounded animate-pulse" />
          <div className="h-12 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-16 bg-muted rounded animate-pulse" />
        <div className="flex justify-between items-center">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-muted rounded animate-pulse" />
            <div className="h-8 w-16 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen pt-16">
      <section className="py-24 bg-gradient-to-br from-background via-background to-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              My <span className="gradient-text">Bookings</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Manage your equipment and brokerage service bookings
            </p>
          </motion.div>
        </div>
      </section>
      
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-effect p-6 mb-8"
          >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.type}
              onValueChange={(value) => handleFilterChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                <SelectItem value="BROKERAGE">Brokerage</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex justify-end">
              <p className="text-sm text-muted-foreground self-center">
                {pagination?.total || 0} total bookings
              </p>
            </div>
          </div>
          </motion.div>

          {/* Bookings List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
          {loading ? (
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <BookingSkeleton key={index} />
              ))}
            </div>
          ) : (bookings?.length || 0) > 0 ? (
            <>
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
              {/* Pagination */}
              {(pagination?.pages || 0) > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  <Button
                    variant="outline"
                    disabled={(pagination?.page || 1) === 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: (prev?.page || 1) - 1 }))}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: pagination?.pages || 0 }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={(pagination?.page || 1) === page ? 'default' : 'outline'}
                      onClick={() => setPagination(prev => ({ ...prev, page }))}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    disabled={(pagination?.page || 1) === (pagination?.pages || 1)}
                    onClick={() => setPagination(prev => ({ ...prev, page: (prev?.page || 1) + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
             <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Calendar className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                No bookings found
              </h3>
              <p className="text-muted-foreground mb-6">
                You haven't made any bookings yet. Start exploring our equipment and services!
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/equipment">
                  <Button>
                    Browse Equipment
                  </Button>
                </Link>
                <Link href="/brokerage">
                  <Button variant="outline">
                    Browse Services
                  </Button>
                </Link>
              </div>
            </div>
          )}
          </motion.div>
        </div>
      </section>
    </div>
  )
}