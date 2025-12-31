import { PractitionerDetailScreen } from 'app/features/connect/practitioners'
import { useLocalSearchParams } from 'expo-router'

export default function PractitionerDetailPage() {
  const { city, practitioner } = useLocalSearchParams<{ city: string; practitioner: string }>()

  if (!city || !practitioner) {
    return null
  }

  return <PractitionerDetailScreen citySlug={city} practitionerSlug={practitioner} />
}
