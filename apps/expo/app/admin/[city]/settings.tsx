import { Stack, useLocalSearchParams } from 'expo-router'
import { AdminSettingsScreen } from 'app/features/connect/admin'

export default function AdminSettingsPage() {
  const { city } = useLocalSearchParams<{ city: string }>()

  if (!city) {
    return null
  }

  return (
    <>
      <Stack.Screen options={{ title: 'City Settings', headerBackTitle: 'Back' }} />
      <AdminSettingsScreen citySlug={city} />
    </>
  )
}
