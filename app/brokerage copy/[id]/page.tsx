import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { DetailPageWrapper } from '@/components/shared/DetailPageWrapper'

interface BrokerageDetailPageProps {
  params: {
    id: string
  }
}

export default async function BrokerageDetailPage({ params }: BrokerageDetailPageProps) {
  const brokerageData = await prisma.brokerage.findUnique({
    where: { id: params.id },
    include: {
      category: {
        select: { id: true, name: true }
      }
    }
  })
  
  if (!brokerageData) {
    notFound()
  }

  // Transform data to match DetailItem interface
  const brokerage = {
    id: brokerageData.id,
    title: brokerageData.title,
    description: brokerageData.description,
    price: brokerageData.price,
    priceType: brokerageData.priceType,
    images: brokerageData.images,
    features: brokerageData.features,
    available: brokerageData.available,
    location: brokerageData.location || undefined,
    category: {
      name: (brokerageData as any).category?.name || 'Unknown'
    }
  }

  return (
    <DetailPageWrapper
      item={brokerage}
      type="brokerage"
      backUrl="/brokerage"
    />
  )
}