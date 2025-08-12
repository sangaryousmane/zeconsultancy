import Link from 'next/link'
import { ArrowRight, Sparkles, Shield, Zap, Globe, FileText, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Features } from '@/components/sections/Features'

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
                Trusted & Reliable Documentation Services
              </span>
            </div>
          </div>
          
          {/* Main Heading */}
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-2xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight">
              <span className="block">Helping Expats & Businesses</span>
              <span className="block gradient-text">
                Navigate Paperwork with Ease
              </span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
              Moving to a new country or running a cross-border business can be overwhelming with documentation requirements. 
              Our <span className="font-semibold"> comprehensive expat and corporate documentation services </span> 
              ensure your visas, permits, licenses, and compliance reports are processed quickly and accurately — saving you time, money, and stress.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4 sm:px-0">
            <Button 
              size="lg" 
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-6 text-base sm:text-lg font-bold shadow-2xl shadow-primary/25 transform hover:scale-105 transition-all duration-200"
              asChild
            >
              <Link href="/contact">
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
              <Link href="/documentation">
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
              <h3 className="text-2xl font-bold mb-2">Secure & Confidential</h3>
              <p className="text-muted-foreground">Your personal and business documents are handled with complete privacy and compliance.</p>
            </div>
            
            <div className="group">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Comprehensive Services</h3>
              <p className="text-muted-foreground">From visas to work permits, we cover every step of your documentation journey.</p>
            </div>
            
            <div className="group">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">International Expertise</h3>
              <p className="text-muted-foreground">We serve expats, diplomats, NGOs, and corporations across multiple countries.</p>
            </div>

            <div className="group">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Accuracy Guaranteed</h3>
              <p className="text-muted-foreground">We ensure your forms and applications are 100% correct before submission.</p>
            </div>

            <div className="group">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Fast Turnaround</h3>
              <p className="text-muted-foreground">Same-day and priority processing available for urgent requests.</p>
            </div>

            <div className="group">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Compliance Assured</h3>
              <p className="text-muted-foreground">We stay up-to-date with local and international regulations so you don’t have to.</p>
            </div>
          </div>
          
          {/* Why Choose Us Section */} 
          <div className="bg-gradient-to-r from-muted/30 to-muted/50 rounded-3xl p-12 border">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6">Why Choose Us?</h3>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  We simplify complex bureaucratic processes by offering complete documentation support — visas, labour reports, resident permits, and work permits. 
                  Our team ensures your paperwork is accurate, complete, and on time, reducing delays or rejections.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold">Fully Insured</div>
                      <div className="text-sm text-muted-foreground">Peace of mind coverage</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold">Instant Access</div>
                      <div className="text-sm text-muted-foreground">Fast, priority handling</div>
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
                      Start Your Process
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
          <Features />
        </div>
      </div>
    </section>
  )
}
