import { Stack, useLocalSearchParams } from 'expo-router'
import { BookingDetailScreen } from 'app/features/connect/practitioner-dashboard'

export default function BookingDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>()

  if (!id) {
    return null
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Booking Details', headerBackTitle: 'Back' }} />
      <BookingDetailScreen bookingId={id} />
    </>
  )
}
