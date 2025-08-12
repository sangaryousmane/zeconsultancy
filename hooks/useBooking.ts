'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Booking, BookingFormData, ApiResponse } from '@/lib/types'
import { BOOKING_STATUS, API_ENDPOINTS } from '@/lib/constants'
import { logger } from '@/lib/logger'

interface UseBookingOptions {
  onSuccess?: (booking: Booking) => void
  onError?: (error: string) => void
  redirectOnSuccess?: boolean
}

interface UseBookingReturn {
  // State
  booking: Booking | null
  bookings: Booking[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  
  // Actions
  createBooking: (data: BookingFormData) => Promise<void>
  updateBooking: (id: string, data: Partial<BookingFormData>) => Promise<void>
  cancelBooking: (id: string, reason?: string) => Promise<void>
  fetchBooking: (id: string) => Promise<void>
  fetchBookings: (filters?: Record<string, any>) => Promise<void>
  calculateTotalPrice: (startDate: Date, endDate: Date, dailyPrice: number) => number
  validateBookingDates: (startDate: Date, endDate: Date, existingBookings?: Booking[]) => string | null
  
  // Utilities
  clearError: () => void
  reset: () => void
}

export function useBooking(options: UseBookingOptions = {}): UseBookingReturn {
  const { onSuccess, onError, redirectOnSuccess = true } = options
  const router = useRouter()
  
  // State
  const [booking, setBooking] = useState<Booking | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Reset state
  const reset = useCallback(() => {
    setBooking(null)
    setBookings([])
    setIsLoading(false)
    setIsSubmitting(false)
    setError(null)
  }, [])

  // Calculate total price
  const calculateTotalPrice = useCallback((startDate: Date, endDate: Date, dailyPrice: number): number => {
    const timeDiff = endDate.getTime() - startDate.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    return Math.max(1, daysDiff) * dailyPrice
  }, [])

  // Validate booking dates
  const validateBookingDates = useCallback((startDate: Date, endDate: Date, existingBookings: Booking[] = []): string | null => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    
    // Check if start date is in the future
    if (startDate < now) {
      return 'Start date must be today or in the future'
    }
    
    // Check if end date is after start date
    if (endDate <= startDate) {
      return 'End date must be after start date'
    }
    
    // Check for conflicts with existing bookings
    const hasConflict = existingBookings.some(booking => {
      if (booking.status === BOOKING_STATUS.CANCELLED) {
        return false
      }
      
      const bookingStart = new Date(booking.startDate)
      const bookingEnd = new Date(booking.endDate)
      
      return (
        (startDate >= bookingStart && startDate < bookingEnd) ||
        (endDate > bookingStart && endDate <= bookingEnd) ||
        (startDate <= bookingStart && endDate >= bookingEnd)
      )
    })
    
    if (hasConflict) {
      return 'Selected dates conflict with existing bookings'
    }
    
    return null
  }, [])

