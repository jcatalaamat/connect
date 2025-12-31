import { Stack, useLocalSearchParams } from 'expo-router'
import { PractitionerDetailScreen } from 'app/features/connect/practitioners'

export default function PractitionerDetailPage() {
  const { city, practitioner } = useLocalSearchParams<{ city: string; practitioner: string }>()

  if (!city || !practitioner) {
    return null
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Practitioner', headerBackTitle: 'Back' }} />
      <PractitionerDetailScreen citySlug={city} practitionerSlug={practitioner} />
    </>
  )
}
