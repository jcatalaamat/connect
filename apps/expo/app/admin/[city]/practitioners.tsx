import { Stack, useLocalSearchParams } from 'expo-router'
import { AdminPractitionersScreen } from 'app/features/connect/admin'

export default function AdminPractitionersPage() {
  const { city } = useLocalSearchParams<{ city: string }>()

  if (!city) {
    return null
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Manage Practitioners', headerBackTitle: 'Back' }} />
      <AdminPractitionersScreen citySlug={city} />
    </>
  )
}
