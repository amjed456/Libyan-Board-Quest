'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image_url?: string
  description?: string
}

interface Product {
  id: string
  name: string
  price: number
  image_url?: string
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, change: 'increase' | 'decrease') => void
  cartCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartCount, setCartCount] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
      
      if (!session) {
        setCartItems([])
        localStorage.removeItem('cart_temp')
      } else {
        const storedCart = localStorage.getItem(`cart_${session.user.id}`)
        if (storedCart) {
          setCartItems(JSON.parse(storedCart))
        }
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
      if (!session) {
        setCartItems([])
        localStorage.removeItem('cart_temp')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const saveCart = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        localStorage.setItem(`cart_${session.user.id}`, JSON.stringify(cartItems))
      }
    }

    saveCart()
  }, [cartItems])

  useEffect(() => {
    // Update cart count whenever items change
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    setCartCount(count)
  }, [cartItems])

  const addToCart = (product: Product) => {
    if (!isAuthenticated) {
      return
    }

    setCartItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === product.id)
      
      if (existingItem) {
        return currentItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...currentItems, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCartItems(currentItems => 
      currentItems.filter(item => item.id !== productId)
    )
  }

  const updateQuantity = (productId: string, change: 'increase' | 'decrease') => {
    setCartItems(currentItems =>
      currentItems.map(item => {
        if (item.id !== productId) return item

        const newQuantity = change === 'increase' 
          ? item.quantity + 1 
          : Math.max(0, item.quantity - 1)

        return newQuantity === 0
          ? null
          : { ...item, quantity: newQuantity }
      }).filter(Boolean) as CartItem[]
    )
  }

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
} 