import { api } from 'app/utils/api'
import { useCity } from 'app/provider/city'
import { useUser } from 'app/utils/useUser'

export type UserRole = 'guest' | 'customer' | 'practitioner' | 'admin'

interface UseUserRoleResult {
  role: UserRole
  isLoading: boolean
  isPractitioner: boolean
  isAdmin: boolean
  isAuthenticated: boolean
  practitionerProfile: ReturnType<typeof api.practitioners.getMyProfile.useQuery>['data']
}

export function useUserRole(): UseUserRoleResult {
  const { session } = useUser()
  const { city } = useCity()
  const isAuthenticated = !!session?.user

  // Check if user is a practitioner
  const {
    data: practitionerProfile,
    isLoading: practitionerLoading,
  } = api.practitioners.getMyProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  })

  // Check if user is a city admin
  const {
    data: adminStatus,
    isLoading: adminLoading,
  } = api.cities.isAdmin.useQuery(
    { cityId: city?.id ?? '' },
    {
      enabled: isAuthenticated && !!city?.id,
    }
  )

  const isLoading = isAuthenticated && (practitionerLoading || (!!city?.id && adminLoading))
  const isPractitioner = !!practitionerProfile && practitionerProfile.status === 'approved'
  const isAdmin = !!adminStatus?.isAdmin

  let role: UserRole = 'guest'
  if (isAuthenticated) {
    role = 'customer'
    if (isPractitioner) role = 'practitioner'
    if (isAdmin) role = 'admin'
  }

  return {
    role,
    isLoading,
    isPractitioner,
    isAdmin,
    isAuthenticated,
    practitionerProfile,
  }
}
