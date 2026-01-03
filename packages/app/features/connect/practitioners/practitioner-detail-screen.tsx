import { ScrollView } from 'react-native'
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
} from '@my/ui'
import { OfferingCard } from '@my/ui'
import { useRouter, useLink } from 'solito/navigation'
import { api } from 'app/utils/api'
import {
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  Globe,
  Instagram,
  Calendar,
  Clock,
} from '@tamagui/lucide-icons'

export function PractitionerDetailScreen({
  citySlug,
  practitionerSlug,
}: {
  citySlug: string
  practitionerSlug: string
}) {
  const router = useRouter()

  // Get practitioner
  const { data: practitioner, isLoading } = api.practitioners.getBySlug.useQuery({
    citySlug,
    practitionerSlug,
  })

  // Get offerings
  const { data: offerings } = api.offerings.listByPractitioner.useQuery(
    { practitionerId: practitioner?.id || '' },
    { enabled: !!practitioner?.id }
  )

  const sessions = offerings?.filter((o) => o.type === 'session') ?? []
  const events = offerings?.filter((o) => o.type === 'event') ?? []

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Spinner size="large" />
      </YStack>
    )
  }

  if (!practitioner) {
    return (
      <YStack flex={1} padding="$4" gap="$4">
        <Button icon={ArrowLeft} circular variant="outlined" onPress={() => router.back()} />
        <Text>Practitioner not found</Text>
      </YStack>
    )
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <YStack flex={1} padding="$4" gap="$6">

      {/* Header */}
      <XStack gap="$4" alignItems="flex-start">
        <Avatar circular size="$10">
          {practitioner.avatar_url ? (
            <Avatar.Image src={practitioner.avatar_url} />
          ) : (
            <Avatar.Fallback backgroundColor="$blue10" jc="center" ai="center">
              <Text color="white" fontSize="$8" fontWeight="600">
                {practitioner.business_name.charAt(0).toUpperCase()}
              </Text>
            </Avatar.Fallback>
          )}
        </Avatar>

        <YStack flex={1} gap="$2">
          <H1 size="$7">{practitioner.business_name}</H1>

          <XStack alignItems="center" gap="$2">
            <MapPin size={16} color="$gray10" />
            <Text size="$3" theme="alt2">
              {(practitioner.cities as any)?.name || citySlug}
            </Text>
          </XStack>

          {practitioner.specialties && practitioner.specialties.length > 0 && (
            <XStack gap="$1" flexWrap="wrap" marginTop="$2">
              {practitioner.specialties.map((specialty) => (
                <Theme key={specialty} name="blue">
                  <Button size="$1" px="$2" br="$10" disabled opacity={0.8}>
                    {specialty}
                  </Button>
                </Theme>
              ))}
            </XStack>
          )}
        </YStack>
      </XStack>

      {/* Bio */}
      {practitioner.bio && (
        <Card bordered padding="$4">
          <Paragraph size="$4" lineHeight="$4">
            {practitioner.bio}
          </Paragraph>
        </Card>
      )}

      {/* Contact Info */}
      <Card bordered padding="$4">
        <YStack gap="$3">
          <Text fontWeight="600" size="$3">
            Contact
          </Text>

          {practitioner.contact_email && (
            <XStack alignItems="center" gap="$3">
              <Mail size={18} color="$gray10" />
              <Text>{practitioner.contact_email}</Text>
            </XStack>
          )}

          {practitioner.phone && (
            <XStack alignItems="center" gap="$3">
              <Phone size={18} color="$gray10" />
              <Text>{practitioner.phone}</Text>
            </XStack>
          )}

          {practitioner.website_url && (
            <XStack alignItems="center" gap="$3">
              <Globe size={18} color="$gray10" />
              <Text color="$blue10">{practitioner.website_url}</Text>
            </XStack>
          )}

          {practitioner.instagram_handle && (
            <XStack alignItems="center" gap="$3">
              <Instagram size={18} color="$gray10" />
              <Text>@{practitioner.instagram_handle}</Text>
            </XStack>
          )}
        </YStack>
      </Card>

      {/* Sessions */}
      {sessions.length > 0 && (
        <YStack gap="$4">
          <XStack gap="$2" alignItems="center">
            <Clock size={20} color="$green10" />
            <H2 size="$5">1:1 Sessions</H2>
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
                onPress={() => router.push(`/${citySlug}/${practitionerSlug}/${offering.id}`)}
              />
            ))}
          </YStack>
        </YStack>
      )}

      {/* Events */}
      {events.length > 0 && (
        <YStack gap="$4">
          <XStack gap="$2" alignItems="center">
            <Calendar size={20} color="$purple10" />
            <H2 size="$5">Events & Ceremonies</H2>
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
                onPress={() => router.push(`/${citySlug}/${practitionerSlug}/${offering.id}`)}
              />
            ))}
          </YStack>
        </YStack>
      )}

      {/* No Offerings */}
      {(!offerings || offerings.length === 0) && (
        <Card bordered padding="$6" alignItems="center" gap="$3">
          <Calendar size={40} color="$gray10" />
          <Text fontWeight="600">No offerings available</Text>
          <Paragraph textAlign="center" theme="alt2">
            This practitioner hasn't added any offerings yet. Check back later!
          </Paragraph>
        </Card>
      )}
      </YStack>
    </ScrollView>
  )
}
