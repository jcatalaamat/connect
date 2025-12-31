import { BookingDetailScreen } from 'app/features/connect/practitioner-dashboard'
import { useLocalSearchParams } from 'expo-router'

export default function BookingDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>()

  if (!id) {
    return null
  }

  return <BookingDetailScreen bookingId={id} />
}
