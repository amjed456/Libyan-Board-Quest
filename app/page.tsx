import Hero from '@/components/Hero'
import ProductGrid from '@/components/ProductGrid'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'
import ColorTransition from '@/components/ColorTransition'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <main className="flex flex-col">
        <Hero />
        <ColorTransition />
        <ProductGrid />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

