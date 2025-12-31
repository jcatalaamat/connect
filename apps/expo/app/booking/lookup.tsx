import { BookingLookupScreen } from 'app/features/connect/booking'
import { useLocalSearchParams } from 'expo-router'

export default function LookupPage() {
  const { code } = useLocalSearchParams<{ code?: string }>()

  return <BookingLookupScreen initialCode={code} />
}
