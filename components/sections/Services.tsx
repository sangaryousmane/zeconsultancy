import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Truck, Users, Wrench, ArrowRight, CheckCircle, Sparkles, Zap, Shield } from 'lucide-react'
import Link from 'next/link'

const services = [
  {
    id: 'equipment',
    title: 'Equipment Rental',
    description: 'Premium construction and industrial equipment with nationwide delivery and 24/7 support.',
    icon: Truck,
    features: ['Heavy Machinery', 'Excavators, Bulldozers, Frontend Loaders, Compactors, Graders, etc', 'Safety Equipment', 'Same-Day Delivery'],
    price: 'Custom pricing',
    popular: true,
    gradient: 'from-blue-500 via-blue-600 to-cyan-600'
  },
  {
    id: 'brokerage',
    title: 'Brokerage Services',
    description: 'Expert brokerage solutions connecting you with verified partners and optimal deals.',
    icon: Users,
    features: ['Import and Export', 'Customs Documentation', 'Transportation & Delivery', 'Freight Forwarding', 'Risk Management', 'Customs Clearing Services'],
    price: 'Custom pricing',
    popular: false,
    gradient: 'from-purple-500 via-purple-600 to-pink-600'
  },
  {
    id: 'software-development',
    title: 'Software Development',
    description: 'Comprehensive software development and vending solutions tailored to your business needs.',
    icon: Wrench,
    features: ['Mobile and Web App Development', 'Custom Software Solutions', '24/7 Expert Support', 'Budget Oriented Packages', 'E-Commerce Solutions', 'Performance Analytics'],
    price: 'Affordable Packages',
    popular: false,
    gradient: 'from-emerald-500 via-emerald-600 to-teal-600'
  },
  {
    id: 'documentation',
    title: 'Expats Documentations',
    description: 'Comprehensive documentation services for expats working and navigating life in Liberia.',
    icon: Wrench,
    features: ['Visa Assistance', 'Housing Support', 'Work and Residency Permits', 'Labor and Immigration Reports'],
    price: 'Very Affordable Packages',
    popular: false,
    gradient: 'from-emerald-500 via-emerald-600 to-teal-600'
  }
]

export default function Services() {
  return (
    <section className="py-32 bg-gradient-to-br from-background via-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-full border border-primary/20 mb-8">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold gradient-text">
              Our Premium Services
            </span>
          </div>
          
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-8 tracking-tight">
            <span>Solutions That</span>
            <br />
            <span className="gradient-text">
              Drive Success
            </span>
          </h2>
          
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            From cutting-edge equipment rentals to expert brokerage services, we deliver <span className="font-semibold">comprehensive solutions</span> that power your business forward.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {services.map((service, index) => (
            <Card key={service.id} className={`group relative overflow-hidden hover-glow transition-all duration-500 transform hover:-translate-y-2 ${service.popular ? 'ring-2 ring-primary/20 scale-105' : ''}`}>
              {service.popular && (
                <div className="absolute -top-1 -right-1 z-10">
                  <Badge className="bg-primary text-primary-foreground border-0 px-4 py-1 text-xs font-bold">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardHeader className="relative p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 rounded-2xl bg-primary/10 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <service.icon className="w-8 h-8 text-primary" />
                  </div>
                </div>
                
                <CardTitle className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                  {service.title}
                </CardTitle>
                
                <CardDescription className="text-muted-foreground text-base leading-relaxed mb-4">
                  {service.description}
                </CardDescription>
                
                <div className="text-2xl font-bold mb-6">
                  {service.price}
                </div>
              </CardHeader>
              
              <CardContent className="relative p-8 pt-0">
                <div className="space-y-4 mb-8">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full py-6 text-lg font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200 group-hover:shadow-xl"
                  asChild
                >
                  <Link href={`/${service.id}`}>
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Section */}
        <div className="bg-gradient-to-r from-muted/30 to-muted/50 rounded-3xl p-12 border">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">
                Why Choose Our Services?
              </h3>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                We combine cutting-edge technology with industry expertise to deliver unmatched value and reliability through professiosionalism, Affordable pricing, and a deep understanding of local and international procedures.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-bold">Fully Insured</div>
                    <div className="text-sm text-muted-foreground">Complete coverage</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-bold">Instant Access</div>
                    <div className="text-sm text-muted-foreground">Same-day service</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center lg:text-right">
              <div className="inline-flex flex-col gap-4">
                <Button 
                  size="lg" 
                  className="px-12 py-6 text-lg font-bold shadow-xl transform hover:scale-105 transition-all duration-200"
                  asChild
                >
                  <Link href="/contact">
                    Start Your Project
                    <ArrowRight className="ml-3 w-6 h-6" />
                  </Link>
                </Button>
                
                <p className="text-sm text-muted-foreground">
                  Free consultation • No commitment required
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}