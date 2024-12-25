'use client'

import { useEffect, useRef } from 'react'

export default function ColorTransition() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = 100 // Reduced height for a more compact transition

    let gradientPosition = 0

    const animate = () => {
      gradientPosition += 0.3 // Reduced speed for smoother animation
      if (gradientPosition > canvas.width) gradientPosition = 0

      const gradient = ctx.createLinearGradient(gradientPosition, 0, gradientPosition + canvas.width, 0)
      gradient.addColorStop(0, '#2D1B69')  // Dark indigo
      gradient.addColorStop(0.25, '#5B2A86') // Purple
      gradient.addColorStop(0.5, '#7A2E9E')  // Violet
      gradient.addColorStop(0.75, '#5B2A86') // Purple
      gradient.addColorStop(1, '#2D1B69')  // Dark indigo

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-[100px]"
      aria-hidden="true"
    />
  )
}

