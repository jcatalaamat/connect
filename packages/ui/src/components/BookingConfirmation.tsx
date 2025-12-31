import { Card, type CardProps, H4, H6, Paragraph, Separator, XStack, YStack, Theme, Button } from 'tamagui'
import { StatusBadge } from './StatusBadge'
import { PriceDisplay } from './PriceDisplay'

export type BookingConfirmationProps = {
  confirmationCode: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded' | 'completed' | 'no_show'
  customerName: string
  offeringTitle: string
  offeringType: 'session' | 'event'
  practitionerName: string
  dateTime: string
  endTime?: string
  locationType: 'in_person' | 'virtual' | 'hybrid'
  locationAddress?: string | null
  virtualLink?: string | null
  amountCents: number
  currency: string
  spotsBooked?: number
  contactEmail?: string
  contactPhone?: string
  timezone?: string
} & CardProps

function formatDateTime(dateString: string, timezone?: string): { date: string; time: string } {
  const date = new Date(dateString)
  return {
    date: date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: timezone,
    }),
    time: date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone,
      hour12: true,
    }),
  }
}

export const BookingConfirmation = ({
  confirmationCode,
  status,
  customerName,
  offeringTitle,
  offeringType,
  practitionerName,
  dateTime,
  endTime,
  locationType,
  locationAddress,
  virtualLink,
  amountCents,
  currency,
  spotsBooked = 1,
  contactEmail,
  contactPhone,
  timezone,
  ...props
}: BookingConfirmationProps) => {
  const { date, time } = formatDateTime(dateTime, timezone)
  const endTimeFormatted = endTime
    ? new Date(endTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: timezone,
        hour12: true,
      })
    : null

  const locationLabel = {
    in_person: 'In Person',
    virtual: 'Virtual',
    hybrid: 'Hybrid',
  }[locationType]

  return (
    <Card p="$5" borderRadius="$4" {...props}>
      <YStack gap="$4">
        {/* Header */}
        <XStack jc="space-between" ai="center">
          <YStack gap="$1">
            <Paragraph size="$2" color="$gray10">Confirmation Code</Paragraph>
            <H4 fontWeight="700" letterSpacing={2}>{confirmationCode}</H4>
          </YStack>
          <StatusBadge status={status} />
        </XStack>

        <Separator />

        {/* Booking Details */}
        <YStack gap="$3">
          <Paragraph size="$2" color="$gray10" fontWeight="600">BOOKING DETAILS</Paragraph>

          <YStack gap="$2">
            <XStack jc="space-between">
              <Paragraph color="$gray11">Service</Paragraph>
              <Paragraph fontWeight="600">{offeringTitle}</Paragraph>
            </XStack>

            <XStack jc="space-between">
              <Paragraph color="$gray11">Practitioner</Paragraph>
              <Paragraph fontWeight="600">{practitionerName}</Paragraph>
            </XStack>

            <XStack jc="space-between">
              <Paragraph color="$gray11">Date</Paragraph>
              <Paragraph fontWeight="600">{date}</Paragraph>
            </XStack>

            <XStack jc="space-between">
              <Paragraph color="$gray11">Time</Paragraph>
              <Paragraph fontWeight="600">
                {time}
                {endTimeFormatted && ` - ${endTimeFormatted}`}
              </Paragraph>
            </XStack>

            {offeringType === 'event' && spotsBooked > 1 && (
              <XStack jc="space-between">
                <Paragraph color="$gray11">Spots</Paragraph>
                <Paragraph fontWeight="600">{spotsBooked}</Paragraph>
              </XStack>
            )}

            <XStack jc="space-between">
              <Paragraph color="$gray11">Location</Paragraph>
              <Paragraph fontWeight="600">{locationLabel}</Paragraph>
            </XStack>

            {locationAddress && (
              <XStack jc="space-between">
                <Paragraph color="$gray11">Address</Paragraph>
                <Paragraph fontWeight="600" f={1} textAlign="right">{locationAddress}</Paragraph>
              </XStack>
            )}
          </YStack>
        </YStack>

        <Separator />

        {/* Payment */}
        <YStack gap="$3">
          <Paragraph size="$2" color="$gray10" fontWeight="600">PAYMENT</Paragraph>
          <XStack jc="space-between" ai="center">
            <Paragraph color="$gray11">Total Paid</Paragraph>
            <PriceDisplay amountCents={amountCents} currency={currency} size="lg" />
          </XStack>
        </YStack>

        {/* Contact Info */}
        {(contactEmail || contactPhone) && (
          <>
            <Separator />
            <YStack gap="$3">
              <Paragraph size="$2" color="$gray10" fontWeight="600">PRACTITIONER CONTACT</Paragraph>
              {contactEmail && (
                <XStack jc="space-between">
                  <Paragraph color="$gray11">Email</Paragraph>
                  <Paragraph fontWeight="600">{contactEmail}</Paragraph>
                </XStack>
              )}
              {contactPhone && (
                <XStack jc="space-between">
                  <Paragraph color="$gray11">Phone</Paragraph>
                  <Paragraph fontWeight="600">{contactPhone}</Paragraph>
                </XStack>
              )}
            </YStack>
          </>
        )}

        {/* Virtual Link */}
        {virtualLink && (locationType === 'virtual' || locationType === 'hybrid') && status === 'confirmed' && (
          <>
            <Separator />
            <YStack gap="$2">
              <Paragraph size="$2" color="$gray10" fontWeight="600">JOIN VIRTUALLY</Paragraph>
              <Theme name="blue">
                <Button size="$4" borderRadius="$3">
                  Join Meeting
                </Button>
              </Theme>
            </YStack>
          </>
        )}
      </YStack>
    </Card>
  )
}
