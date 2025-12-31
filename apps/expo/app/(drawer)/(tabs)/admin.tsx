import { AdminDashboardScreen } from 'app/features/connect/admin'
import { useUserRole } from 'app/hooks'
import { YStack, Text, Spinner } from '@my/ui'

export default function AdminTabScreen() {
  const { adminCitySlug, isLoading, isAdmin } = useUserRole()

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" />
      </YStack>
    )
  }

  if (!isAdmin || !adminCitySlug) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Text>You are not an admin for any city</Text>
      </YStack>
    )
  }

  return <AdminDashboardScreen citySlug={adminCitySlug} />
}
