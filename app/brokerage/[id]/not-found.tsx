import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Service Not Found</h1>
        <p className="text-muted-foreground mb-6">The brokerage service you're looking for doesn't exist or has been removed.</p>
        <Link href="/brokerage">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Brokerage
          </Button>
        </Link>
      </div>
    </div>
  )
}