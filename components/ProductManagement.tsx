'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { toast } from 'sonner'
import { Pencil, Trash2 } from 'lucide-react'
import { PLACEHOLDER_IMAGE } from '@/lib/constants'

interface Product {
  id: string
  name: string
  price: number
  image_url?: string
  description?: string
}

function validateImageFile(file: File) {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload JPG, PNG, or WebP images only.')
  }

  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 5MB.')
  }

  return true
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: null as File | null,
    imagePreview: null as string | null,
  })

  useEffect(() => {
    loadProducts()

    // Subscribe to changes
    const channel = supabase
      .channel('product-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          loadProducts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error loading products:', error)
      toast.error('Failed to load products')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrl = editingProduct?.image_url

      if (formData.image) {
        // Create a unique filename
        const fileExt = formData.image.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        
        // Upload to product-images folder
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(`product-images/${fileName}`, formData.image, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw uploadError
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(`product-images/${fileName}`)

        imageUrl = publicUrl
      }

      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        image_url: imageUrl,
      }

      if (editingProduct) {
        // Handle update
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)

        if (error) throw error
        toast.success('Product updated successfully')
      } else {
        // Handle insert
        const { error } = await supabase
          .from('products')
          .insert([productData])

        if (error) throw error
        toast.success('Product added successfully')
      }

      // Reset form
      setFormData({ name: '', price: '', description: '', image: null, imagePreview: null })
      setEditingProduct(null)
      await loadProducts() // Reload products list
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (product: Product) => {
    try {
      // Delete image from storage if exists
      if (product.image_url) {
        const imagePath = product.image_url.split('/').pop()
        if (imagePath) {
          await supabase.storage
            .from('products')
            .remove([`product-images/${imagePath}`])
        }
      }

      // Delete product from database
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)

      if (error) throw error
      toast.success('Product deleted successfully')
      loadProducts()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to delete product')
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      validateImageFile(file)
      
      // Show preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ 
          ...prev, 
          image: file,
          imagePreview: reader.result as string 
        }))
      }
      reader.readAsDataURL(file)
    } catch (error) {
      // Type guard for Error instances
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('An error occurred while processing the image')
      }
      e.target.value = '' // Reset input
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-100 mb-4">
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Product Name
            </label>
            <Input
              required
              className="bg-gray-700 border-gray-600 text-gray-100"
              placeholder="Enter product name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Price
            </label>
            <Input
              required
              type="number"
              step="0.01"
              min="0"
              className="bg-gray-700 border-gray-600 text-gray-100"
              placeholder="Enter price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <Textarea
              className="bg-gray-700 border-gray-600 text-gray-100 min-h-[100px]"
              placeholder="Enter product description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Image {loading && '(Uploading...)'}
            </label>
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="bg-gray-700 border-gray-600 text-gray-100"
                onChange={handleImageChange}
                disabled={loading}
              />
              {formData.imagePreview && (
                <div className="relative w-32 h-32">
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = PLACEHOLDER_IMAGE
                    }}
                  />
                </div>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-400">
              Supported formats: JPG, PNG, WebP
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white relative"
            >
              {loading ? (
                <>
                  <span className="opacity-0">Add Product</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                </>
              ) : (
                editingProduct ? 'Update Product' : 'Add Product'
              )}
            </Button>
            {editingProduct && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingProduct(null)
                  setFormData({ name: '', price: '', description: '', image: null, imagePreview: null })
                }}
              >
                Cancel Edit
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-100 mb-4">
          Manage Products
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-gray-700 rounded-lg p-4">
              {product.image_url && (
                <div className="relative h-40 mb-4">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = PLACEHOLDER_IMAGE
                    }}
                  />
                </div>
              )}
              <h4 className="text-gray-100 font-medium">{product.name}</h4>
              <p className="text-gray-300">${product.price.toFixed(2)}</p>
              <p className="text-gray-400 text-sm mt-2 line-clamp-2">{product.description}</p>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingProduct(product)
                    setFormData({
                      name: product.name,
                      price: product.price.toString(),
                      description: product.description || '',
                      image: null,
                      imagePreview: null,
                    })
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(product)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 