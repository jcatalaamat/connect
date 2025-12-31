import { Stack, useLocalSearchParams } from 'expo-router'
import { BookingLookupScreen } from 'app/features/connect/booking'

export default function LookupPage() {
  const { code } = useLocalSearchParams<{ code?: string }>()

  return (
    <>
      <Stack.Screen options={{ title: 'Find Booking', headerBackTitle: 'Back' }} />
      <BookingLookupScreen initialCode={code} />
    </>
  )
}
