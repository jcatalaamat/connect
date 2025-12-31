import { OfferingDetailScreen } from 'app/features/connect/offerings'
import { useLocalSearchParams } from 'expo-router'

export default function OfferingPage() {
  const { offering } = useLocalSearchParams<{ offering: string }>()

  if (!offering) {
    return null
  }

  return <OfferingDetailScreen offeringId={offering} />
}
