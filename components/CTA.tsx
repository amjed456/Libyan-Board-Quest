import { Button } from '@/components/ui/button'

export default function CTA() {
  return (
    <section className="bg-gradient-to-r from-purple-800 to-indigo-900 py-20 text-gray-100">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Experience the Future?</h2>
        <p className="text-xl mb-8">Join thousands of satisfied customers and transform your tech life today.</p>
        <Button size="lg" variant="secondary" className="bg-purple-500 hover:bg-purple-600 text-white">
          Get Started Now
        </Button>
      </div>
    </section>
  )
}

