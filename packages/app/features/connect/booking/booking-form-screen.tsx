import { useState } from 'react'
import {
  YStack,
  XStack,
  H1,
  H2,
  Text,
  Button,
  Spinner,
  Card,
  Paragraph,
  Input,
  Label,
  Separator,
  TextArea,
} from '@my/ui'
import { PriceDisplay } from '@my/ui'
import { useRouter } from 'solito/navigation'
import { api } from 'app/utils/api'
import { ArrowLeft, CreditCard, Calendar, Clock, MapPin, Users } from '@tamagui/lucide-icons'

type FormData = {
  customerName: string
  customerEmail: string
  customerPhone: string
  customerNotes: string
  spots: number
}

export function BookingFormScreen({
  offeringId,
  slotId,
  eventDateId,
}: {
  offeringId: string
  slotId?: string
  eventDateId?: string
}) {
  const router = useRouter()

  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerNotes: '',
    spots: 1,
  })
  const [error, setError] = useState<string | null>(null)

  // Get offering details
  const { data: offering, isLoading: loadingOffering } = api.offerings.getById.useQuery({
    id: offeringId,
  })

  // Get specific slot/date details
  const { data: availability } = api.offerings.getAvailability.useQuery(
    { offeringId },
    { enabled: !!offering }
  )

  // Initiate checkout mutation
  const checkoutMutation = api.bookings.initiateCheckout.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl
      }
    },
    onError: (error) => {
      setError(error.message)
    },
  })

  const handleSubmit = () => {
    setError(null)

    if (!formData.customerName.trim()) {
      setError('Please enter your name')
      return
    }

    if (!formData.customerEmail.trim() || !formData.customerEmail.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    checkoutMutation.mutate({
      offeringId,
      slotId: slotId || undefined,
      eventDateId: eventDateId || undefined,
      customerName: formData.customerName.trim(),
      customerEmail: formData.customerEmail.trim().toLowerCase(),
      customerPhone: formData.customerPhone.trim() || undefined,
      customerNotes: formData.customerNotes.trim() || undefined,
      spots: formData.spots,
    })
  }

  if (loadingOffering) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Spinner size="large" />
      </YStack>
    )
  }

  if (!offering) {
    return (
      <YStack flex={1} padding="$4" gap="$4">
        <Button icon={ArrowLeft} circular variant="outlined" onPress={() => router.back()} />
        <Text>Offering not found</Text>
      </YStack>
    )
  }

  const practitioner = offering.practitioners as any
  const city = practitioner?.cities as any
  const isSession = offering.type === 'session'

  // Find selected slot or event date
  let selectedTime: { startTime: string; endTime: string; spotsRemaining?: number } | null = null
  if (isSession && slotId && availability?.type === 'session') {
    const slot = availability.slots.find((s) => s.id === slotId)
    if (slot) {
      selectedTime = { startTime: slot.start_time, endTime: slot.end_time }
    }
  } else if (!isSession && eventDateId && availability?.type === 'event') {
    const eventDate = availability.dates.find((d) => d.id === eventDateId)
    if (eventDate) {
      selectedTime = {
        startTime: eventDate.start_time,
        endTime: eventDate.end_time,
        spotsRemaining: eventDate.spots_remaining,
      }
    }
  }

  const totalAmount = offering.price_cents * formData.spots

  return (
    <YStack flex={1} padding="$4" gap="$6">
      {/* Header */}
      <XStack alignItems="center" gap="$3">
        <Button icon={ArrowLeft} circular variant="outlined" onPress={() => router.back()} />
        <H1 size="$7">Complete Booking</H1>
      </XStack>

      {/* Booking Summary */}
      <Card bordered padding="$4">
        <YStack gap="$3">
          <Text fontWeight="600" size="$2" theme="alt2">
            BOOKING SUMMARY
          </Text>

          <YStack gap="$2">
            <Text size="$5" fontWeight="600">
              {offering.title}
            </Text>
            <Text theme="alt2">{practitioner?.business_name}</Text>
          </YStack>

          <Separator />

          {selectedTime && (
            <XStack gap="$4" flexWrap="wrap">
              <XStack alignItems="center" gap="$2">
                <Calendar size={16} color="$gray10" />
                <Text>
                  {new Date(selectedTime.startTime).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    timeZone: city?.timezone,
                  })}
                </Text>
              </XStack>

              <XStack alignItems="center" gap="$2">
                <Clock size={16} color="$gray10" />
                <Text>
                  {new Date(selectedTime.startTime).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZone: city?.timezone,
                  })}
                </Text>
              </XStack>

              {offering.location_type !== 'virtual' && (
                <XStack alignItems="center" gap="$2">
                  <MapPin size={16} color="$gray10" />
                  <Text>{city?.name}</Text>
                </XStack>
              )}
            </XStack>
          )}
        </YStack>
      </Card>

      {/* Error Display */}
      {error && (
        <Card bordered backgroundColor="$red2" padding="$3">
          <Text color="$red10">{error}</Text>
        </Card>
      )}

      {/* Customer Info Form */}
      <YStack gap="$4">
        <H2 size="$5">Your Information</H2>

        <YStack gap="$2">
          <Label size="$4">Full Name *</Label>
          <Input
            size="$4"
            placeholder="Enter your full name"
            value={formData.customerName}
            onChangeText={(value) => setFormData((prev) => ({ ...prev, customerName: value }))}
          />
        </YStack>

        <YStack gap="$2">
          <Label size="$4">Email *</Label>
          <Input
            size="$4"
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.customerEmail}
            onChangeText={(value) => setFormData((prev) => ({ ...prev, customerEmail: value }))}
          />
          <Text size="$2" theme="alt2">
            Your confirmation will be sent to this email
          </Text>
        </YStack>

        <YStack gap="$2">
          <Label size="$4">Phone (optional)</Label>
          <Input
            size="$4"
            placeholder="+1 (555) 000-0000"
            keyboardType="phone-pad"
            value={formData.customerPhone}
            onChangeText={(value) => setFormData((prev) => ({ ...prev, customerPhone: value }))}
          />
        </YStack>

        {/* Spots (for events only) */}
        {!isSession && selectedTime?.spotsRemaining && (
          <YStack gap="$2">
            <Label size="$4">Number of Spots</Label>
            <XStack gap="$3" alignItems="center">
              <Button
                size="$3"
                circular
                disabled={formData.spots <= 1}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, spots: Math.max(1, prev.spots - 1) }))
                }
              >
                -
              </Button>
              <Text size="$6" fontWeight="600" minWidth={40} textAlign="center">
                {formData.spots}
              </Text>
              <Button
                size="$3"
                circular
                disabled={formData.spots >= (selectedTime.spotsRemaining || 1)}
                onPress={() =>
                  setFormData((prev) => ({
                    ...prev,
                    spots: Math.min(selectedTime!.spotsRemaining || 1, prev.spots + 1),
                  }))
                }
              >
                +
              </Button>
              <Text size="$2" theme="alt2">
                ({selectedTime.spotsRemaining} available)
              </Text>
            </XStack>
          </YStack>
        )}

        <YStack gap="$2">
          <Label size="$4">Notes for practitioner (optional)</Label>
          <TextArea
            size="$4"
            placeholder="Any special requests or information..."
            value={formData.customerNotes}
            onChangeText={(value) => setFormData((prev) => ({ ...prev, customerNotes: value }))}
            minHeight={80}
          />
        </YStack>
      </YStack>

      {/* Total and Checkout */}
      <Card bordered padding="$4" backgroundColor="$backgroundHover">
        <YStack gap="$4">
          <XStack justifyContent="space-between" alignItems="center">
            <Text size="$5" fontWeight="600">
              Total
            </Text>
            <PriceDisplay amountCents={totalAmount} currency={offering.currency} size="lg" />
          </XStack>

          {formData.spots > 1 && (
            <Text size="$2" theme="alt2">
              {formData.spots} x ${(offering.price_cents / 100).toFixed(2)}
            </Text>
          )}

          <Button
            size="$5"
            theme="active"
            icon={CreditCard}
            onPress={handleSubmit}
            disabled={checkoutMutation.isPending}
          >
            {checkoutMutation.isPending ? <Spinner size="small" /> : 'Proceed to Payment'}
          </Button>

          <Text size="$2" theme="alt2" textAlign="center">
            You'll be redirected to our secure payment provider
          </Text>
        </YStack>
      </Card>
    </YStack>
  )
}
