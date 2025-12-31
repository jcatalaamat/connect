import { AdminDashboardScreen } from 'app/features/connect/admin'
import { useLocalSearchParams } from 'expo-router'

export default function AdminDashboardPage() {
  const { city } = useLocalSearchParams<{ city: string }>()

  if (!city) {
    return null
  }

  return <AdminDashboardScreen citySlug={city} />
}
