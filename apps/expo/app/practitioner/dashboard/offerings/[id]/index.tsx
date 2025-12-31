import { Stack, useLocalSearchParams } from 'expo-router'
import { OfferingDetailScreen } from 'app/features/connect/practitioner-dashboard'

export default function OfferingDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>()

  if (!id) {
    return null
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Offering Details', headerBackTitle: 'Back' }} />
      <OfferingDetailScreen offeringId={id} />
    </>
  )
}
