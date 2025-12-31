import { useState, useEffect } from 'react'
import {
  YStack,
  XStack,
  H1,
  Text,
  Button,
  Spinner,
  Card,
  Paragraph,
  Input,
  Label,
} from '@my/ui'
import { BookingConfirmation } from '@my/ui'
import { useRouter } from 'solito/navigation'
import { api } from 'app/utils/api'
import { Search, ArrowLeft } from '@tamagui/lucide-icons'

export function BookingLookupScreen({ initialCode }: { initialCode?: string }) {
  const router = useRouter()

  const [confirmationCode, setConfirmationCode] = useState(initialCode || '')
  const [email, setEmail] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  // Query
  const {
    data: booking,
    isLoading,
    error,
    refetch,
  } = api.bookings.getByConfirmation.useQuery(
    { confirmationCode: confirmationCode.toUpperCase(), email: email.toLowerCase() },
    {
      enabled: false, // Manual trigger
      retry: false,
    }
  )

  const handleSearch = async () => {
    if (!confirmationCode.trim() || !email.trim()) return
    setHasSearched(true)
    refetch()
  }

  // Auto-search if initial code provided
  useEffect(() => {
    if (initialCode && email) {
      handleSearch()
    }
  }, [initialCode])

  const offering = booking?.offerings as any
  const practitioner = offering?.practitioners as any
  const slot = booking?.availability_slots as any
  const eventDate = booking?.event_dates as any
  const dateTime = slot?.start_time || eventDate?.start_time
  const endTime = slot?.end_time || eventDate?.end_time

  return (
    <YStack flex={1} padding="$4" gap="$6">
      {/* Header */}
      <XStack alignItems="center" gap="$3">
        <Button icon={ArrowLeft} circular variant="outlined" onPress={() => router.back()} />
        <H1 size="$7">Find Your Booking</H1>
      </XStack>

      <Paragraph theme="alt2">
        Enter your confirmation code and email to look up your booking details.
      </Paragraph>

      {/* Search Form */}
      <Card bordered padding="$4">
        <YStack gap="$4">
          <YStack gap="$2">
            <Label size="$4">Confirmation Code</Label>
            <Input
              size="$4"
              placeholder="CONN-XXXXXX"
              value={confirmationCode}
              onChangeText={(value) => setConfirmationCode(value.toUpperCase())}
              autoCapitalize="characters"
            />
          </YStack>

          <YStack gap="$2">
            <Label size="$4">Email Address</Label>
            <Input
              size="$4"
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </YStack>

          <Button
            size="$4"
            theme="active"
            icon={Search}
            onPress={handleSearch}
            disabled={isLoading || !confirmationCode.trim() || !email.trim()}
          >
            {isLoading ? <Spinner size="small" /> : 'Find Booking'}
          </Button>
        </YStack>
      </Card>

      {/* Error */}
      {hasSearched && error && (
        <Card bordered backgroundColor="$red2" padding="$4">
          <YStack alignItems="center" gap="$2">
            <Text fontWeight="600" color="$red10">
              Booking Not Found
            </Text>
            <Paragraph textAlign="center" size="$3" color="$red11">
              We couldn't find a booking with that confirmation code and email. Please check your
              details and try again.
            </Paragraph>
          </YStack>
        </Card>
      )}

      {/* Booking Result */}
      {booking && (
        <YStack gap="$4">
          <Text fontWeight="600" theme="alt2">
            BOOKING FOUND
          </Text>

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
        </YStack>
      )}
    </YStack>
  )
}
