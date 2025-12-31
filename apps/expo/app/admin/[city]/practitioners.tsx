import { AdminPractitionersScreen } from 'app/features/connect/admin'
import { useLocalSearchParams } from 'expo-router'

export default function AdminPractitionersPage() {
  const { city } = useLocalSearchParams<{ city: string }>()

  if (!city) {
    return null
  }

  return <AdminPractitionersScreen citySlug={city} />
}
