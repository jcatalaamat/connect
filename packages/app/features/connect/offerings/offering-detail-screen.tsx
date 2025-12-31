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
  Avatar,
  Separator,
  Theme,
  ScrollView,
} from '@my/ui'
import { PriceDisplay, AvailabilitySlot, SpotsRemaining } from '@my/ui'
import { useRouter } from 'solito/navigation'
import { api } from 'app/utils/api'
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Video,
  Calendar,
  ChevronRight,
} from '@tamagui/lucide-icons'

export function OfferingDetailScreen({ offeringId }: { offeringId: string }) {
  const router = useRouter()
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [selectedEventDateId, setSelectedEventDateId] = useState<string | null>(null)

  // Get offering
  const { data: offering, isLoading } = api.offerings.getById.useQuery({ id: offeringId })

  // Get availability
  const { data: availability, isLoading: loadingAvailability } = api.offerings.getAvailability.useQuery(
    { offeringId },
    { enabled: !!offering }
  )

  const handleBookNow = () => {
    const params = new URLSearchParams()
    if (selectedSlotId) {
      params.set('slotId', selectedSlotId)
    }
    if (selectedEventDateId) {
      params.set('eventDateId', selectedEventDateId)
    }
    router.push(`/book/${offeringId}?${params.toString()}`)
  }

  if (isLoading) {
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
  const canBook =
    practitioner?.stripe_charges_enabled &&
    (isSession
      ? selectedSlotId !== null
      : selectedEventDateId !== null)

  const locationLabel = {
    in_person: 'In Person',
    virtual: 'Virtual',
    hybrid: 'Hybrid',
  }[offering.location_type]

  return (
    <YStack flex={1}>
      <ScrollView>
        <YStack padding="$4" gap="$5">
          {/* Back Button */}
          <XStack>
            <Button icon={ArrowLeft} circular variant="outlined" onPress={() => router.back()} />
          </XStack>

          {/* Header */}
          <YStack gap="$3">
            <XStack gap="$2" alignItems="center">
              <Theme name={isSession ? 'green' : 'purple'}>
                <Button size="$1" px="$2" br="$10" disabled>
                  {isSession ? '1:1 Session' : 'Event'}
                </Button>
              </Theme>
            </XStack>

            <H1 size="$8">{offering.title}</H1>

            <PriceDisplay
              amountCents={offering.price_cents}
              currency={offering.currency}
              size="lg"
            />
          </YStack>

          {/* Practitioner Card */}
          <Card
            bordered
            padding="$3"
            onPress={() => router.push(`/${city?.slug}/${practitioner?.slug}`)}
            pressStyle={{ opacity: 0.8 }}
          >
            <XStack gap="$3" alignItems="center">
              <Avatar circular size="$5">
                {practitioner?.avatar_url ? (
                  <Avatar.Image src={practitioner.avatar_url} />
                ) : (
                  <Avatar.Fallback backgroundColor="$blue10" jc="center" ai="center">
                    <Text color="white" fontWeight="600">
                      {practitioner?.business_name?.charAt(0) || 'P'}
                    </Text>
                  </Avatar.Fallback>
                )}
              </Avatar>

              <YStack flex={1}>
                <Text fontWeight="600">{practitioner?.business_name}</Text>
                <XStack alignItems="center" gap="$1">
                  <MapPin size={12} color="$gray10" />
                  <Text size="$2" theme="alt2">
                    {city?.name}
                  </Text>
                </XStack>
              </YStack>

              <ChevronRight size={20} color="$gray10" />
            </XStack>
          </Card>

          {/* Details */}
          <Card bordered padding="$4">
            <YStack gap="$4">
              <XStack gap="$6" flexWrap="wrap">
                {isSession && offering.duration_minutes && (
                  <XStack alignItems="center" gap="$2">
                    <Clock size={18} color="$gray10" />
                    <Text>{offering.duration_minutes} minutes</Text>
                  </XStack>
                )}

                {!isSession && offering.capacity && (
                  <XStack alignItems="center" gap="$2">
                    <Users size={18} color="$gray10" />
                    <Text>{offering.capacity} spots</Text>
                  </XStack>
                )}

                <XStack alignItems="center" gap="$2">
                  {offering.location_type === 'virtual' ? (
                    <Video size={18} color="$gray10" />
                  ) : (
                    <MapPin size={18} color="$gray10" />
                  )}
                  <Text>{locationLabel}</Text>
                </XStack>
              </XStack>

              {offering.description && (
                <>
                  <Separator />
                  <Paragraph lineHeight="$4">{offering.description}</Paragraph>
                </>
              )}

              {offering.location_address && (
                <>
                  <Separator />
                  <YStack gap="$1">
                    <Text size="$2" theme="alt2" fontWeight="600">
                      LOCATION
                    </Text>
                    <Text>{offering.location_address}</Text>
                    {offering.location_notes && (
                      <Text size="$2" theme="alt2">
                        {offering.location_notes}
                      </Text>
                    )}
                  </YStack>
                </>
              )}
            </YStack>
          </Card>

          {/* Availability Selection */}
          <YStack gap="$4">
            <H2 size="$5">
              {isSession ? 'Select a Time' : 'Select a Date'}
            </H2>

            {loadingAvailability ? (
              <XStack justifyContent="center" padding="$4">
                <Spinner />
              </XStack>
            ) : (
              <>
                {/* Session Slots */}
                {isSession && availability?.type === 'session' && (
                  <YStack gap="$2">
                    {availability.slots.length === 0 ? (
                      <Card bordered padding="$6" alignItems="center">
                        <Calendar size={32} color="$gray10" />
                        <Text theme="alt2" marginTop="$2">
                          No available time slots
                        </Text>
                        <Paragraph size="$2" theme="alt2" textAlign="center">
                          Check back later for new availability
                        </Paragraph>
                      </Card>
                    ) : (
                      <YStack gap="$2">
                        {availability.slots.map((slot) => (
                          <AvailabilitySlot
                            key={slot.id}
                            id={slot.id}
                            startTime={slot.start_time}
                            endTime={slot.end_time}
                            isBooked={slot.is_booked}
                            isSelected={selectedSlotId === slot.id}
                            onSelect={(id) => setSelectedSlotId(id === selectedSlotId ? null : id)}
                            timezone={city?.timezone}
                          />
                        ))}
                      </YStack>
                    )}
                  </YStack>
                )}

                {/* Event Dates */}
                {!isSession && availability?.type === 'event' && (
                  <YStack gap="$2">
                    {availability.dates.length === 0 ? (
                      <Card bordered padding="$6" alignItems="center">
                        <Calendar size={32} color="$gray10" />
                        <Text theme="alt2" marginTop="$2">
                          No upcoming event dates
                        </Text>
                        <Paragraph size="$2" theme="alt2" textAlign="center">
                          Check back later for new dates
                        </Paragraph>
                      </Card>
                    ) : (
                      <YStack gap="$2">
                        {availability.dates.map((eventDate) => (
                          <Card
                            key={eventDate.id}
                            bordered
                            padding="$4"
                            backgroundColor={
                              selectedEventDateId === eventDate.id ? '$blue2' : undefined
                            }
                            borderColor={
                              selectedEventDateId === eventDate.id ? '$blue10' : undefined
                            }
                            borderWidth={selectedEventDateId === eventDate.id ? 2 : 1}
                            onPress={() =>
                              setSelectedEventDateId(
                                eventDate.id === selectedEventDateId ? null : eventDate.id
                              )
                            }
                            pressStyle={{ opacity: 0.8 }}
                          >
                            <XStack justifyContent="space-between" alignItems="center">
                              <YStack gap="$1">
                                <Text fontWeight="600">
                                  {new Date(eventDate.start_time).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'short',
                                    day: 'numeric',
                                    timeZone: city?.timezone,
                                  })}
                                </Text>
                                <Text size="$2" theme="alt2">
                                  {new Date(eventDate.start_time).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    timeZone: city?.timezone,
                                  })}{' '}
                                  -{' '}
                                  {new Date(eventDate.end_time).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    timeZone: city?.timezone,
                                  })}
                                </Text>
                              </YStack>
                              <SpotsRemaining
                                spotsRemaining={eventDate.spots_remaining}
                                totalCapacity={eventDate.capacity_override || offering.capacity || 10}
                              />
                            </XStack>
                          </Card>
                        ))}
                      </YStack>
                    )}
                  </YStack>
                )}
              </>
            )}
          </YStack>

          {/* Stripe Not Connected Warning */}
          {!practitioner?.stripe_charges_enabled && (
            <Card bordered backgroundColor="$yellow2" padding="$4">
              <Paragraph color="$yellow11">
                This practitioner is not yet set up to accept payments. Please check back later.
              </Paragraph>
            </Card>
          )}
        </YStack>
      </ScrollView>

      {/* Fixed Book Button */}
      <YStack
        padding="$4"
        borderTopWidth={1}
        borderTopColor="$gray4"
        backgroundColor="$background"
      >
        <Button
          size="$5"
          theme="active"
          disabled={!canBook}
          onPress={handleBookNow}
        >
          {!practitioner?.stripe_charges_enabled
            ? 'Not Available'
            : isSession
            ? selectedSlotId
              ? 'Continue to Booking'
              : 'Select a Time'
            : selectedEventDateId
            ? 'Continue to Booking'
            : 'Select a Date'}
        </Button>
      </YStack>
    </YStack>
  )
}
