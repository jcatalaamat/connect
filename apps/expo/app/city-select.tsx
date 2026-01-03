import { CitySelectorScreen } from 'app/features/connect/city'
import { Stack } from 'expo-router'

export default function CitySelectorPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Choose Your City' }} />
      <CitySelectorScreen />
    </>
  )
}
