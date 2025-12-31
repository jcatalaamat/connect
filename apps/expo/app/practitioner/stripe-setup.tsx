import { Stack } from 'expo-router'
import { StripeOnboardingScreen } from 'app/features/connect/practitioner-dashboard'

export default function StripeSetupPage() {
  return (
    <>
      <Stack.Screen options={{ title: 'Payment Setup', headerBackTitle: 'Back' }} />
      <StripeOnboardingScreen />
    </>
  )
}
