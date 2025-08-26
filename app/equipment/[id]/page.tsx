// import { notFound } from 'next/navigation'
// import { DetailPageWrapper } from '@/components/shared/DetailPageWrapper'

// interface EquipmentDetailPageProps {
//   params: {
//     id: string
//   }
// }

// export default async function EquipmentDetailPage({ params }: EquipmentDetailPageProps) {
//   const equipmentData = await prisma.equipment.findUnique({
//     where: { id: params.id },
//     include: {
//       category: {
//         select: { id: true, name: true }
//       }
//     }
//   })
  
//   if (!equipmentData) {
//     notFound()
//   }

//   // Transform data to match DetailItem interface
//   const equipment = {
//     id: equipmentData.id,
//     title: equipmentData.title,
//     description: equipmentData.description,
//     price: equipmentData.price,
//     priceType: equipmentData.priceType,
//     images: equipmentData.images,
//     features: equipmentData.features,
//     available: equipmentData.available,
//     location: equipmentData.location || undefined,
//     category: {
//       name: (equipmentData as any).category?.name || 'Unknown'
//     }
//   }

//   return (
//     <DetailPageWrapper
//       item={equipment}
//       type="equipment"
//       backUrl="/equipment"
//     />
//   )
// }