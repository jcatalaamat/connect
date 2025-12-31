import { Stack } from 'expo-router'
import { OfferingFormScreen } from 'app/features/connect/practitioner-dashboard'

export default function NewOfferingPage() {
  return (
    <>
      <Stack.Screen options={{ title: 'New Offering', headerBackTitle: 'Back' }} />
      <OfferingFormScreen />
    </>
  )
}
