import { Mail, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Newsletter() {

  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="glass-effect rounded-2xl p-8 sm:p-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Subscribe for the Latest News & Updates
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Stay informed about new services, special offers, and industry insights. 
              Join our community of professionals.
            </p>

            <div className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1"
                />
                <Button className="whitespace-nowrap">
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 pt-8 border-t border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">Weekly</div>
                <div className="text-sm text-muted-foreground">Industry Updates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">Exclusive</div>
                <div className="text-sm text-muted-foreground">Special Offers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">Early</div>
                <div className="text-sm text-muted-foreground">Access to New Services</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}