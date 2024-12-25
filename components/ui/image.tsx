'use client'

import { useState } from 'react'
import NextImage from 'next/image'
import { cn } from '@/lib/utils'
import { PLACEHOLDER_IMAGE } from '@/lib/constants'

interface CustomImageProps extends React.ComponentProps<typeof NextImage> {
  wrapperClassName?: string
}

export function Image({ wrapperClassName, className, src, alt, ...props }: CustomImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  return (
    <div className={cn('relative overflow-hidden', wrapperClassName)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse" />
      )}
      <NextImage
        className={cn(
          'duration-700 ease-in-out',
          isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0',
          className
        )}
        src={error ? PLACEHOLDER_IMAGE : src}
        alt={alt}
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => {
          setError(true)
          setIsLoading(false)
        }}
        {...props}
      />
    </div>
  )
} 