  // Create booking
  const createBooking = useCallback(async (data: BookingFormData) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      logger.logBusiness('Creating booking', { data })
      
      const response = await fetch(API_ENDPOINTS.BOOKINGS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      const result: ApiResponse<Booking> = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create booking')
      }
      
      const newBooking = result.data!
      setBooking(newBooking)
      
      logger.logBusiness('Booking created successfully', { bookingId: newBooking.id })
      
      toast.success('Booking created successfully!')
      
      if (onSuccess) {
        onSuccess(newBooking)
      }
      
      if (redirectOnSuccess) {
        router.push(`/bookings/${newBooking.id}`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking'
      setError(errorMessage)
      
      logger.error('Failed to create booking', err as Error, { data })
      
      toast.error(errorMessage)
      
      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [onSuccess, onError, redirectOnSuccess, router])

  // Update booking
  const updateBooking = useCallback(async (id: string, data: Partial<BookingFormData>) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      logger.logBusiness('Updating booking', { bookingId: id, data })
      
      const response = await fetch(`${API_ENDPOINTS.BOOKINGS}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      const result: ApiResponse<Booking> = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update booking')
      }
      
      const updatedBooking = result.data!
      setBooking(updatedBooking)
      
      // Update in bookings list if present
      setBookings(prev => prev.map(b => b.id === id ? updatedBooking : b))
      
      logger.logBusiness('Booking updated successfully', { bookingId: id })
      
      toast.success('Booking updated successfully!')
      
      if (onSuccess) {
        onSuccess(updatedBooking)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update booking'
      setError(errorMessage)
      
      logger.error('Failed to update booking', err as Error, { bookingId: id, data })
      
      toast.error(errorMessage)
      
      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [onSuccess, onError])

  // Cancel booking
  const cancelBooking = useCallback(async (id: string, reason?: string) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      logger.logBusiness('Cancelling booking', { bookingId: id, reason })
      
      const response = await fetch(`${API_ENDPOINTS.BOOKINGS}/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      })
      
      const result: ApiResponse<Booking> = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel booking')
      }
      
      const cancelledBooking = result.data!
      setBooking(cancelledBooking)
      
      // Update in bookings list if present
      setBookings(prev => prev.map(b => b.id === id ? cancelledBooking : b))
      
      logger.logBusiness('Booking cancelled successfully', { bookingId: id })
      
      toast.success('Booking cancelled successfully!')
      
      if (onSuccess) {
        onSuccess(cancelledBooking)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel booking'
      setError(errorMessage)
      
      logger.error('Failed to cancel booking', err as Error, { bookingId: id, reason })
      
      toast.error(errorMessage)
      
      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [onSuccess, onError])

  // Fetch single booking
  const fetchBooking = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_ENDPOINTS.BOOKINGS}/${id}`)
      const result: ApiResponse<Booking> = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch booking')
      }
      
      setBooking(result.data!)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch booking'
      setError(errorMessage)
      
      logger.error('Failed to fetch booking', err as Error, { bookingId: id })
      
      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }, [onError])

  // Fetch bookings list
  const fetchBookings = useCallback(async (filters: Record<string, any> = {}) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const searchParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      
      const url = `${API_ENDPOINTS.BOOKINGS}?${searchParams.toString()}`
      const response = await fetch(url)
      const result: ApiResponse<Booking[]> = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch bookings')
      }
      
      setBookings(result.data!)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bookings'
      setError(errorMessage)
      
      logger.error('Failed to fetch bookings', err as Error, { filters })
      
      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }, [onError])

  return {
    // State
    booking,
    bookings,
    isLoading,
    isSubmitting,
    error,
    
    // Actions
    createBooking,
    updateBooking,
    cancelBooking,
    fetchBooking,
    fetchBookings,
    calculateTotalPrice,
    validateBookingDates,
    
    // Utilities
    clearError,
    reset,
  }
}

// Hook for booking form state management
export function useBookingForm(initialData?: Partial<BookingFormData>) {
  const [formData, setFormData] = useState<BookingFormData>({
    equipmentId: initialData?.equipmentId || undefined,
    brokerageId: initialData?.brokerageId || undefined,
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    totalPrice: initialData?.totalPrice || 0,
    notes: initialData?.notes || '',
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const updateField = useCallback((field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [errors])
  
  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }))
  }, [])
  
  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])
  
  const resetForm = useCallback(() => {
    setFormData({
      equipmentId: initialData?.equipmentId || undefined,
      brokerageId: initialData?.brokerageId || undefined,
      startDate: initialData?.startDate || '',
      endDate: initialData?.endDate || '',
      totalPrice: initialData?.totalPrice || 0,
      notes: initialData?.notes || '',
    })
    setErrors({})
  }, [initialData])
  
  const isValid = Object.keys(errors).length === 0 && 
    formData.startDate && 
    formData.endDate && 
    formData.totalPrice > 0 && 
    (formData.equipmentId || formData.brokerageId)
  
  return {
    formData,
    errors,
    isValid,
    updateField,
    setFieldError,
    clearErrors,
    resetForm,
  }
}