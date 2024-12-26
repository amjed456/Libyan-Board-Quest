'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { PLACEHOLDER_IMAGE } from '@/lib/constants'

interface Product {
  id: string
  name: string
  price: number
  image_url?: string
  description?: string
}

export default function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { addToCart } = useCart()
  const router = useRouter()

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setIsAuthenticated(!!session)

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', resolvedParams.id)
          .single()

        if (error) throw error
        setProduct(data)
      } catch (error) {
        console.error('Error loading product:', error)
        toast.error('Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [resolvedParams.id])

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart')
      router.push('/auth/signin')
      return
    }

    if (product) {
      addToCart(product)
      toast.success('Added to cart')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#5B2A86] via-[#2D1B69] to-gray-900 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-700 rounded-lg mb-8" />
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-4" />
            <div className="h-6 bg-gray-700 rounded w-1/4 mb-8" />
            <div className="h-px bg-gray-700 mb-8" />
            <div className="h-32 bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#5B2A86] via-[#2D1B69] to-gray-900 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center text-gray-100">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link href="/" className="text-purple-400 hover:text-purple-300">
            Return to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#5B2A86] via-[#2D1B69] to-gray-900 py-6 sm:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-purple-400 hover:text-purple-300">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 sm:p-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-8">
            <div className="flex flex-col items-center">
              <div className="relative h-96 w-full mb-4">
                <img
                  src={product.image_url || PLACEHOLDER_IMAGE}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = PLACEHOLDER_IMAGE
                  }}
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-100 text-center">{product.name}</h1>
            </div>
            
            <div className="flex flex-col justify-between items-center">
              <div className="w-full flex flex-col items-center">
                <div className="text-3xl font-bold text-purple-400 mb-4 text-center">
                  ${product.price.toFixed(2)}
                </div>
                <Button
                  onClick={handleAddToCart}
                  className="w-full max-w-md bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300"
                >
                  {isAuthenticated ? 'Add to Cart' : 'Sign in to Buy'}
                </Button>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-700 mb-8" />

          <div className="prose prose-invert max-w-none text-center">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Product Description</h2>
            <p className="text-gray-300">
              {product.description || 'No description available.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 