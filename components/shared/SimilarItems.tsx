'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DollarSign, MapPin, Star } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface SimilarItem {
  id: string
  title: string
  description: string
  price: number
  priceType: string
  images: string[]
  available: boolean
  location?: string
  category: {
    name: string
  }
  rating?: number
}

interface SimilarItemsProps {
  items: SimilarItem[]
  type: 'equipment' | 'brokerage'
  title?: string
}

export function SimilarItems({ items, type, title }: SimilarItemsProps) {
  const formatPrice = (price: number, priceType: string) => {
    return `$${price.toLocaleString()}/${priceType.toLowerCase()}`
  }

  if (!items || items.length === 0) {
    return null
  }

  const defaultTitle = `Similar ${type === 'equipment' ? 'Equipment' : 'Services'}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-16"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          {title || defaultTitle}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover more {type === 'equipment' ? 'equipment options' : 'services'} that might interest you
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <CardHeader className="p-0 relative">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={item.images[0] || `/placeholder-${type}.jpg`}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  
                  {/* Availability Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge 
                      variant={item.available ? 'default' : 'secondary'}
                      className="shadow-md"
                    >
                      {item.available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
                      {item.category.name}
                    </Badge>
                  </div>
                  
                  {/* Rating (if available) */}
                  {item.rating && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{item.rating}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-4 space-y-3">
                {/* Title */}
                <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                
                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
                
                {/* Location */}
                {item.location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{item.location}</span>
                  </div>
                )}
                
                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="font-bold text-primary text-lg">
                      {formatPrice(item.price, item.priceType)}
                    </span>
                  </div>
                </div>
                
                {/* Action Button */}
                <div className="pt-2">
                  <Link href={`/${type}/${item.id}`} className="block">
                    <Button 
                      variant="outline" 
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      disabled={!item.available}
                    >
                      {item.available ? 'View Details' : 'Unavailable'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* View All Button */}
      <div className="text-center mt-8">
        <Link href={`/${type}`}>
          <Button variant="outline" size="lg" className="px-8">
            View All {type === 'equipment' ? 'Equipment' : 'Services'}
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}