import { useEffect } from 'react'
import { YStack, Text, Spinner } from '@my/ui'
import { useRouter } from 'solito/navigation'

export default function StripeCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to stripe-setup page which will check the status
    const timer = setTimeout(() => {
      router.push('/practitioner/stripe-setup')
    }, 1500)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$4">
      <Spinner size="large" />
      <Text>Completing Stripe setup...</Text>
      <Text size="$2" theme="alt2">
        You'll be redirected shortly.
      </Text>
    </YStack>
  )
}
