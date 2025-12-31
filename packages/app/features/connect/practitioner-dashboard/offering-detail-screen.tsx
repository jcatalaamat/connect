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
  Separator,
  Input,
  Label,
} from '@my/ui'
import { PriceDisplay, StatusBadge, AvailabilitySlot, SpotsRemaining } from '@my/ui'
import { useRouter, useLink } from 'solito/navigation'
import { api } from 'app/utils/api'
import {
  ArrowLeft,
  Edit3,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
} from '@tamagui/lucide-icons'

export function OfferingDetailScreen({ offeringId }: { offeringId: string }) {
  const router = useRouter()
  const utils = api.useUtils()

  const [showAddSlot, setShowAddSlot] = useState(false)
  const [showAddEventDate, setShowAddEventDate] = useState(false)
  const [newSlotDate, setNewSlotDate] = useState('')
  const [newSlotStartTime, setNewSlotStartTime] = useState('')
  const [newSlotEndTime, setNewSlotEndTime] = useState('')
  const [newEventCapacity, setNewEventCapacity] = useState('')

  // Fetch offering
  const { data: offering, isLoading } = api.offerings.getById.useQuery({ id: offeringId })

  // Fetch availability
  const { data: availability } = api.offerings.getAvailability.useQuery(
    { offeringId },
    { enabled: !!offering }
  )

  // Mutations
  const addSlotMutation = api.offerings.addSlot.useMutation({
    onSuccess: () => {
      utils.offerings.getAvailability.invalidate({ offeringId })
      setShowAddSlot(false)
      resetSlotForm()
    },
  })

  const removeSlotMutation = api.offerings.removeSlot.useMutation({
    onSuccess: () => {
      utils.offerings.getAvailability.invalidate({ offeringId })
    },
  })

  const addEventDateMutation = api.offerings.addEventDate.useMutation({
    onSuccess: () => {
      utils.offerings.getAvailability.invalidate({ offeringId })
      setShowAddEventDate(false)
      resetSlotForm()
    },
  })

  const removeEventDateMutation = api.offerings.removeEventDate.useMutation({
    onSuccess: () => {
      utils.offerings.getAvailability.invalidate({ offeringId })
    },
  })

  const resetSlotForm = () => {
    setNewSlotDate('')
    setNewSlotStartTime('')
    setNewSlotEndTime('')
    setNewEventCapacity('')
  }

  const handleAddSlot = () => {
    if (!newSlotDate || !newSlotStartTime || !newSlotEndTime) return

    const startTime = new Date(`${newSlotDate}T${newSlotStartTime}`).toISOString()
    const endTime = new Date(`${newSlotDate}T${newSlotEndTime}`).toISOString()

    addSlotMutation.mutate({ offeringId, startTime, endTime })
  }

  const handleAddEventDate = () => {
    if (!newSlotDate || !newSlotStartTime || !newSlotEndTime) return

    const startTime = new Date(`${newSlotDate}T${newSlotStartTime}`).toISOString()
    const endTime = new Date(`${newSlotDate}T${newSlotEndTime}`).toISOString()
    const capacityOverride = newEventCapacity ? parseInt(newEventCapacity) : undefined

    addEventDateMutation.mutate({ offeringId, startTime, endTime, capacityOverride })
  }

  const handleRemoveSlot = (slotId: string) => {
    if (confirm('Remove this time slot?')) {
      removeSlotMutation.mutate({ slotId })
    }
  }

  const handleRemoveEventDate = (eventDateId: string) => {
    if (confirm('Remove this event date?')) {
      removeEventDateMutation.mutate({ eventDateId })
    }
  }

  const editLink = useLink({ href: `/practitioner/dashboard/offerings/${offeringId}/edit` })

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

  const isSession = offering.type === 'session'
  const locationLabel = {
    in_person: 'In Person',
    virtual: 'Virtual',
    hybrid: 'Hybrid',
  }[offering.location_type]

  return (
    <YStack flex={1} padding="$4" gap="$6">
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="flex-start">
        <XStack alignItems="center" gap="$3" flex={1}>
          <Button icon={ArrowLeft} circular variant="outlined" onPress={() => router.back()} />
          <YStack flex={1}>
            <H1 size="$7" numberOfLines={1}>
              {offering.title}
            </H1>
            <XStack gap="$2" alignItems="center">
              <StatusBadge
                status={offering.is_active ? 'approved' : 'suspended'}
                type="practitioner"
                size="sm"
              />
              <Text size="$2" theme="alt2">
                {isSession ? '1:1 Session' : 'Event'}
              </Text>
            </XStack>
          </YStack>
        </XStack>

        <Button icon={Edit3} variant="outlined" {...editLink}>
          Edit
        </Button>
      </XStack>

      {/* Details Card */}
      <Card bordered padding="$4">
        <YStack gap="$4">
          <XStack justifyContent="space-between" alignItems="center">
            <Text size="$2" theme="alt2" fontWeight="600">
              PRICE
            </Text>
            <PriceDisplay amountCents={offering.price_cents} currency={offering.currency} size="lg" />
          </XStack>

          <Separator />

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
              <Paragraph>{offering.description}</Paragraph>
            </>
          )}

          {offering.location_address && (
            <>
              <Separator />
              <YStack gap="$1">
                <Text size="$2" theme="alt2" fontWeight="600">
                  ADDRESS
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

      {/* Availability Section */}
      <YStack gap="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <H2 size="$6">{isSession ? 'Available Time Slots' : 'Event Dates'}</H2>
          <Button
            icon={Plus}
            size="$3"
            onPress={() => (isSession ? setShowAddSlot(true) : setShowAddEventDate(true))}
          >
            Add {isSession ? 'Slot' : 'Date'}
          </Button>
        </XStack>

        {/* Add Slot/Date Form */}
        {(showAddSlot || showAddEventDate) && (
          <Card bordered padding="$4" backgroundColor="$backgroundHover">
            <YStack gap="$4">
              <Text fontWeight="600">Add New {isSession ? 'Time Slot' : 'Event Date'}</Text>

              <XStack gap="$3" flexWrap="wrap">
                <YStack gap="$2" flex={1} minWidth={120}>
                  <Label size="$3">Date</Label>
                  <Input
                    size="$3"
                    type="date"
                    value={newSlotDate}
                    onChangeText={setNewSlotDate}
                    placeholder="YYYY-MM-DD"
                  />
                </YStack>

                <YStack gap="$2" flex={1} minWidth={100}>
                  <Label size="$3">Start Time</Label>
                  <Input
                    size="$3"
                    type="time"
                    value={newSlotStartTime}
                    onChangeText={setNewSlotStartTime}
                    placeholder="HH:MM"
                  />
                </YStack>

                <YStack gap="$2" flex={1} minWidth={100}>
                  <Label size="$3">End Time</Label>
                  <Input
                    size="$3"
                    type="time"
                    value={newSlotEndTime}
                    onChangeText={setNewSlotEndTime}
                    placeholder="HH:MM"
                  />
                </YStack>

                {!isSession && (
                  <YStack gap="$2" flex={1} minWidth={100}>
                    <Label size="$3">Capacity Override</Label>
                    <Input
                      size="$3"
                      keyboardType="number-pad"
                      value={newEventCapacity}
                      onChangeText={setNewEventCapacity}
                      placeholder={offering.capacity?.toString() || '10'}
                    />
                  </YStack>
                )}
              </XStack>

              <XStack gap="$3" justifyContent="flex-end">
                <Button
                  size="$3"
                  variant="outlined"
                  onPress={() => {
                    setShowAddSlot(false)
                    setShowAddEventDate(false)
                    resetSlotForm()
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="$3"
                  theme="active"
                  onPress={isSession ? handleAddSlot : handleAddEventDate}
                  disabled={
                    !newSlotDate ||
                    !newSlotStartTime ||
                    !newSlotEndTime ||
                    addSlotMutation.isPending ||
                    addEventDateMutation.isPending
                  }
                >
                  {addSlotMutation.isPending || addEventDateMutation.isPending ? (
                    <Spinner size="small" />
                  ) : (
                    'Add'
                  )}
                </Button>
              </XStack>
            </YStack>
          </Card>
        )}

        {/* Slots/Dates List */}
        {isSession && availability?.type === 'session' && (
          <YStack gap="$2">
            {availability.slots.length === 0 ? (
              <Card bordered padding="$6" alignItems="center">
                <Calendar size={32} color="$gray10" />
                <Text theme="alt2" marginTop="$2">
                  No time slots added yet
                </Text>
              </Card>
            ) : (
              availability.slots.map((slot) => (
                <XStack
                  key={slot.id}
                  backgroundColor="$gray2"
                  padding="$3"
                  borderRadius="$3"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <AvailabilitySlot
                    id={slot.id}
                    startTime={slot.start_time}
                    endTime={slot.end_time}
                    isBooked={slot.is_booked}
                  />
                  <Button
                    icon={Trash2}
                    size="$2"
                    circular
                    chromeless
                    disabled={slot.is_booked || removeSlotMutation.isPending}
                    onPress={() => handleRemoveSlot(slot.id)}
                  />
                </XStack>
              ))
            )}
          </YStack>
        )}

        {!isSession && availability?.type === 'event' && (
          <YStack gap="$2">
            {availability.dates.length === 0 ? (
              <Card bordered padding="$6" alignItems="center">
                <Calendar size={32} color="$gray10" />
                <Text theme="alt2" marginTop="$2">
                  No event dates added yet
                </Text>
              </Card>
            ) : (
              availability.dates.map((eventDate) => (
                <XStack
                  key={eventDate.id}
                  backgroundColor="$gray2"
                  padding="$3"
                  borderRadius="$3"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <YStack gap="$1">
                    <Text fontWeight="600">
                      {new Date(eventDate.start_time).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    <Text size="$2" theme="alt2">
                      {new Date(eventDate.start_time).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}{' '}
                      -{' '}
                      {new Date(eventDate.end_time).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </Text>
                    <SpotsRemaining
                      spotsRemaining={eventDate.spots_remaining}
                      totalCapacity={eventDate.capacity_override || offering.capacity || 10}
                      showProgress
                    />
                  </YStack>
                  <Button
                    icon={Trash2}
                    size="$2"
                    circular
                    chromeless
                    disabled={
                      eventDate.spots_remaining <
                        (eventDate.capacity_override || offering.capacity || 10) ||
                      removeEventDateMutation.isPending
                    }
                    onPress={() => handleRemoveEventDate(eventDate.id)}
                  />
                </XStack>
              ))
            )}
          </YStack>
        )}
      </YStack>
    </YStack>
  )
}
