import { Stack } from 'expo-router'
import { OfferingsScreen } from 'app/features/connect/practitioner-dashboard'

export default function OfferingsPage() {
  return (
    <>
      <Stack.Screen options={{ title: 'My Offerings', headerBackTitle: 'Back' }} />
      <OfferingsScreen />
    </>
  )
}
