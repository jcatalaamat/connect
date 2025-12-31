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
  TextArea,
  Label,
} from '@my/ui'
import { StatusBadge, PriceDisplay } from '@my/ui'
import { useRouter } from 'solito/navigation'
import { api } from 'app/utils/api'
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Check,
  X,
  AlertCircle,
} from '@tamagui/lucide-icons'

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded' | 'completed' | 'no_show'

export function BookingDetailScreen({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const utils = api.useUtils()

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [internalNotes, setInternalNotes] = useState('')

  // Get booking
  const { data: bookingsData, isLoading } = api.bookings.listForPractitioner.useQuery({
    limit: 100,
  })

  const booking = bookingsData?.bookings.find((b) => b.id === bookingId)

  // Mutations
  const updateStatusMutation = api.bookings.updateStatus.useMutation({
    onSuccess: () => {
      utils.bookings.listForPractitioner.invalidate()
    },
  })

  const cancelMutation = api.bookings.cancel.useMutation({
    onSuccess: () => {
      utils.bookings.listForPractitioner.invalidate()
      setShowCancelModal(false)
      setCancelReason('')
    },
  })

  const handleMarkCompleted = () => {
    updateStatusMutation.mutate({
      bookingId,
      status: 'completed',
      internalNotes: internalNotes || undefined,
    })
  }

  const handleMarkNoShow = () => {
    if (confirm('Mark this booking as a no-show?')) {
      updateStatusMutation.mutate({
        bookingId,
        status: 'no_show',
        internalNotes: internalNotes || undefined,
      })
    }
  }

  const handleCancel = () => {
    cancelMutation.mutate({
      bookingId,
      reason: cancelReason || undefined,
      issueRefund: false, // TODO: Add refund option
    })
  }

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Spinner size="large" />
      </YStack>
    )
  }

  if (!booking) {
    return (
      <YStack flex={1} padding="$4" gap="$4">
        <Button icon={ArrowLeft} circular variant="outlined" onPress={() => router.back()} />
        <Text>Booking not found</Text>
      </YStack>
    )
  }

  const offering = booking.offerings as any
  const slot = booking.availability_slots as any
  const eventDate = booking.event_dates as any
  const dateTime = slot?.start_time || eventDate?.start_time
  const endTime = slot?.end_time || eventDate?.end_time
  const status = booking.status as BookingStatus
  const canUpdate = status === 'confirmed'
  const canCancel = ['pending', 'confirmed'].includes(status)

  return (
    <YStack flex={1} padding="$4" gap="$5">
      {/* Header */}
      <XStack alignItems="center" gap="$3">
        <Button icon={ArrowLeft} circular variant="outlined" onPress={() => router.back()} />
        <YStack flex={1}>
          <H1 size="$7">Booking Details</H1>
          <Text size="$3" theme="alt2">
            {booking.confirmation_code}
          </Text>
        </YStack>
        <StatusBadge status={status} />
      </XStack>

      {/* Customer Info */}
      <Card bordered padding="$4">
        <YStack gap="$3">
          <Text fontWeight="600" size="$2" theme="alt2">
            CUSTOMER
          </Text>

          <XStack alignItems="center" gap="$3">
            <User size={20} color="$gray10" />
            <Text size="$5" fontWeight="600">
              {booking.customer_name}
            </Text>
          </XStack>

          <XStack alignItems="center" gap="$3">
            <Mail size={18} color="$gray10" />
            <Text>{booking.customer_email}</Text>
          </XStack>

          {booking.customer_phone && (
            <XStack alignItems="center" gap="$3">
              <Phone size={18} color="$gray10" />
              <Text>{booking.customer_phone}</Text>
            </XStack>
          )}

          {booking.customer_notes && (
            <>
              <Separator />
              <YStack gap="$1">
                <Text size="$2" theme="alt2" fontWeight="600">
                  CUSTOMER NOTES
                </Text>
                <Paragraph>{booking.customer_notes}</Paragraph>
              </YStack>
            </>
          )}
        </YStack>
      </Card>

      {/* Booking Info */}
      <Card bordered padding="$4">
        <YStack gap="$3">
          <Text fontWeight="600" size="$2" theme="alt2">
            SERVICE
          </Text>

          <Text size="$5" fontWeight="600">
            {offering?.title}
          </Text>

          {dateTime && (
            <XStack gap="$4" flexWrap="wrap">
              <XStack alignItems="center" gap="$2">
                <Calendar size={16} color="$gray10" />
                <Text>
                  {new Date(dateTime).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </XStack>

              <XStack alignItems="center" gap="$2">
                <Clock size={16} color="$gray10" />
                <Text>
                  {new Date(dateTime).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                  {endTime &&
                    ` - ${new Date(endTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}`}
                </Text>
              </XStack>
            </XStack>
          )}

          {booking.spots_booked > 1 && (
            <Text>Spots booked: {booking.spots_booked}</Text>
          )}
        </YStack>
      </Card>

      {/* Payment Info */}
      <Card bordered padding="$4">
        <YStack gap="$3">
          <Text fontWeight="600" size="$2" theme="alt2">
            PAYMENT
          </Text>

          <XStack justifyContent="space-between">
            <Text theme="alt2">Total charged</Text>
            <PriceDisplay amountCents={booking.amount_cents} currency={booking.currency} />
          </XStack>

          <XStack justifyContent="space-between">
            <Text theme="alt2">Your earnings</Text>
            <PriceDisplay
              amountCents={booking.practitioner_amount_cents}
              currency={booking.currency}
            />
          </XStack>
        </YStack>
      </Card>

      {/* Internal Notes */}
      {canUpdate && (
        <Card bordered padding="$4">
          <YStack gap="$3">
            <Label size="$4">Internal Notes (optional)</Label>
            <TextArea
              size="$4"
              placeholder="Add private notes about this booking..."
              value={internalNotes}
              onChangeText={setInternalNotes}
              minHeight={80}
            />
          </YStack>
        </Card>
      )}

      {booking.internal_notes && !canUpdate && (
        <Card bordered padding="$4">
          <YStack gap="$2">
            <Text fontWeight="600" size="$2" theme="alt2">
              INTERNAL NOTES
            </Text>
            <Paragraph>{booking.internal_notes}</Paragraph>
          </YStack>
        </Card>
      )}

      {/* Actions */}
      {canUpdate && (
        <Card bordered padding="$4" backgroundColor="$backgroundHover">
          <YStack gap="$4">
            <Text fontWeight="600">Update Booking Status</Text>

            <XStack gap="$3" flexWrap="wrap">
              <Button
                icon={Check}
                theme="green"
                flex={1}
                onPress={handleMarkCompleted}
                disabled={updateStatusMutation.isPending}
              >
                Mark Completed
              </Button>

              <Button
                icon={AlertCircle}
                theme="orange"
                variant="outlined"
                flex={1}
                onPress={handleMarkNoShow}
                disabled={updateStatusMutation.isPending}
              >
                No Show
              </Button>
            </XStack>
          </YStack>
        </Card>
      )}

      {canCancel && (
        <YStack gap="$3">
          {!showCancelModal ? (
            <Button
              icon={X}
              theme="red"
              variant="outlined"
              onPress={() => setShowCancelModal(true)}
            >
              Cancel Booking
            </Button>
          ) : (
            <Card bordered padding="$4" backgroundColor="$red2">
              <YStack gap="$4">
                <Text fontWeight="600" color="$red10">
                  Cancel this booking?
                </Text>

                <YStack gap="$2">
                  <Label size="$3">Reason (optional)</Label>
                  <TextArea
                    size="$3"
                    placeholder="Reason for cancellation..."
                    value={cancelReason}
                    onChangeText={setCancelReason}
                    minHeight={60}
                  />
                </YStack>

                <XStack gap="$3">
                  <Button
                    flex={1}
                    variant="outlined"
                    onPress={() => {
                      setShowCancelModal(false)
                      setCancelReason('')
                    }}
                  >
                    Keep Booking
                  </Button>
                  <Button
                    flex={1}
                    theme="red"
                    onPress={handleCancel}
                    disabled={cancelMutation.isPending}
                  >
                    {cancelMutation.isPending ? <Spinner size="small" /> : 'Confirm Cancel'}
                  </Button>
                </XStack>
              </YStack>
            </Card>
          )}
        </YStack>
      )}

      {/* Cancelled Info */}
      {status === 'cancelled' && booking.cancelled_at && (
        <Card bordered padding="$4" backgroundColor="$gray2">
          <YStack gap="$2">
            <Text fontWeight="600">Cancelled</Text>
            <Text size="$2" theme="alt2">
              {new Date(booking.cancelled_at).toLocaleString()}
            </Text>
            {(booking as any).cancellation_reason && (
              <Text size="$3">Reason: {(booking as any).cancellation_reason}</Text>
            )}
          </YStack>
        </Card>
      )}
    </YStack>
  )
}
