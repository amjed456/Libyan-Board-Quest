'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from './ui/button'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useCart } from '@/contexts/CartContext'
import CartDropdown from './CartDropdown'

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { cartCount } = useCart()
  const cartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Check if user is admin
          const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (!adminError && adminData) {
            setIsAdmin(true)
          }
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          setUser(session?.user ?? null)
          if (session?.user) {
            const { data: adminData, error: adminError } = await supabase
              .from('admin_users')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            setIsAdmin(!adminError && !!adminData)
          } else {
            setIsAdmin(false)
          }
        })

        return () => subscription.unsubscribe()
      } catch (error) {
        console.error('Error checking auth status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Error signing out')
    } else {
      router.push('/')
      router.refresh()
    }
  }

  // Close cart when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsCartOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="bg-gray-800 shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-gray-100">
            Libyan Board Quest
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
                <span className="text-sm sm:text-base text-gray-300">{user.user_metadata.username}</span>
                {isAdmin && (
                  <Link href="/admin">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-base">
                      Admin Panel
                    </Button>
                  </Link>
                )}
                <Button 
                  onClick={handleSignOut}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-base"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/auth/signin">
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-base"
                >
                  Sign In
                </Button>
              </Link>
            )}
            <div className="relative" ref={cartRef}>
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="cart-button relative p-2 text-gray-100 hover:text-purple-400 transition-colors"
              >
                <ShoppingCart className="w-6 h-6 text-gray-300" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-scale">
                    {cartCount}
                  </span>
                )}
              </button>
              <CartDropdown isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

