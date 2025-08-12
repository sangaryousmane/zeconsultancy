import { Skeleton } from '@/components/ui/skeleton'

export function PageLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section Skeleton */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="relative z-10 container mx-auto px-4 pt-20">
          <div className="text-center space-y-8">
            <Skeleton className="h-16 w-3/4 mx-auto bg-white/10" />
            <Skeleton className="h-6 w-1/2 mx-auto bg-white/10" />
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Skeleton className="h-12 w-32 bg-white/10" />
              <Skeleton className="h-12 w-32 bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SectionLoading({ height = 'h-96' }: { height?: string }) {
  return (
    <div className={`${height} flex items-center justify-center bg-background`}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}

export function CardLoading() {
  return (
    <div className="bg-card border rounded-lg p-6 space-y-4">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}

export function ListLoading({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardLoading key={i} />
      ))}
    </div>
  )
}