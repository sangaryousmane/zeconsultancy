'use client'

import { useState, useEffect } from 'react'
import { DetailPage } from './DetailPage'

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

interface DetailPageWrapperProps {
  item: DetailItem
  type: 'equipment' | 'brokerage'
  backUrl: string
  similarItems?: any[]
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

export function DetailPageWrapper({ item, type, backUrl, similarItems = [] }: DetailPageWrapperProps) {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
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
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleRefresh = () => {
    checkAuthStatus()
  }

  return (
    <DetailPage
      item={item}
      type={type}
      backUrl={backUrl}
      user={user}
      authLoading={authLoading}
      onRefresh={handleRefresh}
      similarItems={similarItems}
    />
  )
}