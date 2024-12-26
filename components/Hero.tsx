'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { PLACEHOLDER_IMAGE } from '@/lib/constants'
import { MainContent } from '@/types'

export default function Hero() {
  const [content, setContent] = useState<MainContent>({
    id: 'default',
    big_title: 'Discover the Future of Tech',
    paragraph: 'Experience cutting-edge technology that transforms your daily life.',
    button_text: 'Explore Now',
    created_at: new Date().toISOString(),
    hero_image: undefined
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadContent()

    // Subscribe to changes
    const channel = supabase
      .channel('main_content_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'main_content'
        },
        () => {
          loadContent()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadContent = async () => {
    try {
      setIsLoading(true)
      const { data } = await supabase
        .from('main_content')
        .select('*')
        .single()

      if (data) {
        setContent(data)
      }
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="bg-gradient-to-b from-gray-900 via-[#2D1B69] to-[#5B2A86] text-gray-100 py-20">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
            {content.big_title}
          </h1>
          <p className="text-xl mb-6 text-gray-300 animate-fade-in">
            {content.paragraph}
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="bg-purple-500 hover:bg-purple-600 text-white animate-fade-in"
          >
            {content.button_text}
          </Button>
        </div>
        <div className="md:w-1/2">
          {isLoading ? (
            <div className="w-full aspect-[4/3] bg-gray-800 rounded-lg animate-pulse" />
          ) : (
            <img
              src={content.hero_image || PLACEHOLDER_IMAGE}
              alt="Hero Image"
              className="w-full rounded-lg shadow-xl transition-opacity duration-300 animate-fade-in"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = PLACEHOLDER_IMAGE
              }}
            />
          )}
        </div>
      </div>
    </section>
  )
}

