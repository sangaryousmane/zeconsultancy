import { Search, Filter, Calendar, CreditCard, MapPin, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const features = [
  {
    icon: Search,
    title: 'Advanced Search',
    description: 'Find exactly what you need with our powerful search and filtering system.',
  },
  {
    icon: Filter,
    title: 'Smart Filters',
    description: 'Filter by location, price, availability, and specifications to find perfect matches.',
  },
  {
    icon: Calendar,
    title: 'Easy Scheduling',
    description: 'Simple scheduling process with real-time availability and instant confirmation.',
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'Safe and secure payment processing with multiple payment options.',
  },
  {
    icon: MapPin,
    title: 'Location Services',
    description: 'Track service locations and delivery status in real-time.',
  },
  {
    icon: Star,
    title: 'Quality Assured',
    description: 'All services are regularly reviewed and quality checked for excellence.',
  },
]

export function Features() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Why Choose <span className="gradient-text">ZE Consultancy</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the difference with our modern platform designed for efficiency and reliability.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group"
              >
                <div className="p-6 rounded-lg glass-effect hover-glow h-full">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="glass-effect rounded-2xl p-8 sm:p-12">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust ZE Consultancy for their business needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild>
                <Link href="/equipment">
                  Get Started
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}