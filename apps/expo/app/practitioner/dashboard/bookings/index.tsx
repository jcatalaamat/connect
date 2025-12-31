import { Stack } from 'expo-router'
import { BookingsScreen } from 'app/features/connect/practitioner-dashboard'

export default function BookingsPage() {
  return (
    <>
      <Stack.Screen options={{ title: 'Bookings', headerBackTitle: 'Back' }} />
      <BookingsScreen />
    </>
  )
}
