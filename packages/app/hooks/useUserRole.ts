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
  adminCitySlug: string | null
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

  // Check if user is admin for ANY city (not just selected)
  const {
    data: adminCities,
    isLoading: adminLoading,
  } = api.admin.getAdminCities.useQuery(undefined, {
    enabled: isAuthenticated,
  })

  const isLoading = isAuthenticated && (practitionerLoading || adminLoading)
  const isPractitioner = !!practitionerProfile && practitionerProfile.status === 'approved'
  const isAdmin = (adminCities?.length ?? 0) > 0
  const adminCitySlug = (adminCities?.[0]?.cities as any)?.slug ?? null

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
    adminCitySlug,
  }
}
