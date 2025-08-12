'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Upload, X, Plus, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/lib/hooks/use-toast'

interface Category {
  id: string
  name: string
  type: string
}

interface User {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN'
}

interface ItemFormProps {
  type: 'EQUIPMENT' | 'BROKERAGE'
}

const ItemForm = ({ type }: ItemFormProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    priceType: type === 'EQUIPMENT' ? 'DAILY' : 'FIXED',
    categoryId: '',
    location: '',
    available: true,
    contactInfo: type === 'BROKERAGE' ? '' : undefined,
    images: [] as string[]
  })
  const [imageUrl, setImageUrl] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()

  const isEquipment = type === 'EQUIPMENT'
  const isBrokerage = type === 'BROKERAGE'
  const itemTypeName = isEquipment ? 'Equipment' : 'Brokerage Service'
  const apiEndpoint = isEquipment ? '/api/admin/equipment' : '/api/admin/brokerage'
  const backUrl = '/admin'

  useEffect(() => {
    checkAuth()
    loadCategories()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        if (data.user.role !== 'ADMIN') {
          router.push('/')
          return
        }
        setUser(data.user)
      } else {
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        const filteredCategories = data.categories.filter((cat: Category) => cat.type === type)
        setCategories(filteredCategories)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Prepare form data based on type
      const submitData = {
        ...formData,
        price: parseFloat(formData.price)
      }

      // Remove contactInfo for equipment
      if (isEquipment && 'contactInfo' in submitData) {
        delete submitData.contactInfo
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: `${itemTypeName} created successfully`
        })
        // Clear form and images
        setFormData({
          title: '',
          description: '',
          price: '',
          priceType: type === 'EQUIPMENT' ? 'DAILY' : 'FIXED',
          categoryId: '',
          location: '',
          available: true,
          contactInfo: type === 'BROKERAGE' ? '' : undefined,
          images: []
        })
        setImageUrl('')
      } else {
        const errorData = await response.json()
        toast({
          title: 'Error',
          description: errorData.error || `Failed to create ${itemTypeName.toLowerCase()}`,
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to create ${itemTypeName.toLowerCase()}`,
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please select a valid image file',
        variant: 'destructive'
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Image size must be less than 5MB',
        variant: 'destructive'
      })
      return
    }

    setUploadingImage(true)
    try {
      // Convert to base64 for now (in production, you'd upload to cloud storage)
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageDataUrl = event.target?.result as string
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, imageDataUrl]
        }))
        setUploadingImage(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive'
      })
      setUploadingImage(false)
    }
  }

  const handleAddImageUrl = () => {
    if (!imageUrl.trim()) return

    // Basic URL validation
    try {
      new URL(imageUrl)
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl.trim()]
      }))
      setImageUrl('')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Please enter a valid URL',
        variant: 'destructive'
      })
    }
  }

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 pt-24 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href={backUrl}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Add New {itemTypeName}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Create a new {itemTypeName.toLowerCase()} listing
              </p>
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder={`Enter ${itemTypeName.toLowerCase()} title`}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priceType">Price Type *</Label>
                    <Select value={formData.priceType} onValueChange={(value) => handleInputChange('priceType', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HOURLY">Per Hour</SelectItem>
                        <SelectItem value="DAILY">Per Day</SelectItem>
                        <SelectItem value="WEEKLY">Per Week</SelectItem>
                        <SelectItem value="MONTHLY">Per Month</SelectItem>
                        <SelectItem value="FIXED">Fixed Price</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Enter location"
                      required
                    />
                  </div>

                  {isBrokerage && (
                    <div className="space-y-2">
                      <Label htmlFor="contactInfo">Contact Information *</Label>
                      <Input
                        id="contactInfo"
                        value={formData.contactInfo || ''}
                        onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                        placeholder="Enter contact information"
                        required
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="available"
                      checked={formData.available}
                      onCheckedChange={(checked) => handleInputChange('available', checked)}
                    />
                    <Label htmlFor="available">Available for booking</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder={`Describe the ${itemTypeName.toLowerCase()}...`}
                    rows={4}
                    required
                  />
                </div>

                {/* Image Upload Section */}
                <div className="space-y-4">
                  <Label>Images</Label>
                  
                  {/* File Upload */}
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-slate-400" />
                      <div className="mt-4">
                        <Label htmlFor="file-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-slate-900 dark:text-slate-100">
                            Upload images
                          </span>
                          <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                            PNG, JPG, GIF up to 5MB
                          </span>
                        </Label>
                        <Input
                          id="file-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* URL Input */}
                  <div className="flex gap-2">
                    <Input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Or paste image URL"
                    />
                    <Button type="button" onClick={handleAddImageUrl} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Image Preview */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-6">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? 'Creating...' : `Create ${itemTypeName}`}
                  </Button>
                  <Link href={backUrl}>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default ItemForm