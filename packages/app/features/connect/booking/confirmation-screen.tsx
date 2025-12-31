import { YStack, XStack, H1, Text, Button, Spinner, Card, Paragraph } from '@my/ui'
import { BookingConfirmation } from '@my/ui'
import { useRouter, useLink } from 'solito/navigation'
import { api } from 'app/utils/api'
import { Check, Home, Calendar } from '@tamagui/lucide-icons'

export function BookingConfirmationScreen({
  confirmationCode,
  email,
}: {
  confirmationCode: string
  email?: string
}) {
  const router = useRouter()

  // Try to get booking details
  const {
    data: booking,
    isLoading,
    error,
  } = api.bookings.getByConfirmation.useQuery(
    { confirmationCode, email: email || '' },
    {
      enabled: !!confirmationCode && !!email,
      retry: false,
    }
  )

  const homeLink = useLink({ href: '/city-select' })

  // If we don't have email, show success message with code
  if (!email) {
    return (
      <YStack flex={1} padding="$4" justifyContent="center" alignItems="center" gap="$6">
        <YStack
          width={80}
          height={80}
          borderRadius={40}
          backgroundColor="$green10"
          justifyContent="center"
          alignItems="center"
        >
          <Check size={40} color="white" />
        </YStack>

        <YStack alignItems="center" gap="$3">
          <H1 size="$8">Booking Confirmed!</H1>
          <Paragraph textAlign="center" theme="alt2">
            Your booking has been confirmed. Check your email for details.
          </Paragraph>
        </YStack>

        <Card bordered padding="$4" alignItems="center" gap="$2">
          <Text size="$2" theme="alt2">
            Confirmation Code
          </Text>
          <Text size="$8" fontWeight="700" letterSpacing={2}>
            {confirmationCode}
          </Text>
        </Card>

        <Paragraph textAlign="center" size="$3" theme="alt2">
          Save this code to look up your booking anytime
        </Paragraph>

        <XStack gap="$3">
          <Button icon={Home} variant="outlined" {...homeLink}>
            Back to Home
          </Button>
          <Button
            icon={Calendar}
            theme="active"
            onPress={() => router.push(`/booking/lookup?code=${confirmationCode}`)}
          >
            View Booking
          </Button>
        </XStack>
      </YStack>
    )
  }

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Spinner size="large" />
        <Text marginTop="$4" theme="alt2">
          Loading booking details...
        </Text>
      </YStack>
    )
  }

  if (error || !booking) {
    return (
      <YStack flex={1} padding="$4" justifyContent="center" alignItems="center" gap="$6">
        <YStack
          width={80}
          height={80}
          borderRadius={40}
          backgroundColor="$green10"
          justifyContent="center"
          alignItems="center"
        >
          <Check size={40} color="white" />
        </YStack>

        <YStack alignItems="center" gap="$3">
          <H1 size="$8">Booking Confirmed!</H1>
          <Paragraph textAlign="center" theme="alt2">
            Your booking has been confirmed. Check your email for full details.
          </Paragraph>
        </YStack>

        <Card bordered padding="$4" alignItems="center" gap="$2">
          <Text size="$2" theme="alt2">
            Confirmation Code
          </Text>
          <Text size="$8" fontWeight="700" letterSpacing={2}>
            {confirmationCode}
          </Text>
        </Card>

        <Button icon={Home} theme="active" {...homeLink}>
          Back to Home
        </Button>
      </YStack>
    )
  }

  const offering = booking.offerings as any
  const practitioner = offering.practitioners as any
  const slot = booking.availability_slots as any
  const eventDate = booking.event_dates as any
  const dateTime = slot?.start_time || eventDate?.start_time
  const endTime = slot?.end_time || eventDate?.end_time

  return (
    <YStack flex={1} padding="$4" gap="$6">
      {/* Success Header */}
      <YStack alignItems="center" gap="$3" paddingTop="$6">
        <YStack
          width={80}
          height={80}
          borderRadius={40}
          backgroundColor="$green10"
          justifyContent="center"
          alignItems="center"
        >
          <Check size={40} color="white" />
        </YStack>

        <H1 size="$7">Booking Confirmed!</H1>
        <Paragraph textAlign="center" theme="alt2">
          A confirmation email has been sent to {booking.customer_email}
        </Paragraph>
      </YStack>

      {/* Booking Details */}
      <BookingConfirmation
        confirmationCode={booking.confirmation_code}
        status={booking.status as any}
        customerName={booking.customer_name}
        offeringTitle={offering.title}
        offeringType={offering.type}
        practitionerName={practitioner.business_name}
        dateTime={dateTime}
        endTime={endTime}
        locationType={offering.location_type}
        locationAddress={offering.location_address}
        virtualLink={offering.virtual_link}
        amountCents={booking.amount_cents}
        currency={booking.currency}
        spotsBooked={booking.spots_booked}
        contactEmail={practitioner.contact_email}
        contactPhone={practitioner.phone}
      />

      {/* Actions */}
      <XStack gap="$3" justifyContent="center">
        <Button icon={Home} variant="outlined" {...homeLink}>
          Back to Home
        </Button>
      </XStack>
    </YStack>
  )
}
