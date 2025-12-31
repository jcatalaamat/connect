import { useState } from 'react'
import { YStack, XStack, H1, Text, Button, Spinner, Card, Paragraph } from '@my/ui'
import { OfferingCard } from '@my/ui'
import { useRouter, useLink } from 'solito/navigation'
import { api } from 'app/utils/api'
import { Plus, Filter, Calendar, Clock } from '@tamagui/lucide-icons'

export function OfferingsScreen() {
  const router = useRouter()
  const [includeInactive, setIncludeInactive] = useState(false)

  const { data: offerings, isLoading, refetch } = api.offerings.getMyOfferings.useQuery({
    includeInactive,
  })

  const newOfferingLink = useLink({ href: '/practitioner/dashboard/offerings/new' })

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Spinner size="large" />
      </YStack>
    )
  }

  const sessions = offerings?.filter((o) => o.type === 'session') ?? []
  const events = offerings?.filter((o) => o.type === 'event') ?? []

  return (
    <YStack flex={1} padding="$4" gap="$6">
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center">
        <H1 size="$8">Offerings</H1>
        <Button icon={Plus} theme="active" {...newOfferingLink}>
          New Offering
        </Button>
      </XStack>

      {/* Filter */}
      <XStack gap="$3" alignItems="center">
        <Button
          size="$3"
          variant={includeInactive ? 'outlined' : undefined}
          theme={!includeInactive ? 'active' : undefined}
          onPress={() => setIncludeInactive(false)}
        >
          Active Only
        </Button>
        <Button
          size="$3"
          variant={!includeInactive ? 'outlined' : undefined}
          theme={includeInactive ? 'active' : undefined}
          onPress={() => setIncludeInactive(true)}
        >
          Show All
        </Button>
      </XStack>

      {/* Empty State */}
      {(!offerings || offerings.length === 0) && (
        <Card bordered padding="$6" alignItems="center" gap="$4">
          <Calendar size={48} color="$gray10" />
          <YStack alignItems="center" gap="$2">
            <Text size="$6" fontWeight="600">No offerings yet</Text>
            <Paragraph textAlign="center" theme="alt2">
              Create your first offering to start accepting bookings
            </Paragraph>
          </YStack>
          <Button icon={Plus} theme="active" {...newOfferingLink}>
            Create Offering
          </Button>
        </Card>
      )}

      {/* Sessions Section */}
      {sessions.length > 0 && (
        <YStack gap="$4">
          <XStack gap="$2" alignItems="center">
            <Clock size={20} color="$green10" />
            <Text size="$5" fontWeight="600">1:1 Sessions</Text>
            <Text size="$3" theme="alt2">({sessions.length})</Text>
          </XStack>

          <YStack gap="$3">
            {sessions.map((offering) => (
              <OfferingCard
                key={offering.id}
                id={offering.id}
                type="session"
                title={offering.title}
                description={offering.description}
                priceCents={offering.price_cents}
                currency={offering.currency}
                durationMinutes={offering.duration_minutes}
                locationType={offering.location_type as any}
                coverImageUrl={offering.cover_image_url}
                isActive={offering.is_active}
                onPress={() => router.push(`/practitioner/dashboard/offerings/${offering.id}`)}
              />
            ))}
          </YStack>
        </YStack>
      )}

      {/* Events Section */}
      {events.length > 0 && (
        <YStack gap="$4">
          <XStack gap="$2" alignItems="center">
            <Calendar size={20} color="$purple10" />
            <Text size="$5" fontWeight="600">Events & Ceremonies</Text>
            <Text size="$3" theme="alt2">({events.length})</Text>
          </XStack>

          <YStack gap="$3">
            {events.map((offering) => (
              <OfferingCard
                key={offering.id}
                id={offering.id}
                type="event"
                title={offering.title}
                description={offering.description}
                priceCents={offering.price_cents}
                currency={offering.currency}
                capacity={offering.capacity}
                locationType={offering.location_type as any}
                coverImageUrl={offering.cover_image_url}
                isActive={offering.is_active}
                onPress={() => router.push(`/practitioner/dashboard/offerings/${offering.id}`)}
              />
            ))}
          </YStack>
        </YStack>
      )}
    </YStack>
  )
}
