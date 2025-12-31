import { Stack, useLocalSearchParams } from 'expo-router'
import { BookingFormScreen } from 'app/features/connect/booking'

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
    <>
      <Stack.Screen options={{ title: 'Book', headerBackTitle: 'Back' }} />
      <BookingFormScreen
        offeringId={offeringId}
        slotId={slotId}
        eventDateId={eventDateId}
      />
    </>
  )
}
