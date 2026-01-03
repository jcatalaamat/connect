import { useEffect, useState } from 'react'
import { YStack, H1, H2, Text, Button, Spinner, Card, XStack } from '@my/ui'
import { useRouter } from 'solito/navigation'
import { api } from 'app/utils/api'
import { Check, ExternalLink, AlertCircle, CreditCard } from '@tamagui/lucide-icons'
import { Linking, Platform } from 'react-native'

export function StripeOnboardingScreen() {
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Check if user has a practitioner profile
  const { data: profile, isLoading: profileLoading, error: profileError } = api.practitioners.getMyProfile.useQuery()

  // Get Stripe account status
  const {
    data: stripeStatus,
    isLoading: statusLoading,
    error: statusError,
    refetch: refetchStatus,
  } = api.payments.getAccountStatus.useQuery(undefined, {
    enabled: !!profile,
    refetchInterval: 5000, // Poll every 5 seconds while on this page
  })

  // Get onboarding link mutation
  const onboardingMutation = api.payments.getStripeOnboardingLink.useMutation({
    onSuccess: (data) => {
      setIsRedirecting(true)
      // Open Stripe onboarding in browser
      if (Platform.OS === 'web') {
        window.location.href = data.url
      } else {
        Linking.openURL(data.url)
      }
    },
  })

  // Redirect to onboarding if no profile
  useEffect(() => {
    if (!profileLoading && !profile) {
      router.push('/practitioner/onboarding')
    }
  }, [profile, profileLoading, router])

  // Redirect to dashboard if Stripe is fully set up
  useEffect(() => {
    if (stripeStatus?.onboardingComplete && stripeStatus?.chargesEnabled) {
      router.push('/practitioner/dashboard')
    }
  }, [stripeStatus, router])

  if (profileLoading || statusLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Spinner size="large" />
        <Text marginTop="$4">Loading...</Text>
      </YStack>
    )
  }

  // Show error if not authenticated
  if (profileError) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$4">
        <AlertCircle size={48} color="$red10" />
        <Text size="$5" fontWeight="600">Please sign in</Text>
        <Text theme="alt2" textAlign="center">
          You need to be signed in to access Stripe setup.
        </Text>
        <Button onPress={() => router.push('/sign-in')}>Sign In</Button>
      </YStack>
    )
  }

  // Show error if Stripe API fails
  if (statusError) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$4">
        <AlertCircle size={48} color="$orange10" />
        <Text size="$5" fontWeight="600">Stripe Error</Text>
        <Text theme="alt2" textAlign="center">
          {statusError.message || 'Failed to connect to Stripe. Please try again later.'}
        </Text>
        <Button onPress={() => refetchStatus()}>Retry</Button>
      </YStack>
    )
  }

  if (!profile) {
    return null // Will redirect
  }

  const handleStartOnboarding = () => {
    onboardingMutation.mutate()
  }

  return (
    <YStack flex={1} padding="$4" gap="$6" maxWidth={600} marginHorizontal="auto">
      <YStack gap="$2">
        <H1 size="$8">Connect with Stripe</H1>
        <Text theme="alt2">
          To accept payments, you need to connect your Stripe account. This allows you to receive
          payouts directly to your bank account.
        </Text>
      </YStack>

      {/* Status Card */}
      <Card bordered padding="$4">
        <YStack gap="$4">
          <H2 size="$5">Setup Status</H2>

          {/* Profile Created */}
          <XStack gap="$3" alignItems="center">
            <YStack
              width={32}
              height={32}
              borderRadius={16}
              backgroundColor="$green10"
              justifyContent="center"
              alignItems="center"
            >
              <Check size={18} color="white" />
            </YStack>
            <YStack flex={1}>
              <Text fontWeight="600">Profile Created</Text>
              <Text size="$2" theme="alt2">
                {profile.business_name}
              </Text>
            </YStack>
          </XStack>

          {/* Stripe Connected */}
          <XStack gap="$3" alignItems="center">
            <YStack
              width={32}
              height={32}
              borderRadius={16}
              backgroundColor={stripeStatus?.connected ? '$green10' : '$gray8'}
              justifyContent="center"
              alignItems="center"
            >
              {stripeStatus?.connected ? (
                <Check size={18} color="white" />
              ) : (
                <CreditCard size={18} color="white" />
              )}
            </YStack>
            <YStack flex={1}>
              <Text fontWeight="600">Stripe Account</Text>
              <Text size="$2" theme="alt2">
                {stripeStatus?.connected ? 'Connected' : 'Not connected'}
              </Text>
            </YStack>
          </XStack>

          {/* Onboarding Complete */}
          <XStack gap="$3" alignItems="center">
            <YStack
              width={32}
              height={32}
              borderRadius={16}
              backgroundColor={stripeStatus?.onboardingComplete ? '$green10' : '$gray8'}
              justifyContent="center"
              alignItems="center"
            >
              {stripeStatus?.onboardingComplete ? (
                <Check size={18} color="white" />
              ) : (
                <Text color="white" fontWeight="600">
                  2
                </Text>
              )}
            </YStack>
            <YStack flex={1}>
              <Text fontWeight="600">Onboarding Complete</Text>
              <Text size="$2" theme="alt2">
                {stripeStatus?.onboardingComplete
                  ? 'All details submitted'
                  : 'Complete Stripe onboarding'}
              </Text>
            </YStack>
          </XStack>

          {/* Can Accept Payments */}
          <XStack gap="$3" alignItems="center">
            <YStack
              width={32}
              height={32}
              borderRadius={16}
              backgroundColor={stripeStatus?.chargesEnabled ? '$green10' : '$gray8'}
              justifyContent="center"
              alignItems="center"
            >
              {stripeStatus?.chargesEnabled ? (
                <Check size={18} color="white" />
              ) : (
                <Text color="white" fontWeight="600">
                  3
                </Text>
              )}
            </YStack>
            <YStack flex={1}>
              <Text fontWeight="600">Ready to Accept Payments</Text>
              <Text size="$2" theme="alt2">
                {stripeStatus?.chargesEnabled
                  ? 'You can accept payments'
                  : 'Pending Stripe verification'}
              </Text>
            </YStack>
          </XStack>
        </YStack>
      </Card>

      {/* Action Button */}
      {!stripeStatus?.onboardingComplete && (
        <YStack gap="$3">
          <Button
            size="$5"
            theme="active"
            onPress={handleStartOnboarding}
            disabled={onboardingMutation.isPending || isRedirecting}
            iconAfter={ExternalLink}
          >
            {onboardingMutation.isPending || isRedirecting ? (
              <Spinner />
            ) : stripeStatus?.connected ? (
              'Continue Stripe Setup'
            ) : (
              'Connect with Stripe'
            )}
          </Button>

          <Text size="$2" theme="alt2" textAlign="center">
            You'll be redirected to Stripe to complete the onboarding process.
          </Text>
        </YStack>
      )}

      {/* Waiting for verification */}
      {stripeStatus?.onboardingComplete && !stripeStatus?.chargesEnabled && (
        <Card bordered padding="$4" backgroundColor="$yellow2">
          <XStack gap="$3" alignItems="center">
            <AlertCircle size={24} color="$yellow10" />
            <YStack flex={1}>
              <Text fontWeight="600">Verification in Progress</Text>
              <Text size="$2">
                Stripe is verifying your account. This usually takes a few minutes but can take up
                to 24 hours.
              </Text>
            </YStack>
          </XStack>
        </Card>
      )}

      {/* Profile pending approval notice */}
      {profile.status === 'pending' && (
        <Card bordered padding="$4" backgroundColor="$blue2">
          <XStack gap="$3" alignItems="center">
            <AlertCircle size={24} color="$blue10" />
            <YStack flex={1}>
              <Text fontWeight="600">Profile Pending Approval</Text>
              <Text size="$2">
                A city admin will review your profile. You'll be notified when approved.
              </Text>
            </YStack>
          </XStack>
        </Card>
      )}

      {/* Skip for now */}
      {!stripeStatus?.chargesEnabled && (
        <Button variant="outlined" onPress={() => router.push('/practitioner/dashboard')}>
          Skip for now
        </Button>
      )}
    </YStack>
  )
}
