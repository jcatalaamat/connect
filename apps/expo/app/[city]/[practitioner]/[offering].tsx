import { Stack, useLocalSearchParams } from 'expo-router'
import { OfferingDetailScreen } from 'app/features/connect/offerings'

export default function OfferingPage() {
  const { offering } = useLocalSearchParams<{ offering: string }>()

  if (!offering) {
    return null
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Offering', headerBackTitle: 'Back' }} />
      <OfferingDetailScreen offeringId={offering} />
    </>
  )
}
