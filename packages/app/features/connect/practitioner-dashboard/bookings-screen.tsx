import { useState } from 'react'
import { ScrollView } from 'react-native'
import {
  YStack,
  XStack,
  H1,
  Text,
  Button,
  Spinner,
  Card,
  Paragraph,
  Separator,
} from '@my/ui'
import { StatusBadge, PriceDisplay } from '@my/ui'
import { useRouter } from 'solito/navigation'
import { api } from 'app/utils/api'
import { Calendar, Clock, User } from '@tamagui/lucide-icons'

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded' | 'completed' | 'no_show'

const statusFilters: { value: BookingStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'confirmed', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No Show' },
]

export function BookingsScreen() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all')
  const [offset, setOffset] = useState(0)
  const limit = 20

  const { data, isLoading } = api.bookings.listForPractitioner.useQuery({
    status: statusFilter === 'all' ? undefined : statusFilter,
    limit,
    offset,
  })

  const bookings = data?.bookings ?? []
  const total = data?.total ?? 0
  const hasMore = data?.hasMore ?? false

  if (isLoading && offset === 0) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Spinner size="large" />
      </YStack>
    )
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <YStack flex={1} padding="$4" gap="$5">
        {/* Header */}
        <H1 size="$8">Bookings</H1>

        {/* Status Filters */}
        <XStack gap="$2" flexWrap="wrap">
          {statusFilters.map((filter) => (
            <Button
              key={filter.value}
              size="$3"
              borderRadius="$10"
              theme={statusFilter === filter.value ? 'active' : undefined}
              variant={statusFilter !== filter.value ? 'outlined' : undefined}
              onPress={() => {
                setStatusFilter(filter.value)
                setOffset(0)
              }}
            >
              {filter.label}
            </Button>
          ))}
        </XStack>

        {/* Results Count */}
        <Text size="$2" theme="alt2">
          {total} booking{total !== 1 ? 's' : ''}{' '}
          {statusFilter !== 'all' ? `(${statusFilter})` : ''}
        </Text>

        {/* Empty State */}
        {bookings.length === 0 && (
          <Card bordered padding="$6" alignItems="center" gap="$4">
            <Calendar size={48} color="$gray10" />
            <YStack alignItems="center" gap="$2">
              <Text size="$6" fontWeight="600">
                No bookings found
              </Text>
              <Paragraph textAlign="center" theme="alt2">
                {statusFilter === 'all'
                  ? "You don't have any bookings yet"
                  : `No ${statusFilter} bookings`}
              </Paragraph>
            </YStack>
          </Card>
        )}

        {/* Bookings List */}
        <YStack gap="$3">
          {bookings.map((booking) => {
            const offering = booking.offerings as any
            const slot = booking.availability_slots as any
            const eventDate = booking.event_dates as any
            const dateTime = slot?.start_time || eventDate?.start_time

            return (
              <Card
                key={booking.id}
                bordered
                padding="$4"
                onPress={() => router.push(`/practitioner/dashboard/bookings/${booking.id}`)}
                pressStyle={{ opacity: 0.8 }}
              >
                <YStack gap="$3">
                  <XStack justifyContent="space-between" alignItems="flex-start">
                    <YStack flex={1} gap="$1">
                      <Text fontWeight="600">{offering?.title}</Text>
                      <XStack alignItems="center" gap="$2">
                        <User size={14} color="$gray10" />
                        <Text size="$3">{booking.customer_name}</Text>
                      </XStack>
                    </YStack>
                    <StatusBadge status={booking.status as BookingStatus} size="sm" />
                  </XStack>

                  <Separator />

                  <XStack justifyContent="space-between" alignItems="center">
                    <XStack gap="$4">
                      {dateTime && (
                        <XStack alignItems="center" gap="$2">
                          <Calendar size={14} color="$gray10" />
                          <Text size="$2">
                            {new Date(dateTime).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Text>
                        </XStack>
                      )}
                      {dateTime && (
                        <XStack alignItems="center" gap="$2">
                          <Clock size={14} color="$gray10" />
                          <Text size="$2">
                            {new Date(dateTime).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </Text>
                        </XStack>
                      )}
                    </XStack>

                    <PriceDisplay
                      amountCents={booking.practitioner_amount_cents}
                      currency={booking.currency}
                      size="sm"
                    />
                  </XStack>

                  <Text size="$2" theme="alt2">
                    {booking.confirmation_code}
                  </Text>
                </YStack>
              </Card>
            )
          })}
        </YStack>

        {/* Pagination */}
        {(offset > 0 || hasMore) && (
          <XStack gap="$3" justifyContent="center">
            <Button
              size="$3"
              variant="outlined"
              disabled={offset === 0 || isLoading}
              onPress={() => setOffset(Math.max(0, offset - limit))}
            >
              Previous
            </Button>
            <Button
              size="$3"
              variant="outlined"
              disabled={!hasMore || isLoading}
              onPress={() => setOffset(offset + limit)}
            >
              Next
            </Button>
          </XStack>
        )}
      </YStack>
    </ScrollView>
  )
}
