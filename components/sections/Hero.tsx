import Link from 'next/link'
import { ArrowRight, Sparkles, Shield, Zap, Globe, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/30 pt-16">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-muted/20 rounded-full blur-2xl animate-pulse delay-500" />
      </div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          {/* Premium Badge */}
          <div className="mt-8 sm:mt-12 lg:mt-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs sm:text-sm font-semibold gradient-text">
                Premium Business Solutions
              </span>
            </div>
          </div>
          
          {/* Main Heading */}
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight">
              <span className="block">Solutions That</span>
              <span className="block gradient-text">
                Drive Success
              </span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
              Access premium equipment rentals and expert brokerage services. 
              <span className="font-semibold">Trusted by industry leaders worldwide.</span>
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4 sm:px-0">
            <Button 
              size="lg" 
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-6 text-base sm:text-lg font-bold shadow-2xl shadow-primary/25 transform hover:scale-105 transition-all duration-200"
              asChild
            >
              <Link href="/equipment">
                Get Started Now
                <ArrowRight className="ml-2 sm:ml-3 w-5 sm:w-6 h-5 sm:h-6" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-6 text-base sm:text-lg font-bold border-2 transform hover:scale-105 transition-all duration-200"
              asChild
            >
              <Link href="/brokerage">
                Explore Services
              </Link>
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto pt-16">
            <div className="group">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Secure & Trusted</h3>
              <p className="text-muted-foreground">Bank-level security with 99.9% uptime guarantee</p>
            </div>
            
            <div className="group">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Scalable Software Development</h3>
              <p className="text-muted-foreground">Instant development and deployment with 24/7 support</p>
            </div>
            
            <div className="group">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Global Reach</h3>
              <p className="text-muted-foreground">Serving clients in and out of Liberia</p>
            </div>

            <div className="group">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Expats Documentations</h3>
              <p className="text-muted-foreground">We help Expats with their documentation needs and settle in Liberia. We help them do everything from visa applications to finding housing.</p>
            </div>

            <div className="group">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Equipment Rental</h3>
              <p className="text-muted-foreground">We provide equipment rental services for Expats and locals in Liberia, ensuring you have the tools you need for any job.</p>
            </div>

            <div className="group">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Brokerage Services</h3>
              <p className="text-muted-foreground">We help expats and locals navigate the complexities of port logistics, customs clearance and regulations.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}