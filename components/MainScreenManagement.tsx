'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Input } from './ui/input'
import { toast } from 'sonner'
import { MainContent } from '@/types'
import { Trash2 } from 'lucide-react'
import { PLACEHOLDER_IMAGE } from '@/lib/constants'

export default function MainScreenManagement() {
  const [content, setContent] = useState<MainContent | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    big_title: '',
    paragraph: '',
    button_text: '',
    hero_image: null as File | null,
    imagePreview: null as string | null,
  })

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('main_content')
        .select('*')
        .single()

      if (error) throw error
      
      if (data) {
        setContent(data)
        setFormData({
          big_title: data.big_title,
          paragraph: data.paragraph,
          button_text: data.button_text,
          hero_image: null,
          imagePreview: data.hero_image || null,
        })
      }
    } catch (error) {
      console.error('Error loading content:', error)
      toast.error('Failed to load content')
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, or WebP)')
      return
    }

    try {
      const preview = URL.createObjectURL(file)
      setFormData(prev => ({
        ...prev,
        hero_image: file,
        imagePreview: preview
      }))
    } catch (error) {
      console.error('Error handling image:', error)
      toast.error('Failed to process image')
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      hero_image: null,
      imagePreview: null
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let hero_image = content?.hero_image

      if (formData.hero_image) {
        // Create a unique filename
        const fileExt = formData.hero_image.name.split('.').pop()
        const fileName = `hero-${Date.now()}.${fileExt}`
        
        // Upload to hero bucket
        const { error: uploadError } = await supabase.storage
          .from('hero')
          .upload(`images/${fileName}`, formData.hero_image, {
            cacheControl: '3600',
            upsert: true
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw new Error('Failed to upload image')
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('hero')
          .getPublicUrl(`images/${fileName}`)

        hero_image = publicUrl
      }

      // Update main content
      const { error: updateError } = await supabase
        .from('main_content')
        .upsert({
          id: content?.id || undefined,
          big_title: formData.big_title,
          paragraph: formData.paragraph,
          button_text: formData.button_text,
          hero_image: formData.imagePreview === null ? null : (hero_image || content?.hero_image),
        })

      if (updateError) {
        console.error('Update error:', updateError)
        throw new Error('Failed to update content')
      }

      toast.success('Main screen content updated successfully')
      await loadContent()
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update content')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-100 mb-4">
          Edit Main Screen Content
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Hero Image
            </label>
            <div className="space-y-4">
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="bg-gray-700 border-gray-600 text-gray-100"
                onChange={handleImageChange}
              />
              {formData.imagePreview && (
                <div className="relative">
                  <img
                    src={formData.imagePreview}
                    alt="Hero Preview"
                    className="w-full max-w-md h-48 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = PLACEHOLDER_IMAGE
                    }}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Big Title
            </label>
            <Textarea
              className="bg-gray-700 border-gray-600 text-gray-100"
              placeholder="Enter main title"
              value={formData.big_title}
              onChange={(e) => setFormData({ ...formData, big_title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Paragraph
            </label>
            <Textarea
              className="bg-gray-700 border-gray-600 text-gray-100"
              placeholder="Enter paragraph text"
              value={formData.paragraph}
              onChange={(e) => setFormData({ ...formData, paragraph: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Button Text
            </label>
            <Textarea
              className="bg-gray-700 border-gray-600 text-gray-100"
              placeholder="Enter button text"
              value={formData.button_text}
              onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? 'Updating...' : 'Update Content'}
          </Button>
        </form>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-100 mb-4">
          Preview
        </h3>
        <div className="prose prose-invert">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-2xl font-bold">{formData.big_title}</h1>
              <p className="text-gray-300">{formData.paragraph}</p>
              <div className="mt-4">
                <Button className="bg-purple-600">{formData.button_text}</Button>
              </div>
            </div>
            <div>
              {formData.imagePreview ? (
                <img
                  src={formData.imagePreview}
                  alt="Hero Preview"
                  className="w-full rounded-lg shadow-xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = PLACEHOLDER_IMAGE
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gray-700 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400">No image selected</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 