import { Stack, useLocalSearchParams } from 'expo-router'
import { BookingConfirmationScreen } from 'app/features/connect/booking'

export default function ConfirmationPage() {
  const { code, email } = useLocalSearchParams<{ code: string; email?: string }>()

  if (!code) {
    return null
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Booking Confirmed', headerBackTitle: 'Back' }} />
      <BookingConfirmationScreen confirmationCode={code} email={email} />
    </>
  )
}
