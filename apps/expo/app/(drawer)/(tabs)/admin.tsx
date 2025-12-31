import { AdminDashboardScreen } from 'app/features/connect/admin'
import { useCity } from 'app/provider/city'
import { YStack, Text, Spinner } from '@my/ui'

export default function AdminTabScreen() {
  const { citySlug, isLoading } = useCity()

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" />
      </YStack>
    )
  }

  if (!citySlug) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Text>Please select a city first</Text>
      </YStack>
    )
  }

  return <AdminDashboardScreen citySlug={citySlug} />
}
