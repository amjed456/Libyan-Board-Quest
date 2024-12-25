'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageOff } from 'lucide-react'
import { PLACEHOLDER_IMAGE } from '@/lib/constants'

interface ImageFallbackProps {
  src: string
  alt: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
}

export function ImageFallback({ 
  src, 
  alt, 
  className = '', 
  fill = false,
  width,
  height
}: ImageFallbackProps) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className="flex items-center justify-center bg-gray-700 w-full h-full">
        <ImageOff className="w-8 h-8 text-gray-400" />
      </div>
    )
  }

  return (
    <Image
      src={src || PLACEHOLDER_IMAGE}
      alt={alt}
      className={className}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      onError={() => setError(true)}
    />
  )
} 