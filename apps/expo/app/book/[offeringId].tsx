import { BookingFormScreen } from 'app/features/connect/booking'
import { useLocalSearchParams } from 'expo-router'

export default function BookingPage() {
  const { offeringId, slotId, eventDateId } = useLocalSearchParams<{
    offeringId: string
    slotId?: string
    eventDateId?: string
  }>()

  if (!offeringId) {
    return null
  }

  return (
    <BookingFormScreen
      offeringId={offeringId}
      slotId={slotId}
      eventDateId={eventDateId}
    />
  )
}
