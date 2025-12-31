import { ScrollView } from 'react-native'
import { YStack, XStack, H1, H2, Text, Button, Spinner, Card } from '@my/ui'
import { useRouter, useLink } from 'solito/navigation'
import { api } from 'app/utils/api'
import {
  Check,
  Clock,
  Calendar,
  DollarSign,
  Users,
  Plus,
  Settings,
  CreditCard,
} from '@tamagui/lucide-icons'

export function PractitionerDashboardScreen() {
  const router = useRouter()

  // Get practitioner profile
  const { data: profile, isLoading: profileLoading } = api.practitioners.getMyProfile.useQuery()

  // Get Stripe status
  const { data: stripeStatus } = api.payments.getAccountStatus.useQuery(undefined, {
    enabled: !!profile,
  })

  // Get earnings summary
  const { data: earnings } = api.payments.getEarningsSummary.useQuery(undefined, {
    enabled: !!profile,
  })

  // Links
  const offeringsLink = useLink({ href: '/practitioner/dashboard/offerings' })
  const bookingsLink = useLink({ href: '/practitioner/dashboard/bookings' })
  const settingsLink = useLink({ href: '/practitioner/dashboard/settings' })
  const newOfferingLink = useLink({ href: '/practitioner/dashboard/offerings/new' })
  const stripeSetupLink = useLink({ href: '/practitioner/stripe-setup' })

  if (profileLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Spinner size="large" />
      </YStack>
    )
  }

  if (!profile) {
    router.push('/practitioner/onboarding')
    return null
  }

  const isSetupComplete =
    profile.status === 'approved' &&
    stripeStatus?.onboardingComplete &&
    stripeStatus?.chargesEnabled

  return (
    <YStack flex={1} padding="$4" gap="$6">
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center">
        <YStack>
          <H1 size="$8">Dashboard</H1>
          <Text theme="alt2">{profile.business_name}</Text>
        </YStack>
        <Button {...settingsLink} icon={Settings} variant="outlined" circular />
      </XStack>

      {/* Setup Checklist (if not complete) */}
      {!isSetupComplete && (
        <Card bordered padding="$4" backgroundColor="$backgroundHover">
          <YStack gap="$4">
            <H2 size="$5">Complete Your Setup</H2>

            {/* Profile Status */}
            <XStack gap="$3" alignItems="center">
              <YStack
                width={28}
                height={28}
                borderRadius={14}
                backgroundColor={profile.status === 'approved' ? '$green10' : '$yellow10'}
                justifyContent="center"
                alignItems="center"
              >
                {profile.status === 'approved' ? (
                  <Check size={16} color="white" />
                ) : (
                  <Clock size={16} color="white" />
                )}
              </YStack>
              <YStack flex={1}>
                <Text fontWeight="600">Profile Approval</Text>
                <Text size="$2" theme="alt2">
                  {profile.status === 'approved'
                    ? 'Approved'
                    : profile.status === 'pending'
                      ? 'Pending review'
                      : profile.status === 'rejected'
                        ? `Rejected: ${profile.rejection_reason || 'No reason provided'}`
                        : 'Suspended'}
                </Text>
              </YStack>
            </XStack>

            {/* Stripe Status */}
            <XStack gap="$3" alignItems="center">
              <YStack
                width={28}
                height={28}
                borderRadius={14}
                backgroundColor={stripeStatus?.chargesEnabled ? '$green10' : '$yellow10'}
                justifyContent="center"
                alignItems="center"
              >
                {stripeStatus?.chargesEnabled ? (
                  <Check size={16} color="white" />
                ) : (
                  <CreditCard size={16} color="white" />
                )}
              </YStack>
              <YStack flex={1}>
                <Text fontWeight="600">Payment Setup</Text>
                <Text size="$2" theme="alt2">
                  {stripeStatus?.chargesEnabled
                    ? 'Ready to accept payments'
                    : stripeStatus?.onboardingComplete
                      ? 'Verification in progress'
                      : 'Connect Stripe to accept payments'}
                </Text>
              </YStack>
              {!stripeStatus?.chargesEnabled && (
                <Button size="$3" {...stripeSetupLink}>
                  {stripeStatus?.connected ? 'Continue' : 'Connect'}
                </Button>
              )}
            </XStack>
          </YStack>
        </Card>
      )}

      {/* Stats Grid */}
      <XStack flexWrap="wrap" gap="$4">
        <Card bordered padding="$4" flex={1} minWidth={150}>
          <YStack gap="$2">
            <XStack gap="$2" alignItems="center">
              <DollarSign size={20} color="$green10" />
              <Text size="$2" theme="alt2">
                This Month
              </Text>
            </XStack>
            <Text size="$8" fontWeight="700">
              ${earnings?.thisMonthEarnings?.toFixed(2) ?? '0.00'}
            </Text>
          </YStack>
        </Card>

        <Card bordered padding="$4" flex={1} minWidth={150}>
          <YStack gap="$2">
            <XStack gap="$2" alignItems="center">
              <Users size={20} color="$blue10" />
              <Text size="$2" theme="alt2">
                Completed
              </Text>
            </XStack>
            <Text size="$8" fontWeight="700">
              {earnings?.completedBookings ?? 0}
            </Text>
          </YStack>
        </Card>

        <Card bordered padding="$4" flex={1} minWidth={150}>
          <YStack gap="$2">
            <XStack gap="$2" alignItems="center">
              <DollarSign size={20} color="$purple10" />
              <Text size="$2" theme="alt2">
                Total Earnings
              </Text>
            </XStack>
            <Text size="$8" fontWeight="700">
              ${earnings?.totalEarnings?.toFixed(2) ?? '0.00'}
            </Text>
          </YStack>
        </Card>
      </XStack>

      {/* Quick Actions */}
      <YStack gap="$3">
        <H2 size="$5">Quick Actions</H2>

        <XStack flexWrap="wrap" gap="$3">
          <Button size="$4" icon={Plus} theme="active" {...newOfferingLink}>
            New Offering
          </Button>

          <Button size="$4" icon={Calendar} variant="outlined" {...offeringsLink}>
            Manage Offerings
          </Button>

          <Button size="$4" icon={Users} variant="outlined" {...bookingsLink}>
            View Bookings
          </Button>
        </XStack>
      </YStack>

      {/* Profile Preview Link */}
      {profile.status === 'approved' && profile.cities && (
        <Card bordered padding="$4">
          <XStack justifyContent="space-between" alignItems="center">
            <YStack>
              <Text fontWeight="600">Your Public Profile</Text>
              <Text size="$2" theme="alt2">
                /{(profile.cities as any).slug}/{profile.slug}
              </Text>
            </YStack>
            <Button
              size="$3"
              variant="outlined"
              onPress={() =>
                router.push(`/${(profile.cities as any).slug}/${profile.slug}`)
              }
            >
              View
            </Button>
          </XStack>
        </Card>
      )}
    </YStack>
  )
}
