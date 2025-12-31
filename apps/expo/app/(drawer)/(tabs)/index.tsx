import { CitySelectorScreen, CityHomeScreen } from 'app/features/connect/city'
import { useCity } from 'app/provider/city'
import { Spinner, YStack } from '@my/ui'

export default function BrowseScreen() {
  const { city, citySlug, isLoading } = useCity()

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" />
      </YStack>
    )
  }

  // If no city selected, show city selector
  if (!city || !citySlug) {
    return <CitySelectorScreen />
  }

  // Otherwise show city home with practitioners
  return <CityHomeScreen citySlug={citySlug} />
}
