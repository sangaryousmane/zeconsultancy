import Hero from '@/components/sections/Hero'
import Services from '@/components/sections/Services'
import { Features } from '@/components/sections/Features'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Services />
      <Features />
    </div>
  )
}