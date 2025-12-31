import { useEffect } from 'react'
import { YStack, XStack, H1, H2, Text, Card, Spinner, Image } from '@my/ui'
import { useLink } from 'solito/navigation'
import { api } from 'app/utils/api'

// City card component
function CityCard({
  name,
  slug,
  country,
  coverImageUrl,
  description,
  practitionerCount,
}: {
  name: string
  slug: string
  country: string
  coverImageUrl?: string | null
  description?: string | null
  practitionerCount?: number
}) {
  const link = useLink({ href: `/${slug}` })

  return (
    <Card
      elevate
      bordered
      animation="bouncy"
      scale={0.98}
      hoverStyle={{ scale: 1 }}
      pressStyle={{ scale: 0.96 }}
      {...link}
      cursor="pointer"
      overflow="hidden"
      width="100%"
      maxWidth={400}
    >
      {coverImageUrl && (
        <Card.Background>
          <Image
            source={{ uri: coverImageUrl }}
            alt={name}
            width="100%"
            height={200}
            objectFit="cover"
            opacity={0.3}
          />
        </Card.Background>
      )}
      <Card.Header padded>
        <H2 size="$8">{name}</H2>
        <Text theme="alt2" size="$4">
          {country}
        </Text>
      </Card.Header>
      <Card.Footer padded>
        <YStack gap="$2">
          {description && (
            <Text size="$3" numberOfLines={2}>
              {description}
            </Text>
          )}
          {practitionerCount !== undefined && practitionerCount > 0 && (
            <Text size="$2" theme="alt1">
              {practitionerCount} practitioner{practitionerCount !== 1 ? 's' : ''}
            </Text>
          )}
        </YStack>
      </Card.Footer>
    </Card>
  )
}

export function CitySelectorScreen() {
  const { data: cities, isLoading, error } = api.cities.list.useQuery()

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Spinner size="large" />
        <Text marginTop="$4">Loading cities...</Text>
      </YStack>
    )
  }

  if (error) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Text color="$red10">Failed to load cities</Text>
        <Text size="$2" theme="alt2">
          {error.message}
        </Text>
      </YStack>
    )
  }

  return (
    <YStack flex={1} padding="$4" gap="$6">
      <YStack gap="$2" alignItems="center" paddingTop="$8">
        <H1 size="$9" textAlign="center">
          Connect
        </H1>
        <Text size="$5" theme="alt2" textAlign="center">
          Book local wellness sessions & events
        </Text>
      </YStack>

      <YStack gap="$2" alignItems="center">
        <Text size="$4" fontWeight="600">
          Choose your city
        </Text>
      </YStack>

      <XStack
        flexWrap="wrap"
        justifyContent="center"
        gap="$4"
        paddingHorizontal="$4"
      >
        {cities?.map((city) => (
          <CityCard
            key={city.id}
            name={city.name}
            slug={city.slug}
            country={city.country}
            coverImageUrl={city.cover_image_url}
            description={city.description}
          />
        ))}
      </XStack>

      {(!cities || cities.length === 0) && (
        <YStack alignItems="center" padding="$8">
          <Text theme="alt2">No cities available yet</Text>
        </YStack>
      )}
    </YStack>
  )
}
