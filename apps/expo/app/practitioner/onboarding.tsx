import { Stack } from 'expo-router'
import { PractitionerOnboardingScreen } from 'app/features/connect/practitioner-dashboard'

export default function OnboardingPage() {
  return (
    <>
      <Stack.Screen options={{ title: 'Become a Practitioner', headerBackTitle: 'Back' }} />
      <PractitionerOnboardingScreen />
    </>
  )
}
