import { CityHomeScreen } from 'app/features/connect/city'
import { useLocalSearchParams } from 'expo-router'

export default function CityHomePage() {
  const { city } = useLocalSearchParams<{ city: string }>()

  if (!city) {
    return null
  }

  return <CityHomeScreen citySlug={city} />
}
