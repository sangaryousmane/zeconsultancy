'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle, DollarSign, MapPin, Building, Clock, Shield, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/lib/hooks/use-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { SimilarItems } from './SimilarItems'

interface DetailItem {
  id: string
  title: string
  description: string
  price: number
  priceType: string
  images: string[]
  features: string[]
  available: boolean
  location?: string
  category: {
    name: string
  }
  relatedEquipment?: DetailItem[]
  relatedBrokerage?: DetailItem[]
}

interface DetailPageProps {
  item: DetailItem
  type: 'equipment' | 'brokerage'
  backUrl: string
  user?: any
  authLoading?: boolean
  onRefresh?: () => void
  similarItems?: any[]
}

interface BookingData {
  startDate: string
  endDate: string
  notes: string
  phoneNumber: string
}

export function DetailPage({ 
  item, 
  type, 
  backUrl, 
  user, 
  authLoading = false, 
  onRefresh,
  similarItems = []
}: DetailPageProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingData, setBookingData] = useState<BookingData>({
    startDate: '',
    endDate: '',
    notes: '',
    phoneNumber: ''
  })
  const { toast } = useToast()
  const router = useRouter()

  // Test toast on component mount
  useEffect(() => {
    console.log('DetailPage mounted, testing toast system')
    // Test if toast system works
    toast({ title: 'Test', description: 'Toast system is working', variant: 'default' })
  }, [toast])

  const formatPrice = (price: number, priceType: string) => {
    return `$${price.toLocaleString()}/${priceType.toLowerCase()}`
  }

  const calculateTotalPrice = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0
    
    const start = new Date(bookingData.startDate)
    const end = new Date(bookingData.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    switch (item.priceType.toUpperCase()) {
      case 'HOURLY':
        return diffDays * 24 * item.price
      case 'DAILY':
        return diffDays * item.price
      case 'WEEKLY':
        return Math.ceil(diffDays / 7) * item.price
      case 'MONTHLY':
        return Math.ceil(diffDays / 30) * item.price
      case 'FIXED':
        return item.price
      default:
        return diffDays * item.price
    }
  }

  const handleBooking = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (!bookingData.startDate || !bookingData.endDate || !bookingData.phoneNumber) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    setBookingLoading(true)
    
    try {
      const bookingPayload = {
        [type === 'equipment' ? 'equipmentId' : 'brokerageId']: item.id,
        startDate: new Date(bookingData.startDate).toISOString(),
        endDate: new Date(bookingData.endDate).toISOString(),
        totalPrice: calculateTotalPrice(),
        notes: bookingData.notes,
        phoneNumber: bookingData.phoneNumber
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingPayload),
      })

      if (response.ok) {
        toast({
          title: 'Booking Requested',
          description: `Your ${type} booking request has been submitted successfully. We'll contact you soon to confirm the details.`,
        })
        
        // Reset form
        setBookingData({
          startDate: '',
          endDate: '',
          notes: '',
          phoneNumber: ''
        })
        
        onRefresh?.()
      } else {
        console.log('Response not ok, status:', response.status)
        const errorData = await response.json()
        console.log('Error data received:', errorData)
        let errorMessage = 'Failed to submit booking request. Please try again.'
        
        // Handle validation errors specifically
        if (response.status === 400 && errorData.message) {
          console.log('Processing 400 error with message:', errorData.message)
          if (errorData.message.includes('Invalid start date format') || errorData.message.includes('Invalid end date format')) {
            errorMessage = 'Please select valid start and end dates.'
          } else if (errorData.message.includes('phone')) {
            errorMessage = 'Please enter a valid phone number.'
          } else if (errorData.message.includes('Brokerage not available')) {
            errorMessage = 'This service is currently unavailable or no longer exists. Please try a different service.'
          } else if (errorData.message.includes('Equipment not available')) {
            errorMessage = 'This equipment is currently unavailable or no longer exists. Please try different equipment.'
          } else if (errorData.message.includes('already booked')) {
            errorMessage = 'This item is already booked for the selected dates. Please choose different dates.'
          } else {
            errorMessage = errorData.message
          }
        }
        
        console.log('About to show toast with message:', errorMessage)
        toast({
          title: 'Booking Failed',
          description: errorMessage,
          variant: 'destructive',
        })
        console.log('Toast called')
      }
    } catch (error) {
      console.error('Booking error:', error)
      toast({
        title: 'Booking Failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setBookingLoading(false)
    }
  }

  const isFormValid = () => {
    return bookingData.startDate && bookingData.endDate && bookingData.phoneNumber
  }

  const relatedItems = type === 'equipment' ? item.relatedEquipment : item.relatedBrokerage

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link href={backUrl}>
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {type === 'equipment' ? 'Equipment' : 'Brokerage'}
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-effect rounded-lg shadow-md overflow-hidden mb-6"
            >
              <div className="relative h-96">
                <Image
                  src={item.images[selectedImage] || `/placeholder-${type}.jpg`}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge variant={item.available ? 'default' : 'secondary'}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
                <div className="absolute top-4 left-4">
                  <Badge variant="outline" className="bg-white/90">
                    {type === 'brokerage' && <Building className="h-3 w-3 mr-1" />}
                    {item.category.name}
                  </Badge>
                </div>
              </div>
              {item.images.length > 1 && (
                <div className="p-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {item.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                          selectedImage === index ? 'border-primary' : 'border-border'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${item.title} ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Item Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl mb-2">{item.title}</CardTitle>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold text-primary text-lg">
                            {formatPrice(item.price, item.priceType)}
                          </span>
                        </div>
                        {item.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{item.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">
                        {type === 'equipment' ? 'Description' : 'Service Description'}
                      </h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>

                    {item.features.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">
                          {type === 'equipment' ? 'Features' : 'Service Features'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {item.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-primary" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Book This Service
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Date Inputs */}
                  <div>
                    <Label htmlFor="startDate">Service Start Date</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={bookingData.startDate}
                      onChange={(e) => setBookingData(prev => ({ ...prev, startDate: e.target.value }))}
                      min={new Date().toISOString().slice(0, 16)}
                      disabled={!item.available || !user || authLoading}
                      placeholder={!user ? "Login to select date" : "Select start date"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Service End Date</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={bookingData.endDate}
                      onChange={(e) => setBookingData(prev => ({ ...prev, endDate: e.target.value }))}
                      min={bookingData.startDate || new Date().toISOString().slice(0, 16)}
                      disabled={!item.available || !user || authLoading}
                      placeholder={!user ? "Login to select date" : "Select end date"}
                    />
                  </div>

                  {/* Phone Input */}
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={bookingData.phoneNumber}
                      onChange={(e) => setBookingData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder={!user ? "Login to enter phone" : "Enter your phone number"}
                      disabled={!item.available || !user || authLoading}
                      required
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes">Service Requirements (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder={
                        !user 
                          ? "Login to add notes" 
                          : "Describe your specific requirements or any special instructions..."
                      }
                      value={bookingData.notes}
                      onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                      disabled={!item.available || !user || authLoading}
                      rows={4}
                    />
                  </div>
                  
                  {/* Total Price */}
                  {bookingData.startDate && bookingData.endDate && (
                    <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-primary">Total Price:</span>
                        <span className="text-lg font-bold text-primary">
                          ${calculateTotalPrice().toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Why Choose Our Service */}
                  <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                    <h3 className="font-semibold mb-2 text-primary">Why Choose Our Service?</h3>
                    <ul className="text-sm text-primary/80 space-y-1">
                      <li>• Professional and experienced team</li>
                      <li>• Competitive pricing and transparent fees</li>
                      <li>• 24/7 customer support</li>
                      <li>• Secure and reliable service</li>
                    </ul>
                  </div>

                  {/* Booking Button */}
                  <Button
                    onClick={handleBooking}
                    disabled={
                      !item.available || 
                      bookingLoading || 
                      authLoading || 
                      (!user && !authLoading) || 
                      !isFormValid()
                    }
                    className="w-full"
                  >
                    {authLoading ? 'Loading...' : 
                     !user ? 'Login to Book' :
                     bookingLoading ? 'Booking...' : 
                     item.available ? 'Request Service' : 'Unavailable'
                    }
                  </Button>

                  {/* Login Link */}
                  {!authLoading && !user && (
                    <div className="text-sm text-muted-foreground text-center">
                      <span>Don't have an account? </span>
                      <Link href="/auth/register" className="text-primary hover:underline">
                        Sign up here
                      </Link>
                    </div>
                  )}

                  {/* Trust Indicators */}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      <span>Secure booking process</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Professional consultation</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>Dedicated account manager</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Similar Items */}
         <SimilarItems 
           items={similarItems} 
           type={type} 
         />
      </div>
    </div>
  )
}