import { Stack, useLocalSearchParams } from 'expo-router'
import { AdminDashboardScreen } from 'app/features/connect/admin'

export default function AdminDashboardPage() {
  const { city } = useLocalSearchParams<{ city: string }>()

  if (!city) {
    return null
  }

  return (
    <>
      <Stack.Screen options={{ title: 'City Admin', headerBackTitle: 'Back' }} />
      <AdminDashboardScreen citySlug={city} />
    </>
  )
}
