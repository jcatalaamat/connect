import { AdminSettingsScreen } from 'app/features/connect/admin'
import { useLocalSearchParams } from 'expo-router'

export default function AdminSettingsPage() {
  const { city } = useLocalSearchParams<{ city: string }>()

  if (!city) {
    return null
  }

  return <AdminSettingsScreen citySlug={city} />
}
