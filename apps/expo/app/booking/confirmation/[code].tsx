import { BookingConfirmationScreen } from 'app/features/connect/booking'
import { useLocalSearchParams } from 'expo-router'

export default function ConfirmationPage() {
  const { code, email } = useLocalSearchParams<{ code: string; email?: string }>()

  if (!code) {
    return null
  }

  return <BookingConfirmationScreen confirmationCode={code} email={email} />
}
