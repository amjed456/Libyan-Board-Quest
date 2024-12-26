'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { addNewAdmin } from '@/app/actions/admin'
import ProductManagement from '@/components/ProductManagement'
import MainScreenManagement from '@/components/MainScreenManagement'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'admins' | 'products' | 'mainscreen'>('admins')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/')
        return
      }

      const { data: adminData } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (!adminData) {
        router.push('/')
        return
      }

      setIsAdmin(true)
    }

    checkAdminStatus()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await addNewAdmin(email)

      if (result.error) {
        console.error('Admin creation error:', result.error)
        toast.error(result.error)
      } else {
        toast.success('Admin user added successfully')
        setEmail('')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to add admin user')
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-gray-900 py-6 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-purple-400 hover:text-purple-300">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-100 mb-8">
          Admin Panel
        </h2>

        <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-8">
          <Button
            onClick={() => setActiveTab('admins')}
            className={`text-sm sm:text-base ${activeTab === 'admins' ? 'bg-purple-600' : 'bg-gray-700'}`}
          >
            Manage Admins
          </Button>
          <Button
            onClick={() => setActiveTab('products')}
            className={`text-sm sm:text-base ${activeTab === 'products' ? 'bg-purple-600' : 'bg-gray-700'}`}
          >
            Manage Products
          </Button>
          <Button
            onClick={() => setActiveTab('mainscreen')}
            className={`text-sm sm:text-base ${activeTab === 'mainscreen' ? 'bg-purple-600' : 'bg-gray-700'}`}
          >
            Main Screen
          </Button>
        </div>

        {activeTab === 'admins' ? (
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Add New Admin</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-gray-100 bg-gray-800 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="User's email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="mt-2 text-sm text-gray-400">
                  User must have signed up before they can be made an admin
                </p>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {loading ? 'Adding...' : 'Add Admin'}
              </Button>
            </form>
          </div>
        ) : activeTab === 'products' ? (
          <ProductManagement />
        ) : (
          <MainScreenManagement />
        )}
      </div>
    </div>
  )
} 