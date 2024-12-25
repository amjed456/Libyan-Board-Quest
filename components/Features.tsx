import { Zap, Shield, Smartphone } from 'lucide-react'

const features = [
  {
    icon: <Zap className="w-12 h-12 text-yellow-400" />,
    title: 'Lightning Fast',
    description: 'Experience blazing speeds with our cutting-edge technology.'
  },
  {
    icon: <Shield className="w-12 h-12 text-green-400" />,
    title: 'Secure & Reliable',
    description: 'Your data is safe with our advanced security measures.'
  },
  {
    icon: <Smartphone className="w-12 h-12 text-blue-400" />,
    title: 'Mobile Friendly',
    description: 'Seamless experience across all your devices.'
  }
]

export default function Features() {
  return (
    <section className="py-20 bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-100">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 bg-gray-700 rounded-lg shadow-md transition-transform hover:scale-105">
              <div className="mb-4 inline-block">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-100">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

