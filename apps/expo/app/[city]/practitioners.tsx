import { PractitionerListScreen } from 'app/features/connect/practitioners'
import { useLocalSearchParams } from 'expo-router'

export default function PractitionersPage() {
  const { city } = useLocalSearchParams<{ city: string }>()

  if (!city) {
    return null
  }

  return <PractitionerListScreen citySlug={city} />
}
