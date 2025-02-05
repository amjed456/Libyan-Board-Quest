'use client'

import { useCart } from '@/contexts/CartContext'
import { Button } from './ui/button'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { PLACEHOLDER_IMAGE } from '@/lib/constants'

interface CartDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDropdown({ isOpen, onClose }: CartDropdownProps) {
  const { cartItems, removeFromCart, updateQuantity } = useCart()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.cart-dropdown') && !target.closest('.cart-button')) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  if (!isAuthenticated) {
    return (
      <div className="fixed sm:absolute top-16 sm:top-auto left-4 right-4 sm:right-0 sm:left-auto bg-white rounded-lg shadow-xl z-50">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Shopping Cart</h3>
          <p className="text-gray-500 mb-4">Please sign in to view your cart</p>
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => router.push('/auth/signin')}
          >
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <div className="cart-dropdown fixed sm:absolute top-16 sm:top-auto left-4 right-4 sm:right-0 sm:left-auto bg-white rounded-lg shadow-xl z-50">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Shopping Cart</h3>
        {cartItems.length === 0 ? (
          <p className="text-gray-500">Your cart is empty</p>
        ) : (
          <>
            <div className="max-h-[60vh] overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-4 border-b">
                  {item.image_url && (
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <img
                        src={item.image_url || PLACEHOLDER_IMAGE}
                        alt={item.name}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = PLACEHOLDER_IMAGE
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.name}</h4>
                    <p className="text-sm text-gray-500">
                      ${item.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, 'decrease')}
                      className="h-8 w-8"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, 'increase')}
                      className="h-8 w-8"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between font-semibold mb-4">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                Checkout
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 