import { Stack, useLocalSearchParams } from 'expo-router'
import { OfferingFormScreen } from 'app/features/connect/practitioner-dashboard'

export default function EditOfferingPage() {
  const { id } = useLocalSearchParams<{ id: string }>()

  if (!id) {
    return null
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Edit Offering', headerBackTitle: 'Back' }} />
      <OfferingFormScreen offeringId={id} />
    </>
  )
}
