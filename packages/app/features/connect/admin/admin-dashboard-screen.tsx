import { ScrollView } from 'react-native'
import { YStack, XStack, H1, H2, Text, Button, Spinner, Card, Paragraph } from '@my/ui'
import { useRouter, useLink } from 'solito/navigation'
import { api } from 'app/utils/api'
import {
  Users,
  Calendar,
  DollarSign,
  Clock,
  Settings,
  ChevronRight,
  MapPin,
  Check,
  X,
} from '@tamagui/lucide-icons'
import { useState } from 'react'

export function AdminDashboardScreen({ citySlug }: { citySlug: string }) {
  const router = useRouter()
  const [showAllRequests, setShowAllRequests] = useState(false)

  // Get city info
  const { data: city, isLoading: loadingCity } = api.cities.getBySlug.useQuery({ slug: citySlug })

  // Get admin cities to verify access
  const { data: adminCities, isLoading: loadingAdmin } = api.admin.getAdminCities.useQuery()

  // Get city stats
  const { data: stats, isLoading: loadingStats } = api.admin.getCityStats.useQuery(
    { cityId: city?.id || '' },
    { enabled: !!city?.id }
  )

  // Get city requests (pending by default)
  const { data: cityRequests, isLoading: loadingRequests, refetch: refetchRequests } = api.cities.listRequests.useQuery(
    { status: showAllRequests ? undefined : 'pending', limit: 10 },
    { enabled: !!adminCities && adminCities.length > 0 }
  )

  // Mutation to update request status
  const updateRequestMutation = api.cities.updateRequestStatus.useMutation({
    onSuccess: () => {
      refetchRequests()
    },
  })

  const practitionersLink = useLink({ href: `/admin/${citySlug}/practitioners` })
  const settingsLink = useLink({ href: `/admin/${citySlug}/settings` })

  if (loadingCity || loadingAdmin) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Spinner size="large" />
      </YStack>
    )
  }

  // Check if user is admin for this city
  const isAdmin = adminCities?.some((a) => (a.cities as any)?.slug === citySlug)

  if (!isAdmin) {
    return (
      <YStack flex={1} padding="$4" justifyContent="center" alignItems="center" gap="$4">
        <Text size="$6" fontWeight="600">
          Access Denied
        </Text>
        <Paragraph theme="alt2" textAlign="center">
          You are not an admin for this city.
        </Paragraph>
        <Button onPress={() => router.push('/city-select')}>Go Back</Button>
      </YStack>
    )
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <YStack flex={1} padding="$4" gap="$6">
        {/* Header */}
        <YStack gap="$2">
          <Text size="$2" theme="alt2" fontWeight="600">
            CITY ADMIN
          </Text>
          <H1 size="$8">{city?.name}</H1>
        </YStack>

      {/* Stats Cards */}
      {loadingStats ? (
        <XStack justifyContent="center" padding="$4">
          <Spinner />
        </XStack>
      ) : (
        <XStack flexWrap="wrap" gap="$4">
          {/* Practitioners */}
          <Card bordered padding="$4" flex={1} minWidth={150}>
            <YStack gap="$2">
              <XStack gap="$2" alignItems="center">
                <Users size={20} color="$blue10" />
                <Text size="$2" theme="alt2">
                  Practitioners
                </Text>
              </XStack>
              <Text size="$8" fontWeight="700">
                {stats?.practitioners.approved ?? 0}
              </Text>
              {(stats?.practitioners.pending ?? 0) > 0 && (
                <Text size="$2" color="$orange10">
                  {stats?.practitioners.pending} pending
                </Text>
              )}
            </YStack>
          </Card>

          {/* Bookings */}
          <Card bordered padding="$4" flex={1} minWidth={150}>
            <YStack gap="$2">
              <XStack gap="$2" alignItems="center">
                <Calendar size={20} color="$green10" />
                <Text size="$2" theme="alt2">
                  Bookings
                </Text>
              </XStack>
              <Text size="$8" fontWeight="700">
                {stats?.bookings.total ?? 0}
              </Text>
              <Text size="$2" theme="alt2">
                {stats?.bookings.completed ?? 0} completed
              </Text>
            </YStack>
          </Card>

          {/* Revenue */}
          <Card bordered padding="$4" flex={1} minWidth={150}>
            <YStack gap="$2">
              <XStack gap="$2" alignItems="center">
                <DollarSign size={20} color="$purple10" />
                <Text size="$2" theme="alt2">
                  Platform Fees
                </Text>
              </XStack>
              <Text size="$8" fontWeight="700">
                ${stats?.revenue.totalPlatformFees?.toFixed(2) ?? '0.00'}
              </Text>
              <Text size="$2" theme="alt2">
                ${stats?.revenue.thisMonthPlatformFees?.toFixed(2) ?? '0.00'} this month
              </Text>
            </YStack>
          </Card>
        </XStack>
      )}

      {/* Pending Approvals Alert */}
      {(stats?.practitioners.pending ?? 0) > 0 && (
        <Card bordered backgroundColor="$orange2" padding="$4" cursor="pointer" hoverStyle={{ opacity: 0.9 }} {...practitionersLink}>
          <XStack justifyContent="space-between" alignItems="center">
            <XStack gap="$3" alignItems="center">
              <Clock size={24} color="$orange10" />
              <YStack>
                <Text fontWeight="600">Pending Approvals</Text>
                <Text size="$2" theme="alt2">
                  {stats?.practitioners.pending} practitioner
                  {stats?.practitioners.pending !== 1 ? 's' : ''} waiting for review
                </Text>
              </YStack>
            </XStack>
            <ChevronRight size={20} color="$gray10" />
          </XStack>
        </Card>
      )}

      {/* Quick Links */}
      <YStack gap="$4">
        <H2 size="$5">Manage</H2>

        <Card bordered padding="$4" cursor="pointer" hoverStyle={{ opacity: 0.9 }} pressStyle={{ opacity: 0.8 }} {...practitionersLink}>
          <XStack justifyContent="space-between" alignItems="center">
            <XStack gap="$3" alignItems="center">
              <Users size={24} color="$blue10" />
              <YStack>
                <Text fontWeight="600">Practitioners</Text>
                <Text size="$2" theme="alt2">
                  Approve, suspend, or manage practitioners
                </Text>
              </YStack>
            </XStack>
            <ChevronRight size={20} color="$gray10" />
          </XStack>
        </Card>

        <Card bordered padding="$4" cursor="pointer" hoverStyle={{ opacity: 0.9 }} pressStyle={{ opacity: 0.8 }} {...settingsLink}>
          <XStack justifyContent="space-between" alignItems="center">
            <XStack gap="$3" alignItems="center">
              <Settings size={24} color="$gray10" />
              <YStack>
                <Text fontWeight="600">City Settings</Text>
                <Text size="$2" theme="alt2">
                  Platform fee, description, and more
                </Text>
              </YStack>
            </XStack>
            <ChevronRight size={20} color="$gray10" />
          </XStack>
        </Card>
      </YStack>

      {/* Practitioner Breakdown */}
      <Card bordered padding="$4">
        <YStack gap="$3">
          <Text fontWeight="600" size="$3">
            Practitioner Status Breakdown
          </Text>
          <XStack gap="$4" flexWrap="wrap">
            <XStack gap="$2" alignItems="center">
              <YStack width={12} height={12} borderRadius={6} backgroundColor="$green10" />
              <Text size="$2">Approved: {stats?.practitioners.approved ?? 0}</Text>
            </XStack>
            <XStack gap="$2" alignItems="center">
              <YStack width={12} height={12} borderRadius={6} backgroundColor="$yellow10" />
              <Text size="$2">Pending: {stats?.practitioners.pending ?? 0}</Text>
            </XStack>
            <XStack gap="$2" alignItems="center">
              <YStack width={12} height={12} borderRadius={6} backgroundColor="$orange10" />
              <Text size="$2">Suspended: {stats?.practitioners.suspended ?? 0}</Text>
            </XStack>
            <XStack gap="$2" alignItems="center">
              <YStack width={12} height={12} borderRadius={6} backgroundColor="$red10" />
              <Text size="$2">Rejected: {stats?.practitioners.rejected ?? 0}</Text>
            </XStack>
          </XStack>
        </YStack>
      </Card>

      {/* City Requests */}
      <YStack gap="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <XStack gap="$2" alignItems="center">
            <MapPin size={20} color="$blue10" />
            <H2 size="$5">City Requests</H2>
          </XStack>
          <Button
            size="$2"
            variant="outlined"
            onPress={() => setShowAllRequests(!showAllRequests)}
          >
            {showAllRequests ? 'Show Pending' : 'Show All'}
          </Button>
        </XStack>

        {loadingRequests ? (
          <XStack justifyContent="center" padding="$4">
            <Spinner />
          </XStack>
        ) : cityRequests?.requests && cityRequests.requests.length > 0 ? (
          <YStack gap="$3">
            {cityRequests.requests.map((request) => (
              <Card key={request.id} bordered padding="$4">
                <YStack gap="$3">
                  <XStack justifyContent="space-between" alignItems="flex-start">
                    <YStack gap="$1">
                      <Text fontWeight="600" size="$5">
                        {request.city_name}
                      </Text>
                      <Text theme="alt2" size="$3">
                        {request.country}
                      </Text>
                    </YStack>
                    <YStack
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                      borderRadius="$2"
                      backgroundColor={
                        request.status === 'pending'
                          ? '$yellow3'
                          : request.status === 'approved'
                            ? '$green3'
                            : '$red3'
                      }
                    >
                      <Text
                        size="$1"
                        color={
                          request.status === 'pending'
                            ? '$yellow11'
                            : request.status === 'approved'
                              ? '$green11'
                              : '$red11'
                        }
                        fontWeight="600"
                        textTransform="capitalize"
                      >
                        {request.status}
                      </Text>
                    </YStack>
                  </XStack>

                  {request.email && (
                    <Text size="$2" theme="alt2">
                      Contact: {request.email}
                    </Text>
                  )}

                  <Text size="$1" theme="alt2">
                    Requested: {new Date(request.created_at).toLocaleDateString()}
                  </Text>

                  {request.status === 'pending' && (
                    <XStack gap="$2" marginTop="$2">
                      <Button
                        size="$3"
                        theme="green"
                        icon={Check}
                        disabled={updateRequestMutation.isPending}
                        onPress={() =>
                          updateRequestMutation.mutate({
                            requestId: request.id,
                            status: 'approved',
                          })
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="$3"
                        theme="red"
                        variant="outlined"
                        icon={X}
                        disabled={updateRequestMutation.isPending}
                        onPress={() =>
                          updateRequestMutation.mutate({
                            requestId: request.id,
                            status: 'rejected',
                          })
                        }
                      >
                        Reject
                      </Button>
                    </XStack>
                  )}
                </YStack>
              </Card>
            ))}
          </YStack>
        ) : (
          <Card bordered padding="$6" alignItems="center" gap="$2">
            <MapPin size={32} color="$gray8" />
            <Text theme="alt2" textAlign="center">
              {showAllRequests ? 'No city requests yet' : 'No pending requests'}
            </Text>
          </Card>
        )}
      </YStack>
      </YStack>
    </ScrollView>
  )
}
