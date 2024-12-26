'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PLACEHOLDER_IMAGE } from '@/lib/constants'
import { ImageOff } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  image_url?: string
}

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const { addToCart } = useCart()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
    checkAuth()

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
      if (!session) {
        // Force router refresh when user signs out
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error loading products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setIsAuthenticated(!!session)
  }

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart')
      router.push('/auth/signin')
      return
    }

    addToCart(product)
    toast.success('Added to cart')
  }

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-[#5B2A86] via-[#2D1B69] to-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-100">Our Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-700" />
                <div className="p-4">
                  <div className="h-6 bg-gray-700 rounded mb-2" />
                  <div className="h-4 bg-gray-700 rounded w-24 mb-4" />
                  <div className="h-10 bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-b from-[#5B2A86] via-[#2D1B69] to-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-100">Our Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
          {products.map((product) => (
            <div key={product.id} className="bg-gray-800 rounded-lg overflow-hidden transition-transform hover:scale-105 group">
              <div className="relative h-48">
                <img 
                  src={product.image_url || PLACEHOLDER_IMAGE} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = PLACEHOLDER_IMAGE
                  }}
                />
                {!product.image_url && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                    <ImageOff className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button 
                    variant="secondary" 
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                    onClick={() => router.push(`/products/${product.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2 text-gray-100">{product.name}</h3>
                <p className="text-purple-400 mb-4">${product.price.toFixed(2)}</p>
                <Button 
                  variant="outline" 
                  className="w-full relative overflow-hidden group/button bg-purple-600 text-white border-none hover:bg-purple-700 transition-all duration-300 ease-out"
                  onClick={() => handleAddToCart(product)}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-700 opacity-0 group-hover/button:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center justify-center gap-2">
                    {isAuthenticated ? (
                      <>
                        <span>Add to Cart</span>
                        <svg 
                          className="w-5 h-5 transform translate-x-0 group-hover/button:translate-x-1 transition-transform duration-300" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M16 11l-4-4m0 0l-4 4m4-4v14"
                          />
                        </svg>
                      </>
                    ) : (
                      <>
                        <span>Sign in to Buy</span>
                        <svg 
                          className="w-5 h-5 transform translate-x-0 group-hover/button:translate-x-1 transition-transform duration-300" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M11 16l-4-4m0 0l4-4m-4 4h14"
                          />
                        </svg>
                      </>
                    )}
                  </span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

