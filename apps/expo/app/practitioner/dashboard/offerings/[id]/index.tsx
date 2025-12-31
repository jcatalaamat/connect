import { OfferingDetailScreen } from 'app/features/connect/practitioner-dashboard'
import { useLocalSearchParams } from 'expo-router'

export default function OfferingDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>()

  if (!id) {
    return null
  }

  return <OfferingDetailScreen offeringId={id} />
}
